import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const MotionBox = motion(Box);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

  const [mode, setMode] = useState("google");
  const [form, setForm] = useState({ email: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const email = form.email.trim().toLowerCase();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
    setSuccess("");
  };

  const finishLogin = (response) => {
    if (
      response?.user?.role !== "admin" ||
      response?.user?.superAdmin !== true
    ) {
      throw new Error(
        "Access denied. This Google account or email is not an authorized Super Admin.",
      );
    }

    navigate("/admin/dashboard", { replace: true });
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

      // Use the dedicated Super Admin OTP endpoint when available.
      // Business OTP fallback is checked for admin authorization on verification.
      const response = sendSuperAdminEmailOtp
        ? await sendSuperAdminEmailOtp(email)
        : await sendEmailOtp(email);

      setOtpSent(true);
      setForm((previous) => ({ ...previous, otp: "" }));
      setSuccess(response?.message || "Verification code sent to your email.");
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

  const handleGoogleCredential = async (credential) => {
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
          "Access denied. This Google account is not an authorized Super Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== "google" || !GOOGLE_CLIENT_ID) return undefined;

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

      googleButtonRef.current.replaceChildren();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            handleGoogleCredential(response.credential);
          } else {
            setError("Google sign-in did not return a valid credential.");
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        width: Math.min(
          360,
          googleButtonRef.current.parentElement?.clientWidth || 360,
        ),
      });
    };

    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle);
    } else {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        if (!cancelled) {
          setError("Unable to load Google sign-in.");
        }
      };

      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      existingScript?.removeEventListener("load", initializeGoogle);
      if (script) script.onload = null;
    };
  }, [mode]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setOtpSent(false);
    setForm((previous) => ({ ...previous, otp: "" }));
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
        py: { xs: 4, md: 8 },
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.04))",
      }}
    >
      <Container maxWidth="sm">
        <MotionBox
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  color: "#fff",
                }}
              >
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>

              <Typography component="h1" variant="h4" fontWeight={800}>
                Super Admin Login
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Sign in using your authorized Google account or email OTP.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 1,
                mb: 3,
              }}
            >
              <Button
                variant={mode === "google" ? "contained" : "outlined"}
                onClick={() => changeMode("google")}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Google
              </Button>

              <Button
                variant={mode === "otp" ? "contained" : "outlined"}
                onClick={() => changeMode("otp")}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Email OTP
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            {mode === "google" && (
              <Box sx={{ textAlign: "center" }}>
                {!GOOGLE_CLIENT_ID ? (
                  <Alert severity="warning" sx={{ textAlign: "left" }}>
                    Add VITE_GOOGLE_CLIENT_ID to your frontend environment.
                  </Alert>
                ) : (
                  <Box
                    sx={{
                      minHeight: 48,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "& > div": { maxWidth: "100%" },
                    }}
                  >
                    <Box ref={googleButtonRef} />
                  </Box>
                )}

                {loading && (
                  <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Verifying account...
                  </Typography>
                )}
              </Box>
            )}

            {mode === "otp" && (
              <Box component="form" onSubmit={handleVerifyOtp} noValidate>
                <TextField
                  fullWidth
                  required
                  label="Admin Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading || otpSent}
                  autoComplete="email"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <EmailOutlinedIcon
                        sx={{ mr: 1, color: "action.active" }}
                      />
                    ),
                  }}
                />

                {!otpSent ? (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    onClick={handleSendOtp}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    {loading ? "Sending code..." : "Send Email OTP"}
                  </Button>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      required
                      label="Six-Digit Verification Code"
                      name="otp"
                      value={form.otp}
                      onChange={(event) => {
                        setForm((previous) => ({
                          ...previous,
                          otp: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6),
                        }));
                        setError("");
                      }}
                      disabled={loading}
                      autoComplete="one-time-code"
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 6,
                      }}
                      margin="normal"
                    />

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || form.otp.length !== 6}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: "none",
                      }}
                    >
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </Button>

                    <Button
                      fullWidth
                      disabled={loading}
                      onClick={() => {
                        setOtpSent(false);
                        setForm((previous) => ({
                          ...previous,
                          otp: "",
                        }));
                        setError("");
                        setSuccess("");
                      }}
                      startIcon={<ArrowBackOutlinedIcon />}
                      sx={{ mt: 1, textTransform: "none" }}
                    >
                      Change email
                    </Button>

                    <Button
                      fullWidth
                      disabled={loading}
                      onClick={handleSendOtp}
                      sx={{ mt: 0.5, textTransform: "none" }}
                    >
                      Resend code
                    </Button>
                  </>
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center" }}
            >
              Restricted to authorized administrators only.
            </Typography>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}
