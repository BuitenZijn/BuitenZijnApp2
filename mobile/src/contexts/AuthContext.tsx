import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const SESSION_KEY = "buitenzijn_session";

interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  roles: ("admin" | "member" | "guest" | "lijndans" | "ella" | "prono")[];
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
}

interface AuthContextType {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginAction = useAction(api.authActions.secureLogin);
  const registerAction = useAction(api.authActions.secureRegisterWithSession);
  const logoutMutation = useMutation(api.auth.logout);

  // Validate stored session on mount
  const sessionData = useQuery(
    api.auth.validateSession,
    sessionToken ? { token: sessionToken } : "skip",
  );

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    if (sessionToken && sessionData === null) {
      // Session is invalid, clear it
      clearSession();
    }
    if (sessionData !== undefined) {
      setIsLoading(false);
    }
  }, [sessionData, sessionToken]);

  async function loadStoredSession() {
    try {
      const token = await SecureStore.getItemAsync(SESSION_KEY);
      if (token) {
        setSessionToken(token);
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  }

  async function clearSession() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setSessionToken(null);
    setIsLoading(false);
  }

  const rawUser = sessionData?.user as any | null;
  const user: User | null = rawUser
    ? {
        ...rawUser,
        roles: rawUser.roles ?? (rawUser.role ? [rawUser.role] : ["member"]),
      }
    : null;

  const login = async (email: string, password: string) => {
    try {
      const result = await loginAction({ email, password });
      if (result.success && result.sessionToken) {
        await SecureStore.setItemAsync(SESSION_KEY, result.sessionToken);
        setSessionToken(result.sessionToken);
        return { success: true };
      }
      return {
        success: false,
        error: "error" in result ? result.error : "Login failed",
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Login failed" };
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const result = await registerAction({
        email: data.email,
        password: data.password,
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      if (result.success && result.sessionToken) {
        await SecureStore.setItemAsync(SESSION_KEY, result.sessionToken);
        setSessionToken(result.sessionToken);
        return { success: true };
      }
      return {
        success: false,
        error: "error" in result ? result.error : "Registration failed",
      };
    } catch (e: any) {
      return { success: false, error: e.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await logoutMutation({ token: sessionToken });
      }
    } catch {
      // Ignore logout errors
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
