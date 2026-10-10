
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
  MenuItem,
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
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import QRCodeDownload from "../../components/common/QRCodeDownload";
import adminService from "../../services/adminService";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function Businesses() {
  const [businesses, setBusinesses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadBusinesses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await adminService.getBusinesses();

        if (!mounted) return;

        const data =
          response?.data?.businesses || response?.data || response || [];

        setBusinesses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.response?.data?.message || "Unable to load businesses.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(
      startOfWeek.getDate() - (day === 0 ? 6 : day - 1),
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    return businesses.filter((business) => {
      const name = business?.businessName || business?.name || "";
      const email = business?.email || "";
      const category =
        business?.category || business?.businessCategory || "";
      const city = business?.city || "";
      const businessId = business?.businessId || "";

      const matchesSearch =
        !query ||
        [name, email, category, city, businessId].some((value) =>
          String(value).toLowerCase().includes(query),
        );

      if (!matchesSearch) return false;

      const createdAt = business?.createdAt
        ? new Date(business.createdAt)
        : null;

      if (
        dateFilter !== "all" &&
        (!createdAt || Number.isNaN(createdAt.getTime()))
      ) {
        return false;
      }

      switch (dateFilter) {
        case "today":
          return (
            createdAt >= startOfToday &&
            createdAt < startOfTomorrow
          );

        case "yesterday":
          return (
            createdAt >= startOfYesterday &&
            createdAt < startOfToday
          );

        case "week":
          return (
            createdAt >= startOfWeek &&
            createdAt < startOfTomorrow
          );

        case "month":
          return (
            createdAt >= startOfMonth &&
            createdAt < startOfTomorrow
          );

        case "between": {
          if (!startDate || !endDate) return true;

          const start = new Date(`${startDate}T00:00:00`);
          const end = new Date(`${endDate}T23:59:59.999`);

          if (start > end) return false;

          return createdAt >= start && createdAt <= end;
        }

        default:
          return true;
      }
    });
  }, [businesses, search, dateFilter, startDate, endDate]);

  const activeCount = businesses.filter(
    (business) =>
      business?.isActive !== false &&
      business?.status !== "inactive",
  ).length;

  const inactiveCount = businesses.length - activeCount;

  return (
    <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      {/* Header */}
      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        sx={{ mb: { xs: 1.5, sm: 2.5, md: 3 } }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
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
                sx={{ fontSize: { xs: 17, sm: 20 } }}
              />
              <Typography
                color="primary"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "0.62rem", sm: "0.74rem" },
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
                fontSize: { xs: "0.68rem", sm: "0.84rem" },
                lineHeight: 1.45,
              }}
            >
              View and manage businesses registered on TapReview.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            size="small"
            sx={{
              minHeight: { xs: 33, sm: 40 },
              px: { xs: 0.9, sm: 1.5 },
              borderRadius: 1.7,
              fontWeight: 700,
              fontSize: { xs: "0.62rem", sm: "0.75rem" },
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
            fontSize: { xs: "0.67rem", sm: "0.78rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: { xs: 0.8, sm: 1.2 },
          mb: { xs: 1.2, sm: 1.8 },
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

      {/* Compact Search and Date Filters */}
      <MotionCard
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        elevation={0}
        sx={{
          mb: { xs: 1.3, sm: 2 },
          borderRadius: { xs: 1.8, sm: 2.7 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1, sm: 1.25 },
            "&:last-child": {
              pb: { xs: 1, sm: 1.25 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, email, category..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{ fontSize: 19, color: "text.secondary" }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  height: 38,
                  borderRadius: 2,
                },
                "& input": {
                  py: 0.8,
                  fontSize: "0.78rem",
                },
              }}
            />

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                flexShrink: 0,
                minWidth: 0,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <TextField
                select
                size="small"
                label="Date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                sx={{
                  width: { xs: "100%", sm: 145 },
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    borderRadius: 2,
                    fontSize: "0.78rem",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.8rem",
                  },
                }}
              >
                <MenuItem value="all">All time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="yesterday">Yesterday</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="between">Date Between</MenuItem>
              </TextField>

              {dateFilter === "between" && (
                <>
                  <TextField
                    type="date"
                    size="small"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      width: { xs: 125, sm: 145 },
                      "& .MuiOutlinedInput-root": {
                        height: 38,
                        borderRadius: 2,
                        fontSize: "0.75rem",
                      },
                    }}
                  />

                  <TextField
                    type="date"
                    size="small"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      width: { xs: 125, sm: 145 },
                      "& .MuiOutlinedInput-root": {
                        height: 38,
                        borderRadius: 2,
                        fontSize: "0.75rem",
                      },
                    }}
                  />

                  <Button
                    size="small"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setDateFilter("all");
                    }}
                    sx={{
                      minWidth: "auto",
                      textTransform: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Clear
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* Business List */}
      {loading ? (
        <Box
          sx={{
            minHeight: "25vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress size={24} thickness={4} />
        </Box>
      ) : filteredBusinesses.length === 0 ? (
        <MotionCard
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent
            sx={{
              py: { xs: 3, sm: 5 },
              textAlign: "center",
            }}
          >
            <BusinessRoundedIcon
              sx={{
                fontSize: { xs: 34, sm: 46 },
                color: "text.disabled",
              }}
            />

            <Typography
              fontWeight={800}
              sx={{
                mt: 0.7,
                fontSize: { xs: "0.85rem", sm: "1rem" },
              }}
            >
              No businesses found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.3,
                fontSize: { xs: "0.64rem", sm: "0.75rem" },
              }}
            >
              Try changing your search or date filters.
            </Typography>
          </CardContent>
        </MotionCard>
      ) : (
        <>
          {/* Registered Businesses Heading */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.2rem" },
                lineHeight: 1.3,
              }}
            >
              Registered Businesses
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.68rem", sm: "0.8rem" },
                whiteSpace: "nowrap",
              }}
            >
              {filteredBusinesses.length} found
            </Typography>
          </Stack>

          {/* Responsive Business Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 0.8, sm: 1.5, md: 2 },
              alignItems: "stretch",
            }}
          >
            {filteredBusinesses.map((business, index) => {
              const id = business?._id || business?.id;

              const name =
                business?.businessName ||
                business?.name ||
                "Unnamed Business";

              const email = business?.email || "No email";

              const category =
                business?.category ||
                business?.businessCategory ||
                "Business";

              const city = business?.city || "";
              const businessId = business?.businessId || "";

              const publicPageUrl = businessId
                ? `/rate/${encodeURIComponent(businessId)}`
                : "";

              const isActive =
                business?.isActive !== false &&
                business?.status !== "inactive";

              const reviewStats = business?.reviewStats || {};

              const totalRatings =
                Number(
                  business?.totalRatings ?? reviewStats.totalRatings,
                ) || 0;

              const averageRating =
                Number(
                  business?.averageRating ?? reviewStats.averageRating,
                ) ||
                (totalRatings > 0
                  ? Number(
                      (
                        ((Number(reviewStats.oneStar) || 0) * 1 +
                          (Number(reviewStats.twoStars) || 0) * 2 +
                          (Number(reviewStats.threeStars) || 0) * 3 +
                          (Number(reviewStats.fourStars) || 0) * 4 +
                          (Number(reviewStats.fiveStars) || 0) * 5) /
                        totalRatings
                      ).toFixed(1),
                    )
                  : 0);

              return (
                <MotionCard
                  key={id || `${name}-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.035,
                  }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  elevation={0}
                  sx={{
                    minWidth: 0,
                    height: "100%",
                    borderRadius: { xs: 1.8, sm: 2.6 },
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    transition:
                      "box-shadow .25s ease, border-color .25s ease",
                    "&:hover": {
                      boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                      borderColor: "primary.light",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.05, sm: 1.7, md: 2 },
                      "&:last-child": {
                        pb: { xs: 1.05, sm: 1.7, md: 2 },
                      },
                    }}
                  >
                    {/* Business Status */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={0.6}
                    >
                      <Box
                        component={motion.div}
                        whileHover={{ scale: 1.08, rotate: 4 }}
                        sx={{
                          width: { xs: 29, sm: 38 },
                          height: { xs: 29, sm: 38 },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: { xs: 1.2, sm: 1.7 },
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "& svg": {
                            fontSize: { xs: 15, sm: 21 },
                          },
                        }}
                      >
                        <BusinessRoundedIcon />
                      </Box>

                      <Chip
                        size="small"
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? "success" : "default"}
                        sx={{
                          height: { xs: 19, sm: 24 },
                          fontSize: { xs: "0.53rem", sm: "0.64rem" },
                          fontWeight: 800,
                          "& .MuiChip-label": {
                            px: { xs: 0.65, sm: 0.9 },
                          },
                        }}
                      />
                    </Stack>

                    {/* Business Name */}
                    <Typography
                      fontWeight={900}
                      sx={{
                        mt: { xs: 0.8, sm: 1.2 },
                        fontSize: { xs: "0.74rem", sm: "0.95rem" },
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
                        fontSize: { xs: "0.57rem", sm: "0.69rem" },
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
                        mt: { xs: 0.6, sm: 0.9 },
                        maxWidth: "100%",
                        height: { xs: 20, sm: 25 },
                        fontSize: { xs: "0.53rem", sm: "0.64rem" },
                        "& .MuiChip-label": {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    />

                    {/* Ratings */}
                    <Divider sx={{ my: { xs: 0.8, sm: 1.4 } }} />

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
                            fontSize: { xs: 14, sm: 18 },
                            color: "warning.main",
                          }}
                        />

                        <Typography
                          fontWeight={800}
                          sx={{
                            fontSize: { xs: "0.62rem", sm: "0.73rem" },
                          }}
                        >
                          {averageRating.toFixed(1)}
                        </Typography>
                      </Stack>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.56rem", sm: "0.67rem" },
                        }}
                      >
                        {totalRatings} ratings
                      </Typography>
                    </Stack>

                    {/* Location */}
                    {city && (
                      <Stack
                        direction="row"
                        spacing={0.3}
                        alignItems="center"
                        sx={{ mt: 0.5, minWidth: 0 }}
                      >
                        <LocationOnRoundedIcon
                          sx={{
                            fontSize: { xs: 13, sm: 16 },
                            color: "text.secondary",
                          }}
                        />

                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: "0.55rem", sm: "0.67rem" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {city}
                        </Typography>
                      </Stack>
                    )}

                    {/* Public Rating Page */}
                    <Button
                      component="a"
                      href={publicPageUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<OpenInNewRoundedIcon />}
                      disabled={!publicPageUrl}
                      size="small"
                      sx={{
                        mt: { xs: 0.8, sm: 1.3 },
                        minHeight: { xs: 31, sm: 39 },
                        borderRadius: { xs: 1.3, sm: 1.8 },
                        fontSize: { xs: "0.59rem", sm: "0.72rem" },
                        fontWeight: 800,
                      }}
                    >
                      Open Public Page
                    </Button>

                    {/* QR Code */}
                    {businessId && (
                      <QRCodeDownload
                        url={`${window.location.origin}/rate/${encodeURIComponent(
                          businessId,
                        )}`}
                        fileName={`tapreview-${businessId}`}
                      />
                    )}

                    {/* Business Details */}
                    <Button
                      component={Link}
                      to={
                        id
                          ? `/admin/businesses/${id}`
                          : "/admin/businesses"
                      }
                      fullWidth
                      variant="outlined"
                      startIcon={<VisibilityRoundedIcon />}
                      disabled={!id}
                      size="small"
                      sx={{
                        mt: { xs: 0.6, sm: 0.9 },
                        minHeight: { xs: 31, sm: 39 },
                        borderRadius: { xs: 1.3, sm: 1.8 },
                        fontSize: { xs: "0.59rem", sm: "0.72rem" },
                        fontWeight: 800,
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </MotionCard>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <MotionCard
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      elevation={0}
      sx={{
        borderRadius: { xs: 1.7, sm: 2.2 },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 0.95, sm: 1.4 },
          "&:last-child": {
            pb: { xs: 0.95, sm: 1.4 },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.6, sm: 1 }}
          alignItems="center"
        >
          <Box
            sx={{
              width: { xs: 27, sm: 34 },
              height: { xs: 27, sm: 34 },
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              borderRadius: 1.2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "& svg": {
                fontSize: { xs: 15, sm: 19 },
              },
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.55rem", sm: "0.66rem" },
              }}
            >
              {label}
            </Typography>

            <Typography
              fontWeight={900}
              sx={{
                fontSize: { xs: "1rem", sm: "1.35rem" },
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
