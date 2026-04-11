import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { Usuario } from "../models/Usuario";
import type { MainStackParamList } from "../navigation/types";

export type SignInOptions = {
  /** Primera pantalla del stack principal tras iniciar sesión (p. ej. tutorial tras registro). */
  initialMainRoute?: keyof MainStackParamList;
};

type AuthContextType = {
  user: Usuario | null;
  /** Ruta inicial del stack principal en el próximo montaje (se consume al entrar a Main). */
  pendingMainRoute: keyof MainStackParamList | null;
  signIn: (user: Usuario, options?: SignInOptions) => void;
  signOut: () => void;
  clearPendingMainRoute: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [pendingMainRoute, setPendingMainRoute] = useState<keyof MainStackParamList | null>(null);

  const signIn = useCallback((nextUser: Usuario, options?: SignInOptions) => {
    setPendingMainRoute(options?.initialMainRoute ?? "DrawerHome");
    setUser(nextUser);
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setPendingMainRoute(null);
  }, []);

  const clearPendingMainRoute = useCallback(() => {
    setPendingMainRoute(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      pendingMainRoute,
      signIn,
      signOut,
      clearPendingMainRoute,
    }),
    [user, pendingMainRoute, signIn, signOut, clearPendingMainRoute],
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
