import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail } from "../../utils/validators";
import { STORAGE_KEYS } from "../../utils/constants";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function LoginForm() {
  const { sendEmailOtp, verifyEmailOtp, googleLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const busy = Boolean(loadingAction);

  const clearMessages = () => {
    setServerError("");
    setNotice("");
  };

  const goToSignup = useCallback(
    (registrationData = {}) => {
      navigate("/signup", {
        state: {
          email: registrationData.email || email.trim().toLowerCase(),
          emailVerified: Boolean(registrationData.emailVerified),
          verificationToken: registrationData.verificationToken || "",
          googleCredential: registrationData.googleCredential || "",
          ownerName: registrationData.ownerName || "",
        },
      });
    },
    [email, navigate],
  );

  const redirectToSignupAfterAlert = useCallback(
    (registrationData = {}) => {
      setServerError("");
      setNotice(
        "You have not registered your business yet. Please sign up to continue.",
      );

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = setTimeout(() => {
        goToSignup(registrationData);
      }, 1800);
    },
    [goToSignup],
  );

  useEffect(
    () => () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    },
    [],
  );

  const navigateAfterLogin = useCallback(
    (loggedInUser) => {
      const requestedPath = location.state?.from?.pathname;
      const requestedSearch = location.state?.from?.search || "";
      const requestedHash = location.state?.from?.hash || "";

      const isAuthPage = ["/", "/login", "/signup"].includes(requestedPath);

      const destination =
        requestedPath && !isAuthPage
          ? `${requestedPath}${requestedSearch}${requestedHash}`
          : loggedInUser?.role === "admin"
            ? "/admin/dashboard"
            : "/business/dashboard";

      navigate(destination, { replace: true });
    },
    [location.state, navigate],
  );

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    clearMessages();

    if (!isEmail(normalizedEmail)) {
      setServerError("Enter a valid email address.");
      return;
    }

    setLoadingAction("send-otp");

    try {
      const result = await sendEmailOtp(normalizedEmail);
      const data = result?.data ?? result;

      setOtpSent(true);
      setOtp("");
      setNotice(data?.message || "Verification code sent to your email.");
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to send the verification code.",
      );

      if (
        /business.*not found|not registered|no business|account does not exist/i.test(
          message,
        )
      ) {
        redirectToSignupAfterAlert({ email: normalizedEmail });
      } else {
        setServerError(message);
      }
    } finally {
      setLoadingAction("");
    }
  };

  const handleVerifyOtp = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmail(normalizedEmail)) {
      setServerError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setServerError("Enter the six-digit verification code.");
      return;
    }

    setLoadingAction("verify-otp");

    try {
      const result = await verifyEmailOtp({
        email: normalizedEmail,
        otp,
      });

      const data = result?.data ?? result;

      if (data?.token && data?.user) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        navigateAfterLogin(data.user);
        window.location.reload();
        return;
      }

      if (data?.registrationRequired || data?.verificationToken) {
        redirectToSignupAfterAlert({
          email: normalizedEmail,
          emailVerified: true,
          verificationToken: data.verificationToken,
        });
        return;
      }

      if (data?.message) {
        setNotice(data.message);
      } else {
        setServerError("Unable to complete sign-in. Please try again.");
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to verify your email address.",
      );

      if (
        /not found|not registered|register|registration required|no business|account does not exist/i.test(
          message,
        )
      ) {
        redirectToSignupAfterAlert({ email: normalizedEmail });
      } else {
        setServerError(message);
      }
    } finally {
      setLoadingAction("");
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) {
        setServerError("Google did not return a valid credential.");
        return;
      }

      clearMessages();
      setLoadingAction("google-login");

      try {
        const result = await googleLogin(credential);
        const data = result?.data ?? result;

        if (data?.registrationRequired) {
          redirectToSignupAfterAlert({
            email: data.email,
            ownerName: data.name,
            googleCredential: credential,
          });
          return;
        }

        if (data?.token && data?.user) {
          navigateAfterLogin(data.user);
          return;
        }

        setServerError(data?.message || "Unable to sign in with Google.");
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Google sign-in failed. Please try again.",
        );

        if (
          /not found|not registered|registration required|no business|account does not exist/i.test(
            message,
          )
        ) {
          redirectToSignupAfterAlert();
        } else {
          setServerError(message);
        }
      } finally {
        setLoadingAction("");
      }
    },
    [googleLogin, navigateAfterLogin, redirectToSignupAfterAlert],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;
    let script;

    const initializeGoogle = () => {
      if (
        cancelled ||
        !googleButtonRef.current ||
        !window.google?.accounts?.id
      ) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            handleGoogleCredential(response.credential);
          } else {
            setServerError("Google did not return a valid credential.");
          }
        },
      });

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(
          400,
          Math.max(240, googleButtonRef.current.clientWidth || 320),
        ),
      });

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", initializeGoogle);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [handleGoogleCredential]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Stack spacing={2.5}>
        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                {serverError}
              </Alert>
            </MotionBox>
          )}

          {notice && (
            <MotionBox
              key="notice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="error"
                sx={{ borderRadius: 2.5 }}
                action={
                  notice.includes("not registered") ? (
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        if (redirectTimerRef.current) {
                          clearTimeout(redirectTimerRef.current);
                        }
                        goToSignup();
                      }}
                    >
                      Sign up
                    </Button>
                  ) : undefined
                }
              >
                {notice}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            minHeight: 44,
            "& iframe": { maxWidth: "100%" },
          }}
        >
          {GOOGLE_CLIENT_ID ? (
            <>
              <Box
                ref={googleButtonRef}
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              />
              {!googleReady && (
                <CircularProgress
                  size={20}
                  sx={{ ml: 1 }}
                  aria-label="Loading Google sign-in"
                />
              )}
            </>
          ) : (
            <Alert severity="warning" sx={{ width: "100%", borderRadius: 2.5 }}>
              Configure VITE_GOOGLE_CLIENT_ID in client/.env to enable Google
              sign-in.
            </Alert>
          )}
        </Box>

        <Divider>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>

        {!showEmailLogin && (
          <Button
            type="button"
            fullWidth
            variant="outlined"
            startIcon={<EmailRoundedIcon />}
            onClick={() => {
              setShowEmailLogin(true);
              clearMessages();
            }}
            disabled={busy}
            sx={{
              minHeight: 50,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Continue with Email OTP
          </Button>
        )}

        {showEmailLogin && (
          <MotionBox
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            sx={{
              width: "100%",
              p: { xs: 1.5, sm: 2 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={2}>
              <Typography fontWeight={800}>Sign in with Email OTP</Typography>

              <Typography variant="body2" color="text.secondary">
                Enter your business email to receive a one-time code.
              </Typography>

              <TextField
                required
                fullWidth
                label="Business email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setOtpSent(false);
                  setOtp("");
                  clearMessages();
                }}
                disabled={busy || otpSent}
                sx={fieldStyles}
              />

              {otpSent && (
                <TextField
                  required
                  fullWidth
                  label="Six-digit verification code"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                  disabled={busy}
                  sx={fieldStyles}
                />
              )}

              {!otpSent ? (
                <MotionButton
                  type="button"
                  variant="contained"
                  fullWidth
                  disabled={busy}
                  onClick={handleSendOtp}
                  startIcon={
                    loadingAction === "send-otp" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <EmailRoundedIcon />
                    )
                  }
                  sx={primaryButtonStyles}
                >
                  {loadingAction === "send-otp"
                    ? "Sending code..."
                    : "Send Email Login Code"}
                </MotionButton>
              ) : (
                <>
                  <MotionButton
                    type="button"
                    variant="contained"
                    fullWidth
                    disabled={busy || otp.length !== 6}
                    onClick={handleVerifyOtp}
                    startIcon={
                      loadingAction === "verify-otp" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <CheckCircleRoundedIcon />
                      )
                    }
                    sx={primaryButtonStyles}
                  >
                    {loadingAction === "verify-otp"
                      ? "Verifying..."
                      : "Verify Email Code"}
                  </MotionButton>

                  <Button
                    type="button"
                    disabled={busy}
                    onClick={handleSendOtp}
                    sx={{ textTransform: "none" }}
                  >
                    Resend code
                  </Button>
                </>
              )}

              <Button
                type="button"
                onClick={() => {
                  setShowEmailLogin(false);
                  setOtpSent(false);
                  setOtp("");
                  clearMessages();
                }}
                disabled={busy}
                sx={{ textTransform: "none" }}
              >
                Hide email login
              </Button>
            </Stack>
          </MotionBox>
        )}

        <Divider>
          <Typography variant="caption" color="text.secondary">
            NEW TO TAPREVIEW?
          </Typography>
        </Divider>

        <MotionButton
          component={Link}
          to="/signup"
          variant="outlined"
          fullWidth
          disabled={busy}
          endIcon={<ArrowForwardRoundedIcon />}
          startIcon={<PersonAddAltRoundedIcon />}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            minHeight: 50,
            borderRadius: 3,
            fontWeight: 700,
            borderWidth: 1.5,
            "&:hover": { borderWidth: 1.5 },
          }}
        >
          Create Business Account
        </MotionButton>
      </Stack>
    </MotionBox>
  );
}

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2.5,
    transition: "all 0.25s ease",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(37,99,235,0.08)",
    },
  },
};

const primaryButtonStyles = {
  minHeight: 50,
  borderRadius: 2.5,
  fontWeight: 800,
  fontSize: "0.98rem",
  boxShadow: "0 8px 22px rgba(37,99,235,0.18)",
};
