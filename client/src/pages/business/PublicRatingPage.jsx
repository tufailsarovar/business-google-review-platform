
import { useBusiness } from "../../hooks/useBusiness";
import PublicPageSettings from "../../components/business/PublicPageSettings";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import { AnimatePresence, motion } from "framer-motion";

import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

function LoadingCard({ title, Icon, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2.5, sm: 3 },
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          "&:last-child": {
            pb: { xs: 1.5, sm: 2.5 },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box
            sx={{
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 2,
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            <Icon sx={{ fontSize: { xs: 19, sm: 23 } }} />
          </Box>

          <Typography
            sx={{
              fontSize: { xs: "0.85rem", sm: "0.98rem" },
              fontWeight: 800,
            }}
          >
            {title}
          </Typography>
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
}

export default function PublicRatingPage() {
  const { business, error, loading } = useBusiness();

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1100,
        minWidth: 0,
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
            transition: { staggerChildren: 0.08 },
          },
        }}
      >
        {/* Page header */}
        <MotionBox
          variants={fadeUp}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 1.5 }}
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
              <PublicRoundedIcon
                sx={{ fontSize: { xs: 23, sm: 29 } }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: { xs: "0.6rem", sm: "0.73rem" },
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  mb: 0.3,
                }}
              >
                BUSINESS PRESENCE
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: "1.35rem",
                    sm: "1.9rem",
                    md: "2.2rem",
                  },
                  fontWeight: 850,
                  lineHeight: 1.15,
                  letterSpacing: "-0.045em",
                }}
              >
                Public Rating Page
              </Typography>
            </Box>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              maxWidth: 600,
              fontSize: { xs: "0.75rem", sm: "0.9rem" },
              lineHeight: 1.7,
            }}
          >
            Manage your public review page, share your rating link,
            and download your QR code to help customers find you.
          </Typography>
        </MotionBox>

        {/* Feature overview */}
        <MotionBox
          variants={fadeUp}
          sx={{ mb: { xs: 2, sm: 2.5 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            {[
              {
                title: "Public Review Link",
                description: "Share your business page",
                Icon: LinkRoundedIcon,
              },
              {
                title: "QR Code",
                description: "Make reviews easy to access",
                Icon: QrCode2RoundedIcon,
              },
            ].map(({ title, description, Icon }, index) => (
              <MotionCard
                key={title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + index * 0.07 }}
                whileHover={{ y: -2 }}
                elevation={0}
                sx={{
                  minWidth: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: { xs: 2.2, sm: 3 },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5 },
                    p: { xs: 1.25, sm: 2 },
                    "&:last-child": {
                      pb: { xs: 1.25, sm: 2 },
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 35, sm: 43 },
                      height: { xs: 35, sm: 43 },
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: { xs: 1.8, sm: 2.3 },
                      bgcolor: "action.hover",
                      color: "primary.main",
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.86rem" },
                        fontWeight: 800,
                        lineHeight: 1.4,
                      }}
                    >
                      {title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.3,
                        fontSize: { xs: "0.6rem", sm: "0.74rem" },
                        lineHeight: 1.5,
                      }}
                    >
                      {description}
                    </Typography>
                  </Box>
                </CardContent>
              </MotionCard>
            ))}
          </Box>
        </MotionBox>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <MotionBox
              key="public-page-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              sx={{ mb: 2 }}
            >
              <Alert
                severity="error"
                sx={{
                  borderRadius: 2,
                  py: 0.25,
                  "& .MuiAlert-message": {
                    fontSize: { xs: "0.74rem", sm: "0.85rem" },
                    overflowWrap: "anywhere",
                  },
                }}
              >
                {error}
              </Alert>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Loading placeholders */}
        {loading && !business && !error && (
          <MotionBox
            variants={fadeUp}
            sx={{ mb: 2 }}
          >
            <Stack spacing={{ xs: 1.2, sm: 1.8 }}>
              <LoadingCard
                title="Your public review page"
                Icon={LinkRoundedIcon}
              >
                <Skeleton
                  variant="rounded"
                  height={45}
                  animation="wave"
                  sx={{ borderRadius: 2 }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.5 }}
                >
                  <Skeleton
                    variant="rounded"
                    width={115}
                    height={34}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rounded"
                    width={85}
                    height={34}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
              </LoadingCard>

              <LoadingCard title="QR Code" Icon={QrCode2RoundedIcon}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 1.5,
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    width={120}
                    height={120}
                    animation="wave"
                    sx={{ borderRadius: 2 }}
                  />
                </Box>

                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={38}
                  animation="wave"
                  sx={{ borderRadius: 2 }}
                />
              </LoadingCard>
            </Stack>
          </MotionBox>
        )}

        {/* Existing public page settings */}
        {business && (
          <MotionBox
            variants={fadeUp}
            sx={{ minWidth: 0, width: "100%" }}
          >
            <PublicPageSettings business={business} />
          </MotionBox>
        )}

        {/* Empty state when business is unavailable */}
        {!loading && !business && !error && (
          <MotionCard
            variants={fadeUp}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: { xs: 2.5, sm: 3 },
            }}
          >
            <CardContent
              sx={{
                py: { xs: 4, sm: 5 },
                px: 2,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  mx: "auto",
                  mb: 1.5,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  color: "text.secondary",
                }}
              >
                <PublicRoundedIcon sx={{ fontSize: 28 }} />
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: "0.95rem", sm: "1.1rem" },
                  fontWeight: 800,
                }}
              >
                Business information unavailable
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.7,
                  maxWidth: 350,
                  mx: "auto",
                  fontSize: { xs: "0.74rem", sm: "0.85rem" },
                  lineHeight: 1.7,
                }}
              >
                Your public rating page settings will appear here once
                your business information is available.
              </Typography>
            </CardContent>
          </MotionCard>
        )}

        {/* Footer */}
        <MotionBox
          variants={fadeUp}
          sx={{
            mt: { xs: 1.8, sm: 2.5 },
            pb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.6,
          }}
        >
          <PublicRoundedIcon
            sx={{
              color: "text.disabled",
              fontSize: { xs: 13, sm: 15 },
            }}
          />

          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.62rem", sm: "0.73rem" },
              lineHeight: 1.6,
              textAlign: "center",
            }}
          >
            Your public presence, managed in one place.
          </Typography>

          <ArrowForwardRoundedIcon
            sx={{
              color: "text.disabled",
              fontSize: { xs: 13, sm: 15 },
            }}
          />
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
