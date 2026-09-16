import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import {
  getMyBusiness,
  updateBusiness,
} from "../../services/businessService";
import BusinessLogoUpload from "./BusinessLogoUpload";
import { getErrorMessage } from "../../utils/formatters";
import {
  isEmail,
  isValidGoogleUrl,
  isValidMobile,
  isValidUrl,
  isRequired,
} from "../../utils/validators";

const initialForm = {
  businessName: "",
  ownerName: "",
  email: "",
  mobile: "",
  category: "",
  description: "",
  address: "",
  website: "",
  logoUrl: "",
  googleReviewUrl: "",
};

export default function BusinessProfileForm({ onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getMyBusiness();
        const business = response.data?.business;

        if (!mounted) {
          return;
        }

        setForm({
          businessName: business?.businessName || "",
          ownerName: business?.ownerName || "",
          email: business?.email || "",
          mobile: business?.mobile || "",
          category: business?.category || "",
          description: business?.description || "",
          address: business?.address || "",
          website: business?.website || "",
          logoUrl: business?.logoUrl || "",
          googleReviewUrl: business?.googleReviewUrl || "",
        });
      } catch (err) {
        if (mounted) {
          setError(
            getErrorMessage(
              err,
              "Unable to load your business profile."
            )
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, []);

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

    setError("");
    setMessage("");
  };

  const validate = () => {
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

    if (
      form.mobile &&
      !isValidMobile(form.mobile)
    ) {
      nextErrors.mobile =
        "Enter a valid 10-digit mobile number.";
    }

    if (
      form.website &&
      !isValidUrl(form.website)
    ) {
      nextErrors.website =
        "Enter a valid website URL.";
    }

    if (
      form.googleReviewUrl &&
      !isValidGoogleUrl(form.googleReviewUrl)
    ) {
      nextErrors.googleReviewUrl =
        "Enter a valid Google review URL.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLogoChange = (previewUrl, file) => {
    if (!file) {
      return;
    }

    /*
     * The current backend accepts logoUrl as a stored URL.
     * The preview is kept locally until a real upload endpoint
     * is configured.
     */
    setForm(previous => ({
      ...previous,
      logoUrl: previewUrl,
    }));

    setMessage("");
    setError("");
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        businessName: form.businessName.trim(),
        ownerName: form.ownerName.trim(),
        mobile: form.mobile.replace(/\D/g, ""),
        category: form.category.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        website: form.website.trim(),
        logoUrl: form.logoUrl.trim(),
        googleReviewUrl: form.googleReviewUrl.trim(),
      };

      const response = await updateBusiness(payload);
      const savedBusiness = response.data?.business;

      if (savedBusiness) {
        setForm(previous => ({
          ...previous,
          businessName: savedBusiness.businessName || "",
          ownerName: savedBusiness.ownerName || "",
          email: savedBusiness.email || previous.email,
          mobile: savedBusiness.mobile || "",
          category: savedBusiness.category || "",
          description: savedBusiness.description || "",
          address: savedBusiness.address || "",
          website: savedBusiness.website || "",
          logoUrl: savedBusiness.logoUrl || "",
          googleReviewUrl:
            savedBusiness.googleReviewUrl || "",
        }));

        onSaved?.(savedBusiness);
      }

      setMessage("Business profile saved successfully.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save your business profile."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2}>
        <Typography color="text.secondary">
          Loading business profile...
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      noValidate
      spacing={2.5}
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

      <Stack spacing={1}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
        >
          Business information
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Keep your business information accurate so customers
          see the correct details on your public review page.
        </Typography>
      </Stack>

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            label="Business name"
            value={form.businessName}
            onChange={updateField("businessName")}
            error={Boolean(errors.businessName)}
            helperText={errors.businessName}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            label="Owner name"
            value={form.ownerName}
            onChange={updateField("ownerName")}
            error={Boolean(errors.ownerName)}
            helperText={errors.ownerName}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            required
            label="Email"
            type="email"
            value={form.email}
            disabled
            helperText="Account email cannot be changed here."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Mobile number"
            type="tel"
            value={form.mobile}
            onChange={updateField("mobile")}
            error={Boolean(errors.mobile)}
            helperText={errors.mobile}
            disabled={saving}
            inputProps={{
              inputMode: "numeric",
              maxLength: 10,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Business category"
            placeholder="Restaurant, Salon, Store..."
            value={form.category}
            onChange={updateField("category")}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Business description"
            multiline
            minRows={4}
            value={form.description}
            onChange={updateField("description")}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            label="Business address"
            multiline
            minRows={3}
            value={form.address}
            onChange={updateField("address")}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Website"
            placeholder="https://example.com"
            value={form.website}
            onChange={updateField("website")}
            error={Boolean(errors.website)}
            helperText={errors.website}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="Google review URL"
            placeholder="https://www.google.com/..."
            value={form.googleReviewUrl}
            onChange={updateField("googleReviewUrl")}
            error={Boolean(errors.googleReviewUrl)}
            helperText={errors.googleReviewUrl}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Stack spacing={1}>
            <Typography
              variant="subtitle2"
              fontWeight={800}
            >
              Business logo
            </Typography>

            <BusinessLogoUpload
              value={form.logoUrl}
              onChange={handleLogoChange}
            />
          </Stack>
        </Grid>
      </Grid>

      <Divider />

      <Button
        type="submit"
        variant="contained"
        size="large"
        startIcon={<SaveRoundedIcon />}
        disabled={saving}
        sx={{
          alignSelf: { xs: "stretch", sm: "flex-start" },
          minHeight: 48,
          px: 3,
        }}
      >
        {saving ? "Saving..." : "Save profile"}
      </Button>
    </Stack>
  );
}