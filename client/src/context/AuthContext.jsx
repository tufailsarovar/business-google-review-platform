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
  sendSuperAdminEmailOtp as sendSuperAdminEmailOtpApi,
  verifySuperAdminEmailOtp as verifySuperAdminEmailOtpApi,
  superAdminGoogleLogin as superAdminGoogleLoginApi,
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
        if (mounted) {
          setUser(response.data?.user || null);
        }
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          setUser(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Existing admin password login.
  const adminLogin = useCallback(
    async (data) => {
      const response = await adminLoginApi(data);
      const responseData = response.data;

      if (!responseData?.token || responseData?.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      return saveSession(responseData);
    },
    [saveSession],
  );

  // Business email OTP.
  const sendEmailOtp = useCallback(async (email) => {
    const response = await sendEmailOtpApi({
      email: String(email || "")
        .trim()
        .toLowerCase(),
    });

    return response.data;
  }, []);

  const verifyEmailOtp = useCallback(async ({ email, otp }) => {
    const response = await verifyEmailOtpApi({
      email: String(email || "")
        .trim()
        .toLowerCase(),
      otp: String(otp || "").trim(),
    });

    return response.data;
  }, []);

  const completeBusinessRegistration = useCallback(async (data) => {
    const response = await completeBusinessRegistrationApi(data);
    return response.data;
  }, []);

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

  // Super Admin email OTP.
  const sendSuperAdminEmailOtp = useCallback(async (email) => {
    const response = await sendSuperAdminEmailOtpApi({
      email: String(email || "")
        .trim()
        .toLowerCase(),
    });

    return response.data;
  }, []);

  const verifySuperAdminEmailOtp = useCallback(
    async ({ email, otp }) => {
      const response = await verifySuperAdminEmailOtpApi({
        email: String(email || "")
          .trim()
          .toLowerCase(),
        otp: String(otp || "").trim(),
      });

      const responseData = response.data;

      if (
        !responseData?.token ||
        responseData?.user?.role !== "admin" ||
        responseData?.user?.superAdmin !== true
      ) {
        throw new Error(
          "The server did not return an authorized Super Admin session.",
        );
      }

      return saveSession(responseData);
    },
    [saveSession],
  );

  // Super Admin Google login.
  const superAdminGoogleLogin = useCallback(
    async (credential) => {
      const response = await superAdminGoogleLoginApi({ credential });
      const responseData = response.data;

      if (
        !responseData?.token ||
        responseData?.user?.role !== "admin" ||
        responseData?.user?.superAdmin !== true
      ) {
        throw new Error(
          "The server did not return an authorized Super Admin session.",
        );
      }

      return saveSession(responseData);
    },
    [saveSession],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      adminLogin,
      sendEmailOtp,
      verifyEmailOtp,
      completeBusinessRegistration,
      googleLogin,
      sendSuperAdminEmailOtp,
      verifySuperAdminEmailOtp,
      superAdminGoogleLogin,
      logout,
    }),
    [
      user,
      loading,
      adminLogin,
      sendEmailOtp,
      verifyEmailOtp,
      completeBusinessRegistration,
      googleLogin,
      sendSuperAdminEmailOtp,
      verifySuperAdminEmailOtp,
      superAdminGoogleLogin,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
