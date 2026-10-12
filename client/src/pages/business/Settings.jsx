
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useBusiness } from "../../hooks/useBusiness";
import {
  getBusinessSettings,
  updateBusinessSettings,
} from "../../services/businessService";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const defaultSettings = {
  publicPageEnabled: true,
  aiSuggestionsEnabled: true,
  notificationsEnabled: true,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function normalizeSettings(data) {
  return {
    publicPageEnabled: data?.publicPageEnabled ?? true,
    aiSuggestionsEnabled: data?.aiSuggestionsEnabled ?? true,
    notificationsEnabled: data?.notificationsEnabled ?? true,
  };
}

export default function Settings() {
  const { business, loading: businessLoading } = useBusiness();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
          setSettings(normalizeSettings(data));
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
    setSettings((previous) => ({
      ...previous,
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
        throw new Error(
          response?.data?.message || "Unable to save settings."
        );
      }

      const saved = response?.data?.settings;

      if (saved) {
        setSettings(normalizeSettings(saved));
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

  const settingCards = [
    {
      key: "publicPageEnabled",
      title: "Public Rating Page",
      description:
        "Allow customers to access your public TapReview rating page.",
      Icon: PublicRoundedIcon,
      color: "#4285F4",
    },
    {
      key: "aiSuggestionsEnabled",
      title: "AI Review Suggestions",
      description:
        "Enable AI-assisted suggestions to help customers prepare review text.",
      Icon: AutoAwesomeRoundedIcon,
      color: "#8B5CF6",
    },
    {
      key: "notificationsEnabled",
      title: "Notifications",
      description:
        "Receive relevant account and platform notifications.",
      Icon: NotificationsRoundedIcon,
      color: "#0D9488",
    },
  ];

  const enabledCount = Object.values(settings).filter(Boolean).length;

  if (businessLoading || loading) {
    return (
      <Box
        sx={{
          minHeight: "35vh",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Stack alignItems="center" spacing={1.5}>
          <Box
            component={motion.div}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            sx={{
              width: 35,
              height: 35,
              border: "3px solid",
              borderColor: "divider",
              borderTopColor: "primary.main",
              borderRadius: "50%",
            }}
          />
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "0.78rem", sm: "0.9rem" } }}
          >
            Loading your settings...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1000,
        minWidth: 0,
        mx: "auto",
        px: { xs: 1.25, sm: 2, md: 3 },
        py: { xs: 1.5, sm: 2.5, md: 3 },
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.075 },
          },
        }}
      >
        {/* Header */}
        <MotionBox variants={fadeUp} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{ mb: 0.8 }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 49 },
                height: { xs: 40, sm: 49 },
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                borderRadius: { xs: 2.2, sm: 3 },
                bgcolor: "action.hover",
                color: "primary.main",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <SettingsRoundedIcon
                sx={{ fontSize: { xs: 23, sm: 29 } }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: 9, sm: 11 },
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  mb: 0.25,
                }}
              >
                BUSINESS PREFERENCES
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.4rem",
                    sm: "1.9rem",
                    md: "2.2rem",
                  },
                  lineHeight: 1.15,
                  fontWeight: 850,
                  letterSpacing: "-0.045em",
                }}
              >
                Settings
              </Typography>
            </Box>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 580,
              fontSize: { xs: "0.76rem", sm: "0.9rem" },
              lineHeight: 1.7,
              mt: 1,
            }}
          >
            Customize your public page, AI features, and notification
            preferences in one place.
          </Typography>
        </MotionBox>

        {/* Status summary */}
        <MotionCard
          variants={fadeUp}
          elevation={0}
          sx={{
            mb: { xs: 2, sm: 2.5 },
            borderRadius: { xs: 2.5, sm: 3 },
            border: "1px solid",
            borderColor: "divider",
            background: isDark
              ? "linear-gradient(120deg, rgba(99,102,241,0.12), rgba(99,102,241,0.025))"
              : "linear-gradient(120deg, rgba(99,102,241,0.075), rgba(99,102,241,0.015))",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 1.5, sm: 2.2 },
              "&:last-child": {
                pb: { xs: 1.5, sm: 2.2 },
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "0.83rem", sm: "1rem" },
                  }}
                >
                  Your preferences
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    fontSize: { xs: "0.68rem", sm: "0.8rem" },
                  }}
                >
                  {enabledCount} of 3 features enabled
                </Typography>
              </Box>

              <Chip
                size="small"
                icon={<CheckCircleRoundedIcon />}
                label={enabledCount === 3 ? "All enabled" : "Customized"}
                color={enabledCount === 3 ? "success" : "default"}
                variant="outlined"
                sx={{
                  flexShrink: 0,
                  height: { xs: 25, sm: 29 },
                  fontSize: { xs: "0.62rem", sm: "0.72rem" },
                  fontWeight: 700,
                  "& .MuiChip-icon": {
                    fontSize: { xs: 14, sm: 17 },
                  },
                }}
              />
            </Stack>

            <Stack
              direction="row"
              spacing={0.6}
              sx={{ mt: 1.5 }}
              aria-label={`${enabledCount} of 3 settings enabled`}
            >
              {settingCards.map(({ key, color }) => (
                <Box
                  key={key}
                  sx={{
                    flex: 1,
                    height: 4,
                    borderRadius: 5,
                    bgcolor: settings[key] ? color : "action.disabledBackground",
                    transition: "background-color 0.25s ease",
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </MotionCard>

        {/* Alerts */}
        <AnimatePresence initial={false}>
          {message.text && (
            <MotionBox
              key={`${message.type}-${message.text}`}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              sx={{ overflow: "hidden", mb: 2 }}
            >
              <Alert
                severity={message.type}
                onClose={() => setMessage({ type: "", text: "" })}
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  py: { xs: 0.2, sm: 0.5 },
                  px: { xs: 0.7, sm: 1.2 },
                  "& .MuiAlert-message": {
                    fontSize: { xs: "0.75rem", sm: "0.86rem" },
                    overflowWrap: "anywhere",
                  },
                  "& .MuiAlert-icon": {
                    fontSize: { xs: 19, sm: 22 },
                  },
                }}
              >
                {message.text}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Settings section */}
        <MotionBox variants={fadeUp}>
          <Typography
            sx={{
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.76rem", sm: "0.88rem" },
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.035em",
            }}
          >
            GENERAL SETTINGS
          </Typography>

          <Stack spacing={{ xs: 1, sm: 1.5 }}>
            {settingCards.map(({ key, title, description, Icon, color }, index) => {
              const enabled = Boolean(settings[key]);

              return (
                <MotionCard
                  key={key}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  whileHover={{
                    y: -2,
                    transition: { duration: 0.18 },
                  }}
                  elevation={0}
                  sx={{
                    borderRadius: { xs: 2.5, sm: 3 },
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    transition: "border-color 0.2s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.35, sm: 2, md: 2.5 },
                      "&:last-child": {
                        pb: { xs: 1.35, sm: 2, md: 2.5 },
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={{ xs: 1, sm: 1.6 }}
                    >
                      <Box
                        sx={{
                          width: { xs: 39, sm: 47 },
                          height: { xs: 39, sm: 47 },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: { xs: 2, sm: 2.7 },
                          color: color,
                          bgcolor: `${color}15`,
                        }}
                      >
                        <Icon
                          sx={{ fontSize: { xs: 21, sm: 25 } }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "0.8rem", sm: "0.96rem" },
                            lineHeight: 1.35,
                          }}
                        >
                          {title}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.4,
                            fontSize: { xs: "0.68rem", sm: "0.81rem" },
                            lineHeight: { xs: 1.5, sm: 1.65 },
                            overflowWrap: "anywhere",
                          }}
                        >
                          {description}
                        </Typography>
                      </Box>

                      <Stack
                        alignItems="center"
                        spacing={0}
                        sx={{ flexShrink: 0, ml: { xs: 0, sm: 0.5 } }}
                      >
                        <Switch
                          size="small"
                          checked={enabled}
                          onChange={(event, checked) =>
                            handleToggle(key, checked)
                          }
                          disabled={saving}
                          inputProps={{
                            "aria-label": title,
                          }}
                          sx={{
                            mr: { xs: -0.7, sm: -0.4 },
                            "& .MuiSwitch-switchBase": {
                              p: { xs: 0.7, sm: 0.8 },
                            },
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: { xs: "0.56rem", sm: "0.65rem" },
                            fontWeight: 750,
                            color: enabled ? "success.main" : "text.disabled",
                            lineHeight: 1,
                          }}
                        >
                          {enabled ? "ON" : "OFF"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </MotionCard>
              );
            })}
          </Stack>
        </MotionBox>

        {/* Account information */}
        <MotionBox variants={fadeUp} sx={{ mt: { xs: 2.5, sm: 3.5 } }}>
          <Typography
            sx={{
              mb: { xs: 1, sm: 1.5 },
              fontSize: { xs: "0.76rem", sm: "0.88rem" },
              fontWeight: 800,
              color: "text.secondary",
              letterSpacing: "0.035em",
            }}
          >
            ACCOUNT INFORMATION
          </Typography>

          <Card
            elevation={0}
            sx={{
              borderRadius: { xs: 2.5, sm: 3 },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                "&:last-child": {
                  pb: { xs: 1.5, sm: 2.5 },
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 0.5 }}
              >
                <BusinessRoundedIcon
                  sx={{
                    fontSize: { xs: 18, sm: 21 },
                    color: "primary.main",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "1rem" },
                    fontWeight: 800,
                  }}
                >
                  Business details
                </Typography>
              </Stack>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.7rem", sm: "0.82rem" },
                  lineHeight: 1.6,
                  mb: 1.8,
                }}
              >
                Basic information associated with your business account.
              </Typography>

              <Divider sx={{ mb: 1.8 }} />

              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.8,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  >
                    <BusinessRoundedIcon sx={{ fontSize: 17 }} />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.67rem", sm: "0.75rem" } }}
                    >
                      Business Name
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: { xs: "0.78rem", sm: "0.9rem" },
                        fontWeight: 750,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {business?.businessName ||
                        business?.name ||
                        "Not available"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="flex-start"
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.8,
                      bgcolor: "action.hover",
                      color: "text.secondary",
                      flexShrink: 0,
                    }}
                  >
                    <EmailRoundedIcon sx={{ fontSize: 17 }} />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.67rem", sm: "0.75rem" } }}
                    >
                      Email Address
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.3,
                        fontSize: { xs: "0.78rem", sm: "0.9rem" },
                        fontWeight: 750,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {business?.email ||
                        business?.ownerEmail ||
                        "Not available"}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Save action */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mt: { xs: 2, sm: 2.5 },
            position: "sticky",
            bottom: { xs: 8, sm: 12 },
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              p: { xs: 0.6, sm: 1 },
              borderRadius: { xs: 2.5, sm: 3 },
              bgcolor: isDark
                ? "rgba(18,18,18,0.92)"
                : "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={
                saving ? null : <SaveRoundedIcon sx={{ fontSize: 19 }} />
              }
              endIcon={
                saving ? null : <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
              }
              sx={{
                minHeight: { xs: 42, sm: 48 },
                px: 2,
                borderRadius: { xs: 2, sm: 2.3 },
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 5px 16px rgba(0,0,0,0.12)",
                },
                "&.Mui-disabled": {
                  opacity: 0.7,
                },
              }}
            >
              {saving ? "Saving your settings..." : "Save Settings"}
            </Button>
          </Box>
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
