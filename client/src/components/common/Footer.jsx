import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";

import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      label: "Instagram",
      href: "https://instagram.com/",
      icon: <InstagramIcon />,
    },
    {
      label: "Facebook",
      href: "https://facebook.com/",
      icon: <FacebookIcon />,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/",
      icon: <LinkedInIcon />,
    },
    {
      label: "X",
      href: "https://x.com/",
      icon: <XIcon />,
    },
  ];

  const features = [
    {
      icon: <AutoAwesomeRoundedIcon />,
      title: "AI-Powered Insights",
      description:
        "Understand customer feedback and discover opportunities to improve your service.",
    },
    {
      icon: <StarRoundedIcon />,
      title: "Google Reviews",
      description:
        "Help customers access your Google review page and share genuine experiences.",
    },
    {
      icon: <TrendingUpRoundedIcon />,
      title: "Build Trust",
      description:
        "Strengthen your online reputation and build customer confidence.",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 2, sm: 3 },
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid #E8ECF4",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "25%",
          width: "50%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #5277F5, transparent)",
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1.5, sm: 2.5 },
          position: "relative",
        }}
      >
        {/* Compact platform introduction */}
        <Box
          sx={{
            pt: { xs: 2, sm: 2.5 },
            pb: { xs: 1.5, sm: 2 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 17, sm: 21 },
              fontWeight: 850,
              letterSpacing: "-0.5px",
              lineHeight: 1.4,
              color: "#17233F",
            }}
          >
            Grow Your Reputation with{" "}
            <Box component="span" sx={{ color: "#5277F5" }}>
              TapReview
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 0.7,
              mx: "auto",
              maxWidth: 680,
              color: "#667085",
              fontSize: { xs: 11, sm: 12 },
              lineHeight: 1.7,
            }}
          >
            TapReview is an AI-powered Google review and reputation platform
            that helps businesses simplify review collection, understand
            customer feedback, improve service, and build a stronger online
            presence.
          </Typography>
        </Box>

        {/* Small feature cards */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ pb: { xs: 2, sm: 2.5 } }}
        >
          {features.map((feature) => (
            <Box
              key={feature.title}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: { xs: "center", sm: "flex-start" },
                gap: 1.2,
                p: { xs: 1.2, sm: 1.4 },
                border: "1px solid #E8ECF4",
                borderRadius: 2.5,
                backgroundColor: "#FFFFFF",
                textAlign: { xs: "left", sm: "left" },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  color: "#5277F5",
                  backgroundColor: "#EEF2FF",
                  "& svg": { fontSize: 19 },
                }}
              >
                {feature.icon}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 12,
                    color: "#17233F",
                    lineHeight: 1.4,
                  }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.4,
                    color: "#718096",
                    fontSize: 10.5,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ borderColor: "#E8ECF4" }} />

        {/* Brand and social links */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 1.2, sm: 2 }}
          sx={{ py: { xs: 1.5, sm: 2 } }}
        >
          <Stack
            component={Link}
            to="/"
            direction="row"
            alignItems="center"
            spacing={-0.5}
            aria-label="TapReview home"
            sx={{ textDecoration: "none", minWidth: 0 }}
          >
            <Box
              component="img"
              src="/glyrus_round_logo.png"
              alt="TapReview logo"
              sx={{
                display: "block",
                width: { xs: 38, sm: 70 },
                height: { xs: 38, sm: 70 },
                flexShrink: 0,
                objectFit: "contain",
              }}
            />

            <Box>
              <Typography
                sx={{
                  color: "#17233F",
                  fontSize: { xs: 17, sm: 20 },
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: "-0.6px",
                  whiteSpace: "nowrap",
                }}
              >
                Tap
                <Box component="span" sx={{ color: "#5277F5" }}>
                  Review
                </Box>
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.7}
          >
            <Tooltip title="Super Admin Login" arrow>
              <IconButton
                component={Link}
                to="/admin/login"
                aria-label="Super Admin Login"
                size="small"
                sx={{
                  width: 32,
                  height: 32,
                  color: "#69758D",
                  border: "1px solid #E5EAF3",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 2.5,
                  "& svg": { fontSize: 18 },
                  "&:hover": {
                    color: "#FFFFFF",
                    backgroundColor: "#17233F",
                    borderColor: "#17233F",
                  },
                }}
              >
                <AdminPanelSettingsRoundedIcon />
              </IconButton>
            </Tooltip>
            {socialLinks.map((social) => (
              <Tooltip key={social.label} title={social.label} arrow>
                <IconButton
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    color: "#69758D",
                    border: "1px solid #E5EAF3",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 2.5,
                    "& svg": { fontSize: 18 },
                    "&:hover": {
                      color: "#FFFFFF",
                      backgroundColor: "#5277F5",
                      borderColor: "#5277F5",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: "#E8ECF4" }} />

        {/* Compact bottom bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={0.8}
          sx={{
            py: { xs: 1.2, sm: 1.5 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "#7B869A",
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            © {currentYear} TapReview. All rights reserved.
          </Typography>

          <Stack
            component="a"
            href="https://glyrus.com"
            target="_blank"
            rel="noopener noreferrer"
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.6}
            sx={{ textDecoration: "none", color: "#69758D" }}
          >
            <Typography component="span" sx={{ fontSize: 10 }}>
              Powered by
            </Typography>

            <Box
              component="img"
              src="/name_logo.png"
              alt="Glyrus"
              sx={{
                display: "block",
                width: { xs: 45, sm: 52 },
                maxHeight: 19,
                objectFit: "contain",
              }}
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
