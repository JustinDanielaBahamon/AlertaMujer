import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../features/authentication/models/User";
import type { MainStackParamList } from "../navigation/types";
import { listenSession, setAuthToken, setRefreshToken } from "../services/api";
import { clearTokens, saveTokens, leerTokens } from "../services/tokenStorage";
import { forgetDeviceSession } from "../services/devices.service";

export type SignInOptions = {
  /** First screen of the main stack after signing in (e.g. the tutorial after sign-up). */
  initialMainRoute?: keyof MainStackParamList;
  /** Backend refresh token (login, Google or sign-up); if not passed the current one is kept. */
  refreshToken?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  /** Initial route of the main stack on its next mount (consumed when entering Main). */
  pendingMainRoute: keyof MainStackParamList | null;
  signIn: (user: User, token: string, options?: SignInOptions) => void;
  signOut: () => void;
  /** Changes the signed-in user's data (e.g. the photo) without signing in again. */
  updateUser: (changes: Partial<User>) => void;
  clearPendingMainRoute: () => void;
  /** true while the saved session is restored when the app starts. */
  restoring: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_AUTH = "@alerta_mujer:auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingMainRoute, setPendingMainRoute] = useState<keyof MainStackParamList | null>(null);
  const [restoring, setRestoring] = useState(true);
  const refreshRef = useRef<string | null>(null);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  // Restore the saved session when the app starts
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        if (raw) {
          const savedItem = JSON.parse(raw);
          let tokens = await leerTokens();
          // Sessions saved before the encrypted storage existed: the tokens move there
          if (!tokens && savedItem.token) {
            tokens = { token: savedItem.token, refreshToken: savedItem.refreshToken ?? null };
            await saveTokens(tokens);
            await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user: savedItem.user }));
          }
          if (savedItem.user && tokens) {
            setUser(savedItem.user);
            setToken(tokens.token);
            setAuthToken(tokens.token);
            refreshRef.current = tokens.refreshToken;
            setRefreshToken(tokens.refreshToken);
          }
        }
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  // User data goes to AsyncStorage; tokens, to the system's encrypted storage
  const save = (nextUser: User, nextToken: string) => {
    Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user: nextUser })),
      saveTokens({ token: nextToken, refreshToken: refreshRef.current }),
    ]).catch((e) => console.error("No se pudo guardar la sesión:", e));
  };

  const signIn = useCallback((nextUser: User, nextToken: string, options?: SignInOptions) => {
    setPendingMainRoute(options?.initialMainRoute ?? "DrawerHome");
    setUser(nextUser);
    setToken(nextToken);
    setAuthToken(nextToken); // Update the token in the axios interceptor
    if (options?.refreshToken) {
      refreshRef.current = options.refreshToken;
      setRefreshToken(options.refreshToken);
    }
    save(nextUser, nextToken);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null); // Clear the token in the axios interceptor
    refreshRef.current = null;
    setRefreshToken(null);
    forgetDeviceSession();
    setPendingMainRoute(null);
    AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
    clearTokens().catch(() => {});
  }, []);

  // The api.ts interceptor reports when it renewed the token or when the session is no longer valid
  useEffect(
    () =>
      listenSession({
        renewed: (newItem) => {
          setToken(newItem);
          if (userRef.current) save(userRef.current, newItem);
        },
        expired: () => {
          if (!userRef.current || userRef.current.id === 0) return; // demo mode: there is no real session
          signOut();
          Alert.alert("Sesión vencida", "Por seguridad, inicia sesión de nuevo.");
        },
      }),
    [signOut],
  );

  const updateUser = useCallback((changes: Partial<User>) => {
    if (!user || !token) return;
    const newItem = { ...user, ...changes };
    setUser(newItem);
    save(newItem, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const clearPendingMainRoute = useCallback(() => {
    setPendingMainRoute(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      pendingMainRoute,
      signIn,
      signOut,
      updateUser: updateUser,
      clearPendingMainRoute,
      restoring,
    }),
    [user, token, pendingMainRoute, signIn, signOut, updateUser, clearPendingMainRoute, restoring],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}