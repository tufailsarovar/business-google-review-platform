import { useState } from "react";
import {
  Alert,
  Button,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SubjectRoundedIcon from "@mui/icons-material/SubjectRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { contactAdmin } from "../../services/supportService";
import { getErrorMessage } from "../../utils/formatters";
import {
  isEmail,
  isRequired,
} from "../../utils/validators";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactAdminForm({
  initialValues = {},
  onSuccess,
}) {
  const [form, setForm] = useState({
    ...initialForm,
    ...initialValues,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
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

    setMessage("");
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!isRequired(form.name)) {
      nextErrors.name = "Name is required.";
    }

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!isRequired(form.subject)) {
      nextErrors.subject = "Subject is required.";
    }

    if (!isRequired(form.message)) {
      nextErrors.message = "Message is required.";
    } else if (form.message.trim().length < 5) {
      nextErrors.message =
        "Message must contain at least 5 characters.";
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
    setMessage("");
    setServerError("");

    try {
      const response = await contactAdmin({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setMessage(
        response?.data?.message ||
          "Message sent successfully."
      );

      setForm({
        ...initialForm,
        name: form.name,
        email: form.email,
      });

      setErrors({});
      onSuccess?.(response.data);
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          "Unable to send your message. Please try again."
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

      {message && (
        <Alert severity="success">
          {message}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            label="Name"
            value={form.name}
            onChange={updateField("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={updateField("email")}
            error={Boolean(errors.email)}
            helperText={errors.email}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            required
            label="Subject"
            value={form.subject}
            onChange={updateField("subject")}
            error={Boolean(errors.subject)}
            helperText={errors.subject}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SubjectRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            required
            multiline
            minRows={5}
            label="Query / message"
            value={form.message}
            onChange={updateField("message")}
            error={Boolean(errors.message)}
            helperText={errors.message}
            disabled={loading}
            placeholder="Tell us how we can help..."
          />
        </Grid>
      </Grid>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          lineHeight: 1.6,
        }}
      >
        Your message will be sent to the TapReview admin team.
      </Typography>

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={<SendRoundedIcon />}
        sx={{
          alignSelf: {
            xs: "stretch",
            sm: "flex-start",
          },
          minHeight: 48,
          px: 3,
        }}
      >
        {loading ? "Sending..." : "Send message"}
      </Button>
    </Stack>
  );
}