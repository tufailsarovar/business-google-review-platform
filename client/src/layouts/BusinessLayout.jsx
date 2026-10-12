import { Outlet, Link, useLocation } from "react-router-dom";
import { Box, Button, Container, Stack } from "@mui/material";
import { motion } from "framer-motion";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GoogleIcon from "@mui/icons-material/Google";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Navbar from "../components/common/Navbar";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const navigation = [
  {
    label: "Dashboard",
    path: "/business/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Profile",
    path: "/business/profile",
    icon: <PersonRoundedIcon />,
  },
  {
    label: "Google",
    path: "/business/google-settings",
    icon: <GoogleIcon />,
  },
  {
    label: "Public Page",
    path: "/business/public-page",
    icon: <PublicRoundedIcon />,
  },
  {
    label: "Analytics",
    path: "/business/analytics",
    icon: <BarChartRoundedIcon />,
  },
  {
    label: "Support Team",
    path: "/business/contact-admin",
    icon: <SupportAgentRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/business/settings",
    icon: <SettingsRoundedIcon />,
  },
];

export default function BusinessLayout() {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
        overflowX: "hidden",
      }}
    >
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          py: {
            xs: 0.75,
            sm: 1.5,
            md: 2.5,
          },
          px: {
            xs: 0.75,
            sm: 2,
            md: 3,
          },
        }}
      >
        {/* Navigation */}
        <MotionBox
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          sx={{
            position: "sticky",
            top: {
              xs: 56,
              sm: 68,
            },
            zIndex: 20,
            mb: {
              xs: 1.25,
              sm: 2,
              md: 2.5,
            },
          }}
        >
          <Box
            sx={{
              p: {
                xs: 0.3,
                sm: 0.6,
              },
              borderRadius: {
                xs: 1.8,
                sm: 2.5,
              },
              border: "1px solid",
              borderColor: "divider",
              backgroundColor: "rgba(255,255,255,0.94)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              boxShadow: {
                xs: "0 2px 12px rgba(15,23,42,0.05)",
                sm: "0 6px 22px rgba(15,23,42,0.06)",
              },
              overflowX: "auto",
              overflowY: "hidden",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={{
                xs: 0.15,
                sm: 0.4,
              }}
              sx={{
                width: "max-content",
                minWidth: "100%",
              }}
            >
              {navigation.map((item) => {
                const active =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);

                return (
                  <MotionButton
                    key={item.path}
                    component={Link}
                    to={item.path}
                    variant="text"
                    disableElevation
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.97,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    startIcon={
                      <Box
                        component="span"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          "& svg": {
                            fontSize: {
                              xs: 15,
                              sm: 19,
                            },
                          },
                        }}
                      >
                        {item.icon}
                      </Box>
                    }
                    endIcon={
                      active ? (
                        <ChevronRightRoundedIcon
                          sx={{
                            display: {
                              xs: "none",
                              md: "block",
                            },
                            fontSize: 15,
                          }}
                        />
                      ) : null
                    }
                    sx={{
                      position: "relative",
                      minHeight: {
                        xs: 32,
                        sm: 40,
                      },
                      height: {
                        xs: 32,
                        sm: 40,
                      },
                      px: {
                        xs: 0.85,
                        sm: 1.35,
                        md: 1.6,
                      },
                      borderRadius: {
                        xs: 1.4,
                        sm: 2,
                      },
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                      textTransform: "none",
                      fontSize: {
                        xs: "0.66rem",
                        sm: "0.82rem",
                      },
                      lineHeight: 1,
                      fontWeight: active ? 750 : 600,
                      color: active
                        ? "primary.contrastText"
                        : "text.secondary",
                      backgroundColor: active
                        ? "primary.main"
                        : "transparent",
                      boxShadow: active
                        ? {
                            xs: "0 3px 10px rgba(37,99,235,0.18)",
                            sm: "0 5px 15px rgba(37,99,235,0.2)",
                          }
                        : "none",
                      transition:
                        "background-color .2s ease, color .2s ease, box-shadow .2s ease",
                      "&:hover": {
                        backgroundColor: active
                          ? "primary.dark"
                          : "action.hover",
                        color: active
                          ? "primary.contrastText"
                          : "primary.main",
                      },
                      "& .MuiButton-startIcon": {
                        marginLeft: 0,
                        marginRight: {
                          xs: 0.35,
                          sm: 0.65,
                        },
                        "& svg": {
                          display: "block",
                        },
                      },
                      "& .MuiButton-endIcon": {
                        marginLeft: 0.15,
                        marginRight: 0,
                      },
                    }}
                  >
                    {item.label}
                  </MotionButton>
                );
              })}
            </Stack>
          </Box>
        </MotionBox>

        {/* Page Content */}
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.03,
            ease: "easeOut",
          }}
          component="main"
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <Outlet />
        </MotionBox>

        <Box
          sx={{
            display: {
              xs: "block",
              sm: "none",
            },
            height: 6,
          }}
        />
      </Container>
    </Box>
  );
}