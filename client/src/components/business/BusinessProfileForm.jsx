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
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";

import { getMyBusiness, updateBusiness } from "../../services/businessService";
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
  socialLinks: {
    instagram: "",
    facebook: "",
    youtube: "",
    whatsapp: "",
    linkedin: "",
    x: "",
  },
};

const socialFields = [
  {
    name: "instagram",
    label: "Instagram",
    placeholder: "https://instagram.com/yourbusiness",
    Icon: InstagramIcon,
  },
  {
    name: "facebook",
    label: "Facebook",
    placeholder: "https://facebook.com/yourbusiness",
    Icon: FacebookRoundedIcon,
  },
  {
    name: "youtube",
    label: "YouTube",
    placeholder: "https://youtube.com/@yourbusiness",
    Icon: YouTubeIcon,
  },
  {
    name: "whatsapp",
    label: "WhatsApp",
    placeholder: "https://wa.me/919876543210",
    Icon: WhatsAppIcon,
  },
  {
    name: "linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/company/yourbusiness",
    Icon: LinkedInIcon,
  },
  {
    name: "x",
    label: "X",
    placeholder: "https://x.com/yourbusiness",
    Icon: XIcon,
  },
];

const emptySocialLinks = () => ({
  instagram: "",
  facebook: "",
  youtube: "",
  whatsapp: "",
  linkedin: "",
  x: "",
});

export default function BusinessProfileForm({ onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      try {
        const response = await getMyBusiness();
        const business = response.data?.business || {};

        if (!mounted) return;

        setForm({
          businessName: business.businessName || business.name || "",
          ownerName: business.ownerName || business.name || "",
          email: business.email || "",
          mobile: business.mobile || business.phone || "",
          category: business.category || "",
          description: business.description || "",
          address: business.address || "",
          website: business.website || "",
          logoUrl: business.logoUrl || business.logo || "",
          googleReviewUrl:
            business.googleBusiness?.reviewUrl ||
            business.googleReviewUrl ||
            business.googleUrl ||
            "",
          socialLinks: {
            ...emptySocialLinks(),
            ...(business.socialLinks || {}),
          },
        });
      } catch (err) {
        if (mounted) {
          setError(
            getErrorMessage(err, "Unable to load your business profile."),
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setError("");
    setMessage("");
  };

  const updateSocialLink = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      socialLinks: {
        ...previous.socialLinks,
        [field]: event.target.value,
      },
    }));

    setErrors((previous) => ({
      ...previous,
      [`socialLinks.${field}`]: "",
    }));

    setError("");
    setMessage("");
  };

  const clearSocialLink = (field) => {
    setForm((previous) => ({
      ...previous,
      socialLinks: {
        ...previous.socialLinks,
        [field]: "",
      },
    }));

    setErrors((previous) => ({
      ...previous,
      [`socialLinks.${field}`]: "",
    }));

    setError("");
    setMessage("");
  };

  const handleLogoChange = (previewUrl, file) => {
    setForm((previous) => ({
      ...previous,
      logoUrl: previewUrl || "",
    }));

    setLogoFile(file || null);
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

    if (form.mobile && !isValidMobile(form.mobile)) {
      nextErrors.mobile = "Enter a valid 10-digit mobile number.";
    }

    if (form.website && !isValidUrl(form.website)) {
      nextErrors.website = "Enter a valid website URL.";
    }

    if (form.googleReviewUrl && !isValidGoogleUrl(form.googleReviewUrl)) {
      nextErrors.googleReviewUrl = "Enter a valid Google review URL.";
    }

    socialFields.forEach(({ name, label }) => {
      const value = form.socialLinks[name]?.trim();

      if (value && !isValidUrl(value)) {
        nextErrors[`socialLinks.${name}`] = `Enter a valid ${label} URL.`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

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
        googleReviewUrl: form.googleReviewUrl.trim(),
        socialLinks: Object.fromEntries(
          Object.entries(form.socialLinks).map(([key, value]) => [
            key,
            value.trim(),
          ]),
        ),
      };

      let response;

      if (logoFile) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
          if (key === "socialLinks") {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });

        formData.append("image", logoFile);

        const { default: api } = await import("../../services/api");

        response = await api.put("/business/profile", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await updateBusiness({
          ...payload,
          logo: form.logoUrl.startsWith("blob:") ? undefined : form.logoUrl,
        });
      }

      const savedBusiness = response.data?.business || {};

      const savedGoogleUrl =
        savedBusiness.googleBusiness?.reviewUrl ||
        savedBusiness.googleReviewUrl ||
        savedBusiness.googleUrl ||
        form.googleReviewUrl.trim();

      const savedLogo =
        savedBusiness.logoUrl || savedBusiness.logo || form.logoUrl;

      const savedSocialLinks = {
        ...emptySocialLinks(),
        ...form.socialLinks,
        ...(savedBusiness.socialLinks || {}),
      };

      const updatedBusiness = {
        ...savedBusiness,
        googleReviewUrl: savedGoogleUrl,
        socialLinks: savedSocialLinks,
      };

      setForm((previous) => ({
        ...previous,
        businessName:
          savedBusiness.businessName ||
          savedBusiness.name ||
          previous.businessName,
        ownerName:
          savedBusiness.ownerName || savedBusiness.name || previous.ownerName,
        email: savedBusiness.email || previous.email,
        mobile: savedBusiness.mobile || savedBusiness.phone || previous.mobile,
        category: savedBusiness.category ?? previous.category,
        description: savedBusiness.description ?? previous.description,
        address: savedBusiness.address ?? previous.address,
        website: savedBusiness.website ?? previous.website,
        logoUrl: savedLogo,
        googleReviewUrl: savedGoogleUrl,
        socialLinks: savedSocialLinks,
      }));

      setLogoFile(null);
      onSaved?.(updatedBusiness);
      setMessage("Business profile saved successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save your business profile."));
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
    <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={800}>
          Business information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep your business information accurate so customers see the correct
          details on your public review page.
        </Typography>
      </Stack>

      <Divider />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
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
            fullWidth
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
            fullWidth
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
            fullWidth
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
            fullWidth
            label="Business category"
            placeholder="Restaurant, Salon, Store..."
            value={form.category}
            onChange={updateField("category")}
            disabled={saving}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
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
            fullWidth
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
            fullWidth
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
            fullWidth
            label="Google review URL"
            placeholder="https://www.google.com/..."
            value={form.googleReviewUrl}
            onChange={updateField("googleReviewUrl")}
            error={Boolean(errors.googleReviewUrl)}
            helperText={errors.googleReviewUrl}
            disabled={saving}
          />
        </Grid>
      </Grid>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={800}>
          Social media links
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add the profiles you want customers to visit. Leave a field empty or
          clear it to remove that link from your public page.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {socialFields.map(({ name, label, placeholder, Icon }) => (
          <Grid key={name} size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={label}
              placeholder={placeholder}
              value={form.socialLinks[name] || ""}
              onChange={updateSocialLink(name)}
              error={Boolean(errors[`socialLinks.${name}`])}
              helperText={errors[`socialLinks.${name}`] || " "}
              disabled={saving}
              InputProps={{
                startAdornment: (
                  <Icon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  />
                ),
                endAdornment: form.socialLinks[name] ? (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => clearSocialLink(name)}
                    disabled={saving}
                    sx={{ minWidth: "auto", whiteSpace: "nowrap" }}
                  >
                    Clear
                  </Button>
                ) : null,
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={800}>
          Business logo
        </Typography>

        <BusinessLogoUpload
          value={form.logoUrl}
          onChange={handleLogoChange}
          disabled={saving}
        />
      </Stack>

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
