import { useCallback, useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  Skeleton,
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

import InstagramIcon from "@mui/icons-material/Instagram";

import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";

import YouTubeIcon from "@mui/icons-material/YouTube";

import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import LinkedInIcon from "@mui/icons-material/LinkedIn";

import XIcon from "@mui/icons-material/X";

const MotionBox = motion(Box);

const MotionPaper = motion(Paper);

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

const colors = {
  primary: "#3158c9",

  primaryDark: "#2346ad",

  text: "#17223d",

  muted: "#718096",

  border: "#e2e8f0",

  background: "#f5f7fc",
};

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",

    label: "Instagram",

    Icon: InstagramIcon,

    color: "#E4405F",
  },

  {
    key: "facebook",

    label: "Facebook",

    Icon: FacebookRoundedIcon,

    color: "#1877F2",
  },

  {
    key: "youtube",

    label: "YouTube",

    Icon: YouTubeIcon,

    color: "#FF0000",
  },

  {
    key: "whatsapp",

    label: "WhatsApp",

    Icon: WhatsAppIcon,

    color: "#25D366",
  },

  {
    key: "linkedin",

    label: "LinkedIn",

    Icon: LinkedInIcon,

    color: "#0A66C2",
  },

  {
    key: "x",

    label: "X",

    Icon: XIcon,

    color: "#000000",
  },
];

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

  const loadBusiness = useCallback(
    async (mountedRef) => {
      if (!identifier) {
        setError("Business page not found.");

        setLoading(false);

        return;
      }

      setError("");

      try {
        const response = await businessService.getPublicBusiness(identifier);

        if (!mountedRef.current) return;

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

        recordVisitor(identifier).catch((visitorError) => {
          console.error("Unable to record visitor:", visitorError);
        });
      } catch (err) {
        if (!mountedRef.current) return;

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this business page.",
        );
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },

    [identifier],
  );

  useEffect(() => {
    const mountedRef = { current: true };

    setLoading(true);

    loadBusiness(mountedRef);

    return () => {
      mountedRef.current = false;
    };
  }, [loadBusiness, retryKey]);

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

  const cardSx = {
    border: `1px solid ${colors.border}`,

    borderRadius: { xs: "18px", sm: "22px" },

    bgcolor: "#fff",

    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.045)",

    overflow: "hidden",
  };

  const sectionSx = {
    px: { xs: 2, sm: 3.5 },

    py: { xs: 2.5, sm: 3 },
  };

  const buttonSx = {
    minHeight: 46,

    borderRadius: "12px",

    fontWeight: 750,

    textTransform: "none",

    boxShadow: "none",
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",

        px: { xs: 1.25, sm: 2.5 },

        py: { xs: 2, sm: 4 },

        overflowX: "hidden",

        bgcolor: colors.background,

        backgroundImage:
          "radial-gradient(ellipse at top, #e8eeff 0%, #f5f7fc 55%, #f8fafc 100%)",
      }}
    >
      <Container maxWidth="sm" disableGutters>
        {/* Loading state: page structure appears immediately */}

        {!business && loading && (
          <MotionPaper elevation={0} sx={cardSx}>
            <Box
              sx={{
                ...sectionSx,

                textAlign: "center",

                background: "linear-gradient(135deg, #edf2ff, #fff)",
              }}
            >
              <Skeleton
                variant="circular"
                width={86}
                height={86}
                sx={{ mx: "auto", mb: 2 }}
              />

              <Skeleton width="55%" height={34} sx={{ mx: "auto" }} />

              <Skeleton width="30%" height={25} sx={{ mx: "auto" }} />
            </Box>

            <Divider sx={{ borderColor: colors.border }} />

            <Box sx={{ ...sectionSx, textAlign: "center" }}>
              <Skeleton width="75%" height={35} sx={{ mx: "auto" }} />

              <Skeleton width="55%" height={28} sx={{ mx: "auto", mb: 2 }} />

              <Stack direction="row" justifyContent="center" spacing={1}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rounded"
                    width={36}
                    height={38}
                    sx={{ borderRadius: 1.5 }}
                  />
                ))}
              </Stack>
            </Box>
          </MotionPaper>
        )}

        {/* Error state */}

        {!business && !loading && (
          <MotionPaper
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            elevation={0}
            sx={{ ...cardSx, p: { xs: 3, sm: 4 }, textAlign: "center" }}
          >
            <Box
              sx={{
                width: 58,

                height: 58,

                mx: "auto",

                mb: 2,

                display: "grid",

                placeItems: "center",

                borderRadius: "18px",

                bgcolor: "#eef2ff",

                color: colors.primary,
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 30 }} />
            </Box>

            <Typography
              sx={{ fontWeight: 850, fontSize: 23, color: colors.text }}
            >
              Business page unavailable
            </Typography>

            <Typography
              sx={{ mt: 1, mb: 2.5, color: colors.muted, fontSize: 14 }}
            >
              {error || "Unable to load this business page."}
            </Typography>

            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => setRetryKey((previous) => previous + 1)}
              sx={{
                ...buttonSx,

                px: 3,

                color: "#fff",

                bgcolor: colors.primary,

                "&:hover": { bgcolor: colors.primaryDark },
              }}
            >
              Try again
            </Button>
          </MotionPaper>
        )}

        {/* Main rating page */}

        {business && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper elevation={0} sx={cardSx}>
              {/* Business profile */}

              <Box
                sx={{
                  ...sectionSx,

                  textAlign: "center",

                  background:
                    "linear-gradient(135deg, #edf2ff 0%, #f8faff 48%, #fff 100%)",
                }}
              >
                <Stack alignItems="center" spacing={1.2}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={logoUrl || undefined}
                      alt={`${businessName} logo`}
                      sx={{
                        width: { xs: 82, sm: 94 },

                        height: { xs: 82, sm: 94 },

                        bgcolor: "#fff",

                        color: colors.primary,

                        border: "3px solid #fff",

                        boxShadow: "0 8px 24px rgba(30,51,100,.10)",

                        fontSize: 28,

                        fontWeight: 850,

                        "& img": { objectFit: "contain" },
                      }}
                    >
                      {businessName.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box
                      sx={{
                        position: "absolute",

                        right: -3,

                        bottom: 0,

                        width: 29,

                        height: 29,

                        display: "grid",

                        placeItems: "center",

                        borderRadius: "50%",

                        bgcolor: "#fff",

                        boxShadow: "0 3px 10px rgba(15,23,42,.12)",
                      }}
                    >
                      <VerifiedRoundedIcon
                        sx={{ color: "#2875f0", fontSize: 23 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ width: "100%", minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: colors.primary,

                        fontSize: 10,

                        letterSpacing: "1.5px",

                        fontWeight: 850,

                        textTransform: "uppercase",

                        mb: 0.6,
                      }}
                    >
                      Business profile
                    </Typography>

                    <Typography
                      component="h2"
                      sx={{
                        color: colors.text,

                        fontSize: { xs: 25, sm: 30 },

                        fontWeight: 900,

                        letterSpacing: "-.7px",

                        lineHeight: 1.25,

                        overflowWrap: "anywhere",
                      }}
                    >
                      {businessName}
                    </Typography>

                    {category && (
                      <Typography
                        sx={{ color: colors.muted, mt: 0.75, fontSize: 14 }}
                      >
                        {category}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ borderColor: colors.border }} />

              {/* Rating selection */}

              <Box sx={{ ...sectionSx, textAlign: "center" }}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 900,

                    color: colors.text,

                    fontSize: { xs: 21, sm: 26 },

                    letterSpacing: "-.4px",
                  }}
                >
                  How was your experience?
                </Typography>

                <Typography
                  sx={{ color: colors.muted, fontSize: 14, mt: 0.8, mb: 2 }}
                >
                  Choose a star rating to continue.
                </Typography>

                <Box
                  sx={{
                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    width: "100%",

                    "& > *": { alignItems: "center" },
                  }}
                >
                  <StarSelector value={rating} onChange={handleRatingChange} />
                </Box>

                <AnimatePresence mode="wait">
                  {rating > 0 && (
                    <MotionBox
                      key={rating}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      sx={{ mt: 1.5 }}
                    >
                      <Typography
                        sx={{
                          mt: 1.25,

                          fontSize: 13,

                          fontWeight: 700,

                          color: rating <= 2 ? "#b45309" : "#526da9",
                        }}
                      >
                        {ratingMessages[rating]}
                      </Typography>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Box>

              {/* Review editor */}

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
                    <Box sx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          borderColor: colors.border,

                          borderRadius: "16px",

                          overflow: "hidden",

                          transition: "border-color .2s, box-shadow .2s",

                          "&:focus-within": {
                            borderColor: "#91a8f0",

                            boxShadow: "0 0 0 3px rgba(49,88,201,.07)",
                          },
                        }}
                      >
                        <Box sx={{ px: 2, pt: 1.75, pb: 1 }}>
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

                              minHeight: 135,

                              maxHeight: 350,

                              resize: "vertical",

                              border: "none",

                              outline: "none",

                              background: "transparent",

                              color: colors.text,

                              fontFamily: "inherit",

                              fontSize: 14,

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
                          spacing={1.25}
                          sx={{
                            px: 1.5,

                            py: 1.5,

                            bgcolor: "#fafbff",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#8993a7",

                              fontSize: 11,

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
                      </Paper>

                      <Typography
                        sx={{
                          mt: 1.25,

                          color: colors.muted,

                          fontSize: 11,

                          lineHeight: 1.7,
                        }}
                      >
                        Write your review manually or generate a suggestion with
                        AI. You can edit the text before continuing.
                      </Typography>

                      <Box sx={{ mt: 2 }}>
                        <GoogleReviewButton
                          googleUrl={googleUrl}
                          review={review}
                        />
                      </Box>
                    </Box>
                  </MotionBox>
                )}
              </AnimatePresence>

              {/* Contact and social links footer */}
              {(address ||
                phone ||
                website ||
                SOCIAL_PLATFORMS.some(({ key }) =>
                  String(business?.socialLinks?.[key] || "").trim(),
                )) && (
                <>
                  <Divider sx={{ borderColor: colors.border }} />
                  <Box sx={{ ...sectionSx, bgcolor: "#fafbfe" }}>

                    <Stack spacing={2}>
                      {address && (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "12px",
                              bgcolor: "#edf2ff",
                              color: colors.primary,
                            }}
                          >
                            <LocationOnRoundedIcon />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              sx={{
                                color: colors.muted,
                                fontSize: 10,
                                fontWeight: 850,
                                letterSpacing: ".7px",
                                textTransform: "uppercase",
                              }}
                            >
                              Business address
                            </Typography>
                            <Typography
                              sx={{
                                mt: 0.4,
                                fontSize: 13,
                                color: "#34415b",
                                lineHeight: 1.7,
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
                                color: colors.primary,
                                bgcolor: "#edf2ff",
                                borderRadius: "10px",
                              }}
                            >
                              <ArrowOutwardRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}

                      {phone && (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "12px",
                              bgcolor: "#edf2ff",
                              color: colors.primary,
                            }}
                          >
                            <PhoneRoundedIcon />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              sx={{
                                color: colors.muted,
                                fontSize: 10,
                                fontWeight: 850,
                                letterSpacing: ".7px",
                                textTransform: "uppercase",
                              }}
                            >
                              Phone
                            </Typography>
                            <Link
                              href={`tel:${phone}`}
                              underline="hover"
                              sx={{
                                display: "inline-block",
                                mt: 0.4,
                                fontSize: 13,
                                fontWeight: 700,
                                overflowWrap: "anywhere",
                              }}
                            >
                              {phone}
                            </Link>
                          </Box>
                        </Stack>
                      )}

                      {website && (
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: "12px",
                              bgcolor: "#edf2ff",
                              color: colors.primary,
                            }}
                          >
                            <LanguageRoundedIcon />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              sx={{
                                color: colors.muted,
                                fontSize: 10,
                                fontWeight: 850,
                                letterSpacing: ".7px",
                                textTransform: "uppercase",
                              }}
                            >
                              Website
                            </Typography>
                            <Link
                              href={normalizeWebsite(website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              sx={{
                                display: "inline-block",
                                mt: 0.4,
                                fontSize: 13,
                                fontWeight: 700,
                                overflowWrap: "anywhere",
                              }}
                            >
                              Visit our website
                            </Link>
                          </Box>
                          <ArrowOutwardRoundedIcon
                            sx={{ fontSize: 18, color: colors.primary }}
                          />
                        </Stack>
                      )}
                    </Stack>

                    {SOCIAL_PLATFORMS.some(({ key }) =>
                      String(business?.socialLinks?.[key] || "").trim(),
                    ) && (
                      <>
                        <Divider sx={{ my: 2.5, borderColor: colors.border }} />
                       
                        <Stack
                          direction="row"
                          justifyContent="center"
                          alignItems="center"
                          flexWrap="wrap"
                          gap={1.25}
                        >
                          {SOCIAL_PLATFORMS.filter(({ key }) =>
                            String(business?.socialLinks?.[key] || "").trim(),
                          ).map(({ key, label, Icon, color }) => (
                            <Tooltip key={key} title={label} arrow>
                              <IconButton
                                component="a"
                                href={normalizeWebsite(
                                  String(business.socialLinks[key]).trim(),
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${businessName} on ${label}`}
                                sx={{
                                  width: 46,
                                  height: 46,
                                  color,
                                  bgcolor: "#fff",
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: "14px",
                                  transition: "all .2s ease",
                                  "&:hover": {
                                    bgcolor: `${color}12`,
                                    borderColor: color,
                                    transform: "translateY(-3px)",
                                  },
                                }}
                              >
                                <Icon sx={{ fontSize: 23 }} />
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Stack>
                      </>
                    )}
                  </Box>
                </>
              )}
            </Paper>

            {/* Footer */}

            <Stack alignItems="center" spacing={0.6} sx={{ py: 2.5 }}>
              <Typography
                sx={{ color: "#8491a7", fontSize: 12, textAlign: "center" }}
              >
                Your feedback makes a difference
              </Typography>

              <Typography sx={{ fontSize: 11, color: "#9aa4b7" }}>
                Powered by{" "}
                <Link
                  href="https://glyrus.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ color: colors.primary, fontWeight: 850 }}
                >
                  Glyrus.com
                </Link>
              </Typography>
            </Stack>
          </MotionBox>
        )}
      </Container>
    </Box>
  );
}
