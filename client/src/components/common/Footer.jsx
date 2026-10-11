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

  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 3, sm: 5 },
        position: "relative",
        overflow: "hidden",
        borderTop: "1px solid #E8ECF4",
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFF 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "20%",
          width: "60%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, #5277F5, transparent)",
        },
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 1, sm: 2, md: 0 },
          position: "relative",
        }}
      >
        {/* Main footer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{ py: { xs: 2.5, sm: 3 } }}
        >
          {/* TapReview logo and name */}
          <Stack
            component={Link}
            to="/"
            direction="row"
            alignItems="center"
            spacing={{ xs: 0.5, sm: -0.2 }}
            aria-label="TapReview home"
            sx={{
              textDecoration: "none",
              minWidth: 0,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box
              component="img"
              src="/glyrus_round_logo.png"
              alt="Glyrus logo"
              sx={{
                display: "block",
                width: { xs: 48, sm: 58, md: 66 },
                height: { xs: 48, sm: 58, md: 66 },
                flexShrink: 0,
                objectFit: "contain",
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#17233F",
                  fontSize: { xs: 19, sm: 23 },
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: "-0.8px",
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

          {/* Social links */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={{ xs: 0.5, sm: 1 }}
          >
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
                    width: { xs: 34, sm: 38 },
                    height: { xs: 34, sm: 38 },
                    color: "#69758D",
                    border: "1px solid #E5EAF3",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "11px",
                    transition: "all 0.22s ease",
                    "&:hover": {
                      color: "#FFFFFF",
                      backgroundColor: "#5277F5",
                      borderColor: "#5277F5",
                      transform: "translateY(-3px)",
                      boxShadow: "0 5px 12px rgba(82,119,245,0.2)",
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

        {/* Copyright and Glyrus branding */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 1.2, sm: 2 }}
          sx={{
            py: { xs: 1.8, sm: 2 },
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              color: "#7B869A",
              fontSize: { xs: 10, sm: 11 },
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
            spacing={0.7}
            sx={{
              textDecoration: "none",
              color: "#69758D",
              transition: "opacity 0.2s ease",
              "&:hover": { opacity: 0.75 },
            }}
          >
            <Typography component="span" sx={{ fontSize: { xs: 10, sm: 11 } }}>
              Powered by
            </Typography>

            <Box
              component="img"
              src="/name_logo.png"
              alt="Glyrus"
              sx={{
                display: "block",
                width: { xs: 48, sm: 58 },
                maxHeight: 22,
                objectFit: "contain",
              }}
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
