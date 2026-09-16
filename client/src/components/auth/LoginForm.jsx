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

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { Link, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail, isRequired } from "../../utils/validators";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = field => event => {
    const value = event.target.value;

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

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isRequired(form.password)) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      const loggedInUser = response?.user;

      if (!loggedInUser) {
        throw new Error("Invalid login response.");
      }

      const requestedPath =
        location.state?.from?.pathname;

      const requestedSearch =
        location.state?.from?.search || "";

      const requestedHash =
        location.state?.from?.hash || "";

      const isAuthPage =
        requestedPath === "/login" ||
        requestedPath === "/signup" ||
        requestedPath === "/";

      const destination =
        requestedPath && !isAuthPage
          ? `${requestedPath}${requestedSearch}${requestedHash}`
          : loggedInUser.role === "admin"
            ? "/admin/dashboard"
            : "/business/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to sign in. Please check your credentials."
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
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
        ease: "easeOut",
      }}
    >
      <Stack
        component="form"
        onSubmit={handleSubmit}
        noValidate
        spacing={2.2}
      >
        {/* Error */}
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
            "Use the email connected to your account."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailRoundedIcon
                  fontSize="small"
                  color={
                    errors.email
                      ? "error"
                      : "action"
                  }
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              transition:
                "all 0.25s ease",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor:
                      "primary.main",
                  },
              },
              "&.Mui-focused": {
                boxShadow:
                  "0 0 0 3px rgba(37,99,235,0.08)",
              },
            },
            "& .MuiFormHelperText-root": {
              ml: 0.5,
            },
          }}
        />

        {/* Password */}
        <TextField
          required
          fullWidth
          label="Password"
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={updateField("password")}
          error={Boolean(errors.password)}
          helperText={
            errors.password ||
            "Your password must be at least 8 characters."
          }
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockRoundedIcon
                  fontSize="small"
                  color={
                    errors.password
                      ? "error"
                      : "action"
                  }
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              transition:
                "all 0.25s ease",
              "&:hover": {
                "& .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor:
                      "primary.main",
                  },
              },
              "&.Mui-focused": {
                boxShadow:
                  "0 0 0 3px rgba(37,99,235,0.08)",
              },
            },
            "& .MuiFormHelperText-root": {
              ml: 0.5,
            },
          }}
        />

        {/* Sign In */}
        <MotionButton
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={<LoginRoundedIcon />}
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
            ? "Signing in..."
            : "Sign in to Dashboard"}
        </MotionButton>

        {/* Forgot Password */}
        <Typography
          component={Link}
          to="/forgot-password"
          variant="body2"
          textAlign="center"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: 700,
            transition: "color .2s ease",
            "&:hover": {
              textDecoration: "underline",
              color: "primary.dark",
            },
          }}
        >
          Forgot your password?
        </Typography>

        <Divider
          sx={{
            my: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              px: 1,
            }}
          >
            New to TapRating?
          </Typography>
        </Divider>

        {/* Signup */}
        <MotionButton
          component={Link}
          to="/signup"
          variant="outlined"
          fullWidth
          disabled={loading}
          endIcon={
            <ArrowForwardRoundedIcon />
          }
          startIcon={
            <PersonAddAltRoundedIcon />
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
          Create Business Account
        </MotionButton>
      </Stack>
    </MotionBox>
  );
}