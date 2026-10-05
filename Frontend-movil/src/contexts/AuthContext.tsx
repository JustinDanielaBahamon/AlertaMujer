import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Usuario } from "../features/authentication/models/Usuario";
import type { MainStackParamList } from "../navigation/types";
import { setAuthToken } from "../services/api";

export type SignInOptions = {
  /** Primera pantalla del stack principal tras iniciar sesión (p. ej. tutorial tras registro). */
  initialMainRoute?: keyof MainStackParamList;
};

type AuthContextType = {
  user: Usuario | null;
  token: string | null;
  /** Ruta inicial del stack principal en el próximo montaje (se consume al entrar a Main). */
  pendingMainRoute: keyof MainStackParamList | null;
  signIn: (user: Usuario, token: string, options?: SignInOptions) => void;
  signOut: () => void;
  clearPendingMainRoute: () => void;
  /** true mientras se restaura la sesión guardada al iniciar la app. */
  restoring: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_AUTH = "@alerta_mujer:auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingMainRoute, setPendingMainRoute] = useState<keyof MainStackParamList | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restaurar sesión guardada al iniciar la app
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        if (raw) {
          const { user: savedUser, token: savedToken } = JSON.parse(raw);
          if (savedUser && savedToken) {
            setUser(savedUser);
            setToken(savedToken);
            setAuthToken(savedToken);
          }
        }
      } catch (error) {
        console.error("Error al restaurar la sesión:", error);
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  const signIn = useCallback((nextUser: Usuario, nextToken: string, options?: SignInOptions) => {
    console.log('🔐 [AuthContext] signIn INICIADO');
    setPendingMainRoute(options?.initialMainRoute ?? "DrawerHome");
    setUser(nextUser);
    setToken(nextToken);
    setAuthToken(nextToken); // Actualizar el token en el interceptor de axios
    AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ user: nextUser, token: nextToken })).catch((e) =>
      console.error("No se pudo guardar la sesión:", e),
    );
    console.log('✅ [AuthContext] Usuario y token guardados en AuthContext');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null); // Limpiar el token en el interceptor de axios
    setPendingMainRoute(null);
    AsyncStorage.removeItem(STORAGE_KEY_AUTH).catch(() => {});
  }, []);

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
      clearPendingMainRoute,
      restoring,
    }),
    [user, token, pendingMainRoute, signIn, signOut, clearPendingMainRoute, restoring],
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