import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { motion } from "framer-motion";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

import GoogleIcon from "@mui/icons-material/Google";

import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

import EditRoundedIcon from "@mui/icons-material/EditRounded";

import QRCodeDownload from "../../components/common/QRCodeDownload";

import adminService from "../../services/adminService";

const MotionBox = motion(Box);

export default function BusinessDetails() {
  const { id } = useParams();

  const [business, setBusiness] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      if (!id) {
        setLoading(false);

        setError("Business ID is missing.");

        return;
      }

      try {
        setLoading(true);

        setError("");

        const response = await adminService.getBusinessById(id);

        if (!mounted) return;

        setBusiness(response?.data?.business || response?.data || response);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message || "Unable to load business details.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",

          display: "grid",

          placeItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !business) {
    return (
      <Box>
        <Button
          component={Link}
          to="/admin/businesses"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: 3 }}
        >
          Back to Businesses
        </Button>

        <Alert severity="error" sx={{ borderRadius: 2.5 }}>
          {error || "Business not found."}
        </Alert>
      </Box>
    );
  }

  const businessName =
    business.businessName || business.name || "Unnamed Business";

  const email = business.email || business.ownerEmail || "Not provided";

  const phone = business.phone || business.mobile || "Not provided";

  const category = business.category || business.businessCategory || "Business";

  const address = business.address || business.location || "Not provided";

  const description =
    business.description || "No business description has been added.";

  const logo = business.logoUrl || business.logo || "";

  const googleUrl = business.googleReviewUrl || business.googleUrl || "";

  const active = business.isActive !== false && business.status !== "inactive";

  const handleToggleStatus = async () => {
    if (!id || actionLoading) return;

    try {
      setActionLoading(true);
      setActionError("");
      if (active) {
        await adminService.deactivateBusiness(id);
        setBusiness((current) => ({
          ...current,
          isActive: false,
          status: "inactive",
        }));
      } else {
        await adminService.activateBusiness(id);
        setBusiness((current) => ({
          ...current,
          isActive: true,
          status: "active",
        }));
      }
    } catch (err) {
      setActionError(
        err?.response?.data?.message || "Unable to update business status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}

        <Box
          sx={{
            mb: { xs: 1.5, sm: 2.5 },

            display: "flex",

            justifyContent: "space-between",

            alignItems: {
              xs: "flex-start",

              sm: "center",
            },

            flexDirection: {
              xs: "column",

              sm: "row",
            },

            gap: { xs: 1, sm: 2 },
          }}
        >
          <Button
            component={Link}
            to="/admin/businesses"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              minHeight: { xs: 34, sm: 40 },

              borderRadius: { xs: 1.2, sm: 1.8 },
            }}
          >
            Back to Businesses
          </Button>

        </Box>

        {/* Profile card */}

        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 1.8, sm: 2.5 },

            border: "1px solid",

            borderColor: "divider",

            mb: 2.5,
          }}
        >
          <CardContent
            sx={{
              p: { xs: 1.6, sm: 2.5, md: 3 },
            }}
          >
            <Stack
              direction={{
                xs: "column",

                sm: "row",
              }}
              spacing={{ xs: 1.3, sm: 2 }}
              alignItems={{
                xs: "flex-start",

                sm: "center",
              }}
            >
              <Avatar
                src={logo || undefined}
                alt={businessName}
                sx={{
                  width: { xs: 58, sm: 76 },

                  height: { xs: 58, sm: 76 },

                  borderRadius: { xs: 1.2, sm: 1.8 },

                  bgcolor: "primary.main",

                  fontSize: { xs: 22, sm: 28 },

                  fontWeight: 800,
                }}
              >
                {businessName.charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
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
                    {businessName}
                  </Typography>

                  <Chip
                    label={active ? "Active" : "Inactive"}
                    size="small"
                    color={active ? "success" : "default"}
                  />
                </Stack>

                <Chip
                  label={category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />

                {actionError && (
                  <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                    {actionError}
                  </Alert>
                )}
              </Box>

              <Button
                variant={active ? "outlined" : "contained"}
                color={active ? "error" : "success"}
                size="small"
                disabled={actionLoading}
                startIcon={
                  actionLoading ? (
                    <CircularProgress size={15} color="inherit" />
                  ) : active ? (
                    <BlockRoundedIcon />
                  ) : (
                    <CheckCircleRoundedIcon />
                  )
                }
                onClick={handleToggleStatus}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: "flex-start", sm: "center" },
                  minHeight: 36,
                  borderRadius: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                  ml: { sm: "auto" },
                }}
              >
                {actionLoading
                  ? "Updating..."
                  : active
                    ? "Deactivate"
                    : "Activate"}
              </Button>
            </Stack>

            <Divider sx={{ my: { xs: 1.5, sm: 2.5 } }} />

            <Typography variant="subtitle1" fontWeight={800}>
              About
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,

                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={{ xs: 1.3, sm: 2 }}>
          {/* Contact */}

          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",

                borderRadius: { xs: 1.6, sm: 2.2 },

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
                <Typography variant="h6" fontWeight={800}>
                  Business Information
                </Typography>

                <Stack
                  spacing={{ xs: 1, sm: 1.5 }}
                  sx={{ mt: { xs: 1.5, sm: 2.5 } }}
                >
                  <Box
                    sx={{
                      display: "flex",

                      gap: 1.5,

                      p: { xs: 1.1, sm: 1.7 },

                      borderRadius: { xs: 1.2, sm: 1.8 },

                      backgroundColor: "action.hover",
                    }}
                  >
                    <EmailRoundedIcon color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>

                      <Typography
                        fontWeight={700}
                        sx={{
                          mt: 0.5,

                          wordBreak: "break-word",
                        }}
                      >
                        {email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",

                      gap: 1.5,

                      p: { xs: 1.1, sm: 1.7 },

                      borderRadius: { xs: 1.2, sm: 1.8 },

                      backgroundColor: "action.hover",
                    }}
                  >
                    <PhoneRoundedIcon color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>

                      <Typography fontWeight={700} sx={{ mt: 0.5 }}>
                        {phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",

                      gap: 1.5,

                      p: { xs: 1.1, sm: 1.7 },

                      borderRadius: { xs: 1.2, sm: 1.8 },

                      backgroundColor: "action.hover",
                    }}
                  >
                    <LocationOnRoundedIcon color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>

                      <Typography
                        fontWeight={700}
                        sx={{
                          mt: 0.5,

                          lineHeight: 1.6,
                        }}
                      >
                        {address}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Review configuration */}

          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",

                borderRadius: { xs: 1.6, sm: 2.2 },

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2.5, md: 3 } }}>
                <Typography variant="h6" fontWeight={800}>
                  Review Configuration
                </Typography>

                <Stack
                  spacing={{ xs: 1, sm: 1.5 }}
                  sx={{ mt: { xs: 1.5, sm: 2.5 } }}
                >
                  <Box
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "space-between",

                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GoogleIcon color="primary" />

                      <Typography fontWeight={700}>Google Reviews</Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label={googleUrl ? "Connected" : "Not Set"}
                      color={googleUrl ? "success" : "warning"}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      justifyContent: "space-between",

                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PublicRoundedIcon color="primary" />

                      <Typography fontWeight={700}>Public Page</Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label={
                        business.publicPageEnabled === false
                          ? "Disabled"
                          : "Enabled"
                      }
                      color={
                        business.publicPageEnabled === false
                          ? "default"
                          : "success"
                      }
                    />
                  </Box>
                </Stack>

                {googleUrl && (
                  <Button
                    component="a"
                    href={googleUrl}
                    target="\_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    sx={{
                      mt: 3,

                      minHeight: { xs: 38, sm: 44 },

                      borderRadius: { xs: 1.2, sm: 1.8 },
                    }}
                  >
                    Open Google Review Page
                  </Button>
                )}

                {business.businessId && (
                  <Box sx={{ mt: { xs: 1.5, sm: 2.5 } }}>
                    <QRCodeDownload
                      url={`${window.location.origin}/rate/${encodeURIComponent(business.businessId)}`}
                      fileName={`tapreview-${business.businessId}`}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MotionBox>
    </Box>
  );
}
