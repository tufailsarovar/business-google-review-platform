import { useState } from "react";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/business/dashboard";

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid #E8ECF4",
          color: "#17233F",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Box
            sx={{
              minHeight: { xs: 68, sm: 82 },
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* TapReview — left side */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.3, sm: 0 },
                textDecoration: "none",
                zIndex: 1,
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src="/glyrus_round_logo.png"
                alt="TapReview logo"
                sx={{
                  width: { xs: 45, sm: 70 },
                  height: { xs: 45, sm: 70 },
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 17, sm: 25 },
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: "-0.8px",
                    whiteSpace: "nowrap",
                    color: "#15213D",
                  }}
                >
                  Tap
                  <Box component="span" sx={{ color: "#5277F5" }}>
                    Review
                  </Box>
                </Typography>
              </Box>
            </Box>

            {/* Glyrus name — centered, hidden on mobile */}
            <Box
              component={Link}
              to={user ? dashboardPath : "/"}
              sx={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              <Box
                component="img"
                src="/name_logo.png"
                alt="Glyrus"
                sx={{
                  width: { sm: 145, md: 175 },
                  maxHeight: 48,
                  objectFit: "contain",
                }}
              />
            </Box>

            {/* Desktop dashboard and logout */}
            {user && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ display: { xs: "none", md: "flex" }, zIndex: 1 }}
              >
                <IconButton
                  component={Link}
                  to={dashboardPath}
                  aria-label="Dashboard"
                  sx={{ color: "#5277F5" }}
                >
                  <DashboardRoundedIcon />
                </IconButton>

                <IconButton
                  onClick={handleLogout}
                  aria-label="Logout"
                  sx={{ color: "#667085" }}
                >
                  <LogoutRoundedIcon />
                </IconButton>
              </Stack>
            )}

            {/* Mobile menu */}
            {user && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                sx={{
                  display: { xs: "flex", md: "none" },
                  width: 36,
                  height: 36,
                  border: "1px solid #E5EAF3",
                  borderRadius: 2,
                  color: "#34415C",
                  zIndex: 1,
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            )}
          </Box>
        </Container>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={closeMobileMenu}
        PaperProps={{
          sx: {
            width: { xs: "82vw", sm: 320 },
            maxWidth: 340,
            p: 2,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          },
        }}
      >
        <Stack sx={{ height: "100%" }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ pb: 2 }}
          >
            <Box
              component="img"
              src="/name_logo.png"
              alt="Glyrus"
              sx={{ width: 100, maxHeight: 34, objectFit: "contain" }}
            />

            <IconButton onClick={closeMobileMenu} aria-label="Close menu">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider />

          {user && (
            <Box
              sx={{
                mt: 2,
                p: 1.8,
                borderRadius: 3,
                bgcolor: "#F4F7FF",
                border: "1px solid #E5EBFF",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Signed in as
              </Typography>

              <Typography
                sx={{ mt: 0.4, fontWeight: 800, overflowWrap: "anywhere" }}
              >
                {user.businessName || user.name || user.email}
              </Typography>
            </Box>
          )}

          {user && (
            <List sx={{ mt: 2 }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={dashboardPath}
                  onClick={closeMobileMenu}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2.5,
                    bgcolor: "#5277F5",
                    color: "#fff",
                  }}
                >
                  <DashboardRoundedIcon sx={{ mr: 1.5 }} />
                  <ListItemText
                    primary="Dashboard"
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding>
                <ListItemButton
                  onClick={handleLogout}
                  sx={{ minHeight: 48, borderRadius: 2.5, color: "#D32F2F" }}
                >
                  <LogoutRoundedIcon sx={{ mr: 1.5 }} />
                  <ListItemText
                    primary="Logout"
                    primaryTypographyProps={{ fontWeight: 700 }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          )}

          <Box sx={{ mt: "auto", pt: 2, textAlign: "center" }}>
            <Divider sx={{ mb: 2 }} />

            <Typography sx={{ fontWeight: 900, fontSize: 17 }}>
              Tap
              <Box component="span" sx={{ color: "#5277F5" }}>
                Review
              </Box>
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>
              Smarter customer feedback
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 11, color: "text.secondary" }}>
              Powered by Glyrus
            </Typography>
          </Box>
        </Stack>
      </Drawer>
    </>
  );
}
