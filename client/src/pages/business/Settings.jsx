import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { motion } from "framer-motion";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { useBusiness } from "../../hooks/useBusiness";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../../services/businessService";

const MotionBox = motion(Box);

const defaultSettings = {
  publicPageEnabled: true,
  aiSuggestionsEnabled: true,
  notificationsEnabled: true,
};

export default function Settings() {
  const { business, loading: businessLoading } = useBusiness();

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      try {
        setLoading(true);

        const response = await getBusinessSettings();
        const data = response?.data?.settings;

        if (active && data) {
          setSettings({
            publicPageEnabled: data.publicPageEnabled ?? true,
            aiSuggestionsEnabled: data.aiSuggestionsEnabled ?? true,
            notificationsEnabled: data.notificationsEnabled ?? true,
          });
        }
      } catch (error) {
        if (active) {
          setMessage({
            type: "error",
            text:
              error?.response?.data?.message ||
              "Unable to load saved settings.",
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!businessLoading && business) {
      loadSettings();
    } else if (!businessLoading && !business) {
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [businessLoading, business]);

  const handleToggle = (key, checked) => {
    setSettings((prev) => ({
      ...prev,
      [key]: checked,
    }));

    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const response = await updateBusinessSettings(settings);

      if (response?.data?.success === false) {
        throw new Error(response?.data?.message || "Unable to save settings.");
      }

      const saved = response?.data?.settings;

      if (saved) {
        setSettings({
          publicPageEnabled: saved.publicPageEnabled ?? true,
          aiSuggestionsEnabled: saved.aiSuggestionsEnabled ?? true,
          notificationsEnabled: saved.notificationsEnabled ?? true,
        });
      }

      setMessage({
        type: "success",
        text: "Settings saved successfully.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (businessLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: "45vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography color="text.secondary">Loading settings...</Typography>
      </Box>
    );
  }

  const settingCards = [
    {
      key: "publicPageEnabled",
      title: "Public Rating Page",
      description:
        "Allow customers to access your public TapReview rating page.",
      Icon: PublicRoundedIcon,
    },
    {
      key: "aiSuggestionsEnabled",
      title: "AI Review Suggestions",
      description:
        "Allow AI-assisted suggestions to help customers prepare review text.",
      Icon: AutoAwesomeRoundedIcon,
    },
    {
      key: "notificationsEnabled",
      title: "Notifications",
      description: "Receive relevant account and platform notifications.",
      Icon: NotificationsRoundedIcon,
    },
  ];

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <SettingsRoundedIcon color="primary" />
            <Typography color="primary" fontWeight={800} fontSize={14}>
              BUSINESS SETTINGS
            </Typography>
          </Stack>

          <Typography
            component="h1"
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

          <Typography color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.7 }}>
            Manage your public page, AI review suggestions, and notification
            preferences.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2.5 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {settingCards.map(({ key, title, description, Icon }) => (
            <Card
              key={key}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="flex-start"
                  justifyContent="space-between"
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
                    sx={{ minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 3,
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      <Icon />
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75, lineHeight: 1.7 }}
                      >
                        {description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Switch
                    checked={Boolean(settings[key])}
                    onChange={(event, checked) => handleToggle(key, checked)}
                    disabled={saving}
                    inputProps={{ "aria-label": title }}
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography variant="h6" fontWeight={800}>
                Account Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, lineHeight: 1.7 }}
              >
                Basic information associated with your TapReview business
                account.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Business Name
                  </Typography>
                  <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                    {business?.businessName ||
                      business?.name ||
                      "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.5, wordBreak: "break-word" }}
                  >
                    {business?.email || business?.ownerEmail || "Not available"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            mt: 3,
            minHeight: 48,
            px: 3,
            borderRadius: 2.5,
          }}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </MotionBox>
    </Box>
  );
}
