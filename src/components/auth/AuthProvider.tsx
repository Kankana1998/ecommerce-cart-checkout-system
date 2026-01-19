"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

interface AuthState {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  const value = useMemo<AuthState>(
    () => ({ userId, setUserId }),
    [userId],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

