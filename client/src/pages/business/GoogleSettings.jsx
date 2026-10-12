
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";

import GoogleReviewSetup from "../../components/business/GoogleReviewSetup";

import GoogleIcon from "@mui/icons-material/Google";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export default function GoogleSettings() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1050,
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
            transition: { staggerChildren: 0.08 },
          },
        }}
      >
        {/* Header */}
        <MotionBox
          variants={fadeUp}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            alignItems="center"
          >
            <MotionBox
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 0.45,
                type: "spring",
                stiffness: 200,
                damping: 17,
              }}
              sx={{
                width: { xs: 42, sm: 52 },
                height: { xs: 42, sm: 52 },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: { xs: 2.2, sm: 3 },
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                color: "#4285F4",
              }}
            >
              <GoogleIcon
                sx={{ fontSize: { xs: 25, sm: 31 } }}
              />
            </MotionBox>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: "0.6rem", sm: "0.73rem" },
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  mb: 0.3,
                }}
              >
                GOOGLE INTEGRATION
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.3rem",
                    sm: "1.85rem",
                    md: "2.2rem",
                  },
                  fontWeight: 850,
                  lineHeight: 1.15,
                  letterSpacing: "-0.045em",
                  overflowWrap: "anywhere",
                }}
              >
                Google Review Settings
              </Typography>
            </Box>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 620,
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              lineHeight: 1.7,
            }}
          >
            Connect your Google review page so customers can continue
            directly to Google after preparing their feedback.
          </Typography>
        </MotionBox>

        {/* Google setup component */}
        <MotionBox variants={fadeUp} sx={{ minWidth: 0 }}>
          <Card
            elevation={0}
            sx={{
              position: "relative",
              minWidth: 0,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: { xs: 2.5, sm: 3.5 },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                bgcolor: "#4285F4",
              },
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5, md: 3 },
                "&:last-child": {
                  pb: { xs: 1.5, sm: 2.5, md: 3 },
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: { xs: 1.5, sm: 2.2 } }}
              >
                <Box
                  sx={{
                    width: { xs: 34, sm: 40 },
                    height: { xs: 34, sm: 40 },
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    color: "#4285F4",
                  }}
                >
                  <GoogleIcon
                    sx={{ fontSize: { xs: 20, sm: 24 } }}
                  />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.88rem", sm: "1.03rem" },
                      fontWeight: 850,
                    }}
                  >
                    Configure Google Reviews
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      fontSize: { xs: "0.68rem", sm: "0.79rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    Manage your Google review destination below.
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  minWidth: 0,
                  width: "100%",
                  "& > *": {
                    minWidth: 0,
                    maxWidth: "100%",
                  },
                  "& .MuiFormControl-root": {
                    minWidth: 0,
                  },
                  "& .MuiInputBase-root": {
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    borderRadius: { xs: 1.8, sm: 2 },
                  },
                  "& .MuiButton-root": {
                    minHeight: { xs: 39, sm: 43 },
                    borderRadius: { xs: 2, sm: 2.3 },
                    fontSize: { xs: "0.76rem", sm: "0.85rem" },
                    fontWeight: 750,
                    textTransform: "none",
                  },
                }}
              >
                <GoogleReviewSetup />
              </Box>
            </CardContent>
          </Card>
        </MotionBox>

        {/* Footer */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mt: { xs: 1.8, sm: 2.5 },
            pb: 1,
            textAlign: "center",
          }}
        >
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.62rem", sm: "0.73rem" },
              lineHeight: 1.6,
            }}
          >
            TapReview · Google Review Integration
          </Typography>
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
