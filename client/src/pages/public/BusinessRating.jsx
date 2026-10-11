import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import StarSelector from "../../components/reviews/StarSelector";
import ReviewGenerator from "../../components/reviews/ReviewGenerator";
import GoogleReviewButton from "../../components/reviews/GoogleReviewButton";
import businessService from "../../services/businessService";
import { recordRating, recordVisitor } from "../../services/reviewService";

const MotionBox = motion(Box);

const normalizeWebsite = (url) => {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const ratingMessages = {
  1: "We're sorry. Your feedback matters to us.",
  2: "Thanks for sharing. We can do better.",
  3: "Thanks for your honest feedback.",
  4: "Great! We're glad you had a good experience.",
  5: "Excellent! Thank you for your support.",
};

export default function BusinessRating() {
  const { businessId, slug, id } = useParams();
  const identifier = businessId || slug || id || "";

  const [business, setBusiness] = useState(null);
  const [googleBusiness, setGoogleBusiness] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadBusiness = async () => {
      if (!identifier) {
        setError("Business page not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await businessService.getPublicBusiness(identifier);

        if (!mounted) return;

        const data =
          response?.data?.business ||
          response?.data?.data?.business ||
          response?.data?.data ||
          response?.data ||
          response?.business ||
          response;

        if (!data || typeof data !== "object" || !data.businessId) {
          throw new Error("Business information was not returned.");
        }

        if (data.publicPageEnabled === false) {
          setBusiness(null);
          setError("This business's public rating page is currently disabled.");
          return;
        }

        setBusiness(data);
        setGoogleBusiness(
          response?.data?.googleBusiness || response?.googleBusiness || null,
        );

        try {
          await recordVisitor(identifier);
        } catch (visitorError) {
          console.error("Unable to record visitor:", visitorError);
        }
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this business page.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, [identifier, retryKey]);

  const handleRatingChange = async (value) => {
    const selectedRating = Number(value) || 0;

    setRating(selectedRating);
    setReview("");

    if (!selectedRating || !identifier) return;

    try {
      await recordRating({
        businessId: identifier,
        rating: selectedRating,
      });
    } catch (err) {
      console.error("Unable to record rating:", err);
    }
  };

  const businessName = business?.businessName || business?.name || "Business";
  const logoUrl = business?.logo || business?.logoUrl || "";
  const category = business?.category || business?.businessCategory || "";
  const phone = business?.phone || business?.mobile || "";

  const address = [
    business?.address,
    business?.city,
    business?.state,
    business?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const website = business?.website || "";

  const googleUrl =
    googleBusiness?.reviewUrl ||
    business?.googleReviewUrl ||
    business?.googleUrl ||
    business?.reviewUrl ||
    "";

  const locationUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";

  if (error || (!business && !loading)) {
    return (
      <Box
        sx={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          p: 2,
          bgcolor: "#f4f7fd",
        }}
      >
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 3,
            textAlign: "center",
            bgcolor: "#fff",
            border: "1px solid #e2e8f4",
            borderRadius: 3,
          }}
        >
          <BusinessRoundedIcon sx={{ fontSize: 40, color: "#3158c9" }} />

          <Typography variant="h5" fontWeight={800}>
            Business page unavailable
          </Typography>

          <Typography color="text.secondary">
            {error || "Unable to load this business page."}
          </Typography>

          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => setRetryKey((previous) => previous + 1)}
            sx={{ textTransform: "none", borderRadius: 2, boxShadow: "none" }}
          >
            Try again
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        px: { xs: 1, sm: 2 },
        py: { xs: 1.5, sm: 3 },
        overflowX: "hidden",
        bgcolor: "#f3f6fc",
        backgroundImage:
          "radial-gradient(ellipse at top, #e8eeff 0%, #f3f6fc 60%, #f8fafc 100%)",
      }}
    >
      <Container maxWidth="sm" disableGutters>
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              overflow: "hidden",
              bgcolor: "#fff",
              border: "1px solid #dfe6f3",
              borderRadius: { xs: 2.5, sm: 3 },
              boxShadow: "0 12px 36px rgba(28,48,91,.06)",
            }}
          >
            {/* Centered business profile with blue tick on the logo */}
            <Box
              sx={{
                px: { xs: 2, sm: 2.75 },
                pt: { xs: 2.5, sm: 3 },
                pb: 2,
                textAlign: "center",
                background: "linear-gradient(120deg, #edf2ff 0%, #ffffff 90%)",
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={logoUrl || undefined}
                    alt={`${businessName} logo`}
                    sx={{
                      width: { xs: 82, sm: 94 },
                      height: { xs: 82, sm: 94 },
                      bgcolor: "#fff",
                      color: "#3158c9",
                      border: "2px solid #fff",
                      boxShadow: "0 5px 18px rgba(30,51,100,.09)",
                      fontSize: 28,
                      fontWeight: 850,
                      "& img": { objectFit: "contain" },
                    }}
                  >
                    {businessName.charAt(0).toUpperCase()}
                  </Avatar>

                  <Tooltip title="Verified business profile">
                    <Box
                      aria-label="Verified business profile"
                      sx={{
                        position: "absolute",
                        right: -2,
                        bottom: 1,
                        width: 27,
                        height: 27,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "#fff",
                        borderRadius: "50%",
                        boxShadow: "0 2px 7px rgba(25,45,90,.14)",
                      }}
                    >
                      <VerifiedRoundedIcon
                        sx={{ color: "#2875f0", fontSize: 23 }}
                      />
                    </Box>
                  </Tooltip>
                </Box>

                <Box sx={{ width: "100%", minWidth: 0 }}>
                  <Typography
                    sx={{
                      color: "#4965cb",
                      fontSize: ".68rem",
                      letterSpacing: ".08em",
                      fontWeight: 850,
                      textTransform: "uppercase",
                      mb: 0.35,
                    }}
                  >
                    Business profile
                  </Typography>

                  <Typography
                    component="h1"
                    sx={{
                      color: "#17223d",
                      fontSize: { xs: "1.4rem", sm: "1.7rem" },
                      fontWeight: 900,
                      lineHeight: 1.2,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {businessName}
                  </Typography>

                  {category && (
                    <Typography
                      sx={{
                        color: "#65728b",
                        mt: 0.45,
                        fontSize: ".9rem",
                      }}
                    >
                      {category}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {website && (
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  sx={{ mt: 1 }}
                >
                  <Tooltip title="Visit business website">
                    <IconButton
                      component="a"
                      href={normalizeWebsite(website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Visit business website"
                      size="small"
                      sx={{
                        color: "#3158c9",
                        bgcolor: "#fff",
                        border: "1px solid #e2e8f4",
                        borderRadius: 2,
                      }}
                    >
                      <LanguageRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </Box>

            <Divider sx={{ borderColor: "#e9edf5" }} />

            {/* Centered rating section */}
            <Box
              sx={{
                px: { xs: 2, sm: 2.75 },
                py: { xs: 2.5, sm: 3 },
                textAlign: "center",
              }}
            >
              <Typography
                component="h2"
                sx={{
                  fontWeight: 900,
                  color: "#1c2944",
                  fontSize: { xs: "1.2rem", sm: "1.45rem" },
                  mb: 0.5,
                  textAlign: "center",
                }}
              >
                How was your experience?
              </Typography>

              <Typography
                sx={{
                  color: "#7c879c",
                  fontSize: ".9rem",
                  mb: 1.5,
                  textAlign: "center",
                }}
              >
                Choose a star rating to continue.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  "& > *": {
                    alignItems: "center",
                  },
                }}
              >
                <StarSelector value={rating} onChange={handleRatingChange} />
              </Box>

              <AnimatePresence mode="wait">
                {rating > 0 && (
                  <MotionBox
                    key={rating}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.18 }}
                    sx={{ textAlign: "center" }}
                  >
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: ".9rem",
                        fontWeight: 750,
                        color: "#8b6a20",
                        textAlign: "center",
                      }}
                    >
                      {ratingMessages[rating]}
                    </Typography>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>

            {/* One editable review box for manual writing and AI */}
            <AnimatePresence initial={false}>
              {rating > 0 && (
                <MotionBox
                  key="review-editor"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  sx={{ overflow: "hidden" }}
                >
                  <Box sx={{ px: { xs: 1.25, sm: 2 }, pb: 2 }}>
                    <Box
                      sx={{
                        overflow: "hidden",
                        border: "1px solid #dce4f3",
                        borderRadius: 2,
                        bgcolor: "#fff",
                        transition: "border-color .2s, box-shadow .2s",
                        "&:focus-within": {
                          borderColor: "#91a8f0",
                          boxShadow: "0 0 0 3px rgba(49,88,203,.06)",
                        },
                      }}
                    >
                      <Box sx={{ px: { xs: 1.5, sm: 2 }, pt: 1.5, pb: 1 }}>
                        <textarea
                          value={review}
                          onChange={(event) =>
                            setReview(event.target.value.slice(0, 2000))
                          }
                          maxLength={2000}
                          aria-label="Write your review"
                          placeholder="Tell others about your experience with this business..."
                          style={{
                            display: "block",
                            width: "100%",
                            minHeight: "135px",
                            maxHeight: "350px",
                            resize: "vertical",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            color: "#26334d",
                            fontFamily: "inherit",
                            fontSize: "15px",
                            lineHeight: 1.8,
                            boxSizing: "border-box",
                          }}
                        />
                      </Box>

                      <Divider sx={{ borderColor: "#edf0f6" }} />

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        alignItems={{ xs: "stretch", sm: "center" }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{
                          px: 1.5,
                          py: 1.25,
                          bgcolor: "#fbfcff",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "#8993a7",
                            fontSize: ".73rem",
                            textAlign: { xs: "right", sm: "left" },
                          }}
                        >
                          {review.length}/2000 characters
                        </Typography>

                        <ReviewGenerator
                          business={business}
                          businessId={identifier}
                          rating={rating}
                          aiSuggestionsEnabled={
                            business?.aiSuggestionsEnabled !== false
                          }
                          onReviewChange={(value) =>
                            setReview(String(value || "").slice(0, 2000))
                          }
                        />
                      </Stack>
                    </Box>

                    <Typography
                      sx={{
                        mt: 1,
                        color: "#7b8599",
                        fontSize: ".75rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Write your review manually or generate a suggestion with
                      AI. You can edit the text before continuing.
                    </Typography>

                    <Box sx={{ mt: 1.75 }}>
                      <GoogleReviewButton
                        googleUrl={googleUrl}
                        review={review}
                      />
                    </Box>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Contact details */}
            {(address || phone) && (
              <>
                <Divider sx={{ borderColor: "#e9edf5" }} />

                <Stack
                  spacing={1.25}
                  sx={{
                    px: { xs: 2, sm: 2.75 },
                    py: 1.75,
                    bgcolor: "#fbfcff",
                  }}
                >
                  {address && (
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <LocationOnRoundedIcon
                        sx={{ color: "#5367b7", flexShrink: 0 }}
                      />

                      <Box flex={1} minWidth={0}>
                        <Typography
                          sx={{
                            color: "#7b8599",
                            fontSize: ".67rem",
                            fontWeight: 850,
                            textTransform: "uppercase",
                          }}
                        >
                          Business address
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.2,
                            fontSize: ".83rem",
                            color: "#34415b",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {address}
                        </Typography>
                      </Box>

                      <Tooltip title="Open in Google Maps">
                        <IconButton
                          component="a"
                          href={locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open address in Google Maps"
                          size="small"
                          sx={{
                            color: "#3158c9",
                            bgcolor: "#edf1ff",
                            flexShrink: 0,
                          }}
                        >
                          <ArrowOutwardRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}

                  {phone && (
                    <Stack direction="row" spacing={1.1} alignItems="center">
                      <PhoneRoundedIcon
                        sx={{ color: "#5367b7", flexShrink: 0 }}
                      />

                      <Box flex={1} minWidth={0}>
                        <Typography
                          sx={{
                            color: "#7b8599",
                            fontSize: ".67rem",
                            fontWeight: 850,
                            textTransform: "uppercase",
                          }}
                        >
                          Contact
                        </Typography>

                        <Link
                          href={`tel:${phone}`}
                          underline="hover"
                          sx={{
                            mt: 0.2,
                            display: "inline-block",
                            fontSize: ".83rem",
                            fontWeight: 650,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {phone}
                        </Link>
                      </Box>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </Box>

          <Stack alignItems="center" spacing={0.5} sx={{ py: 1.75 }}>
            <Typography sx={{ color: "#8491a7", fontSize: ".74rem" }}>
              Your feedback makes a difference
            </Typography>

            <Typography sx={{ fontSize: ".72rem", color: "#9aa4b7" }}>
              Powered by{" "}
              <Link
                href="https://glyrus.com"
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{ color: "#5068c8", fontWeight: 800 }}
              >
                Glyrus.com
              </Link>
            </Typography>
          </Stack>
        </MotionBox>
      </Container>
    </Box>
  );
}
