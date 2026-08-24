import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";

import { getCurrentUser, logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const restoreUser = async () => {
      try {
        const response = await getCurrentUser();

        const currentUser =
          response.data?.data?.user ||
          response.data?.user ||
          response.data?.data;

        setUser(currentUser);
      }  finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

    const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
    }
  }, []);

    const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout]
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};