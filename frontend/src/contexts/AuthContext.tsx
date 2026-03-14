import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi } from "@/services/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("coreinv_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("coreinv_token"));

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("coreinv_token", res.token);
    localStorage.setItem("coreinv_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.signup(name, email, password);
    localStorage.setItem("coreinv_token", res.token);
    localStorage.setItem("coreinv_user", JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("coreinv_token");
    localStorage.removeItem("coreinv_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
