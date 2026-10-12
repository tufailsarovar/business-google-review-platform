
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GoogleIcon from "@mui/icons-material/Google";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { useBusiness } from "../../hooks/useBusiness";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function Profile() {
  const { business, loading } = useBusiness();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "35vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={26} />
        <Typography color="text.secondary" variant="body2">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  const businessName =
    business?.businessName || business?.name || "Your Business";

  const description =
    business?.description ||
    "Add a description to tell customers more about your business.";

  const logo = business?.logoUrl || business?.logo || "";
  const email = business?.email || business?.ownerEmail || "Not provided";
  const phone = business?.phone || business?.mobile || "Not provided";
  const category =
    business?.category || business?.businessCategory || "Business";
  const address =
    business?.address || business?.location || "Address not added";

  const googleUrl =
    business?.googleBusiness?.reviewUrl ||
    business?.googleReviewUrl ||
    business?.googleUrl ||
    "";

  const setupItems = [
    {
      label: "Business information",
      complete: Boolean(business?.businessName || business?.name),
      status:
        business?.businessName || business?.name
          ? "Complete"
          : "Missing",
    },
    {
      label: "Google review link",
      complete: Boolean(googleUrl),
      status: googleUrl ? "Connected" : "Setup",
    },
    {
      label: "Public rating page",
      complete: true,
      status: "Available",
    },
  ];

  const setupPercentage = Math.round(
    (setupItems.filter((item) => item.complete).length /
      setupItems.length) *
      100
  );

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: { xs: 1, sm: 2 } }}>
      <MotionBox
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <MotionBox variants={itemVariants} sx={{ mb: { xs: 1.5, sm: 3 } }}>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ mb: 0.4 }}
              >
                <BusinessRoundedIcon
                  sx={{ color: "primary.main", fontSize: 16 }}
                />
                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                    letterSpacing: 0.8,
                  }}
                >
                  YOUR BUSINESS
                </Typography>
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "1.25rem", sm: "2rem" },
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                }}
              >
                Business Profile
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.4,
                  fontSize: { xs: "0.72rem", sm: "0.92rem" },
                }}
              >
                Manage your business details.
              </Typography>
            </Box>

            <Button
              component={Link}
              to="/business/profile/edit"
              variant="contained"
              size="small"
              startIcon={<EditRoundedIcon />}
              sx={{
                flexShrink: 0,
                minHeight: { xs: 34, sm: 44 },
                px: { xs: 1, sm: 2 },
                borderRadius: 2,
                fontWeight: 800,
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
                whiteSpace: "nowrap",
                boxShadow: "none",
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.5, sm: 1 },
                },
              }}
            >
              Edit
            </Button>
          </Stack>
        </MotionBox>

        <Grid container spacing={{ xs: 1.2, sm: 2, md: 2.5 }}>
          {/* Main Profile */}
          <Grid size={{ xs: 12, md: 8 }}>
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: { xs: 2.5, sm: 4 },
                overflow: "hidden",
                backgroundImage: "none",
              }}
            >
              <Box
                sx={{
                  height: 3,
                  background:
                    "linear-gradient(90deg, #2563eb, #60a5fa, #a78bfa)",
                }}
              />

              <CardContent sx={{ p: { xs: 1.5, sm: 3, md: 3.5 } }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={{ xs: 1.2, sm: 2 }}
                  sx={{ minWidth: 0 }}
                >
                  <MotionBox
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Avatar
                      src={logo || undefined}
                      alt={businessName}
                      sx={{
                        width: { xs: 48, sm: 78 },
                        height: { xs: 48, sm: 78 },
                        borderRadius: { xs: 2, sm: 3 },
                        bgcolor: "primary.main",
                        fontSize: { xs: 20, sm: 28 },
                        fontWeight: 900,
                        boxShadow: "0 5px 14px rgba(37,99,235,0.16)",
                      }}
                    >
                      {businessName.charAt(0).toUpperCase()}
                    </Avatar>
                  </MotionBox>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.98rem", sm: "1.5rem" },
                        fontWeight: 900,
                        lineHeight: 1.3,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {businessName}
                    </Typography>

                    <Chip
                      label={category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{
                        mt: 0.6,
                        height: { xs: 21, sm: 24 },
                        maxWidth: "100%",
                        fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Stack>

                {/* Description */}
                <Box
                  sx={{
                    mt: { xs: 1.8, sm: 3 },
                    pt: { xs: 1.5, sm: 2.5 },
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.82rem", sm: "1rem" },
                      fontWeight: 800,
                      mb: 0.5,
                    }}
                  >
                    About your business
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.77rem", sm: "0.93rem" },
                      lineHeight: { xs: 1.6, sm: 1.8 },
                      overflowWrap: "anywhere",
                    }}
                  >
                    {description}
                  </Typography>
                </Box>

                {/* Contact Information */}
                <Box sx={{ mt: { xs: 1.8, sm: 3 } }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "0.82rem", sm: "1rem" },
                      fontWeight: 800,
                      mb: { xs: 1, sm: 1.5 },
                    }}
                  >
                    Contact information
                  </Typography>

                  <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoBox
                        icon={<EmailRoundedIcon />}
                        label="Email"
                        value={email}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoBox
                        icon={<PhoneRoundedIcon />}
                        label="Phone"
                        value={phone}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <InfoBox
                        icon={<LocationOnRoundedIcon />}
                        label="Business address"
                        value={address}
                      />
                    </Grid>
                  </Grid>
                </Box>

                <Button
                  component={Link}
                  to="/business/profile/edit"
                  endIcon={<ArrowForwardRoundedIcon />}
                  fullWidth
                  size="small"
                  sx={{
                    mt: { xs: 1.5, sm: 2.5 },
                    minHeight: { xs: 36, sm: 43 },
                    borderRadius: 2,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    fontWeight: 800,
                    bgcolor: "action.hover",
                    color: "text.primary",
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  Update details
                </Button>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Setup Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MotionCard
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              elevation={0}
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: { xs: 2.5, sm: 4 },
                backgroundImage: "none",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.95rem", sm: "1.1rem" },
                    fontWeight: 900,
                  }}
                >
                  Profile setup
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "0.74rem", sm: "0.875rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Keep your business information up to date.
                </Typography>

                {/* Progress */}
                <Box
                  sx={{
                    mt: { xs: 1.5, sm: 2.5 },
                    p: { xs: 1.3, sm: 2 },
                    borderRadius: 2.5,
                    bgcolor: "action.hover",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        fontWeight: 700,
                      }}
                    >
                      Setup progress
                    </Typography>

                    <Typography
                      color="primary.main"
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.95rem" },
                        fontWeight: 900,
                      }}
                    >
                      {setupPercentage}%
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      mt: 1,
                      height: 5,
                      borderRadius: 99,
                      bgcolor: "action.selected",
                      overflow: "hidden",
                    }}
                  >
                    <MotionBox
                      initial={{ width: 0 }}
                      animate={{ width: `${setupPercentage}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      sx={{
                        height: "100%",
                        borderRadius: 99,
                        bgcolor: "primary.main",
                      }}
                    />
                  </Box>
                </Box>

                {/* Checklist */}
                <Stack spacing={1} sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
                  {setupItems.map((item, index) => (
                    <MotionBox
                      key={item.label}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + index * 0.08,
                        duration: 0.25,
                      }}
                    >
                      <SetupRow
                        label={item.label}
                        status={item.status}
                        complete={item.complete}
                      />
                    </MotionBox>
                  ))}
                </Stack>

                {/* Quick links */}
                <Stack spacing={1} sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
                  <ActionButton
                    to="/business/google-settings"
                    icon={<GoogleIcon />}
                    label="Google Settings"
                  />

                  <ActionButton
                    to="/business/public-page"
                    icon={<PublicRoundedIcon />}
                    label="Public Rating Page"
                  />
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>
      </MotionBox>
    </Box>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <MotionBox
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: { xs: 1, sm: 1.5 },
        p: { xs: 1.1, sm: 1.7 },
        minWidth: 0,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, sm: 2.5 },
        transition: "background-color 0.2s",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: { xs: 30, sm: 37 },
          height: { xs: 30, sm: 37 },
          borderRadius: 1.8,
          color: "primary.main",
          bgcolor: "action.hover",
          "& svg": { fontSize: { xs: 17, sm: 20 } },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            display: "block",
            mb: 0.3,
            fontSize: { xs: "0.68rem", sm: "0.8rem" },
            color: "text.secondary",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: "0.76rem", sm: "0.9rem" },
            fontWeight: 700,
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </Box>
    </MotionBox>
  );
}

function SetupRow({ label, status, complete }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.8,
        p: { xs: 1, sm: 1.3 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <CheckCircleRoundedIcon
        sx={{
          fontSize: { xs: 16, sm: 19 },
          flexShrink: 0,
          color: complete ? "success.main" : "text.disabled",
        }}
      />

      <Typography
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: { xs: "0.72rem", sm: "0.82rem" },
          fontWeight: 650,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>

      <Chip
        label={status}
        size="small"
        color={complete ? "success" : "warning"}
        variant="outlined"
        sx={{
          flexShrink: 0,
          height: { xs: 20, sm: 24 },
          fontWeight: 700,
          fontSize: { xs: "0.61rem", sm: "0.68rem" },
          maxWidth: "45%",
          "& .MuiChip-label": {
            px: { xs: 0.7, sm: 1 },
          },
        }}
      />
    </Box>
  );
}

function ActionButton({ to, icon, label }) {
  return (
    <Button
      component={Link}
      to={to}
      variant="outlined"
      fullWidth
      size="small"
      startIcon={icon}
      endIcon={<ArrowForwardRoundedIcon />}
      sx={{
        minHeight: { xs: 38, sm: 46 },
        px: { xs: 1.2, sm: 1.7 },
        borderRadius: 2,
        justifyContent: "space-between",
        fontSize: { xs: "0.72rem", sm: "0.875rem" },
        fontWeight: 800,
        textTransform: "none",
        transition: "transform 0.2s, background-color 0.2s",
        "&:hover": { transform: "translateX(2px)" },
        "& .MuiButton-startIcon": {
          mr: { xs: 0.7, sm: 1 },
          "& svg": { fontSize: { xs: 17, sm: 20 } },
        },
        "& .MuiButton-endIcon": {
          ml: 0.5,
          "& svg": { fontSize: { xs: 17, sm: 20 } },
        },
      }}
    >
      {label}
    </Button>
  );
}
