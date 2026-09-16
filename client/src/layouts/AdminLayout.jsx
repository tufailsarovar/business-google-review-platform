import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
} from "@mui/material";

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
    icon: <DashboardRoundedIcon fontSize="small" />,
  },
  {
    label: "Businesses",
    path: "/admin/businesses",
    icon: <BusinessRoundedIcon fontSize="small" />,
  },
  {
    label: "Registration Requests",
    path: "/admin/registration-requests",
    icon: <AssignmentRoundedIcon fontSize="small" />,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: <PeopleRoundedIcon fontSize="small" />,
  },
  {
    label: "Review Templates",
    path: "/admin/review-templates",
    icon: <DescriptionRoundedIcon fontSize="small" />,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: <SettingsRoundedIcon fontSize="small" />,
  },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <>
      <Navbar />

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            position: "sticky",
            top: { xs: 64, sm: 72 },
            zIndex: 10,
            mb: { xs: 2.5, sm: 3 },
            p: 0.75,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(14px)",
            overflowX: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              minWidth: "max-content",
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
                  sx={{
                    whiteSpace: "nowrap",
                    minHeight: 40,
                    px: {
                      xs: 1.3,
                      sm: 1.7,
                    },
                    color: active
                      ? "primary.contrastText"
                      : "text.secondary",
                    "&:hover": {
                      backgroundColor: active
                        ? "primary.dark"
                        : "rgba(37,99,235,0.06)",
                      color: active
                        ? "primary.contrastText"
                        : "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Box
          component="section"
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          <Outlet />
        </Box>
      </Container>
    </>
  );
}