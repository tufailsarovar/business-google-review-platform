import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";

import { Link, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { USER_ROLES } from "../../utils/constants";

const MotionBox = motion(Box);
const MotionDrawer = motion(Drawer);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate("/login", { replace: true });
  };

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const dashboardPath = isAdmin
    ? "/admin/dashboard"
    : "/business/dashboard";

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.07)",
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 64,
                sm: 72,
              },
            }}
          >
            {/* Logo */}
            <MotionBox
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Typography
                component={Link}
                to={user ? dashboardPath : "/login"}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  color: "text.primary",
                  fontSize: {
                    xs: "1.35rem",
                    sm: "1.55rem",
                  },
                  fontWeight: 900,
                  letterSpacing: "-0.05em",
                }}
              >
                Tap
                <Box
                  component="span"
                  sx={{
                    color: "primary.main",
                  }}
                >
                  Review
                </Box>
              </Typography>
            </MotionBox>

            <Box sx={{ flexGrow: 1 }} />

            {/* DESKTOP NAVIGATION */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "flex",
                },
                alignItems: "center",
                gap: 1,
              }}
            >
              {user ? (
                <>
                  <MotionBox
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      component={Link}
                      to={dashboardPath}
                      variant="contained"
                      startIcon={<DashboardRoundedIcon />}
                      sx={{
                        minHeight: 42,
                        px: 2.2,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        boxShadow:
                          "0 6px 18px rgba(37,99,235,0.18)",
                      }}
                    >
                      Dashboard
                    </Button>
                  </MotionBox>

                  <MotionBox
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      onClick={handleLogout}
                      variant="text"
                      startIcon={<LogoutRoundedIcon />}
                      sx={{
                        minHeight: 42,
                        px: 1.8,
                        borderRadius: 2.5,
                        color: "text.secondary",
                        fontWeight: 600,
                        "&:hover": {
                          color: "error.main",
                          backgroundColor:
                            "rgba(211,47,47,0.06)",
                        },
                      }}
                    >
                      Logout
                    </Button>
                  </MotionBox>
                </>
              ) : (
                <>
                  <MotionBox
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      component={Link}
                      to="/login"
                      variant="outlined"
                      startIcon={<LoginRoundedIcon />}
                      sx={{
                        minHeight: 42,
                        px: 2,
                        borderRadius: 2.5,
                        fontWeight: 700,
                      }}
                    >
                      Login
                    </Button>
                  </MotionBox>

                  <MotionBox
                    whileHover={{
                      y: -2,
                      scale: 1.02,
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button
                      component={Link}
                      to="/signup"
                      variant="contained"
                      startIcon={<PersonAddAltRoundedIcon />}
                      sx={{
                        minHeight: 42,
                        px: 2.2,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        boxShadow:
                          "0 6px 18px rgba(37,99,235,0.18)",
                      }}
                    >
                      Get Started
                    </Button>
                  </MotionBox>
                </>
              )}
            </Box>

            {/* MOBILE MENU BUTTON */}
            <MotionBox
              whileTap={{ scale: 0.88 }}
              sx={{
                display: {
                  xs: "block",
                  md: "none",
                },
                ml: 1,
              }}
            >
              <IconButton
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </MotionBox>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <MotionDrawer
            anchor="right"
            open={mobileOpen}
            onClose={closeMobileMenu}
            PaperProps={{
              component: motion.div,
              initial: {
                x: 40,
                opacity: 0,
              },
              animate: {
                x: 0,
                opacity: 1,
              },
              exit: {
                x: 40,
                opacity: 0,
              },
              transition: {
                duration: 0.25,
              },
              sx: {
                width: {
                  xs: "84vw",
                  sm: 350,
                },
                maxWidth: 360,
                p: 2,
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              },
            }}
          >
            <Stack
              sx={{
                height: "100%",
              }}
            >
              {/* Drawer Header */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  pb: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.3rem",
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
                    Review
                  </Box>
                </Typography>

                <IconButton
                  onClick={closeMobileMenu}
                  aria-label="Close navigation menu"
                  sx={{
                    borderRadius: 2,
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>

              {/* User Status */}
              {user && (
                <Box
                  sx={{
                    mt: 2,
                    mb: 1,
                    p: 2,
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(99,102,241,0.04))",
                    border: "1px solid",
                    borderColor:
                      "rgba(37,99,235,0.12)",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Signed in as
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.3,
                      fontWeight: 800,
                      wordBreak: "break-word",
                    }}
                  >
                    {user.businessName ||
                      user.name ||
                      user.email}
                  </Typography>
                </Box>
              )}

              {/* Navigation */}
              <List
                disablePadding
                sx={{
                  mt: 2,
                }}
              >
                {user ? (
                  <>
                    <ListItem
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <ListItemButton
                        component={Link}
                        to={dashboardPath}
                        onClick={closeMobileMenu}
                        sx={{
                          minHeight: 52,
                          borderRadius: 3,
                          backgroundColor:
                            "primary.main",
                          color:
                            "primary.contrastText",
                          "&:hover": {
                            backgroundColor:
                              "primary.dark",
                          },
                        }}
                      >
                        <DashboardRoundedIcon
                          sx={{ mr: 1.5 }}
                        />

                        <ListItemText
                          primary="Dashboard"
                          primaryTypographyProps={{
                            fontWeight: 700,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={handleLogout}
                        sx={{
                          minHeight: 52,
                          borderRadius: 3,
                          color: "error.main",
                          "&:hover": {
                            backgroundColor:
                              "rgba(211,47,47,0.06)",
                          },
                        }}
                      >
                        <LogoutRoundedIcon
                          sx={{ mr: 1.5 }}
                        />

                        <ListItemText
                          primary="Logout"
                          primaryTypographyProps={{
                            fontWeight: 700,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem
                      disablePadding
                      sx={{ mb: 1 }}
                    >
                      <ListItemButton
                        component={Link}
                        to="/login"
                        onClick={closeMobileMenu}
                        sx={{
                          minHeight: 52,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <LoginRoundedIcon
                          sx={{ mr: 1.5 }}
                        />

                        <ListItemText
                          primary="Login"
                          primaryTypographyProps={{
                            fontWeight: 700,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>

                    <ListItem disablePadding>
                      <ListItemButton
                        component={Link}
                        to="/signup"
                        onClick={closeMobileMenu}
                        sx={{
                          minHeight: 52,
                          borderRadius: 3,
                          backgroundColor:
                            "primary.main",
                          color:
                            "primary.contrastText",
                          "&:hover": {
                            backgroundColor:
                              "primary.dark",
                          },
                        }}
                      >
                        <PersonAddAltRoundedIcon
                          sx={{ mr: 1.5 }}
                        />

                        <ListItemText
                          primary="Create Account"
                          primaryTypographyProps={{
                            fontWeight: 700,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>

              {/* Bottom Branding */}
              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  TapReview
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                  sx={{ opacity: 0.7 }}
                >
                  Smart Google Review Platform
                </Typography>
              </Box>
            </Stack>
          </MotionDrawer>
        )}
      </AnimatePresence>
    </>
  );
}