import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pendingMainRoute, setPendingMainRoute] = useState<keyof MainStackParamList | null>(null);

  const signIn = useCallback((nextUser: Usuario, nextToken: string, options?: SignInOptions) => {
    console.log('🔐 [AuthContext] signIn INICIADO');
    console.log('🔐 [AuthContext] nextUser:', nextUser);
    console.log('🔐 [AuthContext] nextUser.id:', nextUser.id);
    console.log('🔐 [AuthContext] typeof nextUser.id:', typeof nextUser.id);
    console.log('🔐 [AuthContext] nextToken:', nextToken);
    setPendingMainRoute(options?.initialMainRoute ?? "DrawerHome");
    setUser(nextUser);
    setToken(nextToken);
    setAuthToken(nextToken); // Actualizar el token en el interceptor de axios
    console.log('✅ [AuthContext] Usuario y token guardados en AuthContext');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null); // Limpiar el token en el interceptor de axios
    setPendingMainRoute(null);
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
    }),
    [user, token, pendingMainRoute, signIn, signOut, clearPendingMainRoute],
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