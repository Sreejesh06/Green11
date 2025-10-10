import { API_BASE_URL } from "@/lib/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const STORAGE_TOKEN_KEY = "green11.auth.token";
const STORAGE_USER_KEY = "green11.auth.user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((payload: AuthResponse) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(STORAGE_TOKEN_KEY, payload.token);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(payload.user));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
  }, []);

  const parseStoredUser = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch (_error) {
      localStorage.removeItem(STORAGE_USER_KEY);
      return null;
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const storedUser = parseStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    setToken(storedToken);

    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session verification failed");
        }

        const payload = (await response.json()) as { user: AuthUser };
        persistSession({ token: storedToken, user: payload.user });
      } catch (_error) {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession, parseStoredUser, persistSession]);

  const handleAuthRequest = useCallback(
    async (path: "login" | "signup", body: Record<string, unknown>) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let message = "Authentication request failed.";

        try {
          const errorPayload = await response.json();
          if (typeof errorPayload.message === "string") {
            message = errorPayload.message;
          }
        } catch (_error) {
          // ignore JSON parse errors
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as AuthResponse;
      persistSession(payload);
      return payload.user;
    },
    [persistSession]
  );

  const login = useCallback(
    async (email: string, password: string) => handleAuthRequest("login", { email, password }),
    [handleAuthRequest]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => handleAuthRequest("signup", { name, email, password }),
    [handleAuthRequest]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout: clearSession,
    }),
    [clearSession, loading, login, signup, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
