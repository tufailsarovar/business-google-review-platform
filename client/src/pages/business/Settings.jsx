import { useState } from "react";
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

const MotionBox = motion(Box);

export default function Settings() {
  const { business, loading } = useBusiness();

  const [settings, setSettings] = useState({
    publicPageEnabled:
      business?.publicPageEnabled !== false,
    aiSuggestionsEnabled:
      business?.aiSuggestionsEnabled !== false,
    notificationsEnabled:
      business?.notificationsEnabled !== false,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = key => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  const handleSave = () => {
    // Settings are kept locally until the corresponding
    // backend settings endpoint is connected.
    setSaved(true);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "45vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography color="text.secondary">
          Loading settings...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <SettingsRoundedIcon color="primary" />

            <Typography
              color="primary"
              fontWeight={800}
              fontSize={14}
            >
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

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              lineHeight: 1.7,
            }}
          >
            Manage your public page, AI review suggestions,
            and notification preferences.
          </Typography>
        </Box>

        {saved && (
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2.5,
            }}
          >
            Settings saved successfully.
          </Alert>
        )}

        <Stack spacing={2.5}>
          {/* Public page */}
          <Card
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
                    <PublicRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Public Rating Page
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        lineHeight: 1.7,
                      }}
                    >
                      Allow customers to access your public
                      TapRating rating page.
                    </Typography>
                  </Box>
                </Stack>

                <Switch
                  checked={settings.publicPageEnabled}
                  onChange={() =>
                    handleToggle("publicPageEnabled")
                  }
                  inputProps={{
                    "aria-label":
                      "Toggle public rating page",
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* AI suggestions */}
          <Card
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
                    <AutoAwesomeRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      AI Review Suggestions
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        lineHeight: 1.7,
                      }}
                    >
                      Allow AI-assisted suggestions to help
                      customers prepare review text.
                    </Typography>
                  </Box>
                </Stack>

                <Switch
                  checked={settings.aiSuggestionsEnabled}
                  onChange={() =>
                    handleToggle(
                      "aiSuggestionsEnabled"
                    )
                  }
                  inputProps={{
                    "aria-label":
                      "Toggle AI review suggestions",
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card
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
                    <NotificationsRoundedIcon />
                  </Box>

                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      Notifications
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        lineHeight: 1.7,
                      }}
                    >
                      Receive relevant account and platform
                      notifications.
                    </Typography>
                  </Box>
                </Stack>

                <Switch
                  checked={settings.notificationsEnabled}
                  onChange={() =>
                    handleToggle(
                      "notificationsEnabled"
                    )
                  }
                  inputProps={{
                    "aria-label":
                      "Toggle notifications",
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Account information */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Account Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  lineHeight: 1.7,
                }}
              >
                Basic information associated with your
                TapRating business account.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2}>
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Business Name
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{ mt: 0.5 }}
                  >
                    {business?.businessName ||
                      business?.name ||
                      "Not available"}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Email
                  </Typography>

                  <Typography
                    fontWeight={700}
                    sx={{
                      mt: 0.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {business?.email ||
                      business?.ownerEmail ||
                      "Not available"}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            mt: 3,
            minHeight: 48,
            px: 3,
            borderRadius: 2.5,
          }}
        >
          Save Settings
        </Button>
      </MotionBox>
    </Box>
  );
}