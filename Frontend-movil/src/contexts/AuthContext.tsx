import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../features/authentication/models/User";
import type { MainStackParamList } from "../navigation/types";
import { listenSession, setAuthToken, setRefreshToken } from "../services/api";
import { clearTokens, saveTokens, leerTokens } from "../services/tokenStorage";
import { forgetDeviceSession } from "../services/devices.service";

export type SignInOptions = {
  /** Primera pantalla del stack principal tras iniciar sesión (p. ej. tutorial tras registro). */
  initialMainRoute?: keyof MainStackParamList;
  /** Refresh token del backend (login, Google o registro); si no se pasa se conserva el actual. */
  refreshToken?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  /** Ruta inicial del stack principal en el próximo montaje (se consume al entrar a Main). */
  pendingMainRoute: keyof MainStackParamList | null;
  signIn: (user: User, token: string, options?: SignInOptions) => void;
  signOut: () => void;
  /** Cambia datos de la usuaria en sesión (p. ej. la foto) sin volver a iniciar sesión. */
  updateUser: (changes: Partial<User>) => void;
  clearPendingMainRoute: () => void;
  /** true mientras se restaura la sesión guardada al iniciar la app. */
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

  // Restaurar sesión guardada al iniciar la app
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        if (raw) {
          const savedItem = JSON.parse(raw);
          let tokens = await leerTokens();
          // Sesiones guardadas antes de usar el almacén cifrado: los tokens se mudan allá
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

  // Los datos de la usuaria van en AsyncStorage; los tokens, en el almacén cifrado del sistema
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
    setAuthToken(nextToken); // Actualizar el token en el interceptor de axios
    if (options?.refreshToken) {
      refreshRef.current = options.refreshToken;
      setRefreshToken(options.refreshToken);
    }
    save(nextUser, nextToken);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null); // Limpiar el token en el interceptor de axios
    refreshRef.current = null;
    setRefreshToken(null);
    forgetDeviceSession();
    setPendingMainRoute(null);
    AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
    clearTokens().catch(() => {});
  }, []);

  // El interceptor de api.ts avisa cuando renovó el token o cuando la sesión ya no es válida
  useEffect(
    () =>
      listenSession({
        renewed: (newItem) => {
          setToken(newItem);
          if (userRef.current) save(userRef.current, newItem);
        },
        expired: () => {
          if (!userRef.current || userRef.current.id === 0) return; // modo demo: no hay sesión real
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