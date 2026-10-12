import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  CheckCircle,
  Close,
  DeleteOutline,
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  Refresh,
  Search,
  StorefrontOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "../../services/adminService";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRequestId = (request) => request?._id || request?.id;

const getBusinessName = (request) =>
  request?.businessName || request?.name || "Unnamed Business";

export default function RegistrationRequests() {
  const reduceMotion = useReducedMotion();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    request: null,
  });

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRegistrationRequests();
      const data = response?.data?.requests ?? response?.data ?? [];

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load registration requests."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleView = async (id) => {
    if (!id) {
      setError("Registration request ID is missing.");
      return;
    }

    try {
      setError("");

      const response = await getRegistrationRequestById(id);
      const request = response?.data?.request || null;

      if (!request) {
        setError("Registration details were not found.");
        return;
      }

      setSelectedRequest(request);
      setDetailsOpen(true);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load registration details."));
    }
  };

  const openConfirm = (type, request = null) => {
    setSuccess("");
    setError("");

    setConfirmDialog({
      open: true,
      type,
      request,
    });
  };

  const closeConfirm = () => {
    if (actionLoading) return;

    setConfirmDialog({
      open: false,
      type: null,
      request: null,
    });
  };

  const handleAction = async () => {
    const { type, request } = confirmDialog;

    if (!type || actionLoading) return;

    if (type === "approveAll") {
      if (!requests.length) return;

      try {
        setActionLoading("approveAll");
        setError("");
        setSuccess("");

        let approvedCount = 0;
        let failedCount = 0;

        for (const item of requests) {
          const id = getRequestId(item);

          if (!id) {
            failedCount += 1;
            continue;
          }

          try {
            await approveRegistrationRequest(id);
            approvedCount += 1;
          } catch {
            failedCount += 1;
          }
        }

        if (failedCount === 0) {
          setSuccess(
            `${approvedCount} registration ${
              approvedCount === 1 ? "request has" : "requests have"
            } been approved successfully.`,
          );
          setRequests([]);
        } else {
          setSuccess(
            `${approvedCount} ${
              approvedCount === 1 ? "request was" : "requests were"
            } approved successfully.`,
          );

          await loadRequests();

          setError(
            `${failedCount} ${
              failedCount === 1 ? "request could not" : "requests could not"
            } be approved.`,
          );
        }

        setConfirmDialog({
          open: false,
          type: null,
          request: null,
        });
      } catch (err) {
        setError(
          getErrorMessage(err, "Failed to approve all registration requests."),
        );
      } finally {
        setActionLoading(null);
      }

      return;
    }

    const id = getRequestId(request);

    if (!id || !["approve", "reject"].includes(type)) return;

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      if (type === "approve") {
        const response = await approveRegistrationRequest(id);

        setSuccess(
          response?.data?.message || "Business approved successfully.",
        );
      } else {
        const response = await rejectRegistrationRequest(id);

        setSuccess(
          response?.data?.message ||
            "Registration request rejected successfully.",
        );
      }

      setRequests((previous) =>
        previous.filter((item) => getRequestId(item) !== id),
      );

      if (getRequestId(selectedRequest) === id) {
        setSelectedRequest(null);
        setDetailsOpen(false);
      }

      setConfirmDialog({
        open: false,
        type: null,
        request: null,
      });
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Failed to ${
            type === "approve" ? "approve" : "reject"
          } registration request.`,
        ),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const enterAnimation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.22 },
      };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  const confirmType = confirmDialog.type;
  const confirmRequest = confirmDialog.request;

  const filteredRequests = requests.filter((request) => {
    // Search by business, owner, email, or phone
    const query = searchQuery.trim().toLowerCase();

    const searchableText = [
      request.businessName,
      request.name,
      request.email,
      request.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (query && !searchableText.includes(query)) {
      return false;
    }

    // Date range filtering uses local calendar dates
    if (dateFilter === "all") return true;

    if (!request.createdAt) return false;

    const createdAt = new Date(request.createdAt);

    if (Number.isNaN(createdAt.getTime())) return false;

    const now = new Date();

    const startOfDay = (date) => {
      const result = new Date(date);
      result.setHours(0, 0, 0, 0);
      return result;
    };

    const today = startOfDay(now);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateFilter === "today") {
      return createdAt >= today && createdAt < tomorrow;
    }

    if (dateFilter === "yesterday") {
      return createdAt >= yesterday && createdAt < today;
    }

    if (dateFilter === "week") {
      const weekStart = new Date(today);
      const day = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1));

      return createdAt >= weekStart && createdAt < tomorrow;
    }

    if (dateFilter === "lastMonth") {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      return createdAt >= monthStart && createdAt < currentMonthStart;
    }

    if (dateFilter === "custom") {
      if (customStartDate) {
        const start = new Date(`${customStartDate}T00:00:00`);
        if (createdAt < start) return false;
      }

      if (customEndDate) {
        const end = new Date(`${customEndDate}T00:00:00`);
        end.setDate(end.getDate() + 1);

        if (createdAt >= end) return false;
      }

      return true;
    }

    return true;
  });

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        minWidth: 0,
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 1.5, sm: 2.5 },
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <MotionBox {...enterAnimation} sx={{ mb: { xs: 1.5, sm: 2.5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              color="primary"
              fontWeight={800}
              sx={{
                fontSize: { xs: "0.61rem", sm: "0.72rem" },
                letterSpacing: "0.07em",
                mb: 0.35,
              }}
            >
              BUSINESS APPROVALS
            </Typography>

            <Typography
              component="h1"
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.8rem",
                  md: "2rem",
                },
                letterSpacing: "-0.035em",
                lineHeight: 1.2,
              }}
            >
              Registration Requests
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.4,
                fontSize: { xs: "0.68rem", sm: "0.82rem" },
                lineHeight: 1.5,
              }}
            >
              Review and manage new business registrations.
            </Typography>
          </Box>

          <IconButton
            aria-label="Refresh registration requests"
            onClick={loadRequests}
            disabled={loading || Boolean(actionLoading)}
            sx={{
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.2,
              flexShrink: 0,
            }}
          >
            <Refresh sx={{ fontSize: { xs: 18, sm: 21 } }} />
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 1.3 }}
        >
          <Chip
            label={`${requests.length} pending`}
            size="small"
            color={requests.length ? "warning" : "default"}
            sx={{
              height: 24,
              borderRadius: 0.9,
              fontWeight: 800,
              fontSize: "0.68rem",
            }}
          />

          {requests.length > 0 && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={
                actionLoading === "approveAll" ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CheckCircle />
                )
              }
              onClick={() => openConfirm("approveAll")}
              disabled={Boolean(actionLoading)}
              sx={{
                minHeight: 33,
                px: 1.1,
                borderRadius: 1,
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontWeight: 800,
                textTransform: "none",
                "& .MuiButton-startIcon": {
                  mr: 0.5,
                  "& svg": { fontSize: 16 },
                },
              }}
            >
              {actionLoading === "approveAll"
                ? "Approving..."
                : `Approve All (${requests.length})`}
            </Button>
          )}
        </Stack>
      </MotionBox>

      {/* Alerts */}
      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            key="registration-error"
            initial={reduceMotion ? false : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -5 }}
          >
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{
                mb: 1.2,
                py: 0,
                borderRadius: 1.2,
                fontSize: "0.77rem",
                "& .MuiAlert-message": { py: 0.7 },
              }}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="registration-success"
            initial={reduceMotion ? false : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? {} : { opacity: 0, y: -5 }}
          >
            <Alert
              severity="success"
              onClose={() => setSuccess("")}
              sx={{
                mb: 1.2,
                py: 0,
                borderRadius: 1.2,
                fontSize: "0.77rem",
                "& .MuiAlert-message": { py: 0.7 },
              }}
            >
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and date filters */}
      <Paper
        elevation={0}
        sx={{
          mb: { xs: 1.2, sm: 1.8 },
          p: { xs: 1, sm: 1.5 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1.5,
        }}
      >
        <Stack spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search business, owner, email or phone..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={{
                      fontSize: 19,
                      color: "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 1.1,
                fontSize: { xs: "0.73rem", sm: "0.82rem" },
                minHeight: 39,
              },
            }}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={0.8}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.1,
                  fontSize: { xs: "0.73rem", sm: "0.8rem" },
                  minHeight: 38,
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.78rem",
                },
              }}
            >
              <MenuItem value="all">All dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="yesterday">Yesterday</MenuItem>
              <MenuItem value="week">This week</MenuItem>
              <MenuItem value="lastMonth">Last month</MenuItem>
              <MenuItem value="custom">Custom date range</MenuItem>
            </TextField>

            {dateFilter === "custom" && (
              <>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="From"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.1,
                      fontSize: "0.75rem",
                      minHeight: 38,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="To"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  slotProps={{
                    inputLabel: { shrink: true },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.1,
                      fontSize: "0.75rem",
                      minHeight: 38,
                    },
                  }}
                />
              </>
            )}

            {(searchQuery || dateFilter !== "all") && (
              <Button
                size="small"
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter("all");
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                sx={{
                  minHeight: 36,
                  borderRadius: 1,
                  textTransform: "none",
                  flexShrink: 0,
                }}
              >
                Clear
              </Button>
            )}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              {filteredRequests.length} of {requests.length} requests
            </Typography>

            <CalendarMonth sx={{ fontSize: 17, color: "text.secondary" }} />
          </Stack>
        </Stack>
      </Paper>

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            minHeight: "24vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress size={26} thickness={4} />
        </Box>
      ) : filteredRequests.length === 0 ? (
        /* Empty state */
        <Paper
          elevation={0}
          sx={{
            minHeight: { xs: 190, sm: 250 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 2.5,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              width: 45,
              height: 45,
              display: "grid",
              placeItems: "center",
              bgcolor: "success.light",
              color: "success.dark",
              borderRadius: 1.2,
              mb: 1.2,
            }}
          >
            <CheckCircle sx={{ fontSize: 25 }} />
          </Box>

          <Typography variant="h6" fontWeight={800}>
            {requests.length === 0
              ? "No pending requests"
              : "No matching requests"}
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {requests.length === 0
              ? "New business registration requests will appear here."
              : "Try a different search term or date range."}
          </Typography>
        </Paper>
      ) : (
        /* Registration cards */
        <Stack spacing={{ xs: 1, sm: 1.3 }}>
          {filteredRequests.map((request, index) => {
            const id = getRequestId(request);
            const name = getBusinessName(request);
            const owner = request.name || "—";
            const email = request.email || "No email provided";
            const phone = request.phone || "";
            const busy = actionLoading === id;

            return (
              <MotionPaper
                key={id || `${name}-${index}`}
                elevation={0}
                {...(reduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 8 },
                      animate: { opacity: 1, y: 0 },
                      transition: {
                        duration: 0.22,
                        delay: Math.min(index * 0.025, 0.2),
                      },
                      whileHover: { y: -1 },
                    })}
                sx={{
                  p: { xs: 1.1, sm: 1.7 },
                  minWidth: 0,
                  borderRadius: { xs: 1.2, sm: 1.5 },
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "border-color .2s ease",
                  "&:hover": {
                    borderColor: "primary.light",
                  },
                }}
              >
                <Stack spacing={1.1}>
                  {/* Name and status */}
                  <Stack direction="row" alignItems="flex-start" spacing={0.9}>
                    <Box
                      sx={{
                        width: { xs: 32, sm: 39 },
                        height: { xs: 32, sm: 39 },
                        flexShrink: 0,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "action.hover",
                        color: "primary.main",
                        borderRadius: 1,
                      }}
                    >
                      <StorefrontOutlined
                        sx={{ fontSize: { xs: 18, sm: 22 } }}
                      />
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        fontWeight={850}
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "0.95rem" },
                          lineHeight: 1.35,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {name}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 0.2,
                          fontSize: { xs: "0.64rem", sm: "0.75rem" },
                        }}
                      >
                        Owner: {owner}
                      </Typography>
                    </Box>

                    <Chip
                      label="Pending"
                      color="warning"
                      size="small"
                      sx={{
                        height: 21,
                        flexShrink: 0,
                        borderRadius: 0.8,
                        fontSize: { xs: "0.58rem", sm: "0.66rem" },
                        fontWeight: 800,
                        "& .MuiChip-label": { px: 0.8 },
                      }}
                    />
                  </Stack>

                  <Divider />

                  {/* Contact details */}
                  <Stack spacing={0.65}>
                    <Stack
                      direction="row"
                      spacing={0.8}
                      alignItems="flex-start"
                    >
                      <EmailOutlined
                        sx={{
                          fontSize: 16,
                          color: "text.secondary",
                          mt: "1px",
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "0.67rem", sm: "0.78rem" },
                          overflowWrap: "anywhere",
                          minWidth: 0,
                        }}
                      >
                        {email}
                      </Typography>
                    </Stack>

                    {phone && (
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <PhoneOutlined
                          sx={{
                            fontSize: 16,
                            color: "text.secondary",
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: { xs: "0.67rem", sm: "0.78rem" },
                            overflowWrap: "anywhere",
                          }}
                        >
                          {phone}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.59rem", sm: "0.7rem" },
                      lineHeight: 1.4,
                    }}
                  >
                    Submitted {formatDate(request.createdAt)}
                  </Typography>

                  <Divider />

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "repeat(3, minmax(0, 1fr))",
                        sm: "repeat(3, minmax(95px, auto))",
                      },
                      gap: 0.65,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityOutlined />}
                      onClick={() => handleView(id)}
                      disabled={Boolean(actionLoading) || !id}
                      sx={actionButtonSx}
                    >
                      View
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={
                        busy ? (
                          <CircularProgress size={13} color="inherit" />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      onClick={() => openConfirm("approve", request)}
                      disabled={Boolean(actionLoading) || !id}
                      sx={actionButtonSx}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutline />}
                      onClick={() => openConfirm("reject", request)}
                      disabled={Boolean(actionLoading) || !id}
                      sx={actionButtonSx}
                    >
                      Reject
                    </Button>
                  </Box>
                </Stack>
              </MotionPaper>
            );
          })}
        </Stack>
      )}

      {/* Registration details dialog */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "100%" },
            maxHeight: "90dvh",
            borderRadius: { xs: 1.5, sm: 2 },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 1.5, sm: 2 },
            fontWeight: 850,
            fontSize: { xs: "1rem", sm: "1.15rem" },
            pr: 6,
          }}
        >
          Registration Details
          <IconButton
            aria-label="Close registration details"
            onClick={closeDetails}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              width: 34,
              height: 34,
              borderRadius: 1,
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2 } }}>
          {selectedRequest && (
            <Stack spacing={1.5}>
              <DetailRow
                label="Business Name"
                value={selectedRequest.businessName || "—"}
              />

              <Divider />

              <DetailRow
                label="Owner Name"
                value={selectedRequest.name || "—"}
              />

              <Divider />

              <DetailRow
                label="Email"
                value={selectedRequest.email || "—"}
                icon={<EmailOutlined />}
              />

              <Divider />

              <DetailRow
                label="Phone"
                value={selectedRequest.phone || "—"}
                icon={<PhoneOutlined />}
              />

              <Divider />

              <DetailRow
                label="Category"
                value={selectedRequest.category || "—"}
              />

              <Divider />

              <DetailRow
                label="Address"
                value={
                  [
                    selectedRequest.address,
                    selectedRequest.city,
                    selectedRequest.state,
                    selectedRequest.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
                icon={<LocationOnOutlined />}
              />

              {selectedRequest.website && (
                <>
                  <Divider />
                  <DetailRow label="Website" value={selectedRequest.website} />
                </>
              )}

              {selectedRequest.description && (
                <>
                  <Divider />
                  <DetailRow
                    label="Description"
                    value={selectedRequest.description}
                  />
                </>
              )}

              <Divider />

              <DetailRow
                label="Submitted"
                value={formatDate(selectedRequest.createdAt)}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 1.2, sm: 1.5 },
            gap: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Button onClick={closeDetails} size="small" sx={actionButtonSx}>
            Close
          </Button>

          {selectedRequest && (
            <>
              <Button
                color="error"
                variant="outlined"
                size="small"
                onClick={() => openConfirm("reject", selectedRequest)}
                disabled={Boolean(actionLoading)}
                sx={actionButtonSx}
              >
                Reject
              </Button>

              <Button
                color="success"
                variant="contained"
                size="small"
                onClick={() => openConfirm("approve", selectedRequest)}
                disabled={Boolean(actionLoading)}
                sx={actionButtonSx}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 2 },
            width: { xs: "calc(100% - 24px)", sm: "100%" },
            borderRadius: 1.5,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 1.5, sm: 2 },
            fontWeight: 850,
            fontSize: { xs: "0.98rem", sm: "1.1rem" },
          }}
        >
          {confirmType === "approveAll"
            ? "Approve All Registrations?"
            : confirmType === "approve"
              ? "Approve Registration?"
              : "Reject Registration?"}
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.77rem", sm: "0.85rem" },
              lineHeight: 1.7,
              overflowWrap: "anywhere",
            }}
          >
            {confirmType === "approveAll"
              ? `Approve all ${requests.length} pending registration ${
                  requests.length === 1 ? "request" : "requests"
                }? Each approved business will be activated and receive an approval email containing its Business ID and login link.`
              : confirmType === "approve"
                ? `Approve ${
                    confirmRequest?.businessName || "this business"
                  }? The business will be activated and an approval email containing the Business ID and login link will be sent.`
                : `Reject ${
                    confirmRequest?.businessName || "this registration"
                  }? The business will remain inactive.`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 1.2, sm: 1.5 },
            gap: 0.5,
          }}
        >
          <Button
            onClick={closeConfirm}
            disabled={Boolean(actionLoading)}
            size="small"
            sx={actionButtonSx}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={
              confirmType === "approve" || confirmType === "approveAll"
                ? "success"
                : "error"
            }
            onClick={handleAction}
            disabled={Boolean(actionLoading)}
            size="small"
            startIcon={
              actionLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : confirmType === "approve" || confirmType === "approveAll" ? (
                <CheckCircle />
              ) : (
                <DeleteOutline />
              )
            }
            sx={{
              ...actionButtonSx,
              minWidth: 95,
            }}
          >
            {actionLoading
              ? confirmType === "approveAll"
                ? "Approving..."
                : "Processing..."
              : confirmType === "approveAll"
                ? "Approve All"
                : confirmType === "approve"
                  ? "Approve"
                  : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const actionButtonSx = {
  minWidth: 0,
  minHeight: { xs: 31, sm: 35 },
  px: { xs: 0.45, sm: 1.1 },
  borderRadius: 1,
  fontSize: { xs: "0.61rem", sm: "0.73rem" },
  fontWeight: 750,
  lineHeight: 1.25,
  textTransform: "none",
  whiteSpace: "nowrap",
  "& .MuiButton-startIcon": {
    mr: { xs: 0.3, sm: 0.55 },
    ml: 0,
    "& svg": {
      fontSize: { xs: 14, sm: 17 },
    },
  },
};

function DetailRow({ label, value, icon }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        color="text.secondary"
        sx={{
          mb: 0.45,
          fontSize: { xs: "0.66rem", sm: "0.73rem" },
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Stack
        direction="row"
        spacing={0.8}
        alignItems="flex-start"
        sx={{ minWidth: 0 }}
      >
        {icon && (
          <Box
            sx={{
              color: "primary.main",
              display: "flex",
              mt: "2px",
              flexShrink: 0,
              "& svg": { fontSize: 17 },
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          sx={{
            minWidth: 0,
            fontSize: { xs: "0.78rem", sm: "0.86rem" },
            lineHeight: 1.6,
            overflowWrap: "anywhere",
            whiteSpace: "pre-wrap",
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Box>
  );
}
