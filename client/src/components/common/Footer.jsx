import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
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
        mt: 8,
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
          sx={{
            py: 3,
          }}
        >
          <Box>
            <Typography
              component={Link}
              to="/"
              sx={{
                display: "inline-block",
                textDecoration: "none",
                color: "text.primary",
                fontSize: "1.25rem",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              Tap
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                }}
              >
                Rating
              </Box>
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              AI-assisted customer feedback for businesses.
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5}>
            {socialLinks.map((social) => (
              <IconButton
                key={social.label}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                sx={{
                  color: "text.secondary",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "action.hover",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ py: 2 }}
        >
          <Typography variant="caption" color="text.secondary">
            © {currentYear} TapRating. All rights reserved.
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: { xs: "left", sm: "right" },
            }}
          >
            Reviews are submitted directly by customers through Google.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}