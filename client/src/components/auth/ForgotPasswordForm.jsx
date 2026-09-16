import { useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/authService";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail } from "../../utils/validators";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword({
        email: normalizedEmail,
      });

      setMessage(
        response?.data?.message ||
          "If the account exists, a reset link was sent."
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to process the request. Please try again."
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
      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {message && (
        <Alert severity="success">
          {message}
        </Alert>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.7 }}
      >
        Enter the email address associated with your business
        account. If the account exists, we will send instructions
        to reset your password.
      </Typography>

      <TextField
        required
        fullWidth
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={event => {
          setEmail(event.target.value);
          setError("");
          setMessage("");
        }}
        error={Boolean(error)}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={loading}
        startIcon={<SendRoundedIcon />}
        sx={{
          minHeight: 48,
        }}
      >
        {loading ? "Sending..." : "Send reset link"}
      </Button>

      <Typography
        component={Link}
        to="/login"
        variant="body2"
        textAlign="center"
        sx={{
          color: "primary.main",
          textDecoration: "none",
          fontWeight: 600,
          "&:hover": {
            textDecoration: "underline",
          },
        }}
      >
        Back to login
      </Typography>
    </Stack>
  );
}