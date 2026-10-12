import { useEffect, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";

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

import Dialog from "@mui/material/Dialog";

import DialogTitle from "@mui/material/DialogTitle";

import DialogContent from "@mui/material/DialogContent";

import DialogActions from "@mui/material/DialogActions";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

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

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,

    type: "single",

    business: null,
  });

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const [deleteSuccess, setDeleteSuccess] = useState("");

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

        setError(err?.response?.data?.message || "Unable to load businesses.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const getBusinessId = (business) => business?._id || business?.id || "";

  const openDeleteDialog = (business = null) => {
    setDeleteError("");

    setDeleteSuccess("");

    setDeleteDialog({
      open: true,

      type: business ? "single" : "all",

      business,
    });
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;

    setDeleteDialog({ open: false, type: "single", business: null });
  };

  const handleDeleteBusinesses = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);

    setDeleteError("");

    setDeleteSuccess("");

    try {
      if (deleteDialog.type === "all") {
        const response = await adminService.deleteAllBusinesses();

        setBusinesses([]);

        setDeleteSuccess(
          response?.data?.message || "All businesses deleted successfully.",
        );
      } else {
        const id = getBusinessId(deleteDialog.business);

        if (!id) throw new Error("Business ID is missing.");

        const response = await adminService.deleteBusiness(id);

        setBusinesses((previous) =>
          previous.filter((business) => getBusinessId(business) !== id),
        );

        setDeleteSuccess(
          response?.data?.message || "Business deleted successfully.",
        );
      }

      setDeleteDialog({ open: false, type: "single", business: null });
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete business(es).",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

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

    startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return businesses.filter((business) => {
      const name = business?.businessName || business?.name || "";

      const email = business?.email || "";

      const category = business?.category || business?.businessCategory || "";

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
          return createdAt >= startOfToday && createdAt < startOfTomorrow;

        case "yesterday":
          return createdAt >= startOfYesterday && createdAt < startOfToday;

        case "week":
          return createdAt >= startOfWeek && createdAt < startOfTomorrow;

        case "month":
          return createdAt >= startOfMonth && createdAt < startOfTomorrow;

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
      business?.isActive !== false && business?.status !== "inactive",
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

              borderRadius: 1,

              fontWeight: 700,

              fontSize: { xs: "0.62rem", sm: "0.75rem" },

              flexShrink: 0,
            }}
          >
            Dashboard
          </Button>
        </Stack>
      </MotionBox>

      {deleteSuccess && (
        <Alert
          severity="success"
          onClose={() => setDeleteSuccess("")}
          sx={{ mb: 1.3, borderRadius: 1 }}
        >
          {deleteSuccess}
        </Alert>
      )}

      {deleteError && (
        <Alert
          severity="error"
          onClose={() => setDeleteError("")}
          sx={{ mb: 1.3, borderRadius: 1 }}
        >
          {deleteError}
        </Alert>
      )}

      {/* Error */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.4,

            py: 0.2,

            px: 1,

            borderRadius: 1,

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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        elevation={0}
        sx={{
          mb: { xs: 1, sm: 2 },
          borderRadius: { xs: 1, sm: 1.5 },
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 0.8, sm: 1.5 },
            "&:last-child": {
              pb: { xs: 0.8, sm: 1.5 },
            },
          }}
        >
          <Stack spacing={{ xs: 0.7, sm: 1.1 }}>
            {/* Small search bar */}
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business, email, category..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        fontSize: { xs: 17, sm: 20 },
                        color: "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: { xs: 36, sm: 42 },
                  borderRadius: 2,
                  bgcolor: "background.paper",
                },
                "& .MuiInputBase-input": {
                  fontSize: { xs: "0.72rem", sm: "0.82rem" },
                  py: 0,
                },
                "& .MuiInputBase-input::placeholder": {
                  opacity: 0.7,
                },
              }}
            />

            {/* Date filter and delete button */}
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{ minWidth: 0 }}
            >
              <TextField
                select
                size="small"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter businesses by date"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  "& .MuiOutlinedInput-root": {
                    height: { xs: 34, sm: 40 },
                    borderRadius: 1.7,
                    fontSize: { xs: "0.72rem", sm: "0.8rem" },
                  },
                  "& .MuiSelect-select": {
                    py: 0.7,
                    pr: "28px !important",
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

              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => openDeleteDialog()}
                disabled={loading || deleteLoading || businesses.length === 0}
                sx={{
                  flexShrink: 0,
                  minWidth: 0,
                  minHeight: { xs: 34, sm: 40 },
                  px: { xs: 1, sm: 1.6 },
                  borderRadius: 1.7,
                  fontSize: { xs: "0.67rem", sm: "0.78rem" },
                  fontWeight: 800,
                  textTransform: "none",
                  whiteSpace: "nowrap",
                  "& .MuiButton-startIcon": {
                    mr: { xs: 0.4, sm: 0.7 },
                    ml: 0,
                    "& svg": {
                      fontSize: { xs: 15, sm: 18 },
                    },
                  },
                }}
              >
                Delete All
              </Button>
            </Stack>

            {/* Date range controls */}
            {dateFilter === "between" && (
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <TextField
                  type="date"
                  size="small"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  inputProps={{ "aria-label": "Start date" }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      height: 35,
                      borderRadius: 1.5,
                      fontSize: "0.7rem",
                    },
                  }}
                />

                <TextField
                  type="date"
                  size="small"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  inputProps={{ "aria-label": "End date" }}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      height: 35,
                      borderRadius: 1.5,
                      fontSize: "0.7rem",
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
                    minWidth: 0,
                    px: 0.5,
                    fontSize: "0.68rem",
                    textTransform: "none",
                  }}
                >
                  Clear
                </Button>
              </Stack>
            )}
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
            borderRadius: { xs: 1, sm: 1.5 },

            border: "none",

            borderColor: "transparent",
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
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(3, minmax(0, 1fr))",
              },
              gap: { xs: 1, sm: 1.5, md: 2 },
              alignItems: "stretch",
            }}
          >
            {filteredBusinesses.map((business, index) => {
              const id = business?._id || business?.id;
              const name =
                business?.businessName || business?.name || "Unnamed Business";
              const email = business?.email || "No email";
              const category =
                business?.category || business?.businessCategory || "Business";
              const city = business?.city || "";
              const businessId = business?.businessId || "";

              const logoUrl =
                business?.logo ||
                business?.logoUrl ||
                business?.logoURL ||
                business?.businessLogo ||
                business?.logo?.url ||
                business?.profileImage ||
                "";

              const publicPageUrl = businessId
                ? `/rate/${encodeURIComponent(businessId)}`
                : "";

              const isActive =
                business?.isActive !== false && business?.status !== "inactive";

              const reviewStats = business?.reviewStats || {};
              const totalRatings =
                Number(business?.totalRatings ?? reviewStats.totalRatings) || 0;

              const averageRating =
                Number(business?.averageRating ?? reviewStats.averageRating) ||
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.025 }}
                  whileHover={{ y: -3 }}
                  elevation={0}
                  sx={{
                    height: "100%",
                    minWidth: 0,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: { xs: 1, sm: 1.5 },
                    bgcolor: "background.paper",
                    transition: "border-color .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 8px 24px rgba(15,23,42,0.07)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.4, sm: 1.7 },
                      "&:last-child": {
                        pb: { xs: 1.4, sm: 1.7 },
                      },
                    }}
                  >
                    {/* Business identity */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.1}
                      sx={{ minWidth: 0 }}
                    >
                      <Avatar
                        src={logoUrl || undefined}
                        alt={`${name} logo`}
                        variant="rounded"
                        imgProps={{
                          onError: (event) => {
                            event.currentTarget.style.display = "none";
                          },
                        }}
                        sx={{
                          width: { xs: 48, sm: 54 },
                          height: { xs: 48, sm: 54 },
                          flexShrink: 0,
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          fontWeight: 900,
                          fontSize: "1.15rem",
                          border: "1px solid",
                          borderColor: "divider",
                          "& img": {
                            objectFit: "cover",
                          },
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          fontWeight={850}
                          sx={{
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            lineHeight: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={name}
                        >
                          {name}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.35,
                            fontSize: { xs: "0.7rem", sm: "0.76rem" },
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={email}
                        >
                          {email}
                        </Typography>

                        {city && (
                          <Stack
                            direction="row"
                            spacing={0.35}
                            alignItems="center"
                            sx={{ mt: 0.35, minWidth: 0 }}
                          >
                            <LocationOnRoundedIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography
                              color="text.secondary"
                              sx={{
                                fontSize: "0.68rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {city}
                            </Typography>
                          </Stack>
                        )}
                      </Box>

                      <Chip
                        size="small"
                        label={isActive ? "Active" : "Inactive"}
                        color={isActive ? "success" : "default"}
                        sx={{
                          height: 23,
                          flexShrink: 0,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                    </Stack>

                    {/* Category and rating */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{
                        mt: 1.3,
                        pt: 1.1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        minWidth: 0,
                      }}
                    >
                      <Chip
                        label={category}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          maxWidth: "55%",
                          height: 25,
                          fontSize: "0.68rem",
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        }}
                      />

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.4}
                        sx={{ flexShrink: 0 }}
                      >
                        <StarRoundedIcon
                          sx={{ color: "warning.main", fontSize: 17 }}
                        />
                        <Typography
                          fontWeight={850}
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {averageRating.toFixed(1)}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.68rem" }}
                        >
                          ({totalRatings})
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Public page */}
                    <Button
                      component="a"
                      href={publicPageUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      variant="contained"
                      startIcon={<OpenInNewRoundedIcon />}
                      disabled={!publicPageUrl}
                      size="small"
                      sx={{
                        mt: 1.3,
                        minHeight: 38,
                        borderRadius: 1.5,
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textTransform: "none",
                        boxShadow: "none",
                        "&:hover": { boxShadow: "none" },
                      }}
                    >
                      Open Public Page
                    </Button>

                    {/* QR code actions */}
                    {businessId && (
                      <QRCodeDownload
                        url={`${window.location.origin}/rate/${encodeURIComponent(
                          businessId,
                        )}`}
                        fileName={`tapreview-${businessId}`}
                      />
                    )}

                    {/* Secondary actions */}
                    <Stack direction="row" spacing={0.8} sx={{ mt: 0.8 }}>
                      <Button
                        component={Link}
                        to={
                          id ? `/admin/businesses/${id}` : "/admin/businesses"
                        }
                        fullWidth
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        disabled={!id}
                        size="small"
                        sx={{
                          minWidth: 0,
                          minHeight: 35,
                          borderRadius: 1.5,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          textTransform: "none",
                        }}
                      >
                        View Details
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        disabled={deleteLoading}
                        onClick={() => openDeleteDialog(business)}
                        size="small"
                        sx={{
                          minWidth: 0,
                          minHeight: 35,
                          borderRadius: 1.5,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          textTransform: "none",
                          "& .MuiButton-startIcon": {
                            mr: 0.5,
                          },
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </MotionCard>
              );
            })}
          </Box>
        </>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {deleteDialog.type === "all"
            ? "Delete all businesses?"
            : "Delete this business?"}
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            {deleteDialog.type === "all"
              ? `This will permanently delete all ${businesses.length} business records. This cannot be undone.`
              : `This will permanently delete ${
                  deleteDialog.business?.businessName ||
                  deleteDialog.business?.name ||
                  "this business"
                }. This cannot be undone.`}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteBusinesses}
            disabled={deleteLoading}
            startIcon={
              deleteLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
          >
            {deleteLoading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </Dialog>
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
       borderRadius: { xs: 0.6, sm: 1 },

        border: "none",

        borderColor: "transparent",
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
        <Stack direction="row" spacing={{ xs: 0.6, sm: 1 }} alignItems="center">
          <Box
            sx={{
              width: { xs: 27, sm: 34 },

              height: { xs: 27, sm: 34 },

              flexShrink: 0,

              display: "grid",

              placeItems: "center",

              borderRadius: 0.8,

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
