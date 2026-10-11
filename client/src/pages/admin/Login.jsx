
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Fade,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function AdminLogin() {
  const navigate = useNavigate();

  const {
    sendSuperAdminEmailOtp,
    verifySuperAdminEmailOtp,
    superAdminGoogleLogin,
    sendEmailOtp,
    verifyEmailOtp,
    googleLogin,
  } = useAuth();

  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);
  const googleInitializedRef = useRef(false);
  const resizeObserverRef = useRef(null);
  const resizeTimerRef = useRef(null);

  const [mode, setMode] = useState("google");
  const [form, setForm] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const email = form.email.trim().toLowerCase();

  const finishLogin = useCallback(
    (response) => {
      if (
        response?.user?.role !== "admin" ||
        response?.user?.superAdmin !== true
      ) {
        throw new Error(
          "Access denied. This account is not an authorized Super Admin.",
        );
      }

      navigate("/admin/dashboard", { replace: true });
    },
    [navigate],
  );

  const handleGoogleCredential = useCallback(
    async (credential) => {
      if (!credential) {
        setError("Google sign-in did not return a valid credential.");
        return;
      }

      if (googleCallbackRef.current) return;
      googleCallbackRef.current = true;

      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const response = superAdminGoogleLogin
          ? await superAdminGoogleLogin(credential)
          : await googleLogin(credential);

        finishLogin(response);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Google sign-in failed. Please try again.",
        );
      } finally {
        googleCallbackRef.current = false;
        setLoading(false);
      }
    },
    [superAdminGoogleLogin, googleLogin, finishLogin],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSendOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = sendSuperAdminEmailOtp
        ? await sendSuperAdminEmailOtp(email)
        : await sendEmailOtp(email);

      setOtpSent(true);
      setForm((previous) => ({ ...previous, otp: "" }));
      setSuccess(
        response?.message || "Verification code sent to your email.",
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to send the verification code.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!email || !/^\d{6}$/.test(form.otp.trim())) {
      setError("Enter the six-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = verifySuperAdminEmailOtp
        ? await verifySuperAdminEmailOtp({
            email,
            otp: form.otp.trim(),
          })
        : await verifyEmailOtp({
            email,
            otp: form.otp.trim(),
          });

      finishLogin(response);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Verification failed. This account may not have admin access.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Load Google Identity Services once. Keep its button container mounted.
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;
    let retryTimer;
    let scriptCreated = false;

    const renderGoogleButton = () => {
      const container = googleButtonRef.current;

      if (cancelled || !container || !window.google?.accounts?.id) return;

      const width = Math.floor(container.getBoundingClientRect().width);
      if (width < 100) return;

      const existingWidth = container.dataset.renderedWidth;
      const hasButton = Boolean(container.querySelector("iframe"));

      if (existingWidth === String(width) && hasButton) return;

      container.replaceChildren();
      delete container.dataset.renderedWidth;

      window.google.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(360, width),
        logo_alignment: "left",
      });

      container.dataset.renderedWidth = String(width);
    };

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return false;

      // Initialize only once; switching tabs must not reset the GIS client.
      if (!googleInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            handleGoogleCredential(response?.credential);
          },
        });

        googleInitializedRef.current = true;
      }

      renderGoogleButton();
      return true;
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    const onScriptLoad = () => initializeGoogle();

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (existingScript) {
      existingScript.addEventListener("load", onScriptLoad);

      retryTimer = window.setInterval(() => {
        if (initializeGoogle()) {
          window.clearInterval(retryTimer);
        }
      }, 300);
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = onScriptLoad;
      script.onerror = () => {
        if (!cancelled) {
          setError("Unable to load Google sign-in. Please try again.");
        }
      };

      document.head.appendChild(script);
      scriptCreated = true;
    }

    const container = googleButtonRef.current;

    if (container && typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        window.clearTimeout(resizeTimerRef.current);
        resizeTimerRef.current = window.setTimeout(
          renderGoogleButton,
          150,
        );
      });

      resizeObserverRef.current.observe(container);
    }

    return () => {
      cancelled = true;
      window.clearInterval(retryTimer);
      window.clearTimeout(resizeTimerRef.current);
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      existingScript?.removeEventListener("load", onScriptLoad);

      // Keep the shared Google script in the document.
      // Do not remove the rendered button when changing login modes.
      void scriptCreated;
    };
  }, [handleGoogleCredential]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "auto", md: "calc(100vh - 90px)" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        py: { xs: 1.5, sm: 3, md: 7 },
        px: { xs: 1.5, sm: 2 },
        background:
          "linear-gradient(135deg, #edf3ff 0%, #f7f9ff 48%, #e9efff 100%)",
      }}
    >
      <MotionBox
        aria-hidden="true"
        animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: { xs: 180, md: 300 },
          height: { xs: 180, md: 300 },
          top: { xs: 15, md: 45 },
          left: { xs: -90, md: "8%" },
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.10)",
          pointerEvents: "none",
        }}
      />

      <MotionBox
        aria-hidden="true"
        animate={{ y: [0, 20, 0], x: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: { xs: 190, md: 320 },
          height: { xs: 190, md: 320 },
          right: { xs: -100, md: "7%" },
          bottom: { xs: 15, md: 30 },
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.10)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <MotionPaper
          elevation={0}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          sx={{
            width: "100%",
            maxWidth: 490,
            mx: "auto",
            p: { xs: 2, sm: 4, md: 4.5 },
            borderRadius: { xs: "22px", sm: "30px" },
            border: "1px solid rgba(148,163,184,0.28)",
            bgcolor: "#fff",
            boxShadow: "0 24px 80px rgba(30,64,175,0.12)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: "linear-gradient(90deg, #2563eb, #6366f1, #818cf8)",
            }}
          />

          <Stack spacing={{ xs: 2, sm: 2.75 }}>
            {/* Brand */}
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="img"
                src="/glyrus_round_logo.png"
                alt="Glyrus logo"
                sx={{
                  display: "block",
                  width: { xs: 64, sm: 82 },
                  height: { xs: 64, sm: 82 },
                  objectFit: "contain",
                  mx: "auto",
                  mb: 0.5,
                }}
              />

              <Box
                component="img"
                src="/name_logo.png"
                alt="Glyrus"
                sx={{
                  display: "block",
                  width: { xs: 170, sm: 205 },
                  maxWidth: "80%",
                  height: "auto",
                  objectFit: "contain",
                  mx: "auto",
                  mb: 1.5,
                }}
              />

              <Box
                sx={{
                  width: 50,
                  height: 50,
                  mx: "auto",
                  mb: 1.5,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "16px",
                  color: "#fff",
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  boxShadow: "0 9px 24px rgba(37,99,235,0.25)",
                }}
              >
                <AdminPanelSettingsRoundedIcon sx={{ fontSize: 29 }} />
              </Box>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: 25, sm: 30 },
                  fontWeight: 850,
                  letterSpacing: "-0.8px",
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                Super Admin Login
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  mx: "auto",
                  maxWidth: 330,
                  fontSize: { xs: 13, sm: 14 },
                  lineHeight: 1.7,
                  color: "#64748b",
                }}
              >
                Secure access to your administration dashboard.
              </Typography>
            </Box>

            {/* Mode selector */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                p: 0.65,
                borderRadius: "15px",
                bgcolor: "#f1f5f9",
                border: "1px solid #e2e8f0",
              }}
            >
              {[
                { id: "google", label: "Google" },
                { id: "otp", label: "Email OTP" },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="text"
                  disabled={loading}
                  onClick={() => changeMode(item.id)}
                  sx={{
                    minHeight: 44,
                    borderRadius: "11px",
                    fontWeight: 750,
                    fontSize: 13,
                    textTransform: "none",
                    color: mode === item.id ? "#1d4ed8" : "#64748b",
                    bgcolor: mode === item.id ? "#fff" : "transparent",
                    boxShadow:
                      mode === item.id
                        ? "0 2px 8px rgba(15,23,42,0.07)"
                        : "none",
                    "&:hover": {
                      bgcolor:
                        mode === item.id ? "#fff" : "rgba(255,255,255,0.6)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {error && (
                <MotionBox
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <Alert
                    severity="error"
                    onClose={() => setError("")}
                    sx={{ borderRadius: "12px", fontSize: 13 }}
                  >
                    {error}
                  </Alert>
                </MotionBox>
              )}

              {success && (
                <MotionBox
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <Alert
                    severity="success"
                    onClose={() => setSuccess("")}
                    sx={{ borderRadius: "12px", fontSize: 13 }}
                  >
                    {success}
                  </Alert>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Google remains mounted while Email OTP is selected. */}
            <Box sx={{ display: mode === "google" ? "block" : "none" }}>
              {!GOOGLE_CLIENT_ID ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Google sign-in is not configured.
                </Alert>
              ) : (
                <Box
                  sx={{
                    minHeight: 54,
                    p: 0.75,
                    border: "1px solid #dbe4f0",
                    borderRadius: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    "& > div": { maxWidth: "100%" },
                  }}
                >
                  <Box
                    ref={googleButtonRef}
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  />
                </Box>
              )}
            </Box>

            {/* Email OTP remains mounted only while selected. */}
            <Box sx={{ display: mode === "otp" ? "block" : "none" }}>
              <Stack
                component="form"
                onSubmit={handleVerifyOtp}
                spacing={1.75}
              >
                <TextField
                  fullWidth
                  required
                  label="Admin email address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading || otpSent}
                  autoComplete="email"
                  placeholder="admin@example.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      minHeight: 52,
                      borderRadius: "12px",
                    },
                  }}
                />

                {!otpSent ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSendOtp}
                    disabled={loading}
                    sx={{
                      minHeight: 52,
                      borderRadius: "12px",
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "none",
                      background:
                        "linear-gradient(135deg, #2563eb, #4f46e5)",
                      "&:hover": {
                        boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
                        background:
                          "linear-gradient(135deg, #1d4ed8, #4338ca)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={21} color="inherit" />
                    ) : (
                      "Send verification code"
                    )}
                  </Button>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      required
                      label="Six-digit verification code"
                      name="otp"
                      value={form.otp}
                      onChange={(event) => {
                        setForm((previous) => ({
                          ...previous,
                          otp: event.target.value.replace(/\D/g, "").slice(0, 6),
                        }));
                        setError("");
                      }}
                      disabled={loading}
                      autoComplete="one-time-code"
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 6,
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          minHeight: 52,
                          borderRadius: "12px",
                        },
                      }}
                    />

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={loading || form.otp.length !== 6}
                      sx={{
                        minHeight: 52,
                        borderRadius: "12px",
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: "none",
                        background:
                          "linear-gradient(135deg, #2563eb, #4f46e5)",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={21} color="inherit" />
                      ) : (
                        "Verify and sign in"
                      )}
                    </Button>

                    <Stack direction="row" justifyContent="space-between">
                      <Button
                        size="small"
                        disabled={loading}
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => {
                          setOtpSent(false);
                          setForm((previous) => ({ ...previous, otp: "" }));
                          setError("");
                          setSuccess("");
                        }}
                        sx={{ textTransform: "none", fontWeight: 650 }}
                      >
                        Change email
                      </Button>

                      <Button
                        size="small"
                        disabled={loading}
                        onClick={handleSendOtp}
                        sx={{ textTransform: "none", fontWeight: 650 }}
                      >
                        Resend code
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>
            </Box>

            {loading && (
              <Fade in>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  alignItems="center"
                >
                  <CircularProgress size={15} />
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {mode === "google"
                      ? "Verifying administrator access..."
                      : otpSent
                        ? "Verifying your code..."
                        : "Sending verification code..."}
                  </Typography>
                </Stack>
              </Fade>
            )}

            <Divider>
              <Typography
                sx={{
                  px: 1,
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: 1.1,
                }}
              >
                SECURE ADMIN ACCESS
              </Typography>
            </Divider>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
            >
              <ShieldRoundedIcon sx={{ fontSize: 17, color: "success.main" }} />
              <Typography
                sx={{
                  fontSize: { xs: 11, sm: 12 },
                  color: "text.secondary",
                }}
              >
                Protected sign-in · Authorized administrators only
              </Typography>
            </Stack>

            <Typography
              sx={{
                textAlign: "center",
                fontSize: 11,
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
                  color: "#2563eb",
                  fontWeight: 850,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Glyrus.com
              </Box>
            </Typography>
          </Stack>
        </MotionPaper>
      </Container>
    </Box>
  );
}
