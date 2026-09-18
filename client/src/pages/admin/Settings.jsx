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
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import adminService from "../../services/adminService";

export default function Settings() {
  const [settings, setSettings] = useState({
    siteName: "TapReview",
    supportEmail: "",
    maintenanceMode: false,
    allowBusinessRegistration: true,
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

      const response =
        await adminService.getSettings();

      const data =
        response?.data?.settings ||
        response?.data ||
        {};

      setSettings(prev => ({
        ...prev,
        ...data,
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Unable to load admin settings.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = event => {
    const { name, value, checked, type } =
      event.target;

    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async event => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage({
        type: "",
        text: "",
      });

      await adminService.updateSettings(settings);

      setMessage({
        type: "success",
        text: "Settings updated successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Unable to update settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <SettingsRoundedIcon color="primary" />

            <Typography
              color="primary"
              fontWeight={800}
              fontSize={14}
            >
              ADMIN CONFIGURATION
            </Typography>
          </Box>

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.3rem",
              },
            }}
          >
            Settings
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              lineHeight: 1.7,
            }}
          >
            Manage global settings and platform
            controls.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={loadSettings}
          disabled={loading || saving}
          sx={{
            minHeight: 44,
            borderRadius: 2.5,
          }}
        >
          Refresh
        </Button>
      </Box>

      {message.text && (
        <Alert
          severity={message.type}
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {message.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSave}
      >
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              md: 7,
            }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3.5,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  General Settings
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    mb: 3,
                  }}
                >
                  Basic information used across the
                  TapReview platform.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="Site Name"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading || saving}
                  />

                  <TextField
                    label="Support Email"
                    name="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading || saving}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 5,
            }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.5,
                    sm: 3.5,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Platform Controls
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    mb: 2.5,
                    lineHeight: 1.6,
                  }}
                >
                  Enable or disable major platform
                  features.
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      name="maintenanceMode"
                      checked={
                        Boolean(
                          settings.maintenanceMode
                        )
                      }
                      onChange={handleChange}
                      disabled={loading || saving}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>
                        Maintenance Mode
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Temporarily restrict normal
                        platform access.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    mb: 2,
                    ml: 0,
                    "& .MuiSwitch-root": {
                      mr: 1,
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      name="allowBusinessRegistration"
                      checked={
                        Boolean(
                          settings.allowBusinessRegistration
                        )
                      }
                      onChange={handleChange}
                      disabled={loading || saving}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>
                        Business Registration
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Allow new businesses to create
                        accounts.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    mb: 2,
                    ml: 0,
                    "& .MuiSwitch-root": {
                      mr: 1,
                    },
                  }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      name="allowReviewGeneration"
                      checked={
                        Boolean(
                          settings.allowReviewGeneration
                        )
                      }
                      onChange={handleChange}
                      disabled={loading || saving}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={700}>
                        Review Generation
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Allow AI-assisted review
                        suggestions.
                      </Typography>
                    </Box>
                  }
                  sx={{
                    width: "100%",
                    alignItems: "flex-start",
                    ml: 0,
                    "& .MuiSwitch-root": {
                      mr: 1,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveRoundedIcon />}
                disabled={loading || saving}
                sx={{
                  minWidth: 150,
                  minHeight: 48,
                  borderRadius: 2.5,
                }}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}