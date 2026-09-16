import { Link } from "react-router-dom";
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
} from "@mui/material";
import { motion } from "framer-motion";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GoogleIcon from "@mui/icons-material/Google";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useBusiness } from "../../hooks/useBusiness";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function Profile() {
  const { business, loading } = useBusiness();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Typography color="text.secondary">
          Loading profile...
        </Typography>
      </Box>
    );
  }

  const businessName =
    business?.businessName ||
    business?.name ||
    "Your Business";

  const description =
    business?.description ||
    "Add a description to tell customers more about your business.";

  const logo =
    business?.logoUrl ||
    business?.logo ||
    "";

  const email =
    business?.email ||
    business?.ownerEmail ||
    "Not provided";

  const phone =
    business?.phone ||
    business?.mobile ||
    "Not provided";

  const category =
    business?.category ||
    business?.businessCategory ||
    "Business";

  const address =
    business?.address ||
    business?.location ||
    "Address not added";

  const googleUrl =
    business?.googleReviewUrl ||
    business?.googleUrl ||
    "";

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <MotionBox
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Header */}
        <Box
          sx={{
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
            mb: {
              xs: 2.5,
              sm: 3.5,
            },
          }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={0.8}
              alignItems="center"
              sx={{ mb: 0.8 }}
            >
              <BusinessRoundedIcon
                color="primary"
                sx={{ fontSize: 20 }}
              />

              <Typography
                color="primary"
                fontWeight={800}
                fontSize={13}
                letterSpacing="0.04em"
              >
                BUSINESS PROFILE
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
              Business Profile
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.7,
                fontSize: {
                  xs: "0.9rem",
                  sm: "1rem",
                },
              }}
            >
              View and manage your business information.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/business/profile/edit"
            variant="contained"
            startIcon={<EditRoundedIcon />}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
              minHeight: 44,
              px: 2.2,
              borderRadius: 2.5,
              fontWeight: 800,
            }}
          >
            Edit Profile
          </Button>
        </Box>

        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {/* Main Profile */}
          <Grid size={{ xs: 12, md: 8 }}>
            <MotionCard
              whileHover={{
                y: -2,
              }}
              transition={{
                duration: 0.2,
              }}
              elevation={0}
              sx={{
                height: "100%",
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
                    xs: 2.2,
                    sm: 3,
                    md: 4,
                  },
                }}
              >
                {/* Business Identity */}
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                >
                  <Avatar
                    src={logo || undefined}
                    alt={businessName}
                    sx={{
                      width: {
                        xs: 72,
                        sm: 88,
                      },
                      height: {
                        xs: 72,
                        sm: 88,
                      },
                      borderRadius: 3,
                      fontSize: {
                        xs: 25,
                        sm: 30,
                      },
                      fontWeight: 800,
                      bgcolor: "primary.main",
                      boxShadow:
                        "0 10px 25px rgba(37,99,235,0.18)",
                    }}
                  >
                    {businessName.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      sx={{
                        fontSize: {
                          xs: "1.35rem",
                          sm: "1.55rem",
                        },
                        wordBreak: "break-word",
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
                        mt: 1,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Stack>

                {/* About */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                  >
                    About the business
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.8,
                      lineHeight: 1.75,
                      fontSize: "0.94rem",
                    }}
                  >
                    {description}
                  </Typography>
                </Box>

                {/* Contact Information */}
                <Grid
                  container
                  spacing={1.5}
                  sx={{ mt: 1.5 }}
                >
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
                      label="Business Address"
                      value={address}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Profile Setup */}
          <Grid size={{ xs: 12, md: 4 }}>
            <MotionCard
              whileHover={{
                y: -2,
              }}
              transition={{
                duration: 0.2,
              }}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: {
                  xs: 3,
                  sm: 4,
                },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.2,
                    sm: 3,
                  },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={900}
                >
                  Profile Setup
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                    lineHeight: 1.7,
                  }}
                >
                  Keep your business profile complete so
                  customers get accurate information.
                </Typography>

                <Stack spacing={1.3} sx={{ mt: 2.5 }}>
                  <SetupRow
                    label="Business information"
                    status={
                      business?.businessName ||
                      business?.name
                        ? "Complete"
                        : "Missing"
                    }
                    color={
                      business?.businessName ||
                      business?.name
                        ? "success"
                        : "warning"
                    }
                  />

                  <SetupRow
                    label="Google review URL"
                    status={googleUrl ? "Connected" : "Setup"}
                    color={googleUrl ? "success" : "warning"}
                  />

                  <SetupRow
                    label="Public rating page"
                    status="Available"
                    color="success"
                  />
                </Stack>

                {/* Action Buttons */}
                <Stack spacing={1.2} sx={{ mt: 2.5 }}>
                  <Button
                    component={Link}
                    to="/business/google-settings"
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    endIcon={<ArrowForwardRoundedIcon />}
                    fullWidth
                    sx={{
                      minHeight: 46,
                      borderRadius: 2.5,
                      justifyContent: "space-between",
                      px: 2,
                      fontWeight: 800,
                    }}
                  >
                    Google Settings
                  </Button>

                  <Button
                    component={Link}
                    to="/business/public-page"
                    variant="outlined"
                    startIcon={<PublicRoundedIcon />}
                    endIcon={<ArrowForwardRoundedIcon />}
                    fullWidth
                    sx={{
                      minHeight: 46,
                      borderRadius: 2.5,
                      justifyContent: "space-between",
                      px: 2,
                      fontWeight: 800,
                    }}
                  >
                    Public Page
                  </Button>
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
    <Box
      sx={{
        p: {
          xs: 1.7,
          sm: 2,
        },
        height: "100%",
        borderRadius: 2.8,
        backgroundColor: "action.hover",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: "action.selected",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.3}
        alignItems="flex-start"
      >
        <Box
          sx={{
            display: "flex",
            color: "primary.main",
            mt: 0.1,
            "& svg": {
              fontSize: 21,
            },
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {label}
          </Typography>

          <Typography
            fontWeight={700}
            sx={{
              mt: 0.4,
              wordBreak: "break-word",
              lineHeight: 1.5,
              fontSize: {
                xs: "0.9rem",
                sm: "0.95rem",
              },
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function SetupRow({ label, status, color }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        p: 1.2,
        borderRadius: 2,
        backgroundColor: "action.hover",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          minWidth: 0,
        }}
      >
        {label}
      </Typography>

      <Chip
        label={status}
        size="small"
        color={color}
        sx={{
          flexShrink: 0,
          fontWeight: 700,
        }}
      />
    </Box>
  );
}