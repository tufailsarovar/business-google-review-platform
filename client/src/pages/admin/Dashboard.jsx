import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { motion } from "framer-motion";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

import adminService from "../../services/adminService";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    totalRatings: 0,
    averageRating: 0,
    pendingRequests: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardResponse,
          requestsResponse,
        ] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRegistrationRequests(),
        ]);

        if (!mounted) return;

        const payload =
          dashboardResponse?.data ||
          dashboardResponse ||
          {};

        const data =
          payload?.stats ||
          payload?.data ||
          payload;

        const requestsPayload =
          requestsResponse?.data ||
          requestsResponse ||
          {};

        const requests =
          requestsPayload?.requests ||
          [];

        setStats({
          totalBusinesses:
            Number(data?.totalBusinesses) || 0,

          totalUsers:
            Number(data?.totalUsers) || 0,

          totalRatings:
            Number(data?.totalRatings) || 0,

          averageRating:
            Number(data?.averageRating) || 0,

          pendingRequests:
            Array.isArray(requests)
              ? requests.length
              : Number(
                  requestsPayload?.total
                ) || 0,
        });
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load admin dashboard statistics."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    {
      title: "Businesses",
      value: stats.totalBusinesses,
      description: "Registered businesses",
      icon: <BusinessRoundedIcon />,
      path: "/admin/businesses",
    },
    {
      title: "Users",
      value: stats.totalUsers,
      description: "Registered accounts",
      icon: <PeopleRoundedIcon />,
      path: "/admin/users",
    },
    {
      title: "Ratings",
      value: stats.totalRatings,
      description: "Customer ratings",
      icon: <StarRoundedIcon />,
      path: "/admin/businesses",
    },
    {
      title: "Average Rating",
      value: stats.averageRating
        ? stats.averageRating.toFixed(1)
        : "0.0",
      description: "Across tracked ratings",
      icon: <TrendingUpRoundedIcon />,
      path: "/admin/businesses",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}

      <MotionBox
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        sx={{
          mb: {
            xs: 1.5,
            sm: 2.5,
            md: 3,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            mb: {
              xs: 0.35,
              sm: 0.6,
            },
          }}
        >
          <AdminPanelSettingsRoundedIcon
            color="primary"
            sx={{
              fontSize: {
                xs: 17,
                sm: 21,
              },
            }}
          />

          <Typography
            color="primary"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "0.63rem",
                sm: "0.76rem",
              },
              letterSpacing: "0.04em",
            }}
          >
            SUPER ADMIN PANEL
          </Typography>
        </Stack>

        <Typography
          component="h1"
          fontWeight={900}
          sx={{
            fontSize: {
              xs: "1.4rem",
              sm: "2rem",
              md: "2.3rem",
            },
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}
        >
          Admin Dashboard
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.4,
            fontSize: {
              xs: "0.7rem",
              sm: "0.88rem",
            },
            lineHeight: 1.5,
          }}
        >
          Monitor businesses, users, ratings,
          and platform activity.
        </Typography>
      </MotionBox>

      {/* Error */}

      {error && (
        <MotionBox
          initial={{
            opacity: 0,
            y: -8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          sx={{
            mb: {
              xs: 1.3,
              sm: 2,
            },
          }}
        >
          <Alert
            severity="error"
            sx={{
              borderRadius: 1.8,
              py: 0.25,
              px: 1,
              fontSize: {
                xs: "0.68rem",
                sm: "0.8rem",
              },
            }}
          >
            {error}
          </Alert>
        </MotionBox>
      )}

      {/* Registration Requests */}

      <MotionCard
        component={Link}
        to="/admin/registration-requests"
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        whileHover={{
          y: -3,
        }}
        whileTap={{
          scale: 0.99,
        }}
        transition={{
          duration: 0.35,
        }}
        elevation={0}
        sx={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          mb: {
            xs: 1.2,
            sm: 2,
            md: 2.5,
          },
          borderRadius: {
            xs: 2,
            sm: 2.5,
          },
          border: "1px solid",
          borderColor:
            stats.pendingRequests > 0
              ? "warning.main"
              : "divider",
          background:
            stats.pendingRequests > 0
              ? "rgba(245, 158, 11, 0.045)"
              : "background.paper",
          overflow: "hidden",
          cursor: "pointer",
          transition:
            "all .25s ease",
          "&:hover": {
            boxShadow:
              "0 10px 28px rgba(15,23,42,0.08)",
          },
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.25,
              sm: 1.8,
              md: 2,
            },
            "&:last-child": {
              pb: {
                xs: 1.25,
                sm: 1.8,
                md: 2,
              },
            },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1.5}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={{
                xs: 1,
                sm: 1.4,
              }}
              sx={{
                minWidth: 0,
              }}
            >
              <Box
                component={motion.div}
                whileHover={{
                  scale: 1.08,
                  rotate: -4,
                }}
                sx={{
                  width: {
                    xs: 34,
                    sm: 42,
                  },
                  height: {
                    xs: 34,
                    sm: 42,
                  },
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: {
                    xs: 1.4,
                    sm: 1.8,
                  },
                  backgroundColor:
                    "warning.main",
                  color:
                    "warning.contrastText",
                  "& svg": {
                    fontSize: {
                      xs: 18,
                      sm: 22,
                    },
                  },
                }}
              >
                <PendingActionsRoundedIcon />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  fontWeight={900}
                  sx={{
                    fontSize: {
                      xs: "0.82rem",
                      sm: "1rem",
                    },
                  }}
                >
                  Registration Requests
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: {
                      xs: "0.62rem",
                      sm: "0.74rem",
                    },
                    mt: 0.2,
                  }}
                >
                  Review new business registrations
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{
                flexShrink: 0,
              }}
            >
              <Typography
                fontWeight={900}
                color={
                  stats.pendingRequests > 0
                    ? "warning.main"
                    : "text.primary"
                }
                sx={{
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.55rem",
                  },
                }}
              >
                {loading
                  ? "—"
                  : stats.pendingRequests}
              </Typography>

              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: {
                    xs: 17,
                    sm: 21,
                  },
                  color:
                    "text.secondary",
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* Statistics */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: {
            xs: 0.8,
            sm: 1.5,
            md: 2,
          },
          width: "100%",
        }}
      >
        {cards.map((card, index) => (
          <MotionCard
            key={card.title}
            initial={{
              opacity: 0,
              y: 18,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.35,
              delay: index * 0.07,
            }}
            whileHover={{
              y: -4,
            }}
            whileTap={{
              scale: 0.98,
            }}
            elevation={0}
            sx={{
              width: "100%",
              minWidth: 0,
              height: "100%",
              borderRadius: {
                xs: 1.8,
                sm: 2.6,
                md: 3,
              },
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              cursor: "pointer",
              transition:
                "box-shadow .25s ease, border-color .25s ease",
              "&:hover": {
                boxShadow:
                  "0 10px 28px rgba(15,23,42,0.08)",
                borderColor:
                  "primary.light",
              },
            }}
          >
            <Box
              component={Link}
              to={card.path}
              sx={{
                display: "block",
                height: "100%",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 1.1,
                    sm: 1.8,
                    md: 2.2,
                  },
                  "&:last-child": {
                    pb: {
                      xs: 1.1,
                      sm: 1.8,
                      md: 2.2,
                    },
                  },
                }}
              >
                <Box
                  component={motion.div}
                  whileHover={{
                    scale: 1.08,
                    rotate: 5,
                  }}
                  sx={{
                    width: {
                      xs: 30,
                      sm: 38,
                    },
                    height: {
                      xs: 30,
                      sm: 38,
                    },
                    display: "grid",
                    placeItems: "center",
                    borderRadius: {
                      xs: 1.2,
                      sm: 1.8,
                    },
                    mb: {
                      xs: 0.7,
                      sm: 1.15,
                    },
                    backgroundColor:
                      "primary.main",
                    color:
                      "primary.contrastText",
                    "& svg": {
                      fontSize: {
                        xs: 16,
                        sm: 21,
                      },
                    },
                  }}
                >
                  {card.icon}
                </Box>

                <Typography
                  color="text.secondary"
                  fontWeight={650}
                  sx={{
                    fontSize: {
                      xs: "0.62rem",
                      sm: "0.74rem",
                    },
                    lineHeight: 1.25,
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  fontWeight={900}
                  sx={{
                    mt: 0.2,
                    fontSize: {
                      xs: "1.3rem",
                      sm: "1.7rem",
                      md: "1.95rem",
                    },
                    lineHeight: 1.1,
                  }}
                >
                  {loading
                    ? "—"
                    : card.value}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    display: {
                      xs: "none",
                      sm: "block",
                    },
                    mt: 0.4,
                    fontSize: "0.7rem",
                    lineHeight: 1.35,
                  }}
                >
                  {card.description}
                </Typography>
              </CardContent>
            </Box>
          </MotionCard>
        ))}
      </Box>

      {/* Quick Actions */}

      <MotionCard
        initial={{
          opacity: 0,
          y: 18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          delay: 0.32,
        }}
        elevation={0}
        sx={{
          mt: {
            xs: 1.8,
            sm: 2.8,
            md: 3.5,
          },
          borderRadius: {
            xs: 2,
            sm: 3,
          },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.3,
              sm: 2.2,
              md: 2.7,
            },
            "&:last-child": {
              pb: {
                xs: 1.3,
                sm: 2.2,
                md: 2.7,
              },
            },
          }}
        >
          <Stack
            direction="row"
            spacing={0.55}
            alignItems="center"
          >
            <SettingsRoundedIcon
              color="primary"
              sx={{
                fontSize: {
                  xs: 17,
                  sm: 20,
                },
              }}
            />

            <Typography
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: "0.92rem",
                  sm: "1.2rem",
                },
              }}
            >
              Quick Actions
            </Typography>
          </Stack>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.3,
              fontSize: {
                xs: "0.63rem",
                sm: "0.76rem",
              },
              lineHeight: 1.5,
            }}
          >
            Access the main administration areas.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(4, minmax(0, 1fr))",
              },
              gap: {
                xs: 0.8,
                sm: 1.2,
              },
              mt: {
                xs: 1,
                sm: 1.5,
              },
            }}
          >
            <ActionButton
              to="/admin/registration-requests"
              icon={
                <PendingActionsRoundedIcon />
              }
              label="Requests"
              primary={
                stats.pendingRequests > 0
              }
            />

            <ActionButton
              to="/admin/businesses"
              icon={
                <BusinessRoundedIcon />
              }
              label="Businesses"
            />

            <ActionButton
              to="/admin/users"
              icon={
                <PeopleRoundedIcon />
              }
              label="Users"
            />

            <ActionButton
              to="/admin/review-templates"
              icon={
                <StarRoundedIcon />
              }
              label="Templates"
            />
          </Box>
        </CardContent>
      </MotionCard>

      {/* Loading */}

      {loading && (
        <MotionBox
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          sx={{
            mt: 1.5,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <CircularProgress
            size={19}
            thickness={4}
          />
        </MotionBox>
      )}
    </Box>
  );
}

function ActionButton({
  to,
  icon,
  label,
  primary = false,
}) {
  return (
    <Button
      component={motion.create(Button)}
      variant={
        primary
          ? "contained"
          : "outlined"
      }
      startIcon={icon}
      endIcon={
        <ArrowForwardRoundedIcon
          sx={{
            fontSize: {
              xs: 14,
              sm: 17,
            },
          }}
        />
      }
      onClick={(event) => {
        event.currentTarget.blur();
      }}
      size="small"
      fullWidth
      sx={{
        minHeight: {
          xs: 35,
          sm: 42,
        },
        px: {
          xs: 0.65,
          sm: 1.3,
        },
        borderRadius: {
          xs: 1.5,
          sm: 2,
        },
        fontWeight: 800,
        fontSize: {
          xs: "0.61rem",
          sm: "0.75rem",
        },
        whiteSpace: "nowrap",
        "& .MuiButton-startIcon": {
          marginRight: {
            xs: 0.2,
            sm: 0.55,
          },
          "& svg": {
            fontSize: {
              xs: 15,
              sm: 19,
            },
          },
        },
        "& .MuiButton-endIcon": {
          marginLeft: {
            xs: 0.15,
            sm: 0.45,
          },
        },
      }}
    >
      <Box
        component={Link}
        to={to}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {label}
    </Button>
  );
}