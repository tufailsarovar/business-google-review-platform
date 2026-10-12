
import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";

import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ContactAdminForm from "../../components/contact/ContactAdminForm";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function ContactAdmin() {
  const [success, setSuccess] = useState(false);
  const theme = useTheme();

  const isDark = theme.palette.mode === "dark";

  const handleSuccess = () => {
    setSuccess(true);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: 1040,
        mx: "auto",
        px: { xs: 1.25, sm: 2, md: 3 },
        py: { xs: 1.5, sm: 2.5, md: 3 },
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.09,
            },
          },
        }}
      >
        {/* Compact page header */}
        <MotionBox variants={fadeUp} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            spacing={{ xs: 1.2, sm: 1.8 }}
            alignItems="center"
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.75, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 16,
                delay: 0.12,
              }}
              sx={{
                width: { xs: 43, sm: 54 },
                height: { xs: 43, sm: 54 },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: { xs: 2.5, sm: 3 },
                color: "primary.main",
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <SupportAgentRoundedIcon
                sx={{ fontSize: { xs: 25, sm: 31 } }}
              />
            </MotionBox>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: 9, sm: 11 },
                  fontWeight: 800,
                  letterSpacing: "0.13em",
                  mb: 0.35,
                }}
              >
                TAPREVIEW SUPPORT
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.35rem",
                    sm: "1.8rem",
                    md: "2.15rem",
                  },
                  fontWeight: 850,
                  lineHeight: 1.15,
                  letterSpacing: "-0.045em",
                  overflowWrap: "anywhere",
                }}
              >
                Support Team
              </Typography>
            </Box>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: { xs: 1.1, sm: 1.5 },
              fontSize: { xs: "0.78rem", sm: "0.9rem", md: "0.95rem" },
              lineHeight: { xs: 1.6, sm: 1.75 },
              maxWidth: 560,
            }}
          >
            Need help with your account or business? Send a message
            to our administration team and we will assist you.
          </Typography>

          <Chip
            icon={
              <ScheduleRoundedIcon
                sx={{ fontSize: { xs: 14, sm: 17 } }}
              />
            }
            label="Usually replies within 24 hours"
            variant="outlined"
            color="primary"
            size="small"
            sx={{
              mt: { xs: 1.2, sm: 1.7 },
              height: { xs: 27, sm: 31 },
              borderRadius: 2,
              maxWidth: "100%",
              "& .MuiChip-label": {
                px: { xs: 0.7, sm: 1 },
                fontSize: { xs: "0.66rem", sm: "0.76rem" },
                fontWeight: 650,
                whiteSpace: "normal",
              },
              "& .MuiChip-icon": {
                ml: 0.8,
                mr: -0.2,
              },
            }}
          />
        </MotionBox>

        {/* Success notification */}
        {success && (
          <MotionBox
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            sx={{ mb: { xs: 1.5, sm: 2 } }}
          >
            <Alert
              severity="success"
              icon={<CheckCircleRoundedIcon />}
              sx={{
                borderRadius: { xs: 2, sm: 2.5 },
                py: { xs: 0.25, sm: 0.5 },
                px: { xs: 0.75, sm: 1.5 },
                alignItems: "flex-start",
                "& .MuiAlert-icon": {
                  fontSize: { xs: 19, sm: 22 },
                  mr: { xs: 0.8, sm: 1.5 },
                  pt: 0.5,
                },
                "& .MuiAlert-message": {
                  fontSize: { xs: "0.74rem", sm: "0.88rem" },
                  lineHeight: 1.6,
                  overflowWrap: "anywhere",
                },
              }}
            >
              <Typography
                component="span"
                sx={{ fontWeight: 800, fontSize: "inherit" }}
              >
                Request sent successfully!
              </Typography>
              <br />
              Our team will usually reply within 24 hours.
            </Alert>
          </MotionBox>
        )}

        {/* Main form card */}
        <MotionCard
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          whileHover={{
            y: { xs: 0, sm: -2 },
            transition: { duration: 0.2 },
          }}
          elevation={0}
          sx={{
            position: "relative",
            minWidth: 0,
            borderRadius: { xs: 2.5, sm: 3.5 },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: isDark
              ? "0 8px 30px rgba(0,0,0,0.16)"
              : "0 8px 30px rgba(15,23,42,0.045)",
            transition: "border-color 0.25s ease",
            "&:hover": {
              borderColor: "primary.main",
            },
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              bgcolor: "primary.main",
            },
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 1.5,
                sm: 2.5,
                md: 3.5,
              },
              "&:last-child": {
                pb: { xs: 1.5, sm: 2.5, md: 3.5 },
              },
            }}
          >
            {/* Form introduction */}
            <Box sx={{ mb: { xs: 2, sm: 2.8 } }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.9}
                sx={{ mb: 0.5 }}
              >
                <Typography
                  component="h2"
                  sx={{
                    fontSize: { xs: "0.94rem", sm: "1.12rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                  }}
                >
                  Send us a message
                </Typography>

                <ArrowForwardRoundedIcon
                  sx={{
                    color: "primary.main",
                    fontSize: { xs: 17, sm: 19 },
                  }}
                />
              </Stack>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.73rem", sm: "0.86rem" },
                  lineHeight: 1.65,
                  maxWidth: 520,
                }}
              >
                Describe your issue clearly so we can help you faster.
              </Typography>
            </Box>

            {/* Existing form — functionality preserved */}
            <Box
              sx={{
                minWidth: 0,
                "& > *": {
                  minWidth: 0,
                  maxWidth: "100%",
                },
                "& .MuiFormControl-root": {
                  minWidth: 0,
                },
                "& .MuiInputBase-root": {
                  fontSize: { xs: "0.82rem", sm: "0.9rem" },
                  borderRadius: { xs: 1.8, sm: 2 },
                },
                "& .MuiInputLabel-root": {
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                },
                "& .MuiFormHelperText-root": {
                  mx: 0,
                  fontSize: { xs: "0.67rem", sm: "0.75rem" },
                  lineHeight: 1.5,
                },
                "& .MuiButton-root": {
                  minHeight: { xs: 39, sm: 44 },
                  borderRadius: { xs: 2, sm: 2.3 },
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  fontWeight: 750,
                  textTransform: "none",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                  "@media (hover: hover)": {
                    "&:hover": {
                      transform: "translateY(-1px)",
                    },
                  },
                },
              }}
            >
              <ContactAdminForm onSuccess={handleSuccess} />
            </Box>
          </CardContent>
        </MotionCard>

        {/* Compact response information */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mt: { xs: 1.5, sm: 2 },
            px: { xs: 0.3, sm: 0.7 },
          }}
        >
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1}
          >
            <ScheduleRoundedIcon
              sx={{
                color: "primary.main",
                fontSize: { xs: 16, sm: 19 },
                mt: "2px",
                flexShrink: 0,
              }}
            />

            <Typography
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.68rem", sm: "0.78rem" },
                lineHeight: 1.65,
              }}
            >
              Your message will be reviewed by the TapReview
              administration team. Response times may vary.
            </Typography>
          </Stack>
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
