"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
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
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  authenticatedFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_HINT_KEY = "binks-auth-session:v1";
let bootstrapSession: Promise<AuthResponse> | null = null;

function hasSessionHint() {
  try {
    return window.localStorage.getItem(SESSION_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setSessionHint(present: boolean) {
  try {
    if (present) window.localStorage.setItem(SESSION_HINT_KEY, "1");
    else window.localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    // Storage can be unavailable in privacy modes. Authentication still works in memory.
  }
}

function refreshSession() {
  bootstrapSession ??= apiRequest<AuthResponse>("/api/auth/refresh", { method: "POST" }).finally(
    () => {
      bootstrapSession = null;
    }
  );
  return bootstrapSession;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AccountUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionAttempted, setSessionAttempted] = useState(false);
  const protectedPath =
    pathname === "/account" ||
    pathname.startsWith("/account/orders/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/admin");

  const acceptSession = useCallback((session: AuthResponse) => {
    setUser(session.user);
    setAccessToken(session.accessToken);
    setSessionAttempted(true);
    setSessionHint(true);
  }, []);

  useEffect(() => {
    if (sessionAttempted || (!protectedPath && !hasSessionHint())) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    refreshSession()
      .then((session) => {
        if (active) acceptSession(session);
      })
      .catch((error) => {
        if (active && error instanceof ApiError && error.status === 401) setSessionHint(false);
        else if (active) console.error(error);
      })
      .finally(() => {
        if (active) {
          setSessionAttempted(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [acceptSession, protectedPath, sessionAttempted]);

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
      setSessionHint(false);
      setUser(null);
      setAccessToken(null);
      setSessionAttempted(true);
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
    () => ({
      user,
      accessToken,
      loading: loading || (protectedPath && !sessionAttempted && !user),
      login,
      register,
      logout,
      authenticatedFetch,
    }),
    [
      user,
      accessToken,
      loading,
      protectedPath,
      sessionAttempted,
      login,
      register,
      logout,
      authenticatedFetch,
    ]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
