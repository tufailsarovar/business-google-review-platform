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
import { motion, AnimatePresence } from "framer-motion";
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
    let resizeObserver;
    let resizeTimer;

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

      const renderGoogleButton = () => {
        if (cancelled || !googleButtonRef.current) return;

        const container = googleButtonRef.current;
        const availableWidth = Math.floor(
          container.getBoundingClientRect().width,
        );

        if (availableWidth < 120) return;

        container.innerHTML = "";

        window.google.accounts.id.renderButton(container, {
          theme: theme.palette.mode === "dark" ? "filled_black" : "outline",
          size: "large",
          shape: "rectangular",
          text: "continue_with",
          width: Math.max(120, Math.min(availableWidth, 400)),
          logo_alignment: "left",
        });

        setGoogleReady(true);
      };

      const scheduleRender = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderGoogleButton, 100);
      };

      renderGoogleButton();

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(scheduleRender);
        resizeObserver.observe(googleButtonRef.current);
      }
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
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
      script?.removeEventListener("load", initializeGoogle);
    };
  }, [handleGoogleCredential, theme.palette.mode]);

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      minHeight: { xs: 44, sm: 48 },
      borderRadius: "7px",
      backgroundColor: "background.paper",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: primaryColor,
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 3px ${alpha(primaryColor, 0.08)}`,
      },
    },
    "& .MuiInputBase-input": {
      fontSize: { xs: "12px", sm: "14px" },
      py: 1.2,
    },
    "& .MuiInputLabel-root": {
      fontSize: { xs: "12px", sm: "14px" },
    },
  };

  const primaryButtonStyles = {
    minHeight: { xs: 44, sm: 48 },
    borderRadius: "7px",
    fontWeight: 750,
    fontSize: { xs: "12px", sm: "14px" },
    textTransform: "none",
    boxShadow: `0 4px 12px ${alpha(primaryColor, 0.2)}`,
    "&:hover": {
      boxShadow: `0 6px 16px ${alpha(primaryColor, 0.28)}`,
    },
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: "100%",
        maxWidth: 880,
        minWidth: 0,
        mx: "auto",
        p: { xs: 2, sm: 3.5, md: 5 },
        borderRadius: { xs: "28px", sm: "34px" },
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.7),
        backgroundColor: "background.paper",
        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.035)}`,
        boxSizing: "border-box",
        "& *, & *::before, & *::after": {
          boxSizing: "border-box",
        },
      }}
    >
      <Stack spacing={{ xs: 1.5, sm: 2 }}>
        {/* LOGOS */}
        <Stack
          alignItems="center"
          spacing={0}
          sx={{
            m: 0,
            p: 0,
            gap: 0,
            lineHeight: 0,
          }}
        >
          <Box
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Glyrus home"
            sx={{
              mt: 0,
              mb: "-22px",
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src="/glyrus_round_logo.png"
              alt="Glyrus logo"
              sx={{
                display: "block",
                width: { xs: 90, sm: 110, md: 125 },
                height: { xs: 90, sm: 110, md: 125 },
                objectFit: "contain",
                m: 0,
                p: 0,
              }}
            />
          </Box>
          <Box
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Glyrus home"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: "-15px",
              lineHeight: 0,
            }}
          >
            <Box
              component="img"
              src="/name_logo.png"
              alt="Glyrus"
              sx={{
                display: "block",
                width: { xs: 205, sm: 245, md: 270 },
                maxWidth: "90%",
                height: { xs: 48, sm: 58, md: 64 },
                objectFit: "contain",
                m: 0,
                p: 0,
              }}
            />
          </Box>
        </Stack>

        {/* WELCOME HEADING */}
        <Box
          sx={{
            textAlign: "center",
            mt: 0,
            mb: 0,
            p: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: "20px", sm: "34px", md: "28px" },
              fontWeight: 650,
              letterSpacing: { xs: "-0.8px", sm: "-1px" },
              lineHeight: 1.2,
              color: "text.primary",
              m: 0,
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              mb: 0,
              fontSize: { xs: "12px", sm: "15px", md: "16px" },
              lineHeight: 1.5,
            }}
          >
            Sign in to manage your TapReview business account.
          </Typography>
        </Box>

        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              key="error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: "7px",
                  py: 0,
                  fontSize: "12px",
                  "& .MuiAlert-message": { overflowWrap: "anywhere" },
                }}
              >
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
                severity="info"
                sx={{
                  borderRadius: "7px",
                  py: 0,
                  fontSize: "12px",
                  "& .MuiAlert-message": { overflowWrap: "anywhere" },
                }}
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

        {/* GOOGLE + EMAIL OTP BUTTONS */}
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 2 }}
          alignItems="stretch"
          sx={{
            width: "100%",
            minWidth: 0,
            "& > *": {
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: "100%",
            },
          }}
        >
          {GOOGLE_CLIENT_ID ? (
            <Box
              sx={{
                flex: "1 1 0",
                width: "50%",
                minWidth: 0,
                maxWidth: "100%",
                height: { xs: 46, sm: 54 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                border: "1px solid",
                borderColor: alpha(theme.palette.divider, 0.9),
                borderRadius: "7px",
                backgroundColor: "background.paper",
                "& iframe": {
                  maxWidth: "100% !important",
                },
              }}
            >
              <Box
                ref={googleButtonRef}
                sx={{
                  width: "100%",
                  minWidth: 0,
                  maxWidth: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                  "& > div": {
                    width: "100% !important",
                    maxWidth: "100% !important",
                  },
                  "& iframe": {
                    maxWidth: "100% !important",
                  },
                }}
              />
              {!googleReady && (
                <CircularProgress
                  size={15}
                  sx={{ ml: 0.5, flexShrink: 0 }}
                  aria-label="Loading Google sign-in"
                />
              )}
            </Box>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              disabled
              sx={{
                minWidth: 0,
                height: { xs: 46, sm: 54 },
                borderRadius: "7px",
                fontSize: { xs: "10px", sm: "13px" },
                textTransform: "none",
              }}
            >
              Google unavailable
            </Button>
          )}

          <MotionButton
            type="button"
            fullWidth
            variant="outlined"
            disabled={busy}
            onClick={() => {
              setShowEmailLogin((previous) => !previous);
              clearMessages();
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            startIcon={<EmailRoundedIcon />}
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: "100%",
              minHeight: { xs: 46, sm: 54 },
              px: { xs: 0.5, sm: 1.5 },
              borderRadius: "7px",
              borderWidth: 1,
              fontSize: { xs: "11px", sm: "14px" },
              fontWeight: 750,
              textTransform: "none",
              whiteSpace: "nowrap",
              "&:hover": {
                borderWidth: 1,
                backgroundColor: alpha(primaryColor, 0.04),
              },
              "& .MuiButton-startIcon": {
                mr: { xs: 0.4, sm: 0.8 },
                ml: 0,
                flexShrink: 0,
              },
              "& .MuiButton-startIcon > *": {
                fontSize: { xs: 16, sm: 20 },
              },
            }}
          >
            {showEmailLogin ? "Hide Email OTP" : "Email OTP"}
          </MotionButton>
        </Stack>

        <AnimatePresence initial={false}>
          {showEmailLogin && (
            <MotionBox
              key="email-login"
              initial={{ opacity: 0, height: 0, y: 6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              sx={{ overflow: "hidden", minWidth: 0 }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2.5 },
                  borderRadius: "7px",
                  border: "1px solid",
                  borderColor: alpha(primaryColor, 0.16),
                  backgroundColor: alpha(primaryColor, 0.025),
                }}
              >
                <Stack spacing={{ xs: 1.4, sm: 1.8 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "7px",
                        color: "primary.main",
                        backgroundColor: alpha(primaryColor, 0.09),
                      }}
                    >
                      {otpSent ? (
                        <CheckCircleRoundedIcon />
                      ) : (
                        <EmailRoundedIcon />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "12px", sm: "14px" },
                        }}
                      >
                        {otpSent ? "Verify your email" : "Email verification"}
                      </Typography>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: { xs: "10px", sm: "12px" } }}
                      >
                        {otpSent
                          ? "Enter the 6-digit code sent to your inbox."
                          : "We'll send you a one-time login code."}
                      </Typography>
                    </Box>
                  </Stack>

                  <TextField
                    required
                    fullWidth
                    label="Business email address"
                    placeholder="you@company.com"
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

                  <AnimatePresence initial={false}>
                    {otpSent && (
                      <MotionBox
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <TextField
                          required
                          fullWidth
                          label="Six-digit verification code"
                          placeholder="000000"
                          value={otp}
                          onChange={(event) =>
                            setOtp(
                              event.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          inputProps={{
                            inputMode: "numeric",
                            maxLength: 6,
                            autoComplete: "one-time-code",
                          }}
                          disabled={busy}
                          sx={{
                            ...fieldStyles,
                            "& input": {
                              letterSpacing: "0.3em",
                              fontWeight: 800,
                            },
                          }}
                        />
                      </MotionBox>
                    )}
                  </AnimatePresence>

                  {!otpSent ? (
                    <MotionButton
                      type="button"
                      variant="contained"
                      fullWidth
                      disabled={busy}
                      onClick={handleSendOtp}
                      startIcon={
                        loadingAction === "send-otp" ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <EmailRoundedIcon />
                        )
                      }
                      whileTap={{ scale: 0.99 }}
                      sx={primaryButtonStyles}
                    >
                      {loadingAction === "send-otp"
                        ? "Sending code..."
                        : "Send Login Code"}
                    </MotionButton>
                  ) : (
                    <Stack spacing={0.5}>
                      <MotionButton
                        type="button"
                        variant="contained"
                        fullWidth
                        disabled={busy || otp.length !== 6}
                        onClick={handleVerifyOtp}
                        startIcon={
                          loadingAction === "verify-otp" ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CheckCircleRoundedIcon />
                          )
                        }
                        whileTap={{ scale: 0.99 }}
                        sx={primaryButtonStyles}
                      >
                        {loadingAction === "verify-otp"
                          ? "Verifying..."
                          : "Verify & Sign In"}
                      </MotionButton>

                      <Button
                        type="button"
                        disabled={busy}
                        onClick={handleSendOtp}
                        sx={{
                          minHeight: 30,
                          fontSize: "11px",
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Resend verification code
                      </Button>
                    </Stack>
                  )}

                  <Button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setShowEmailLogin(false);
                      setOtpSent(false);
                      setOtp("");
                      clearMessages();
                    }}
                    sx={{
                      minHeight: 28,
                      fontSize: "11px",
                      textTransform: "none",
                      color: "text.secondary",
                    }}
                  >
                    Cancel email sign-in
                  </Button>
                </Stack>
              </Box>
            </MotionBox>
          )}
        </AnimatePresence>

        <Divider>
          <Typography
            sx={{
              px: 0.75,
              whiteSpace: "nowrap",
              fontSize: { xs: "9px", sm: "11px" },
              fontWeight: 800,
              letterSpacing: { xs: 0.45, sm: 0.9 },
              color: "text.secondary",
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
          endIcon={<ArrowForwardRoundedIcon />}
          startIcon={<PersonAddAltRoundedIcon />}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.99 }}
          sx={{
            minHeight: { xs: 46, sm: 54 },
            px: { xs: 1, sm: 1.5 },
            borderRadius: "7px",
            borderWidth: 1,
            fontWeight: 750,
            fontSize: { xs: "11px", sm: "14px" },
            textTransform: "none",
            whiteSpace: "nowrap",
            "&:hover": {
              borderWidth: 1,
              backgroundColor: alpha(primaryColor, 0.04),
            },
          }}
        >
          Create Business Account
        </MotionButton>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
            pt: 0.2,
          }}
        >
          <ShieldRoundedIcon
            sx={{ fontSize: 14, color: "success.main", flexShrink: 0 }}
          />
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "9px", sm: "12px" },
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            Secure sign-in · Your account stays protected
          </Typography>
        </Box>

        <Typography
          component="div"
          sx={{
            pt: { xs: 0.5, sm: 0.8 },
            textAlign: "center",
            fontSize: { xs: "10px", sm: "12px" },
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
