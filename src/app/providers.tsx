"use client";

import { ConvexProvider, ConvexReactClient, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

/**
 * BuitenZijn App - Providers
 *
 * This file sets up the Convex client and auth context.
 */

// Initialize Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// ==========================================
// AUTH CONTEXT
// ==========================================

interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles: ("admin" | "member" | "guest" | "lijndans" | "ella" | "prono")[];
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ==========================================
// AUTH PROVIDER
// ==========================================

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("session_token");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate session with Convex — this reactively updates when the token changes
  const sessionData = useQuery(
    api.auth.validateSession,
    sessionToken ? { token: sessionToken } : "skip",
  );

  // When session validation completes, update user state
  useEffect(() => {
    // Still waiting for the query to return
    if (sessionToken && sessionData === undefined) return;

    if (sessionData && sessionData.user) {
      const freshUser: User = {
        id: sessionData.user._id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        firstName: sessionData.user.firstName,
        lastName: sessionData.user.lastName,
        avatarUrl: sessionData.user.avatarUrl,
        roles:
          (sessionData.user as any).roles ??
          ((sessionData.user as any).role
            ? [(sessionData.user as any).role]
            : ["member"]),
        emailVerified: sessionData.user.emailVerified,
      };
      setUser(freshUser);
      localStorage.setItem("user", JSON.stringify(freshUser));
    } else if (sessionToken && sessionData === null) {
      // Session is invalid or expired — clear everything
      localStorage.removeItem("session_token");
      localStorage.removeItem("user");
      setSessionToken(null);
      setUser(null);
    } else if (!sessionToken) {
      // No token at all
      setUser(null);
    }

    setIsLoading(false);
  }, [sessionData, sessionToken]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("session_token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setSessionToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("session_token");
    localStorage.removeItem("user");
    setSessionToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        sessionToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// ROOT PROVIDERS
// ==========================================

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexProvider>
  );
}
