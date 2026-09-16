import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  login as loginApi,
  adminLogin as adminLoginApi,
  signup as signupApi,
  me,
} from "../services/authService";

import { STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(
      STORAGE_KEYS.TOKEN
    );

    if (!token) {
      setLoading(false);
      return;
    }

    let mounted = true;

    me()
      .then(response => {
        if (mounted) {
          setUser(response.data?.user || null);
        }
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem(
            STORAGE_KEYS.TOKEN
          );
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async data => {
    const response = await loginApi(data);
    const token = response.data?.token;

    if (!token) {
      throw new Error(
        "Login response did not contain a token."
      );
    }

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      token
    );

    setUser(response.data?.user || null);

    return response.data;
  }, []);

  const adminLogin = useCallback(async data => {
    const response = await adminLoginApi(data);
    const token = response.data?.token;

    if (!token) {
      throw new Error(
        "Admin login response did not contain a token."
      );
    }

    if (response.data?.user?.role !== "admin") {
      throw new Error(
        "This account does not have admin access."
      );
    }

    localStorage.setItem(
      STORAGE_KEYS.TOKEN,
      token
    );

    setUser(response.data?.user || null);

    return response.data;
  }, []);

  const signup = useCallback(async data => {
    const response = await signupApi(data);
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      adminLogin,
      signup,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [
      user,
      loading,
      login,
      adminLogin,
      signup,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;