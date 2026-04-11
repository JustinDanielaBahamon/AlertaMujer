import React, { createContext, useState } from "react";
import type { Usuario } from "../models/Usuario";

interface AuthContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
}

// Crea el contexto con el tipo definido
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

// Define el tipo de children
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Usuario | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};