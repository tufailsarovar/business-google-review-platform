import { useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useNavigate, useSearchParams } from "react-router-dom";

import { resetPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/formatters";
import {
  isRequired,
  isValidPassword,
  passwordsMatch,
} from "../../utils/validators";

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = field => event => {
    setForm(previous => ({
      ...previous,
      [field]: event.target.value,
    }));

    setErrors(previous => ({
      ...previous,
      [field]: "",
    }));

    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!token) {
      setServerError(
        "This password reset link is missing or invalid."
      );
      return false;
    }

    if (!isRequired(form.password)) {
      nextErrors.password = "New password is required.";
    } else if (!isValidPassword(form.password)) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    }

    if (!passwordsMatch(form.password, form.confirmPassword)) {
      nextErrors.confirmPassword = "Passwords do not match.";
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
    setSuccess("");

    try {
      const response = await resetPassword({
        token,
        password: form.password,
      });

      setSuccess(
        response?.data?.message ||
          "Password reset successfully."
      );

      setForm({
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to reset your password. The link may have expired."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      noValidate
      spacing={2}
    >
      {serverError && (
        <Alert severity="error">
          {serverError}
        </Alert>
      )}

      {success && (
        <Alert severity="success">
          {success}
        </Alert>
      )}

      {!token && !serverError && (
        <Alert severity="warning">
          No password reset token was provided.
        </Alert>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.7 }}
      >
        Create a new password for your TapReview business
        account. Your password should contain at least 8
        characters.
      </Typography>

      <TextField
        required
        label="New password"
        type="password"
        autoComplete="new-password"
        value={form.password}
        onChange={updateField("password")}
        error={Boolean(errors.password)}
        helperText={errors.password || "Minimum 8 characters."}
        disabled={loading || Boolean(success)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        required
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={updateField("confirmPassword")}
        error={Boolean(errors.confirmPassword)}
        helperText={errors.confirmPassword}
        disabled={loading || Boolean(success)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading || !token || Boolean(success)}
        startIcon={
          success ? (
            <CheckCircleRoundedIcon />
          ) : (
            <LockRoundedIcon />
          )
        }
        sx={{
          minHeight: 48,
        }}
      >
        {success
          ? "Password reset"
          : loading
            ? "Resetting..."
            : "Reset password"}
      </Button>
    </Stack>
  );
}