import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail, isValidMobile, isRequired } from "../../utils/validators";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const initialForm = {
  businessName: "",
  ownerName: "",
  email: "",
  mobile: "",
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function SignupForm() {
  const {
    sendEmailOtp,
    verifyEmailOtp,
    completeBusinessRegistration,
    googleLogin,
  } = useAuth();

  const googleButtonRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [googleCredential, setGoogleCredential] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [googleReady, setGoogleReady] = useState(false);

  const busy = Boolean(loadingAction);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response?.credential) {
            setServerError("Google sign-in did not return a valid credential.");
            return;
          }

          setLoadingAction("google");
          setServerError("");
          setNotice("");

          try {
            const result = await googleLogin(response.credential);
            const data = result?.data ?? result;

            if (data?.registrationRequired) {
              setGoogleCredential(response.credential);
              setForm((previous) => ({
                ...previous,
                email: data.email || previous.email,
                ownerName: data.name || previous.ownerName,
              }));
              setEmailVerified(true);
              setVerificationToken("");
              setNotice(
                "Google email verified. Complete your business details below.",
              );
            } else if (data?.token) {
              setNotice(
                "Your business account is approved. You can now sign in.",
              );
            } else {
              setServerError(
                data?.message || "Unable to continue with Google sign-in.",
              );
            }
          } catch (error) {
            setServerError(
              getErrorMessage(
                error,
                "Google sign-in failed. Please try again.",
              ),
            );
          } finally {
            setLoadingAction("");
          }
        },
      });

      if (googleButtonRef.current) {
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
      }

      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      let script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );

      const handleLoad = () => initializeGoogle();

      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", handleLoad);
        document.head.appendChild(script);
      } else {
        script.addEventListener("load", handleLoad);

        if (window.google?.accounts?.id) initializeGoogle();
      }

      return () => {
        cancelled = true;
        script?.removeEventListener("load", handleLoad);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [googleLogin]);

  const updateField = (field) => (event) => {
    let value = event.target.value;

    if (field === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    if (field === "email") {
      value = value.trimStart();
      setEmailVerified(false);
      setVerificationToken("");
      setGoogleCredential("");
      setOtpSent(false);
      setOtp("");
    }

    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setServerError("");
    setNotice("");
  };

  const validateDetails = () => {
    const nextErrors = {};

    if (!isRequired(form.businessName)) {
      nextErrors.businessName = "Business name is required.";
    }

    if (!isRequired(form.ownerName)) {
      nextErrors.ownerName = "Owner name is required.";
    }

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isValidMobile(form.mobile)) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendOtp = async () => {
    const nextErrors = {};

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
      setErrors(nextErrors);
      return;
    }

    setLoadingAction("send-otp");
    setServerError("");
    setNotice("");

    try {
      const result = await sendEmailOtp(form.email.trim().toLowerCase());
      const data = result?.data ?? result;

      setOtpSent(true);
      setOtp("");
      setVerificationToken("");
      setEmailVerified(false);
      setGoogleCredential("");
      setNotice(data?.message || "Verification code sent to your email.");
    } catch (error) {
      setServerError(
        getErrorMessage(error, "Unable to send the code. Please try again."),
      );
    } finally {
      setLoadingAction("");
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setServerError("Enter the six-digit code sent to your email.");
      return;
    }

    setLoadingAction("verify-otp");
    setServerError("");
    setNotice("");

    try {
      const result = await verifyEmailOtp({
        email: form.email.trim().toLowerCase(),
        otp,
      });

      const data = result?.data ?? result;

      if (!data?.verificationToken) {
        throw new Error("Email verification token was not returned.");
      }

      setVerificationToken(data.verificationToken);
      setEmailVerified(true);
      setGoogleCredential("");
      setOtpSent(false);
      setNotice(data.message || "Email verified successfully.");
    } catch (error) {
      setServerError(
        getErrorMessage(error, "Incorrect or expired code. Please try again."),
      );
    } finally {
      setLoadingAction("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateDetails()) return;

    if (!emailVerified || (!verificationToken && !googleCredential)) {
      setServerError(
        "Verify your email using OTP or Google before continuing.",
      );
      return;
    }

    setLoadingAction("submit");
    setServerError("");
    setNotice("");

    try {
      const result = await completeBusinessRegistration({
        businessName: form.businessName.trim(),
        name: form.ownerName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.mobile,
        ...(verificationToken ? { verificationToken } : {}),
        ...(googleCredential ? { googleCredential } : {}),
      });

      const data = result?.data ?? result;

      if (data?.success === false) {
        throw new Error(data.message || "Registration could not be submitted.");
      }

      setSubmitted(true);
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to submit your registration. Please try again.",
        ),
      );
    } finally {
      setLoadingAction("");
    }
  };

  if (submitted) {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack
          spacing={2.5}
          alignItems="center"
          textAlign="center"
          sx={{ py: 3 }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "success.main",
              color: "success.contrastText",
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 46 }} />
          </Box>

          <Typography component="h1" variant="h4" fontWeight={900}>
            Registration Submitted
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ maxWidth: 470, lineHeight: 1.7 }}
          >
            Your business registration request has been submitted successfully.
            Our admin team will review your details before activating your
            account.
          </Typography>

          <Box
            sx={{
              width: "100%",
              maxWidth: 470,
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "warning.light",
              bgcolor: "rgba(245,158,11,0.06)",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <HourglassTopRoundedIcon color="warning" />

              <Box sx={{ textAlign: "left" }}>
                <Typography fontWeight={800}>
                  Waiting for admin approval
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  You will receive updates at <strong>{form.email}</strong>.
                  Business dashboard access is available after approval.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <MotionButton
            component={Link}
            to="/login"
            variant="contained"
            fullWidth
            startIcon={<LoginRoundedIcon />}
            endIcon={<ArrowForwardRoundedIcon />}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              maxWidth: 470,
              minHeight: 50,
              borderRadius: 2.5,
              fontWeight: 800,
            }}
          >
            Back to Login
          </MotionButton>
        </Stack>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Stack component="form" onSubmit={handleSubmit} noValidate spacing={1.8}>
        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Alert severity="error" sx={{ borderRadius: 2.5 }}>
                {serverError}
              </Alert>
            </MotionBox>
          )}

          {notice && (
            <MotionBox
              key="notice"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Alert severity="success" sx={{ borderRadius: 2.5 }}>
                {notice}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        <TextField
          required
          fullWidth
          label="Business name"
          placeholder="Enter your business name"
          autoComplete="organization"
          value={form.businessName}
          onChange={updateField("businessName")}
          error={Boolean(errors.businessName)}
          helperText={errors.businessName || "Example: Royal Feast"}
          disabled={busy}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        <TextField
          required
          fullWidth
          label="Owner name"
          placeholder="Enter your full name"
          autoComplete="name"
          value={form.ownerName}
          onChange={updateField("ownerName")}
          error={Boolean(errors.ownerName)}
          helperText={errors.ownerName || "Name of the business owner"}
          disabled={busy}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        <TextField
          required
          fullWidth
          label="Email address"
          placeholder="Enter your email address"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={updateField("email")}
          error={Boolean(errors.email)}
          helperText={
            errors.email ||
            (emailVerified
              ? "Email verified successfully."
              : "Verify your email to continue.")
          }
          disabled={busy || emailVerified}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: emailVerified ? (
              <InputAdornment position="end">
                <CheckCircleRoundedIcon color="success" />
              </InputAdornment>
            ) : null,
          }}
          sx={fieldStyles}
        />

        {!emailVerified && (
          <>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleSendOtp}
              disabled={busy}
              sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 800 }}
            >
              {loadingAction === "send-otp" ? (
                <CircularProgress size={21} />
              ) : otpSent ? (
                "Resend Email Code"
              ) : (
                "Send Email Verification Code"
              )}
            </Button>

            {otpSent && (
              <Stack spacing={1.2}>
                <TextField
                  fullWidth
                  label="6-digit email code"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputProps={{ inputMode: "numeric", maxLength: 6 }}
                  disabled={busy}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                <Button
                  type="button"
                  variant="contained"
                  onClick={handleVerifyOtp}
                  disabled={busy || otp.length !== 6}
                  sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 800 }}
                >
                  {loadingAction === "verify-otp" ? (
                    <CircularProgress size={21} color="inherit" />
                  ) : (
                    "Verify Email"
                  )}
                </Button>
              </Stack>
            )}
          </>
        )}

        <TextField
          required
          fullWidth
          label="Mobile number"
          placeholder="Enter 10-digit mobile number"
          type="tel"
          autoComplete="tel"
          value={form.mobile}
          onChange={updateField("mobile")}
          error={Boolean(errors.mobile)}
          helperText={errors.mobile || "Example: 9876543210"}
          disabled={busy}
          inputProps={{ inputMode: "numeric", maxLength: 10 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        <MotionButton
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={busy || !emailVerified}
          startIcon={
            loadingAction === "submit" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PersonAddAltRoundedIcon />
            )
          }
          whileHover={!busy ? { y: -2, scale: 1.01 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
          sx={{
            minHeight: 52,
            mt: 0.5,
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: "0.98rem",
            boxShadow: "0 8px 22px rgba(37,99,235,0.18)",
          }}
        >
          {loadingAction === "submit"
            ? "Submitting registration..."
            : "Submit Registration Request"}
        </MotionButton>

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            OR CONTINUE WITH
          </Typography>
        </Divider>

        {GOOGLE_CLIENT_ID ? (
          <Box
            sx={{
              minHeight: 44,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              "& > div": { maxWidth: "100%" },
            }}
          >
            <Box ref={googleButtonRef} />
            {!googleReady && (
              <Typography variant="caption" color="text.secondary">
                {busy ? "Connecting..." : "Loading Google sign-in..."}
              </Typography>
            )}
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            Google sign-in will be available after configuring
            VITE_GOOGLE_CLIENT_ID.
          </Alert>
        )}

        <Divider sx={{ my: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
            ALREADY REGISTERED?
          </Typography>
        </Divider>

        <MotionButton
          component={Link}
          to="/login"
          variant="outlined"
          fullWidth
          disabled={busy}
          startIcon={<LoginRoundedIcon />}
          endIcon={<ArrowForwardRoundedIcon />}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            minHeight: 50,
            borderRadius: 2.5,
            fontWeight: 700,
            borderWidth: 1.5,
            "&:hover": { borderWidth: 1.5 },
          }}
        >
          Back to Login
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
  "& .MuiFormHelperText-root": {
    ml: 0.5,
  },
};
