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
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail } from "../../utils/validators";
import { STORAGE_KEYS } from "../../utils/constants";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const fieldStyles = {
  "& .MuiInputLabel-root": {
    fontSize: { xs: 13, sm: 14 },
  },
  "& .MuiOutlinedInput-root": {
    minHeight: 48,
    borderRadius: "12px",
    bgcolor: "background.paper",
    "& fieldset": {
      borderColor: "rgba(148,163,184,0.45)",
    },
    "&:hover fieldset": {
      borderColor: "primary.main",
    },
    "&.Mui-focused fieldset": {
      borderWidth: 1.5,
    },
  },
  "& .MuiInputBase-input": {
    fontSize: { xs: 14, sm: 15 },
    py: 1.5,
    px: 1.75,
  },
  "& .MuiFormHelperText-root": {
    mx: 0.5,
    fontSize: 11,
  },
};

export default function LoginForm() {
  const theme = useTheme();
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
  const primaryColor = theme.palette.primary.main;

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
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmail(normalizedEmail)) {
      setServerError("Enter a valid email address.");
      return;
    }

    setLoadingAction("send-otp");

    try {
      const result = await sendEmailOtp(normalizedEmail, "login");
      const data = result?.data ?? result;

      setOtpSent(true);
      setOtp("");
      setNotice(data?.message || "Verification code sent to your email.");
    } catch (error) {
      setServerError(
        getErrorMessage(error, "Unable to send the verification code."),
      );
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
        navigateAfterLogin(data.user);
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
          /not found|not registered|register|registration required|no business|account does not exist/i.test(
            message,
          )
        ) {
          redirectToSignupAfterAlert({
            email: email.trim().toLowerCase(),
            googleCredential: credential,
          });
        } else {
          setServerError(message);
        }
      } finally {
        setLoadingAction("");
      }
    },
    [email, googleLogin, navigateAfterLogin, redirectToSignupAfterAlert],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;
    let resizeObserver;
    let resizeTimer;
    let loadTimeout;

    const renderGoogleButton = () => {
      const container = googleButtonRef.current;

      if (cancelled || !container || !window.google?.accounts?.id) {
        return;
      }

      const width = Math.floor(container.getBoundingClientRect().width);
      if (width < 100) return;

      // Avoid rebuilding the button when its width has not changed.
      if (container.dataset.googleWidth === String(width)) return;

      container.innerHTML = "";
      container.dataset.googleWidth = String(width);

      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: theme.palette.mode === "dark" ? "filled_black" : "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: Math.min(width, 400),
      });

      setGoogleReady(true);
    };

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (!cancelled) {
            handleGoogleCredential(response?.credential);
          }
        },
      });

      renderGoogleButton();
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle);
      loadTimeout = setTimeout(initializeGoogle, 1000);
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        if (!cancelled) {
          setServerError(
            "Google sign-in could not load. Please use email OTP.",
          );
        }
      };
      document.head.appendChild(script);
    }

    if (typeof ResizeObserver !== "undefined" && googleButtonRef.current) {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderGoogleButton, 150);
      });
      resizeObserver.observe(googleButtonRef.current);
    }

    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      clearTimeout(loadTimeout);
      resizeObserver?.disconnect();
      existingScript?.removeEventListener("load", initializeGoogle);
    };
  }, [handleGoogleCredential, theme.palette.mode]);

  const toggleEmailLogin = () => {
    clearMessages();
    setShowEmailLogin((previous) => !previous);
    setOtpSent(false);
    setOtp("");
  };

  const buttonStyles = {
    minHeight: { xs: 46, sm: 50 },
    borderRadius: "12px",
    fontSize: { xs: 13, sm: 14 },
    fontWeight: 750,
    textTransform: "none",
    px: { xs: 1.25, sm: 2 },
    whiteSpace: "nowrap",
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      sx={{
        width: "100%",
        maxWidth: 520,
        mx: "auto",
        p: { xs: 2, sm: 3.5, md: 4 },
        borderRadius: 0,
        bgcolor: "transparent",
        border: "none",
        boxShadow: "none",
        boxSizing: "border-box",
        "& *, & *::before, & *::after": {
          boxSizing: "border-box",
        },
      }}
    >
      <Stack spacing={{ xs: 2, sm: 2.5 }}>
        <Stack alignItems="center" spacing={0}>
          <Box
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Glyrus home"
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              component="img"
              src="/glyrus_round_logo.png"
              alt="Glyrus logo"
              sx={{
                display: "block",
                width: { xs: 76, sm: 92 },
                height: { xs: 76, sm: 92 },
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Glyrus website"
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: -0.5,
              mb: 1.25,
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src="/name_logo.png"
              alt="Glyrus"
              sx={{
                display: "block",
                width: { xs: 175, sm: 220 },
                maxWidth: "85%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: 20, sm: 23 },
              fontWeight: 750,
              letterSpacing: "-0.8px",
              lineHeight: 0.9,
              color: "text.primary",
              textAlign: "center",
              mt: 1,
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              fontSize: { xs: 12.5, sm: 14 },
              textAlign: "center",
              lineHeight: 1.6,
              maxWidth: 340,
            }}
          >
            Sign in to manage your TapReview business account.
          </Typography>
        </Stack>

        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <Alert
                severity="error"
                onClose={() => setServerError("")}
                sx={{ borderRadius: "12px", fontSize: 13 }}
              >
                {serverError}
              </Alert>
            </MotionBox>
          )}

          {notice && (
            <MotionBox
              key="notice"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <Alert
                severity="success"
                onClose={() => setNotice("")}
                sx={{ borderRadius: "12px", fontSize: 13 }}
              >
                {notice}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        <Stack spacing={1.25}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.25,
              alignItems: "stretch",
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                minHeight: { xs: 46, sm: 50 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.75,
                bgcolor: "background.paper",
                "& iframe": {
                  maxWidth: "100% !important",
                },
              }}
            >
              {!GOOGLE_CLIENT_ID ? (
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: 12, textAlign: "center" }}
                >
                  Google sign-in unavailable
                </Typography>
              ) : (
                <Box
                  ref={googleButtonRef}
                  sx={{
                    width: "100%",
                    minWidth: 0,
                    display: "flex",
                    justifyContent: "center",
                    "& > div": { maxWidth: "100%" },
                  }}
                />
              )}
            </Box>

            <MotionButton
              variant="outlined"
              onClick={toggleEmailLogin}
              disabled={busy}
              startIcon={<EmailRoundedIcon />}
              endIcon={showEmailLogin ? null : <ArrowForwardRoundedIcon />}
              whileTap={{ scale: 0.98 }}
              sx={{
                ...buttonStyles,
                borderColor: alpha(primaryColor, 0.45),
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(primaryColor, 0.045),
                },
              }}
            >
              {showEmailLogin ? "Hide Email OTP" : "Continue with Email"}
            </MotionButton>
          </Box>

          {GOOGLE_CLIENT_ID && !googleReady && !busy && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: 11, textAlign: "center" }}
            >
              Loading Google sign-in…
            </Typography>
          )}
        </Stack>

        <AnimatePresence initial={false}>
          {showEmailLogin && (
            <MotionBox
              key="email-login"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              sx={{ overflow: "hidden" }}
            >
              <Stack
                spacing={1.5}
                sx={{
                  pt: 1.5,
                  p: { xs: 1.5, sm: 2 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "14px",
                  bgcolor: alpha(primaryColor, 0.025),
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 750,
                    color: "text.primary",
                  }}
                >
                  Sign in with email OTP
                </Typography>

                <TextField
                  fullWidth
                  required
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  disabled={busy || otpSent}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearMessages();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !otpSent) {
                      event.preventDefault();
                      handleSendOtp();
                    }
                  }}
                  sx={fieldStyles}
                />

                {!otpSent ? (
                  <MotionButton
                    fullWidth
                    variant="contained"
                    disabled={busy}
                    onClick={handleSendOtp}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      ...buttonStyles,
                      minHeight: 52,
                      borderRadius: "12px",
                      fontSize: 14,
                      fontWeight: 750,
                      boxShadow: "none",
                    }}
                  >
                    {loadingAction === "send-otp" ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Send verification code"
                    )}
                  </MotionButton>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      required
                      label="6-digit verification code"
                      placeholder="000000"
                      value={otp}
                      disabled={busy}
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 6,
                        autoComplete: "one-time-code",
                      }}
                      onChange={(event) => {
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                        clearMessages();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleVerifyOtp();
                        }
                      }}
                      sx={fieldStyles}
                    />

                    <MotionButton
                      fullWidth
                      variant="contained"
                      disabled={busy || !/^\d{6}$/.test(otp)}
                      onClick={handleVerifyOtp}
                      startIcon={
                        loadingAction === "verify-otp" ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <CheckCircleRoundedIcon />
                        )
                      }
                      whileTap={{ scale: 0.98 }}
                      sx={buttonStyles}
                    >
                      {loadingAction === "verify-otp"
                        ? "Verifying..."
                        : "Verify and sign in"}
                    </MotionButton>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Button
                        size="small"
                        disabled={busy}
                        onClick={handleSendOtp}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        Resend code
                      </Button>

                      <Button
                        size="small"
                        disabled={busy}
                        onClick={() => {
                          setOtpSent(false);
                          setOtp("");
                          clearMessages();
                        }}
                        sx={{
                          textTransform: "none",
                          fontSize: 12,
                        }}
                      >
                        Change email
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </MotionBox>
          )}
        </AnimatePresence>

        {busy && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{ py: 0.25 }}
          >
            <CircularProgress size={15} />
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {loadingAction === "google-login"
                ? "Signing in with Google..."
                : loadingAction === "send-otp"
                  ? "Sending verification code..."
                  : loadingAction === "verify-otp"
                    ? "Verifying your code..."
                    : "Please wait..."}
            </Typography>
          </Stack>
        )}

        <Divider sx={{ my: 0.25 }}>
          <Typography
            color="text.secondary"
            sx={{
              px: 1,
              fontSize: { xs: 9, sm: 10 },
              fontWeight: 800,
              letterSpacing: 0.8,
            }}
          >
            NEW TO TAPREVIEW?
          </Typography>
        </Divider>

        <MotionButton
          component={Link}
          to="/signup"
          variant="outlined"
          fullWidth
          disabled={busy}
          startIcon={<PersonAddAltRoundedIcon />}
          endIcon={<ArrowForwardRoundedIcon />}
          whileTap={{ scale: 0.98 }}
          sx={{
            ...buttonStyles,
            borderColor: alpha(primaryColor, 0.45),
            "&:hover": {
              borderColor: "primary.main",
              borderWidth: 1,
              bgcolor: alpha(primaryColor, 0.04),
            },
          }}
        >
          Create Business Account
        </MotionButton>

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={0.6}
          sx={{ pt: 0.25 }}
        >
          <ShieldRoundedIcon
            sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }}
          />
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: 10, sm: 11 },
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Secure sign-in · Your account stays protected
          </Typography>
        </Stack>

        <Typography
          component="div"
          sx={{
            textAlign: "center",
            fontSize: { xs: 10, sm: 11 },
            color: "text.secondary",
          }}
        >
          Powered by{" "}
          <Box
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: "primary.main",
              fontWeight: 800,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Glyrus.com
          </Box>
        </Typography>
      </Stack>
    </MotionBox>
  );
}
