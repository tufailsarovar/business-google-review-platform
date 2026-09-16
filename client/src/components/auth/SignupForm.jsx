import { useState } from "react";
import {
  Alert,
  Box,
  Button,
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

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/formatters";

import {
  isEmail,
  isValidMobile,
  isValidPassword,
  isRequired,
  passwordsMatch,
} from "../../utils/validators";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const initialForm = {
  businessName: "",
  ownerName: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
};

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const updateField = field => event => {
    let value = event.target.value;

    if (field === "mobile") {
      value = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setForm(previous => ({
      ...previous,
      [field]: value,
    }));

    setErrors(previous => ({
      ...previous,
      [field]: "",
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!isRequired(form.businessName)) {
      nextErrors.businessName =
        "Business name is required.";
    }

    if (!isRequired(form.ownerName)) {
      nextErrors.ownerName =
        "Owner name is required.";
    }

    if (!isEmail(form.email)) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (
      form.mobile &&
      !isValidMobile(form.mobile)
    ) {
      nextErrors.mobile =
        "Enter a valid 10-digit mobile number.";
    }

    if (!isValidPassword(form.password)) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (
      !passwordsMatch(
        form.password,
        form.confirmPassword
      )
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await signup({
        businessName:
          form.businessName.trim(),

        name:
          form.ownerName.trim(),

        email:
          form.email.trim().toLowerCase(),

        phone: form.mobile
          ? form.mobile.replace(/\D/g, "")
          : "",

        password: form.password,
      });

      const email =
        form.email.trim().toLowerCase();

      navigate(
        `/verify-email?email=${encodeURIComponent(
          email
        )}`,
        {
          replace: true,
          state: {
            message:
              response?.message ||
              "Account created. Check your email for the verification link.",

            businessId:
              response?.businessId || null,
          },
        }
      );
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to create your account. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionBox
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
    >
      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        spacing={1.8}
      >
        {/* Server Error */}
        <AnimatePresence mode="wait">
          {serverError && (
            <MotionBox
              initial={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                height: "auto",
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -8,
              }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2.5,
                  alignItems: "center",
                }}
              >
                {serverError}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Business Name */}
        <TextField
          required
          fullWidth
          label="Business name"
          placeholder="Enter your business name"
          autoComplete="organization"
          value={form.businessName}
          onChange={updateField(
            "businessName"
          )}
          error={Boolean(
            errors.businessName
          )}
          helperText={
            errors.businessName ||
            "Example: Royal Feast"
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Owner Name */}
        <TextField
          required
          fullWidth
          label="Owner name"
          placeholder="Enter your full name"
          autoComplete="name"
          value={form.ownerName}
          onChange={updateField(
            "ownerName"
          )}
          error={Boolean(
            errors.ownerName
          )}
          helperText={
            errors.ownerName ||
            "Enter the name of the business owner."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Email */}
        <TextField
          required
          fullWidth
          label="Email address"
          placeholder="Enter your business email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={updateField("email")}
          error={Boolean(errors.email)}
          helperText={
            errors.email ||
            "We'll use this email for account verification."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Mobile */}
        <TextField
          fullWidth
          label="Mobile number"
          placeholder="Enter 10-digit mobile number"
          type="tel"
          autoComplete="tel"
          value={form.mobile}
          onChange={updateField("mobile")}
          error={Boolean(errors.mobile)}
          helperText={
            errors.mobile ||
            "Example: 9876543210"
          }
          disabled={loading}
          inputProps={{
            inputMode: "numeric",
            maxLength: 10,
            pattern: "[0-9]*",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Password */}
        <TextField
          required
          fullWidth
          label="Password"
          placeholder="Create a strong password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={updateField(
            "password"
          )}
          error={Boolean(
            errors.password
          )}
          helperText={
            errors.password ||
            "Use at least 8 characters."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Confirm Password */}
        <TextField
          required
          fullWidth
          label="Confirm password"
          placeholder="Re-enter your password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={updateField(
            "confirmPassword"
          )}
          error={Boolean(
            errors.confirmPassword
          )}
          helperText={
            errors.confirmPassword ||
            "Enter the same password again."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockRoundedIcon
                  fontSize="small"
                />
              </InputAdornment>
            ),
          }}
          sx={fieldStyles}
        />

        {/* Create Account */}
        <MotionButton
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={
            <PersonAddAltRoundedIcon />
          }
          whileHover={
            !loading
              ? {
                  y: -2,
                  scale: 1.01,
                }
              : {}
          }
          whileTap={
            !loading
              ? {
                  scale: 0.98,
                }
              : {}
          }
          sx={{
            minHeight: 52,
            mt: 0.5,
            borderRadius: 2.5,
            fontWeight: 800,
            fontSize: "0.98rem",
            boxShadow:
              "0 8px 22px rgba(37,99,235,0.18)",
          }}
        >
          {loading
            ? "Creating account..."
            : "Create Business Account"}
        </MotionButton>

        {/* Login Redirect */}
        <Divider sx={{ my: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ px: 1 }}
          >
            Already have an account?
          </Typography>
        </Divider>

        <MotionButton
          component={Link}
          to="/login"
          variant="outlined"
          fullWidth
          disabled={loading}
          startIcon={
            <LoginRoundedIcon />
          }
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          whileHover={{
            y: -2,
          }}
          whileTap={{
            scale: 0.98,
          }}
          sx={{
            minHeight: 50,
            borderRadius: 2.5,
            fontWeight: 700,
            borderWidth: 1.5,
            "&:hover": {
              borderWidth: 1.5,
            },
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

    "&:hover .MuiOutlinedInput-notchedOutline":
      {
        borderColor: "primary.main",
      },

    "&.Mui-focused": {
      boxShadow:
        "0 0 0 3px rgba(37,99,235,0.08)",
    },
  },

  "& .MuiFormHelperText-root": {
    ml: 0.5,
  },
};