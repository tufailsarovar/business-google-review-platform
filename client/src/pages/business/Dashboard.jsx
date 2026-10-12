
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import GoogleIcon from "@mui/icons-material/Google";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

import { useBusiness } from "../../hooks/useBusiness";
import businessService from "../../services/businessService";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

export default function Dashboard() {
  const { business, loading: businessLoading } = useBusiness();

  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalRatings: 0,
    averageRating: 0,
    fiveStarRatings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await businessService.getBusinessAnalytics();

        if (!mounted) return;

        const payload = response?.data || response || {};
        const data = payload?.analytics || payload || {};

        setStats({
          totalVisitors: Number(data.totalVisitors) || 0,
          totalRatings: Number(data.totalRatings) || 0,
          averageRating: Number(data.averageRating) || 0,
          fiveStarRatings:
            Number(data.fiveStars ?? data.fiveStarRatings) || 0,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const businessName =
    business?.businessName || business?.name || "Your Business";

  const publicSlug =
    business?.businessId || business?.slug || business?._id;

  const googleConfigured = Boolean(
    business?.googleBusiness?.reviewUrl ||
      business?.googleReviewUrl ||
      business?.googlePlaceId ||
      business?.googleUrl
  );

  const statsCards = [
    {
      title: "Visitors",
      value: stats.totalVisitors,
      description: "Page visits",
      icon: <PeopleRoundedIcon />,
    },
    {
      title: "Ratings",
      value: stats.totalRatings,
      description: "Customer ratings",
      icon: <StarRoundedIcon />,
    },
    {
      title: "Average",
      value: stats.averageRating
        ? stats.averageRating.toFixed(1)
        : "0.0",
      description: "Average rating",
      icon: <StarRoundedIcon />,
    },
    {
      title: "5-Star",
      value: stats.fiveStarRatings,
      description: "5-star ratings",
      icon: <StarRoundedIcon />,
    },
  ];

  if (businessLoading) {
    return (
      <Box
        sx={{
          minHeight: "35vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: 1, overflow: "hidden" }}>
      <MotionBox
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <MotionBox
          variants={itemVariants}
          sx={{ mb: { xs: 1.5, sm: 2.5 } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ mb: 0.4 }}
              >
                <BusinessRoundedIcon
                  sx={{ fontSize: { xs: 15, sm: 19 }, color: "primary.main" }}
                />
                <Typography
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    fontSize: { xs: "0.6rem", sm: "0.75rem" },
                    letterSpacing: "0.06em",
                  }}
                >
                  BUSINESS DASHBOARD
                </Typography>
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "2rem", md: "2.3rem" },
                  fontWeight: 900,
                  lineHeight: 1.2,
                  letterSpacing: "-0.04em",
                  overflowWrap: "anywhere",
                }}
              >
                Welcome, {businessName}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.4,
                  fontSize: { xs: "0.68rem", sm: "0.88rem" },
                  lineHeight: 1.5,
                }}
              >
                Your reviews, ratings and business activity.
              </Typography>
            </Box>

            <Button
              component={Link}
              to="/business/profile"
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              size="small"
              sx={{
                flexShrink: 0,
                minHeight: { xs: 31, sm: 38 },
                px: { xs: 0.8, sm: 1.5 },
                borderRadius: 1,
                fontWeight: 800,
                fontSize: { xs: "0.65rem", sm: "0.78rem" },
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.4, sm: 0.8 },
                  "& svg": { fontSize: { xs: 14, sm: 18 } },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Edit Profile
              </Box>
              <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                Edit
              </Box>
            </Button>
          </Stack>
        </MotionBox>

        {/* Alerts */}
        {error && (
          <MotionBox variants={itemVariants}>
            <Alert
              severity="warning"
              sx={{
                mb: 1.3,
                py: 0,
                px: 1,
                borderRadius: 1,
                fontSize: { xs: "0.7rem", sm: "0.8rem" },
                "& .MuiAlert-icon": { fontSize: 18, mr: 1 },
              }}
            >
              {error}
            </Alert>
          </MotionBox>
        )}

        {!googleConfigured && (
          <MotionBox variants={itemVariants} sx={{ mb: 1.5 }}>
            <Alert
              severity="info"
              action={
                <Button
                  component={Link}
                  to="/business/google-settings"
                  color="inherit"
                  size="small"
                  sx={{
                    minWidth: 0,
                    fontWeight: 800,
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                >
                  Setup
                </Button>
              }
              sx={{
                borderRadius: 1,
                py: 0,
                px: 1,
                fontSize: { xs: "0.68rem", sm: "0.8rem" },
                "& .MuiAlert-icon": { fontSize: 18, mr: 1 },
              }}
            >
              Connect Google reviews to help customers find your business.
            </Alert>
          </MotionBox>
        )}

        {/* Statistics */}
        <Grid container spacing={{ xs: 0.8, sm: 1.5, md: 2 }}>
          {statsCards.map((stat, index) => (
            <Grid key={stat.title} size={{ xs: 6, sm: 6, md: 3 }}>
              <MotionCard
                variants={itemVariants}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: { xs: 1.2, sm: 1.8 },
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundImage: "none",
                  transition: "border-color .2s, box-shadow .2s",
                  "&:hover": {
                    borderColor: "primary.light",
                    boxShadow: "0 5px 15px rgba(15,23,42,0.06)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.05, sm: 1.8, md: 2.2 },
                    "&:last-child": {
                      pb: { xs: 1.05, sm: 1.8, md: 2.2 },
                    },
                  }}
                >
                  <MotionBox
                    whileHover={{ scale: 1.06 }}
                    sx={{
                      width: { xs: 27, sm: 36 },
                      height: { xs: 27, sm: 36 },
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1,
                      mb: { xs: 0.7, sm: 1.1 },
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "& svg": { fontSize: { xs: 15, sm: 20 } },
                    }}
                  >
                    {stat.icon}
                  </MotionBox>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.64rem", sm: "0.78rem" },
                      lineHeight: 1.3,
                    }}
                  >
                    {stat.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: { xs: "1.25rem", sm: "1.7rem", md: "1.95rem" },
                      fontWeight: 900,
                      lineHeight: 1.15,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {loading ? "—" : stat.value}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      display: { xs: "none", sm: "block" },
                      mt: 0.4,
                      fontSize: "0.7rem",
                    }}
                  >
                    {stat.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <MotionBox variants={itemVariants} sx={{ mt: { xs: 1.8, sm: 3 } }}>
          <Typography
            sx={{
              mb: { xs: 0.8, sm: 1.3 },
              fontSize: { xs: "0.9rem", sm: "1.25rem" },
              fontWeight: 900,
            }}
          >
            Quick Actions
          </Typography>

          <Grid container spacing={{ xs: 0.8, sm: 1.5, md: 2 }}>
            <Grid size={{ xs: 6, sm: 6, md: 6 }}>
              <ActionCard
                icon={<GoogleIcon />}
                title="Google Reviews"
                description="Configure your Google review destination."
                button="Configure"
                to="/business/google-settings"
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 6 }}>
              <ActionCard
                icon={<AnalyticsRoundedIcon />}
                title="Analytics"
                description="Explore customer ratings and performance."
                button="View Analytics"
                to="/business/analytics"
              />
            </Grid>
          </Grid>
        </MotionBox>

        {/* Public Rating Page */}
        <MotionCard
          variants={itemVariants}
          whileHover={{ y: -1 }}
          elevation={0}
          sx={{
            mt: { xs: 1.5, sm: 2.8 },
            borderRadius: { xs: 1.2, sm: 1.8 },
            border: "1px solid",
            borderColor: "divider",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.025))",
          }}
        >
          <CardContent sx={{ p: { xs: 1.2, sm: 2.2, md: 2.7 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={{ xs: 0.9, sm: 2 }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Chip
                  label="PUBLIC PAGE"
                  size="small"
                  color="primary"
                  sx={{
                    height: { xs: 19, sm: 24 },
                    borderRadius: 1,
                    fontSize: { xs: "0.57rem", sm: "0.68rem" },
                    fontWeight: 800,
                  }}
                />

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: { xs: "0.82rem", sm: "1.08rem" },
                    fontWeight: 900,
                  }}
                >
                  Your customer rating page
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    fontSize: { xs: "0.66rem", sm: "0.78rem" },
                  }}
                >
                  Share your page with customers.
                </Typography>
              </Box>

              <Button
                component={Link}
                to={
                  publicSlug
                    ? `/rate/${encodeURIComponent(publicSlug)}`
                    : "/business/public-page"
                }
                variant="contained"
                endIcon={<ArrowForwardRoundedIcon />}
                size="small"
                sx={{
                  minHeight: { xs: 33, sm: 39 },
                  px: { xs: 1, sm: 1.8 },
                  borderRadius: 1,
                  fontWeight: 800,
                  fontSize: { xs: "0.66rem", sm: "0.76rem" },
                  width: { xs: "100%", sm: "auto" },
                  whiteSpace: "nowrap",
                  boxShadow: "none",
                }}
              >
                Open Rating Page
              </Button>
            </Stack>
          </CardContent>
        </MotionCard>

        {loading && (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={18} thickness={4} />
          </Box>
        )}
      </MotionBox>
    </Box>
  );
}

function ActionCard({ icon, title, description, button, to }) {
  return (
    <MotionCard
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.985 }}
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: { xs: 1.2, sm: 1.8 },
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
        transition: "border-color .2s, box-shadow .2s",
        "&:hover": {
          borderColor: "primary.light",
          boxShadow: "0 5px 15px rgba(15,23,42,0.06)",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.05, sm: 1.8, md: 2.2 },
          "&:last-child": {
            pb: { xs: 1.05, sm: 1.8, md: 2.2 },
          },
        }}
      >
        <MotionBox
          whileHover={{ scale: 1.06 }}
          sx={{
            width: { xs: 27, sm: 36 },
            height: { xs: 27, sm: 36 },
            display: "grid",
            placeItems: "center",
            borderRadius: 1,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "& svg": { fontSize: { xs: 15, sm: 20 } },
          }}
        >
          {icon}
        </MotionBox>

        <Typography
          sx={{
            mt: { xs: 0.7, sm: 1.1 },
            fontSize: { xs: "0.74rem", sm: "0.98rem" },
            fontWeight: 900,
            lineHeight: 1.35,
          }}
        >
          {title}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.35,
            fontSize: { xs: "0.61rem", sm: "0.73rem" },
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </Typography>

        <Button
          component={Link}
          to={to}
          endIcon={<ArrowForwardRoundedIcon />}
          size="small"
          sx={{
            mt: { xs: 0.45, sm: 0.9 },
            px: 0,
            minWidth: 0,
            fontWeight: 800,
            fontSize: { xs: "0.61rem", sm: "0.75rem" },
            "& .MuiButton-endIcon": {
              ml: 0.3,
              "& svg": { fontSize: { xs: 13, sm: 17 } },
            },
          }}
        >
          {button}
        </Button>
      </CardContent>
    </MotionCard>
  );
}
