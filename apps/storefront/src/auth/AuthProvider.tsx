"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, ApiError } from "@/lib/api";

export type AccountUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: AccountUser;
};
type RegisterInput = { email: string; password: string; firstName: string; lastName: string };
type AuthContextValue = {
  user: AccountUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
let bootstrapSession: Promise<AuthResponse> | null = null;

function refreshSession() {
  bootstrapSession ??= apiRequest<AuthResponse>("/api/auth/refresh", { method: "POST" }).finally(
    () => {
      bootstrapSession = null;
    }
  );
  return bootstrapSession;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const acceptSession = useCallback((session: AuthResponse) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
  }, []);

  useEffect(() => {
    let active = true;
    refreshSession()
      .then((session) => {
        if (active) acceptSession(session);
      })
      .catch((error) => {
        if (active && !(error instanceof ApiError && error.status === 401)) console.error(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [acceptSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      acceptSession(
        await apiRequest<AuthResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        })
      );
    },
    [acceptSession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      acceptSession(
        await apiRequest<AuthResponse>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(input),
        })
      );
    },
    [acceptSession]
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const authenticatedFetch = useCallback(
    async <T,>(path: string, init: RequestInit = {}) => {
      let token = accessToken;
      const request = () =>
        apiRequest<T>(path, {
          ...init,
          headers: { ...init.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
      try {
        return await request();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
        const session = await refreshSession();
        acceptSession(session);
        token = session.accessToken;
        return request();
      }
    },
    [accessToken, acceptSession]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, authenticatedFetch }),
    [user, loading, login, register, logout, authenticatedFetch]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
