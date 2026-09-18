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
} from "@mui/material";
import { motion } from "framer-motion";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";

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

export default function Analytics() {
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
        const data = payload?.analytics || payload || {};

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
          err?.response?.data?.message ||
            "Unable to load analytics."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
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

  const summaryCards = [
    {
      title: "Visitors",
      value: analytics.totalVisitors,
      description: "Page visits",
      icon: <PeopleRoundedIcon />,
    },
    {
      title: "Ratings",
      value: analytics.totalRatings,
      description: "Customer ratings",
      icon: <AssessmentRoundedIcon />,
    },
    {
      title: "Average",
      value: analytics.averageRating
        ? analytics.averageRating.toFixed(1)
        : "0.0",
      description: "Average rating",
      icon: <StarRoundedIcon />,
    },
    {
      title: "5-Star",
      value: analytics.fiveStars,
      description: "5-star ratings",
      icon: <TrendingUpRoundedIcon />,
    },
  ];

  const ratingRows = [5, 4, 3, 2, 1];

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{
          mb: {
            xs: 1.5,
            sm: 2.5,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={0.7}
          alignItems="center"
          sx={{ mb: 0.45 }}
        >
          <AnalyticsRoundedIcon
            sx={{
              fontSize: {
                xs: 17,
                sm: 20,
              },
            }}
            color="primary"
          />

          <Typography
            color="primary"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "0.65rem",
                sm: "0.78rem",
              },
              letterSpacing: 0.5,
            }}
          >
            BUSINESS ANALYTICS
          </Typography>
        </Stack>

        <Typography
          component="h1"
          fontWeight={800}
          sx={{
            fontSize: {
              xs: "1.45rem",
              sm: "2rem",
              md: "2.25rem",
            },
            lineHeight: 1.15,
          }}
        >
          Analytics
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.45,
            fontSize: {
              xs: "0.72rem",
              sm: "0.88rem",
            },
            lineHeight: 1.5,
          }}
        >
          Understand how customers interact with your review
          experience.
        </Typography>
      </MotionBox>

      {/* Error */}
      {error && (
        <MotionBox
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{ mb: 1.5 }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 1.8,
              py: 0.25,
              px: 1,
              fontSize: {
                xs: "0.7rem",
                sm: "0.8rem",
              },
            }}
          >
            {error}
          </Alert>
        </MotionBox>
      )}

      {/* Summary Cards */}
      <Grid container spacing={{ xs: 0.8, sm: 1.5, md: 2 }}>
        {summaryCards.map((card, index) => (
          <Grid
            key={card.title}
            size={{
              xs: 6,
              sm: 6,
              md: 3,
            }}
          >
            <MotionCard
              initial={{
                opacity: 0,
                y: 18,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.35,
                delay: index * 0.06,
              }}
              whileHover={{
                y: -3,
              }}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: {
                  xs: 1.8,
                  sm: 2.5,
                },
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                transition: "box-shadow .25s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                },
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.1,
                    sm: 1.8,
                    md: 2.2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.1,
                      sm: 1.8,
                      md: 2.2,
                    },
                  },
                }}
              >
                <Box
                  component={motion.div}
                  whileHover={{
                    rotate: 5,
                    scale: 1.05,
                  }}
                  sx={{
                    width: {
                      xs: 30,
                      sm: 38,
                    },
                    height: {
                      xs: 30,
                      sm: 38,
                    },
                    display: "grid",
                    placeItems: "center",
                    borderRadius: {
                      xs: 1.2,
                      sm: 1.8,
                    },
                    mb: {
                      xs: 0.8,
                      sm: 1.2,
                    },
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                    "& svg": {
                      fontSize: {
                        xs: 17,
                        sm: 21,
                      },
                    },
                  }}
                >
                  {card.icon}
                </Box>

                <Typography
                  color="text.secondary"
                  fontWeight={650}
                  sx={{
                    fontSize: {
                      xs: "0.63rem",
                      sm: "0.75rem",
                    },
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  fontWeight={800}
                  sx={{
                    mt: 0.15,
                    fontSize: {
                      xs: "1.25rem",
                      sm: "1.65rem",
                      md: "1.9rem",
                    },
                    lineHeight: 1.15,
                  }}
                >
                  {loading ? "—" : card.value}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.3,
                    fontSize: {
                      xs: "0.58rem",
                      sm: "0.7rem",
                    },
                    lineHeight: 1.35,
                  }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Main Analytics */}
      <Grid
        container
        spacing={{ xs: 0.8, sm: 1.5, md: 2 }}
        sx={{ mt: { xs: 0.1, sm: 0.5 } }}
      >
        {/* Rating Breakdown */}
        <Grid size={{ xs: 12, md: 7 }}>
          <MotionCard
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.2,
            }}
            elevation={0}
            sx={{
              mt: {
                xs: 0.8,
                sm: 1.5,
              },
              borderRadius: {
                xs: 1.8,
                sm: 2.5,
              },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 1.3,
                  sm: 2,
                  md: 2.5,
                },
              }}
            >
              <Typography
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "0.9rem",
                    sm: "1.05rem",
                  },
                }}
              >
                Rating Breakdown
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  mb: {
                    xs: 1.3,
                    sm: 2,
                  },
                  fontSize: {
                    xs: "0.65rem",
                    sm: "0.76rem",
                  },
                }}
              >
                Distribution of customer ratings.
              </Typography>

              <Stack
                spacing={{
                  xs: 1,
                  sm: 1.4,
                }}
              >
                {ratingRows.map((rating) => {
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
                        spacing={{
                          xs: 0.6,
                          sm: 1,
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.2}
                          sx={{
                            width: {
                              xs: 34,
                              sm: 44,
                            },
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            fontWeight={750}
                            sx={{
                              fontSize: {
                                xs: "0.67rem",
                                sm: "0.78rem",
                              },
                            }}
                          >
                            {rating}
                          </Typography>

                          <StarRoundedIcon
                            sx={{
                              fontSize: {
                                xs: 13,
                                sm: 17,
                              },
                              color: "warning.main",
                            }}
                          />
                        </Stack>

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            height: {
                              xs: 6,
                              sm: 8,
                            },
                            borderRadius: 10,
                            backgroundColor: "action.hover",
                            overflow: "hidden",
                          }}
                        >
                          <MotionBox
                            initial={{ width: 0 }}
                            animate={{
                              width: `${barWidth}%`,
                            }}
                            transition={{
                              duration: 0.7,
                              delay: 0.2,
                              ease: "easeOut",
                            }}
                            sx={{
                              height: "100%",
                              borderRadius: 10,
                              backgroundColor:
                                "primary.main",
                            }}
                          />
                        </Box>

                        <Typography
                          fontWeight={700}
                          sx={{
                            width: {
                              xs: 25,
                              sm: 35,
                            },
                            textAlign: "right",
                            fontSize: {
                              xs: "0.64rem",
                              sm: "0.75rem",
                            },
                          }}
                        >
                          {loading ? "—" : count}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            width: {
                              xs: 31,
                              sm: 38,
                            },
                            textAlign: "right",
                            fontSize: {
                              xs: "0.58rem",
                              sm: "0.68rem",
                            },
                          }}
                        >
                          {loading
                            ? "—"
                            : `${percentage.toFixed(0)}%`}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Rating Overview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <MotionCard
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: 0.28,
            }}
            elevation={0}
            sx={{
              mt: {
                xs: 0.8,
                sm: 1.5,
              },
              height: {
                xs: "auto",
                md: "calc(100% - 12px)",
              },
              borderRadius: {
                xs: 1.8,
                sm: 2.5,
              },
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 1.3,
                  sm: 2,
                  md: 2.5,
                },
              }}
            >
              <Typography
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "0.9rem",
                    sm: "1.05rem",
                  },
                }}
              >
                Rating Overview
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  fontSize: {
                    xs: "0.65rem",
                    sm: "0.76rem",
                  },
                  lineHeight: 1.5,
                }}
              >
                Your average rating from customers using
                TapReview.
              </Typography>

              <Box
                sx={{
                  mt: {
                    xs: 2,
                    sm: 3,
                  },
                  textAlign: "center",
                }}
              >
                <Typography
                  fontWeight={800}
                  sx={{
                    fontSize: {
                      xs: "2.3rem",
                      sm: "3rem",
                    },
                    lineHeight: 1,
                  }}
                >
                  {loading
                    ? "—"
                    : analytics.averageRating
                      ? analytics.averageRating.toFixed(1)
                      : "0.0"}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={0.05}
                  sx={{
                    mt: {
                      xs: 0.7,
                      sm: 1,
                    },
                  }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarRoundedIcon
                      key={star}
                      sx={{
                        fontSize: {
                          xs: 19,
                          sm: 24,
                        },
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
                    mt: 0.5,
                    fontSize: {
                      xs: "0.62rem",
                      sm: "0.72rem",
                    },
                  }}
                >
                  Based on{" "}
                  {loading ? "—" : analytics.totalRatings}{" "}
                  customer ratings
                </Typography>
              </Box>

              {/* Visitors */}
              <Box
                sx={{
                  mt: {
                    xs: 1.8,
                    sm: 2.5,
                  },
                  p: {
                    xs: 1,
                    sm: 1.4,
                  },
                  borderRadius: {
                    xs: 1.3,
                    sm: 1.8,
                  },
                  backgroundColor: "action.hover",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    fontWeight={700}
                    sx={{
                      fontSize: {
                        xs: "0.68rem",
                        sm: "0.76rem",
                      },
                    }}
                  >
                    Page Visitors
                  </Typography>

                  <Typography
                    fontWeight={800}
                    color="primary.main"
                    sx={{
                      fontSize: {
                        xs: "0.75rem",
                        sm: "0.85rem",
                      },
                    }}
                  >
                    {loading
                      ? "—"
                      : analytics.totalVisitors}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={
                    analytics.totalVisitors > 0
                      ? Math.min(
                          (analytics.totalRatings /
                            analytics.totalVisitors) *
                            100,
                          100
                        )
                      : 0
                  }
                  sx={{
                    mt: 0.8,
                    height: {
                      xs: 4,
                      sm: 6,
                    },
                    borderRadius: 10,
                  }}
                />

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.45,
                    fontSize: {
                      xs: "0.57rem",
                      sm: "0.65rem",
                    },
                  }}
                >
                  Visitors who submitted a rating
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            mt: 1.5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={20}
            thickness={4}
          />
        </MotionBox>
      )}
    </Box>
  );
}