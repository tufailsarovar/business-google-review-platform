
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import businessService from "../../services/businessService";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const initialAnalytics = {
  totalVisitors: 0,
  totalRatings: 0,
  oneStar: 0,
  twoStars: 0,
  threeStars: 0,
  fourStars: 0,
  fiveStars: 0,
  averageRating: 0,
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const summaryConfig = [
  {
    title: "Visitors",
    description: "Total page visits",
    key: "totalVisitors",
    Icon: PeopleRoundedIcon,
    color: "#3B82F6",
  },
  {
    title: "Ratings",
    description: "Customer ratings",
    key: "totalRatings",
    Icon: AssessmentRoundedIcon,
    color: "#8B5CF6",
  },
  {
    title: "Average",
    description: "Average rating",
    key: "averageRating",
    Icon: StarRoundedIcon,
    color: "#F59E0B",
  },
  {
    title: "5-Star",
    description: "Excellent ratings",
    key: "fiveStars",
    Icon: TrendingUpRoundedIcon,
    color: "#10B981",
  },
];

const ratingRows = [5, 4, 3, 2, 1];

function getRatingCount(data, rating) {
  return Number(
    data[
      {
        1: "oneStar",
        2: "twoStars",
        3: "threeStars",
        4: "fourStars",
        5: "fiveStars",
      }[rating]
    ]
  ) || 0;
}

export default function Analytics() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await businessService.getBusinessAnalytics();

        if (!mounted) return;

        const payload = response?.data || response || {};
        const data = payload?.analytics || payload;

        setAnalytics({
          totalVisitors: Number(data.totalVisitors) || 0,
          totalRatings: Number(data.totalRatings) || 0,
          oneStar: Number(data.oneStar) || 0,
          twoStars: Number(data.twoStars) || 0,
          threeStars: Number(data.threeStars) || 0,
          fourStars: Number(data.fourStars) || 0,
          fiveStars: Number(data.fiveStars) || 0,
          averageRating: Number(data.averageRating) || 0,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message || "Unable to load analytics."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const ratingBreakdown = useMemo(
    () => ({
      1: analytics.oneStar,
      2: analytics.twoStars,
      3: analytics.threeStars,
      4: analytics.fourStars,
      5: analytics.fiveStars,
    }),
    [analytics]
  );

  const maxRatingCount = Math.max(
    ...Object.values(ratingBreakdown),
    1
  );

  const ratingParticipation =
    analytics.totalVisitors > 0
      ? Math.min(
          (analytics.totalRatings / analytics.totalVisitors) * 100,
          100
        )
      : 0;

  const getSummaryValue = (key) => {
    if (loading) return "—";

    if (key === "averageRating") {
      return analytics.averageRating.toFixed(1);
    }

    return analytics[key].toLocaleString();
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        maxWidth: 1200,
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
            transition: { staggerChildren: 0.07 },
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
            <Box
              sx={{
                width: { xs: 41, sm: 51 },
                height: { xs: 41, sm: 51 },
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: { xs: 2.2, sm: 3 },
                bgcolor: "action.hover",
                border: "1px solid",
                borderColor: "divider",
                color: "primary.main",
              }}
            >
              <AnalyticsRoundedIcon
                sx={{ fontSize: { xs: 23, sm: 29 } }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: "0.6rem", sm: "0.73rem" },
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  mb: 0.3,
                }}
              >
                BUSINESS INSIGHTS
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.4rem",
                    sm: "1.9rem",
                    md: "2.2rem",
                  },
                  fontWeight: 850,
                  lineHeight: 1.15,
                  letterSpacing: "-0.045em",
                }}
              >
                Analytics
              </Typography>
            </Box>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 560,
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              lineHeight: 1.65,
            }}
          >
            Understand your visitors, customer ratings, and overall
            review performance.
          </Typography>
        </MotionBox>

        {/* Error notification */}
        <AnimatePresence>
          {error && (
            <MotionBox
              key="analytics-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              sx={{ mb: 1.5 }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  py: 0.25,
                  px: { xs: 0.8, sm: 1.2 },
                  fontSize: { xs: "0.72rem", sm: "0.84rem" },
                  "& .MuiAlert-message": {
                    overflowWrap: "anywhere",
                  },
                }}
              >
                {error}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Summary cards */}
        <Grid
          container
          spacing={{ xs: 1, sm: 1.5, md: 2 }}
        >
          {summaryConfig.map(({ title, description, key, Icon, color }, index) => (
            <Grid
              key={key}
              size={{ xs: 6, sm: 6, md: 3 }}
            >
              <MotionCard
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.065,
                }}
                whileHover={{ y: -2 }}
                elevation={0}
                sx={{
                  height: "100%",
                  minWidth: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: { xs: 2.2, sm: 3 },
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                  "&:hover": {
                    borderColor: color,
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.25, sm: 2, md: 2.3 },
                    "&:last-child": {
                      pb: { xs: 1.25, sm: 2, md: 2.3 },
                    },
                  }}
                >
                  <Box
                    component={motion.div}
                    whileHover={{ rotate: 5, scale: 1.06 }}
                    sx={{
                      width: { xs: 32, sm: 40 },
                      height: { xs: 32, sm: 40 },
                      display: "grid",
                      placeItems: "center",
                      borderRadius: { xs: 1.5, sm: 2 },
                      bgcolor: `${color}18`,
                      color,
                      mb: { xs: 1, sm: 1.4 },
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 18, sm: 23 } }} />
                  </Box>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.66rem", sm: "0.79rem" },
                      fontWeight: 650,
                    }}
                  >
                    {title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      fontSize: {
                        xs: "1.3rem",
                        sm: "1.75rem",
                        md: "2rem",
                      },
                      lineHeight: 1.15,
                      fontWeight: 850,
                      letterSpacing: "-0.04em",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {getSummaryValue(key)}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.59rem", sm: "0.72rem" },
                      lineHeight: 1.45,
                    }}
                  >
                    {description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>

        {/* Main analytics panels */}
        <Grid
          container
          spacing={{ xs: 1.2, sm: 1.8, md: 2 }}
          sx={{ mt: { xs: 0.4, sm: 0.8 } }}
        >
          {/* Rating breakdown */}
          <Grid size={{ xs: 12, md: 7 }}>
            <MotionCard
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: { xs: 2.2, sm: 3 },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2.3, md: 2.7 } }}
              >
                <Typography
                  sx={{
                    fontWeight: 850,
                    fontSize: { xs: "0.9rem", sm: "1.05rem" },
                  }}
                >
                  Rating Breakdown
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    mb: { xs: 1.8, sm: 2.5 },
                    fontSize: { xs: "0.68rem", sm: "0.8rem" },
                    lineHeight: 1.6,
                  }}
                >
                  See how customers rate your business.
                </Typography>

                <Stack spacing={{ xs: 1.25, sm: 1.8 }}>
                  {ratingRows.map((rating, index) => {
                    const count = ratingBreakdown[rating];

                    const percentage =
                      analytics.totalRatings > 0
                        ? (count / analytics.totalRatings) * 100
                        : 0;

                    const barWidth =
                      (count / maxRatingCount) * 100;

                    return (
                      <Box key={rating}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={{ xs: 0.7, sm: 1.1 }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.2}
                            sx={{
                              width: { xs: 37, sm: 46 },
                              flexShrink: 0,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 750,
                                fontSize: { xs: "0.7rem", sm: "0.82rem" },
                              }}
                            >
                              {rating}
                            </Typography>

                            <StarRoundedIcon
                              sx={{
                                color: "warning.main",
                                fontSize: { xs: 14, sm: 18 },
                              }}
                            />
                          </Stack>

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              height: { xs: 7, sm: 9 },
                              borderRadius: 10,
                              bgcolor: "action.hover",
                              overflow: "hidden",
                            }}
                          >
                            <MotionBox
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{
                                duration: 0.65,
                                delay: 0.2 + index * 0.06,
                                ease: "easeOut",
                              }}
                              sx={{
                                height: "100%",
                                borderRadius: 10,
                                bgcolor: "primary.main",
                              }}
                            />
                          </Box>

                          <Typography
                            sx={{
                              width: { xs: 29, sm: 39 },
                              textAlign: "right",
                              fontWeight: 750,
                              fontSize: { xs: "0.66rem", sm: "0.78rem" },
                            }}
                          >
                            {loading ? "—" : count.toLocaleString()}
                          </Typography>

                          <Typography
                            color="text.secondary"
                            sx={{
                              width: { xs: 32, sm: 43 },
                              textAlign: "right",
                              fontSize: { xs: "0.59rem", sm: "0.7rem" },
                            }}
                          >
                            {loading ? "—" : `${percentage.toFixed(0)}%`}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Rating overview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <MotionCard
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: { xs: 2.2, sm: 3 },
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent
                sx={{ p: { xs: 1.5, sm: 2.3, md: 2.7 } }}
              >
                <Typography
                  sx={{
                    fontWeight: 850,
                    fontSize: { xs: "0.9rem", sm: "1.05rem" },
                  }}
                >
                  Rating Overview
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                    fontSize: { xs: "0.68rem", sm: "0.8rem" },
                    lineHeight: 1.6,
                  }}
                >
                  Your overall customer rating.
                </Typography>

                <Box sx={{ textAlign: "center", py: { xs: 2.5, sm: 3.5 } }}>
                  <Typography
                    sx={{
                      fontWeight: 850,
                      fontSize: { xs: "2.5rem", sm: "3.2rem" },
                      lineHeight: 1,
                      letterSpacing: "-0.055em",
                    }}
                  >
                    {loading ? "—" : analytics.averageRating.toFixed(1)}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={0.15}
                    sx={{ mt: 0.9 }}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarRoundedIcon
                        key={star}
                        sx={{
                          fontSize: { xs: 21, sm: 27 },
                          color:
                            analytics.averageRating >= star
                              ? "warning.main"
                              : "action.disabled",
                        }}
                      />
                    ))}
                  </Stack>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.6,
                      fontSize: { xs: "0.64rem", sm: "0.75rem" },
                    }}
                  >
                    Based on{" "}
                    {loading
                      ? "—"
                      : analytics.totalRatings.toLocaleString()}{" "}
                    customer ratings
                  </Typography>
                </Box>

                {/* Visitor-to-rating summary */}
                <Box
                  sx={{
                    p: { xs: 1.2, sm: 1.6 },
                    borderRadius: { xs: 1.8, sm: 2.2 },
                    bgcolor: "action.hover",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      sx={{
                        fontWeight: 750,
                        fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      }}
                    >
                      Page Visitors
                    </Typography>

                    <Typography
                      sx={{
                        color: "primary.main",
                        fontWeight: 850,
                        fontSize: { xs: "0.77rem", sm: "0.9rem" },
                      }}
                    >
                      {loading
                        ? "—"
                        : analytics.totalVisitors.toLocaleString()}
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={loading ? 0 : ratingParticipation}
                    sx={{
                      mt: 1,
                      height: { xs: 5, sm: 7 },
                      borderRadius: 10,
                      bgcolor: "action.disabledBackground",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 10,
                        transition: "transform 0.7s ease",
                      },
                    }}
                  />

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.6,
                      fontSize: { xs: "0.59rem", sm: "0.68rem" },
                      lineHeight: 1.5,
                    }}
                  >
                    {loading
                      ? "Loading visitor data..."
                      : `${ratingParticipation.toFixed(1)}% of visitors submitted a rating`}
                  </Typography>
                </Box>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Loading indicator */}
        {loading && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress size={20} thickness={4} />
          </MotionBox>
        )}

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
              fontSize: { xs: "0.63rem", sm: "0.74rem" },
              lineHeight: 1.6,
            }}
          >
            TapReview Analytics · Your business performance at a glance
          </Typography>
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
