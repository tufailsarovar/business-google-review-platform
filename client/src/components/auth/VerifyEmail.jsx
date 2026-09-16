import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { verifyEmail } from "../../services/authService";
import { getErrorMessage } from "../../utils/formatters";
import { isEmail } from "../../utils/validators";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    location.state?.message || ""
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryEmail = searchParams.get("email");

    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [searchParams]);

  const handleCodeChange = event => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setCode(value);
    setError("");
  };

  const handleSubmit = async event => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await verifyEmail({
        email: normalizedEmail,
        code,
      });

      setMessage(
        response?.data?.message ||
          "Email verified successfully."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Invalid or expired verification code."
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
        Enter the 6-digit verification code sent to your email
        address.
      </Typography>

      <TextField
        required
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={event => {
          setEmail(event.target.value);
          setError("");
        }}
        disabled={loading || Boolean(message)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        required
        label="Verification code"
        value={code}
        onChange={handleCodeChange}
        disabled={loading || Boolean(message)}
        inputProps={{
          inputMode: "numeric",
          maxLength: 6,
          autoComplete: "one-time-code",
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <VerifiedRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={
          loading ||
          Boolean(message) ||
          code.length !== 6
        }
        startIcon={<VerifiedRoundedIcon />}
        sx={{
          minHeight: 48,
        }}
      >
        {loading ? "Verifying..." : "Verify email"}
      </Button>
    </Stack>
  );
}