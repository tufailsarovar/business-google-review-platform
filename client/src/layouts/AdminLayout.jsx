import { Link, Outlet, useLocation } from "react-router-dom";
import { Box, Button, Container, Stack } from "@mui/material";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import Navbar from "../components/common/Navbar";

const navigation = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardRoundedIcon />,
  },
  {
    label: "Businesses",
    path: "/admin/businesses",
    icon: <BusinessRoundedIcon />,
  },
  {
    label: "Registration Requests",
    path: "/admin/registration-requests",
    icon: <AssignmentRoundedIcon />,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <PeopleRoundedIcon />,
  },
  {
    label: "Review Templates",
    path: "/admin/review-templates",
    icon: <DescriptionRoundedIcon />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <SettingsRoundedIcon />,
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        overflowX: "clip",
      }}
    >
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 0.6, sm: 2, md: 2.5 },
          px: { xs: 0.6, sm: 2, md: 3 },
          minWidth: 0,
        }}
      >
        {/* Compact responsive navigation */}
        <Box
          sx={{
            position: "sticky",
            top: { xs: 56, sm: 72 },
            zIndex: 20,
            mb: { xs: 0.8, sm: 2, md: 2.5 },
            p: { xs: 0.25, sm: 0.75 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 1.5, sm: 3 },
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: {
              xs: "0 2px 8px rgba(15,23,42,0.04)",
              sm: "0 6px 22px rgba(15,23,42,0.06)",
            },
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.1, sm: 0.5 }}
            alignItems="center"
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
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  variant={active ? "contained" : "text"}
                  color={active ? "primary" : "inherit"}
                  disableElevation
                  size="small"
                  sx={{
                    flexShrink: 0,
                    minWidth: 0,
                    minHeight: { xs: 29, sm: 40 },
                    height: { xs: 29, sm: 40 },
                    px: { xs: 0.65, sm: 1.7 },
                    py: { xs: 0.3, sm: 0.8 },
                    borderRadius: { xs: 1, sm: 1.8 },
                    whiteSpace: "nowrap",
                    textTransform: "none",
                    fontSize: {
                      xs: "0.58rem",
                      sm: "0.78rem",
                    },
                    lineHeight: 1.1,
                    fontWeight: active ? 800 : 600,
                    color: active ? "primary.contrastText" : "text.secondary",
                    bgcolor: active ? "primary.main" : "transparent",
                    boxShadow: active
                      ? {
                          xs: "0 2px 6px rgba(37,99,235,0.16)",
                          sm: "0 5px 15px rgba(37,99,235,0.18)",
                        }
                      : "none",
                    transition:
                      "background-color .2s ease, color .2s ease, box-shadow .2s ease",
                    "& .MuiButton-startIcon": {
                      ml: 0,
                      mr: { xs: 0.3, sm: 0.8 },
                      "& svg": {
                        display: "block",
                        fontSize: { xs: 14, sm: 19 },
                      },
                    },
                    "&:hover": {
                      bgcolor: active ? "primary.dark" : "rgba(37,99,235,0.06)",
                      color: active ? "primary.contrastText" : "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            width: "100%",
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          <Outlet />
        </Box>

        {/* Bottom spacing on phones */}
        <Box
          sx={{
            display: { xs: "block", sm: "none" },
            height: 4,
          }}
        />
      </Container>
    </Box>
  );
}
