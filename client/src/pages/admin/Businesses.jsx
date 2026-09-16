import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";

import adminService from "../../services/adminService";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await adminService.getBusinesses();

        if (!mounted) return;

        const data =
          response?.data?.businesses ||
          response?.data ||
          response ||
          [];

        setBusinesses(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load businesses."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return businesses;

    return businesses.filter((business) => {
      const name =
        business?.businessName ||
        business?.name ||
        "";

      const email =
        business?.email || "";

      const category =
        business?.category ||
        business?.businessCategory ||
        "";

      const city =
        business?.city || "";

      const businessId =
        business?.businessId || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        city.toLowerCase().includes(query) ||
        businessId.toLowerCase().includes(query)
      );
    });
  }, [businesses, search]);

  const activeCount = businesses.filter(
    (business) =>
      business?.isActive !== false &&
      business?.status !== "inactive"
  ).length;

  const inactiveCount =
    businesses.length - activeCount;

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
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ mb: 0.4 }}
            >
              <BusinessRoundedIcon
                color="primary"
                sx={{
                  fontSize: {
                    xs: 17,
                    sm: 20,
                  },
                }}
              />

              <Typography
                color="primary"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs: "0.62rem",
                    sm: "0.74rem",
                  },
                  letterSpacing: "0.04em",
                }}
              >
                BUSINESS MANAGEMENT
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
              Businesses
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.35,
                fontSize: {
                  xs: "0.68rem",
                  sm: "0.84rem",
                },
                lineHeight: 1.45,
              }}
            >
              View and manage businesses registered on
              TapRating.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            startIcon={
              <ArrowBackRoundedIcon
                sx={{
                  fontSize: {
                    xs: 15,
                    sm: 18,
                  },
                }}
              />
            }
            size="small"
            sx={{
              minHeight: {
                xs: 33,
                sm: 40,
              },
              px: {
                xs: 0.9,
                sm: 1.5,
              },
              borderRadius: 1.7,
              fontWeight: 700,
              fontSize: {
                xs: "0.62rem",
                sm: "0.75rem",
              },
              flexShrink: 0,
            }}
          >
            Dashboard
          </Button>
        </Stack>
      </MotionBox>

      {/* Error */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.4,
            py: 0.2,
            px: 1,
            borderRadius: 1.7,
            fontSize: {
              xs: "0.67rem",
              sm: "0.78rem",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Small stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: {
            xs: 0.8,
            sm: 1.2,
          },
          mb: {
            xs: 1.2,
            sm: 1.8,
          },
        }}
      >
        <MiniStat
          icon={<BusinessRoundedIcon />}
          label="Total"
          value={businesses.length}
        />

        <MiniStat
          icon={<PeopleRoundedIcon />}
          label="Active"
          value={activeCount}
        />

        <MiniStat
          icon={<BusinessRoundedIcon />}
          label="Inactive"
          value={inactiveCount}
        />
      </Box>

      {/* Search */}
      <MotionCard
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          delay: 0.05,
        }}
        elevation={0}
        sx={{
          mb: {
            xs: 1.3,
            sm: 2,
          },
          borderRadius: {
            xs: 1.8,
            sm: 2.7,
          },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1,
              sm: 1.6,
            },
            "&:last-child": {
              pb: {
                xs: 1,
                sm: 1.6,
              },
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search business, email, category..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      fontSize: {
                        xs: 18,
                        sm: 21,
                      },
                      color: "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: {
                  xs: 1.4,
                  sm: 1.8,
                },
                minHeight: {
                  xs: 38,
                  sm: 43,
                },
              },
              "& input": {
                fontSize: {
                  xs: "0.68rem",
                  sm: "0.78rem",
                },
              },
            }}
          />
        </CardContent>
      </MotionCard>

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            minHeight: "25vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress
            size={24}
            thickness={4}
          />
        </Box>
      ) : filteredBusinesses.length === 0 ? (
        <MotionCard
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          elevation={0}
          sx={{
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
              py: {
                xs: 3,
                sm: 5,
              },
              textAlign: "center",
            }}
          >
            <BusinessRoundedIcon
              sx={{
                fontSize: {
                  xs: 34,
                  sm: 46,
                },
                color: "text.disabled",
              }}
            />

            <Typography
              fontWeight={800}
              sx={{
                mt: 0.7,
                fontSize: {
                  xs: "0.85rem",
                  sm: "1rem",
                },
              }}
            >
              No businesses found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.3,
                fontSize: {
                  xs: "0.64rem",
                  sm: "0.75rem",
                },
              }}
            >
              Try changing your search query.
            </Typography>
          </CardContent>
        </MotionCard>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: {
              xs: 0.8,
              sm: 1.5,
              md: 2,
            },
          }}
        >
          {filteredBusinesses.map(
            (business, index) => {
              const id =
                business?._id ||
                business?.id;

              const name =
                business?.businessName ||
                business?.name ||
                "Unnamed Business";

              const email =
                business?.email ||
                "No email";

              const category =
                business?.category ||
                business?.businessCategory ||
                "Business";

              const city =
                business?.city ||
                "";

              const isActive =
                business?.isActive !== false &&
                business?.status !== "inactive";

              const reviewStats =
                business?.reviewStats || {};

              const totalRatings =
                Number(
                  business?.totalRatings ??
                    reviewStats.totalRatings
                ) || 0;

              const averageRating =
                Number(
                  business?.averageRating ??
                    reviewStats.averageRating
                ) ||
                (totalRatings > 0
                  ? Number(
                      (
                        (
                          (Number(
                            reviewStats.oneStar
                          ) || 0) *
                            1 +
                          (Number(
                            reviewStats.twoStars
                          ) || 0) *
                            2 +
                          (Number(
                            reviewStats.threeStars
                          ) || 0) *
                            3 +
                          (Number(
                            reviewStats.fourStars
                          ) || 0) *
                            4 +
                          (Number(
                            reviewStats.fiveStars
                          ) || 0) *
                            5
                        ) /
                        totalRatings
                      ).toFixed(1)
                    )
                  : 0);

              return (
                <MotionCard
                  key={
                    id ||
                    `${name}-${index}`
                  }
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.035,
                  }}
                  whileHover={{
                    y: -3,
                  }}
                  whileTap={{
                    scale: 0.985,
                  }}
                  elevation={0}
                  sx={{
                    minWidth: 0,
                    height: "100%",
                    borderRadius: {
                      xs: 1.8,
                      sm: 2.6,
                    },
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    transition:
                      "box-shadow .25s ease, border-color .25s ease",
                    "&:hover": {
                      boxShadow:
                        "0 10px 25px rgba(15,23,42,0.08)",
                      borderColor:
                        "primary.light",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: {
                        xs: 1.05,
                        sm: 1.7,
                        md: 2,
                      },
                      "&:last-child": {
                        pb: {
                          xs: 1.05,
                          sm: 1.7,
                          md: 2,
                        },
                      },
                    }}
                  >
                    {/* Top */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={0.6}
                    >
                      <Box
                        component={motion.div}
                        whileHover={{
                          scale: 1.08,
                          rotate: 4,
                        }}
                        sx={{
                          width: {
                            xs: 29,
                            sm: 38,
                          },
                          height: {
                            xs: 29,
                            sm: 38,
                          },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: {
                            xs: 1.2,
                            sm: 1.7,
                          },
                          bgcolor:
                            "primary.main",
                          color:
                            "primary.contrastText",
                          "& svg": {
                            fontSize: {
                              xs: 15,
                              sm: 21,
                            },
                          },
                        }}
                      >
                        <BusinessRoundedIcon />
                      </Box>

                      <Chip
                        size="small"
                        label={
                          isActive
                            ? "Active"
                            : "Inactive"
                        }
                        color={
                          isActive
                            ? "success"
                            : "default"
                        }
                        sx={{
                          height: {
                            xs: 19,
                            sm: 24,
                          },
                          fontSize: {
                            xs: "0.53rem",
                            sm: "0.64rem",
                          },
                          fontWeight: 800,
                          "& .MuiChip-label": {
                            px: {
                              xs: 0.65,
                              sm: 0.9,
                            },
                          },
                        }}
                      />
                    </Stack>

                    {/* Business name */}
                    <Typography
                      fontWeight={900}
                      sx={{
                        mt: {
                          xs: 0.8,
                          sm: 1.2,
                        },
                        fontSize: {
                          xs: "0.74rem",
                          sm: "0.95rem",
                        },
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                      }}
                    >
                      {name}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.3,
                        fontSize: {
                          xs: "0.57rem",
                          sm: "0.69rem",
                        },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {email}
                    </Typography>

                    {/* Category */}
                    <Chip
                      label={category}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{
                        mt: {
                          xs: 0.6,
                          sm: 0.9,
                        },
                        maxWidth: "100%",
                        height: {
                          xs: 20,
                          sm: 25,
                        },
                        fontSize: {
                          xs: "0.53rem",
                          sm: "0.64rem",
                        },
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                        },
                      }}
                    />

                    {/* Rating info */}
                    <Divider
                      sx={{
                        my: {
                          xs: 0.8,
                          sm: 1.4,
                        },
                      }}
                    />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={0.5}
                    >
                      <Stack
                        direction="row"
                        spacing={0.35}
                        alignItems="center"
                      >
                        <StarRoundedIcon
                          sx={{
                            fontSize: {
                              xs: 14,
                              sm: 18,
                            },
                            color:
                              "warning.main",
                          }}
                        />

                        <Typography
                          fontWeight={800}
                          sx={{
                            fontSize: {
                              xs: "0.62rem",
                              sm: "0.73rem",
                            },
                          }}
                        >
                          {averageRating.toFixed(
                            1
                          )}
                        </Typography>
                      </Stack>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: {
                            xs: "0.56rem",
                            sm: "0.67rem",
                          },
                        }}
                      >
                        {totalRatings} ratings
                      </Typography>
                    </Stack>

                    {city && (
                      <Stack
                        direction="row"
                        spacing={0.3}
                        alignItems="center"
                        sx={{
                          mt: 0.5,
                          minWidth: 0,
                        }}
                      >
                        <LocationOnRoundedIcon
                          sx={{
                            fontSize: {
                              xs: 13,
                              sm: 16,
                            },
                            color:
                              "text.secondary",
                          }}
                        />

                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "0.55rem",
                              sm: "0.67rem",
                            },
                            overflow: "hidden",
                            textOverflow:
                              "ellipsis",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {city}
                        </Typography>
                      </Stack>
                    )}

                    {/* View */}
                    <Button
                      component={Link}
                      to={
                        id
                          ? `/admin/businesses/${id}`
                          : "/admin/businesses"
                      }
                      fullWidth
                      variant="outlined"
                      startIcon={
                        <VisibilityRoundedIcon
                          sx={{
                            fontSize: {
                              xs: 14,
                              sm: 17,
                            },
                          }}
                        />
                      }
                      disabled={!id}
                      size="small"
                      sx={{
                        mt: {
                          xs: 0.8,
                          sm: 1.3,
                        },
                        minHeight: {
                          xs: 31,
                          sm: 39,
                        },
                        borderRadius: {
                          xs: 1.3,
                          sm: 1.8,
                        },
                        fontSize: {
                          xs: "0.59rem",
                          sm: "0.72rem",
                        },
                        fontWeight: 800,
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </MotionCard>
              );
            }
          )}
        </Box>
      )}
    </Box>
  );
}

function MiniStat({
  icon,
  label,
  value,
}) {
  return (
    <MotionCard
      whileHover={{
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
      }}
      elevation={0}
      sx={{
        borderRadius: {
          xs: 1.7,
          sm: 2.2,
        },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 0.95,
            sm: 1.4,
          },
          "&:last-child": {
            pb: {
              xs: 0.95,
              sm: 1.4,
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={{
            xs: 0.6,
            sm: 1,
          }}
          alignItems="center"
        >
          <Box
            sx={{
              width: {
                xs: 27,
                sm: 34,
              },
              height: {
                xs: 27,
                sm: 34,
              },
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "& svg": {
                fontSize: {
                  xs: 15,
                  sm: 19,
                },
              },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: {
                  xs: "0.55rem",
                  sm: "0.66rem",
                },
              }}
            >
              {label}
            </Typography>

            <Typography
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.35rem",
                },
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </MotionCard>
  );
}