import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  adminLogin as adminLoginApi,
  me,
  sendEmailOtp as sendEmailOtpApi,
  verifyEmailOtp as verifyEmailOtpApi,
  completeBusinessRegistration as completeBusinessRegistrationApi,
  googleLogin as googleLoginApi,
} from "../services/authService";

import { STORAGE_KEYS } from "../utils/constants";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((data) => {
    if (!data?.token) {
      throw new Error("Authentication response did not contain a token.");
    }

    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    setUser(data.user || null);

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    me()
      .then((response) => {
        if (!mounted) return;
        setUser(response.data?.user || null);
      })
      .catch(() => {
        if (!mounted) return;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Admin password login is preserved.
  const adminLogin = useCallback(
    async (data) => {
      const response = await adminLoginApi(data);
      const responseData = response.data;

      if (!responseData?.token) {
        throw new Error("Admin login response did not contain a token.");
      }

      if (responseData?.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      return saveSession(responseData);
    },
    [saveSession],
  );

  // Request an email verification code.
  const sendEmailOtp = useCallback(async (email) => {
    const response = await sendEmailOtpApi({
      email: String(email || "")
        .trim()
        .toLowerCase(),
    });

    return response.data;
  }, []);

  // Verify the email OTP. This does not create an authenticated session.
  const verifyEmailOtp = useCallback(async ({ email, otp }) => {
    const response = await verifyEmailOtpApi({
      email: String(email || "")
        .trim()
        .toLowerCase(),
      otp: String(otp || "").trim(),
    });

    return response.data;
  }, []);

  // Submit business details after email verification.
  const completeBusinessRegistration = useCallback(async (data) => {
    const response = await completeBusinessRegistrationApi(data);
    return response.data;
  }, []);

  // Google login can return either an authenticated session or a
  // registrationRequired response for a new business.
  const googleLogin = useCallback(
    async (credential) => {
      const response = await googleLoginApi({ credential });
      const responseData = response.data;

      if (responseData?.token && responseData?.user) {
        return saveSession(responseData);
      }

      return responseData;
    },
    [saveSession],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      adminLogin,
      sendEmailOtp,
      verifyEmailOtp,
      completeBusinessRegistration,
      googleLogin,
      logout,
      isAuthenticated: Boolean(user),
    }),
    [
      user,
      loading,
      adminLogin,
      sendEmailOtp,
      verifyEmailOtp,
      completeBusinessRegistration,
      googleLogin,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
