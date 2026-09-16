import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import {
  getGoogleSettings,
  saveGoogleSettings,
} from "../../services/googleService";

import { getErrorMessage } from "../../utils/formatters";
import { isValidGoogleUrl } from "../../utils/validators";

export default function GoogleReviewSetup({
  business,
  onSaved,
}) {
  const [url, setUrl] = useState(
    business?.googleReviewUrl || ""
  );

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const response =
          await getGoogleSettings();

        if (!mounted) return;

        const googleBusiness =
          response.data?.googleBusiness;

        setUrl(
          googleBusiness?.reviewUrl || ""
        );
      } catch (err) {
        if (mounted) {
          setError(
            getErrorMessage(
              err,
              "Unable to load Google review settings."
            )
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (business?.googleReviewUrl) {
      setUrl(business.googleReviewUrl);
    }
  }, [business?.googleReviewUrl]);

  const handleSave = async () => {
    const normalizedUrl = url.trim();

    if (!normalizedUrl) {
      setError(
        "Google review URL is required."
      );
      setMessage("");
      return;
    }

    if (!isValidGoogleUrl(normalizedUrl)) {
      setError(
        "Enter a valid Google review URL."
      );
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await saveGoogleSettings({
          reviewUrl: normalizedUrl,
        });

      const googleBusiness =
        response.data?.googleBusiness;

      const savedUrl =
        googleBusiness?.reviewUrl ||
        normalizedUrl;

      setUrl(savedUrl);

      setMessage(
        "Google review link saved successfully."
      );

      onSaved?.(googleBusiness);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save the Google review link."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
        >
          Google review link
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            lineHeight: 1.7,
          }}
        >
          Add the Google review URL customers
          should visit after preparing their
          feedback.
        </Typography>
      </Stack>

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

      <TextField
        fullWidth
        label="Google review URL"
        placeholder="https://www.google.com/..."
        value={url}
        onChange={event => {
          setUrl(event.target.value);
          setError("");
          setMessage("");
        }}
        error={Boolean(error)}
        disabled={loading || saving}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LinkRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
      >
        Example: your Google Business review
        link. Customers will be redirected to
        Google and submit the review there.
      </Typography>

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={loading || saving}
        startIcon={<SaveRoundedIcon />}
        sx={{
          alignSelf: {
            xs: "stretch",
            sm: "flex-start",
          },
          minHeight: 46,
          px: 3,
        }}
      >
        {loading
          ? "Loading..."
          : saving
            ? "Saving..."
            : "Save Google link"}
      </Button>
    </Stack>
  );
}