import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(
    async (authToken = null) => {
      const currentToken =
        authToken || localStorage.getItem("token");

      if (!currentToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load user"
          );
        }

        setToken(currentToken);
        setUser(result.data.user);
      } catch (error) {
        console.error("Auth user error:", error);

        clearAuth();
      } finally {
        setLoading(false);
      }
    },
    [clearAuth]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      return;
    }

    const timer = setTimeout(() => {
      fetchCurrentUser(storedToken);
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCurrentUser]);

  const login = useCallback((authToken, userData = null) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);

    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    try {
      if (currentToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  }, [clearAuth, navigate]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    refreshUser: fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}

export default AuthContext;