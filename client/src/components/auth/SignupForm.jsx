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
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
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
  const [showEmailVerification, setShowEmailVerification] = useState(false);

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
              setShowEmailVerification(false);
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

        const buttonWidth = Math.floor(
          googleButtonRef.current.getBoundingClientRect().width,
        );

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: buttonWidth < 190 ? "icon" : "continue_with",
          width: Math.max(120, Math.min(400, buttonWidth || 220)),
          logo_alignment: "center",
        });
      }
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
      const result = await sendEmailOtp(
        form.email.trim().toLowerCase(),
        "registration",
      );
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
        purpose: "registration",
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
      const message =
        error?.response?.data?.message ||
        getErrorMessage(error, "Incorrect or expired code. Please try again.");

      setServerError(message);

      if (
        error?.response?.status === 409 ||
        error?.response?.data?.alreadyRegistered
      ) {
        window.alert(message);
      }
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
        sx={{ width: "100%", maxWidth: 470, mx: "auto" }}
      >
        <Stack
          spacing={2}
          alignItems="center"
          textAlign="center"
          sx={{ py: { xs: 1.5, sm: 3 } }}
        >
          <Box
            sx={{
              width: { xs: 60, sm: 76 },
              height: { xs: 60, sm: 76 },
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              bgcolor: "success.main",
              color: "success.contrastText",
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: { xs: 36, sm: 46 } }} />
          </Box>

          <Typography
            component="h1"
            sx={{ fontSize: { xs: "1.4rem", sm: "2.125rem" }, fontWeight: 900 }}
          >
            Registration Submitted
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 470,
              fontSize: { xs: "0.85rem", sm: "1rem" },
              lineHeight: 1.7,
            }}
          >
            Your business registration request has been submitted successfully.
            Our admin team will review your details before activating your
            account.
          </Typography>

          <Box
            sx={{
              width: "100%",
              p: { xs: 1.5, sm: 2 },
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
                  sx={{ mt: 0.5, fontSize: { xs: "0.78rem", sm: "0.875rem" } }}
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
              minHeight: { xs: 44, sm: 50 },
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform: "none",
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
      initial={{ opacity: 0, y: 22, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      sx={{
        width: "100%",
        maxWidth: 760,
        mx: "auto",
        p: { xs: 1.5, sm: 3.5, md: 4.5 },
        borderRadius: { xs: "24px", sm: "30px" },
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "rgba(148,163,184,0.18)",
        boxShadow: "0 18px 55px rgba(15,23,42,0.08)",
        boxSizing: "border-box",
        "& *, & *::before, & *::after": { boxSizing: "border-box" },
      }}
    >
      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        spacing={{ xs: 1.2, sm: 1.8 }}
      >
        <Stack alignItems="center" spacing={0} sx={{ mb: { xs: 0.5, sm: 1 } }}>
          <Box
            component="img"
            src="/glyrus_round_logo.png"
            alt="Glyrus logo"
            sx={{
              width: { xs: 60, sm: 100 },
              height: { xs: 60, sm: 100 },
              objectFit: "contain",
              mb: "-1px",
            }}
          />

          <Box
            component="img"
            src="/name_logo.png"
            alt="Glyrus"
            sx={{
              width: { xs: 165, sm: 255 },
              maxWidth: "80%",
              height: "auto",
              objectFit: "contain",
              mb: { xs: 0.75, sm: 1.5 },
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "0.8rem", sm: "1.30rem" },
              fontWeight: 650,
              letterSpacing: "-0.04em",
              color: "text.primary",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Create Business Account
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: { xs: "0.82rem", sm: "1.08rem" },
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Register your business and start managing your TapReview account.
          </Typography>
        </Stack>

        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  py: { xs: 0.25, sm: 0.5 },
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Alert
                severity="success"
                sx={{
                  borderRadius: 2,
                  py: { xs: 0.25, sm: 0.5 },
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
                  "& .MuiAlert-message": { overflowWrap: "anywhere" },
                }}
              >
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap: { xs: 1, sm: 1.5 },
            width: "100%",
            minWidth: 0,
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              height: { xs: 46, sm: 52 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #DCE3ED",
              borderRadius: "12px",
              overflow: "hidden",
              "& > div": {
                width: "100%",
                minWidth: 0,
                display: "flex",
                justifyContent: "center",
              },
            }}
          >
            {GOOGLE_CLIENT_ID ? (
              <Box
                ref={googleButtonRef}
                sx={{
                  width: "100%",
                  minWidth: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              />
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                Google unavailable
              </Typography>
            )}
          </Box>

          <Button
            type="button"
            variant={showEmailVerification ? "contained" : "outlined"}
            startIcon={<EmailRoundedIcon />}
            disabled={busy || emailVerified}
            onClick={() => setShowEmailVerification((previous) => !previous)}
            sx={{
              minWidth: 0,
              width: "100%",
              height: { xs: 46, sm: 52 },
              px: { xs: 1, sm: 1.5 },
              borderRadius: "12px",
              fontWeight: 750,
              fontSize: { xs: "0.85rem", sm: "0.9rem" },
              textTransform: "none",
              whiteSpace: "normal",
              lineHeight: 1.25,
              "& .MuiButton-startIcon": {
                mr: { xs: 0.5, sm: 0.8 },
                ml: 0,
              },
            }}
          >
            {emailVerified ? "Email Verified" : "Verify with Email"}
          </Button>
        </Box>

        <AnimatePresence initial={false}>
          {showEmailVerification && !emailVerified && (
            <MotionBox
              key="email-verification"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              sx={{ overflow: "hidden" }}
            >
              <Stack spacing={{ xs: 1.1, sm: 1.5 }} sx={{ pt: 1 }}>
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
                  helperText={errors.email || "Verify your email to continue."}
                  disabled={busy}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailRoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldStyles}
                />

                <Button
                  type="button"
                  variant="outlined"
                  fullWidth
                  onClick={handleSendOtp}
                  disabled={busy}
                  sx={{
                    minHeight: { xs: 44, sm: 52 },
                    borderRadius: "999px",
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: { xs: "0.82rem", sm: "1rem" },
                    px: 1,
                  }}
                >
                  {loadingAction === "send-otp" ? (
                    <CircularProgress size={20} />
                  ) : otpSent ? (
                    "Resend Email Verification Code"
                  ) : (
                    "Send Email Verification Code"
                  )}
                </Button>

                {otpSent && (
                  <Stack spacing={{ xs: 1.1, sm: 1.5 }}>
                    <TextField
                      fullWidth
                      label="6-digit email code"
                      placeholder="Enter verification code"
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      inputProps={{
                        inputMode: "numeric",
                        maxLength: 6,
                      }}
                      disabled={busy}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRoundedIcon />
                          </InputAdornment>
                        ),
                      }}
                      sx={fieldStyles}
                    />

                    <Button
                      type="button"
                      variant="contained"
                      fullWidth
                      onClick={handleVerifyOtp}
                      disabled={busy || otp.length !== 6}
                      sx={{
                        minHeight: { xs: 44, sm: 48 },
                        borderRadius: "999px",
                        fontWeight: 800,
                        textTransform: "none",
                        fontSize: { xs: "0.88rem", sm: "1rem" },
                      }}
                    >
                      {loadingAction === "verify-otp" ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </MotionBox>
          )}
        </AnimatePresence>

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
              <CircularProgress size={18} color="inherit" />
            ) : (
              <PersonAddAltRoundedIcon />
            )
          }
          whileHover={!busy ? { y: -2, scale: 1.01 } : {}}
          whileTap={!busy ? { scale: 0.98 } : {}}
          sx={{
            minHeight: { xs: 46, sm: 52 },
            mt: 0.5,
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: { xs: "0.85rem", sm: "0.98rem" },
            boxShadow: "0 8px 22px rgba(37,99,235,0.18)",
            textTransform: "none",
            px: 1,
          }}
        >
          {loadingAction === "submit"
            ? "Submitting registration..."
            : "Submit Registration Request"}
        </MotionButton>

        <Divider sx={{ my: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1, fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
          >
            OR CONTINUE WITH
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
            minHeight: { xs: 44, sm: 52 },
            borderRadius: "12px",
            fontWeight: 750,
            fontSize: { xs: "0.88rem", sm: "0.98rem" },
            borderWidth: 1.5,
            textTransform: "none",
            color: "primary.main",
            "&:hover": {
              borderWidth: 1.5,
              bgcolor: "rgba(37,99,235,0.04)",
            },
          }}
        >
          Back to Login
        </MotionButton>
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          pt: 0,
          mt: { xs: 1, sm: 1.7 },
        }}
      >
        <ShieldRoundedIcon
          sx={{
            fontSize: 14,
            color: "#16A34A",
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: { xs: "9px", sm: "12px" },
            fontWeight: 500,
            color: "text.secondary",
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
          href="https://glyrus.com/"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline",
            color: "#2563EB",
            fontWeight: 800,
            textDecoration: "none",
            cursor: "pointer",
            "&:hover": {
              color: "#1D4ED8",
              textDecoration: "underline",
            },
          }}
        >
          Glyrus.com
        </Box>
      </Typography>
    </MotionBox>
  );
}

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 2, sm: 2.5 },
    minHeight: { xs: 46, sm: 56 },
    transition: "all 0.25s ease",
    "& input": {
      fontSize: { xs: "0.9rem", sm: "1rem" },
      py: { xs: 1.1, sm: 1.6 },
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(37,99,235,0.08)",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.88rem", sm: "1rem" },
  },
  "& .MuiFormHelperText-root": {
    ml: 0.5,
    mt: 0.4,
    fontSize: { xs: "0.68rem", sm: "0.75rem" },
  },
};
