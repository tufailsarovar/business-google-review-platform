import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { motion } from "framer-motion";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import StarSelector from "../../components/reviews/StarSelector";
import ReviewGenerator from "../../components/reviews/ReviewGenerator";
import GoogleReviewButton from "../../components/reviews/GoogleReviewButton";

import businessService from "../../services/businessService";

import { recordRating, recordVisitor } from "../../services/reviewService";

const MotionCard = motion(Card);

export default function BusinessRating() {
  const { businessId, slug, id } = useParams();

  const identifier = businessId || slug || id || "";

  const [business, setBusiness] = useState(null);

  const [rating, setRating] = useState(0);

  const [review, setReview] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      if (!identifier) {
        if (mounted) {
          setLoading(false);
          setError("Business page not found.");
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await businessService.getPublicBusiness(identifier);

        if (!mounted) {
          return;
        }

        const data =
          response?.data?.business ||
          response?.data ||
          response?.business ||
          response;

        if (!data || typeof data !== "object") {
          throw new Error("Business information was not returned.");
        }

        setBusiness(data);

        try {
          await recordVisitor(identifier);
        } catch (visitorError) {
          console.error("Unable to record visitor:", visitorError);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this business page.",
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
  }, [identifier]);

  const handleRatingChange = async (value) => {
    const selectedRating = Number(value) || 0;

    setRating(selectedRating);
    setReview("");

    if (!selectedRating || !identifier) {
      return;
    }

    try {
      await recordRating({
        businessId: identifier,
        rating: selectedRating,
      });
    } catch (err) {
      console.error("Unable to record rating:", err);
    }
  };

  const handleReviewChange = (value) => {
    setReview(value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">Loading business...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error || !business) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={0}
            sx={{
              borderRadius: 5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 3,
                  sm: 5,
                },
                textAlign: "center",
              }}
            >
              <BusinessRoundedIcon
                sx={{
                  fontSize: 48,
                  color: "text.disabled",
                  mb: 2,
                }}
              />

              <Typography variant="h5" fontWeight={800}>
                Business Not Found
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 1,
                  lineHeight: 1.7,
                }}
              >
                {error ||
                  "This rating page is unavailable or no longer exists."}
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  const businessName = business.businessName || business.name || "Business";

  const description =
    business.description ||
    business.publicPageDescription ||
    "We value your feedback and appreciate you taking the time to share your experience.";

  const logo = business.logoUrl || business.logo || "";

  const category = business.category || business.businessCategory || "";

  const googleUrl = business.googleReviewUrl || business.googleUrl || "";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: {
          xs: 2,
          sm: 5,
        },
        px: {
          xs: 1,
          sm: 2,
        },
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.03))",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          px: {
            xs: 0,
            sm: 1,
          },
        }}
      >
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
          }}
          elevation={0}
          sx={{
            borderRadius: {
              xs: 3.5,
              sm: 5,
            },
            border: "1px solid",
            borderColor: "rgba(37,99,235,0.10)",
            overflow: "hidden",
            backgroundColor: "#ffffff",
          }}
        >
          {/* BUSINESS HEADER */}
          <Box
            sx={{
              px: {
                xs: 2,
                sm: 4,
              },
              py: {
                xs: 2.5,
                sm: 4,
              },
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.035))",
            }}
          >
            <Avatar
              src={logo || undefined}
              alt={businessName}
              sx={{
                width: {
                  xs: 62,
                  sm: 78,
                },
                height: {
                  xs: 62,
                  sm: 78,
                },
                mx: "auto",
                mb: {
                  xs: 1.5,
                  sm: 2,
                },
                borderRadius: 3,
                bgcolor: "primary.main",
                fontSize: {
                  xs: 24,
                  sm: 28,
                },
                fontWeight: 800,
              }}
            >
              {businessName.charAt(0).toUpperCase()}
            </Avatar>

            <Typography
              component="h1"
              variant="h5"
              fontWeight={800}
              sx={{
                fontSize: {
                  xs: "1.35rem",
                  sm: "1.8rem",
                },
              }}
            >
              {businessName}
            </Typography>

            {category && (
              <Typography
                variant="body2"
                color="primary"
                fontWeight={700}
                sx={{
                  mt: 0.4,
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                  },
                }}
              >
                {category}
              </Typography>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 1,
                lineHeight: 1.6,
                fontSize: {
                  xs: "0.78rem",
                  sm: "0.875rem",
                },
              }}
            >
              {description}
            </Typography>
          </Box>

          <CardContent
            sx={{
              p: {
                xs: 1.75,
                sm: 3.5,
              },
            }}
          >
            {/* RATING */}
            <Box
              sx={{
                textAlign: "center",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "1.05rem",
                    sm: "1.25rem",
                  },
                }}
              >
                How was your experience?
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "0.76rem",
                    sm: "0.875rem",
                  },
                }}
              >
                Select a rating to continue.
              </Typography>

              <Box
                sx={{
                  mt: {
                    xs: 1.5,
                    sm: 2.5,
                  },
                }}
              >
                <StarSelector value={rating} onChange={handleRatingChange} />
              </Box>

              {rating > 0 && (
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={0.4}
                  alignItems="center"
                  sx={{
                    mt: 1,
                  }}
                >
                  <StarRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: "warning.main",
                    }}
                  />

                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.875rem",
                      },
                    }}
                  >
                    {rating} out of 5
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* REVIEW SECTION */}
            {rating > 0 && (
              <>
                <Divider
                  sx={{
                    my: {
                      xs: 2,
                      sm: 3,
                    },
                  }}
                />

                <Stack
                  spacing={{
                    xs: 1.5,
                    sm: 2,
                  }}
                >
                  <Stack direction="row" spacing={0.8} alignItems="center">
                    <AutoAwesomeRoundedIcon
                      color="primary"
                      sx={{
                        fontSize: {
                          xs: 20,
                          sm: 24,
                        },
                      }}
                    />

                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          sm: "1.25rem",
                        },
                      }}
                    >
                      Prepare your review
                    </Typography>
                  </Stack>

                  <ReviewGenerator
                    business={business}
                    businessId={identifier}
                    rating={rating}
                    onReviewChange={handleReviewChange}
                  />

                  {/* GOOGLE SUBMIT */}
                  <MotionCard
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    elevation={0}
                    sx={{
                      p: {
                        xs: 1.5,
                        sm: 2,
                      },
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "rgba(37,99,235,0.12)",
                      background:
                        "linear-gradient(145deg,#ffffff 0%,#f8faff 100%)",
                    }}
                  >
                    <GoogleReviewButton
                      googleUrl={googleUrl}
                      review={review}
                      rating={rating}
                    />
                  </MotionCard>
                </Stack>
              </>
            )}
          </CardContent>
          <Box
            sx={{
              mt: 3,
              pb: 1,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.02em",
              }}
            >
              Powered by{" "}
              <Box
                component="a"
                href="https://TapReview.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                TapReview
              </Box>
            </Typography>
          </Box>
        </MotionCard>
      </Container>
    </Box>
  );
}
