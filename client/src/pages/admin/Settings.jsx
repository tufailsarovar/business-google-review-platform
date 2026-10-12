import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import { motion, useReducedMotion } from "framer-motion";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import adminService from "../../services/adminService";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function Settings() {
  const reduceMotion = useReducedMotion();

  const [settings, setSettings] = useState({
    platformName: "TapReview",
    supportEmail: "",
    maintenanceMode: false,
    allowRegistration: true,
    allowReviewGeneration: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const loadSettings = async () => {
    try {
      setLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      const response = await adminService.getSettings();
      const data = response?.data?.settings || response?.data || {};

      setSettings({
        platformName: data.platformName ?? data.siteName ?? "TapReview",
        supportEmail: data.supportEmail ?? "",
        maintenanceMode: Boolean(data.maintenanceMode),
        allowRegistration:
          data.allowRegistration ?? data.allowBusinessRegistration ?? true,
        allowReviewGeneration: data.allowReviewGeneration ?? true,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message || "Unable to load admin settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage({
        type: "",
        text: "",
      });

      const response = await adminService.updateSettings(settings);
      const saved = response?.data?.settings;

      if (saved) {
        setSettings((previous) => ({
          ...previous,
          ...saved,
          platformName: saved.platformName ?? previous.platformName,
          supportEmail: saved.supportEmail ?? previous.supportEmail,
          maintenanceMode: saved.maintenanceMode ?? previous.maintenanceMode,
          allowRegistration:
            saved.allowRegistration ??
            saved.allowBusinessRegistration ??
            previous.allowRegistration,
          allowReviewGeneration:
            saved.allowReviewGeneration ?? previous.allowReviewGeneration,
        }));
      }

      setMessage({
        type: "success",
        text: "Settings updated successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error?.response?.data?.message || "Unable to update settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const controlItems = [
    {
      name: "maintenanceMode",
      title: "Maintenance Mode",
      description: "Temporarily restrict normal platform access.",
      color: "warning",
    },
    {
      name: "allowRegistration",
      title: "Business Registration",
      description: "Allow new businesses to create accounts.",
      color: "primary",
    },
    {
      name: "allowReviewGeneration",
      title: "Review Generation",
      description: "Allow AI-assisted review suggestions.",
      color: "primary",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        pb: { xs: 1, sm: 2 },
      }}
    >
      {/* Page Header */}
      <MotionBox
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        sx={{
          mb: { xs: 1.5, sm: 2.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.6,
              mb: 0.4,
            }}
          >
            <SettingsRoundedIcon
              color="primary"
              sx={{ fontSize: { xs: 16, sm: 20 } }}
            />

            <Typography
              color="primary"
              fontWeight={800}
              sx={{
                fontSize: { xs: "0.61rem", sm: "0.74rem" },
                letterSpacing: "0.045em",
              }}
            >
              ADMIN CONFIGURATION
            </Typography>
          </Box>

          <Typography
            component="h1"
            fontWeight={900}
            sx={{
              fontSize: {
                xs: "1.45rem",
                sm: "2rem",
                md: "2.3rem",
              },
              lineHeight: 1.15,
              letterSpacing: "-0.035em",
            }}
          >
            Settings
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.35,
              fontSize: { xs: "0.7rem", sm: "0.875rem" },
              lineHeight: 1.5,
            }}
          >
            Manage platform settings and controls.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={loadSettings}
          disabled={loading || saving}
          size="small"
          sx={{
            flexShrink: 0,
            minWidth: 0,
            minHeight: { xs: 32, sm: 40 },
            px: { xs: 0.9, sm: 1.5 },
            borderRadius: { xs: 1.2, sm: 2 },
            fontSize: { xs: "0.68rem", sm: "0.875rem" },
            fontWeight: 700,
            textTransform: "none",
            "& .MuiButton-startIcon": {
              mr: { xs: 0.4, sm: 0.8 },
              ml: 0,
            },
          }}
        >
          Refresh
        </Button>
      </MotionBox>

      {/* Loading Indicator */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={22} thickness={4} />
        </Box>
      )}

      {/* Feedback */}
      {message.text && (
        <Alert
          severity={message.type}
          onClose={() =>
            setMessage((previous) => ({
              ...previous,
              text: "",
            }))
          }
          iconMapping={{
            success: <CheckCircleRoundedIcon fontSize="inherit" />,
          }}
          sx={{
            mb: { xs: 1.2, sm: 2 },
            py: { xs: 0.1, sm: 0.4 },
            px: { xs: 0.8, sm: 1.5 },
            borderRadius: { xs: 1.3, sm: 2 },
            fontSize: { xs: "0.72rem", sm: "0.85rem" },
            alignItems: "center",
          }}
        >
          {message.text}
        </Alert>
      )}

      {/* Settings Form */}
      <Box component="form" onSubmit={handleSave}>
        <Grid container spacing={{ xs: 1.2, sm: 2 }}>
          {/* General Settings */}
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionCard
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.28,
                delay: reduceMotion ? 0 : 0.04,
              }}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: { xs: 1.5, sm: 2.5 },
                overflow: "hidden",
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  boxShadow: "0 6px 20px rgba(15,23,42,0.05)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.4, sm: 2.5, md: 3 },
                  "&:last-child": {
                    pb: { xs: 1.4, sm: 2.5, md: 3 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "0.95rem", sm: "1.15rem" },
                    fontWeight: 850,
                  }}
                >
                  General Settings
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    mb: { xs: 1.2, sm: 2 },
                    fontSize: { xs: "0.7rem", sm: "0.82rem" },
                    lineHeight: 1.5,
                  }}
                >
                  Basic information used across TapReview.
                </Typography>

                <Divider sx={{ mb: { xs: 1.3, sm: 2 } }} />

                <Stack spacing={{ xs: 1.3, sm: 2 }}>
                  <TextField
                    label="Site Name"
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    disabled={loading || saving}
                    sx={fieldStyles}
                  />

                  <TextField
                    label="Support Email"
                    name="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    disabled={loading || saving}
                    sx={fieldStyles}
                  />
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Platform Controls */}
          <Grid size={{ xs: 12, md: 5 }}>
            <MotionCard
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.28,
                delay: reduceMotion ? 0 : 0.08,
              }}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: { xs: 1.5, sm: 2.5 },
                overflow: "hidden",
                transition: "border-color .2s ease, box-shadow .2s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  boxShadow: "0 6px 20px rgba(15,23,42,0.05)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 1.4, sm: 2.5, md: 3 },
                  "&:last-child": {
                    pb: { xs: 1.4, sm: 2.5, md: 3 },
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "0.95rem", sm: "1.15rem" },
                    fontWeight: 850,
                  }}
                >
                  Platform Controls
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    mb: { xs: 1.2, sm: 2 },
                    fontSize: { xs: "0.7rem", sm: "0.82rem" },
                    lineHeight: 1.5,
                  }}
                >
                  Enable or disable platform features.
                </Typography>

                <Divider sx={{ mb: { xs: 0.8, sm: 1.5 } }} />

                <Stack spacing={{ xs: 0.6, sm: 1 }}>
                  {controlItems.map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        p: { xs: 0.65, sm: 1 },
                        borderRadius: { xs: 1, sm: 1.5 },
                        transition: "background-color .2s ease",
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            name={item.name}
                            checked={Boolean(settings[item.name])}
                            onChange={handleChange}
                            disabled={loading || saving}
                            size="small"
                            color={item.color}
                          />
                        }
                        label={
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "0.78rem",
                                  sm: "0.9rem",
                                },
                                fontWeight: 750,
                                lineHeight: 1.3,
                              }}
                            >
                              {item.title}
                            </Typography>

                            <Typography
                              color="text.secondary"
                              sx={{
                                mt: 0.2,
                                fontSize: {
                                  xs: "0.65rem",
                                  sm: "0.73rem",
                                },
                                lineHeight: 1.4,
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>
                        }
                        sx={{
                          width: "100%",
                          alignItems: "center",
                          ml: 0,
                          mr: 0,
                          gap: { xs: 0.5, sm: 1 },
                          "& .MuiSwitch-root": {
                            mr: { xs: 0.2, sm: 0.5 },
                          },
                          "& .MuiFormControlLabel-label": {
                            flex: 1,
                            minWidth: 0,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Save Action */}
          <Grid size={12}>
            <MotionBox
              initial={reduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.25,
                delay: reduceMotion ? 0 : 0.1,
              }}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveRoundedIcon />
                  )
                }
                disabled={loading || saving}
                fullWidth={false}
                sx={{
                  minWidth: { xs: 0, sm: 150 },
                  width: { xs: "100%", sm: "auto" },
                  minHeight: { xs: 39, sm: 46 },
                  px: { xs: 1.5, sm: 2.5 },
                  borderRadius: { xs: 1.3, sm: 2 },
                  fontSize: { xs: "0.78rem", sm: "0.875rem" },
                  fontWeight: 800,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                  },
                }}
              >
                {saving ? "Saving Settings..." : "Save Settings"}
              </Button>
            </MotionBox>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 1.3, sm: 1.8 },
    fontSize: { xs: "0.78rem", sm: "0.875rem" },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.78rem", sm: "0.875rem" },
  },
};
