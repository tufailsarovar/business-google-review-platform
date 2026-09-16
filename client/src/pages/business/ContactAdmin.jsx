import { useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ContactAdminForm from "../../components/contact/ContactAdminForm";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function ContactAdmin() {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
            sx={{ mb: 0.8 }}
          >
            <SupportAgentRoundedIcon
              color="primary"
              sx={{ fontSize: 21 }}
            />

            <Typography
              color="primary"
              fontWeight={800}
              fontSize={13}
              letterSpacing="0.04em"
            >
              ADMIN SUPPORT
            </Typography>
          </Stack>

          <Typography
            component="h1"
            fontWeight={900}
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.3rem",
              },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            Contact Admin
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.7,
              maxWidth: 650,
              fontSize: {
                xs: "0.9rem",
                sm: "1rem",
              },
              lineHeight: 1.7,
            }}
          >
            Have a question or need help? Send a support
            request to the TapRating administration team.
          </Typography>

          {/* Response Time */}
          <Chip
            icon={
              <ScheduleRoundedIcon
                sx={{ fontSize: 18 }}
              />
            }
            label="We usually reply within 24 hours"
            color="primary"
            variant="outlined"
            sx={{
              mt: 1.8,
              height: 36,
              borderRadius: 2,
              fontWeight: 700,
              "& .MuiChip-label": {
                px: 1.2,
              },
            }}
          />
        </Box>

        {/* Success Message */}
        {success && (
          <MotionBox
            initial={{
              opacity: 0,
              y: -10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.3,
            }}
            sx={{ mb: 2.5 }}
          >
            <Alert
              severity="success"
              icon={<CheckCircleRoundedIcon />}
              sx={{
                borderRadius: 2.5,
                alignItems: "center",
                "& .MuiAlert-message": {
                  fontWeight: 600,
                },
              }}
            >
              Your support request has been sent successfully.
              Our team will usually reply within 24 hours.
            </Alert>
          </MotionBox>
        )}

        {/* Form */}
        <MotionCard
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            delay: 0.08,
            ease: "easeOut",
          }}
          whileHover={{
            y: -2,
          }}
          elevation={0}
          sx={{
            borderRadius: {
              xs: 3,
              sm: 4,
            },
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
                md: 4,
              },
            }}
          >
            <Box
              sx={{
                mb: 2.5,
                p: {
                  xs: 1.6,
                  sm: 2,
                },
                borderRadius: 2.5,
                backgroundColor: "action.hover",
              }}
            >
              <Typography
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "0.95rem",
                    sm: "1rem",
                  },
                }}
              >
                Send us a message
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                  lineHeight: 1.6,
                }}
              >
                Tell us what you need help with and our
                administration team will get back to you.
              </Typography>
            </Box>

            <ContactAdminForm onSuccess={handleSuccess} />
          </CardContent>
        </MotionCard>

        {/* Response Notice */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          sx={{
            mt: 1.8,
            px: 0.5,
          }}
        >
          <ScheduleRoundedIcon
            color="primary"
            sx={{ fontSize: 18 }}
          />

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
            }}
          >
            Support requests are reviewed by the TapRating
            admin team. You can expect a reply within 24 hours.
          </Typography>
        </Stack>
      </MotionBox>
    </Box>
  );
}