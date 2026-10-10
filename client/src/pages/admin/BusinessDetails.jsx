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

  return (
    <Box>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <Box
          sx={{
            mb: 4,
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
            gap: 2,
          }}
        >
          <Button
            component={Link}
            to="/admin/businesses"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              minHeight: 42,
              borderRadius: 2.5,
            }}
          >
            Back to Businesses
          </Button>

          <Button
            component={Link}
            to="/admin/manage-businesses"
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            sx={{
              minHeight: 42,
              borderRadius: 2.5,
            }}
          >
            Manage Businesses
          </Button>
        </Box>

        {/* Profile card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
            mb: 2.5,
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, md: 4 },
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2.5}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
            >
              <Avatar
                src={logo || undefined}
                alt={businessName}
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 3,
                  bgcolor: "primary.main",
                  fontSize: 30,
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
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={800}>
              About
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                lineHeight: 1.8,
              }}
            >
              {description}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          {/* Contact */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" fontWeight={800}>
                  Business Information
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      p: 2,
                      borderRadius: 3,
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
                      p: 2,
                      borderRadius: 3,
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
                      p: 2,
                      borderRadius: 3,
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
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography variant="h6" fontWeight={800}>
                  Review Configuration
                </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
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
                      gap: 2,
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
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    variant="outlined"
                    startIcon={<GoogleIcon />}
                    sx={{
                      mt: 3,
                      minHeight: 44,
                      borderRadius: 2.5,
                    }}
                  >
                    Open Google Review Page
                  </Button>
                )}
                {business.businessId && (
                  <Box sx={{ mt: 3 }}>
                    <QRCodeDownload
                      url={`${window.location.origin}/rate/${encodeURIComponent(
                        business.businessId,
                      )}`}
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
