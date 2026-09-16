import React, { useEffect, useState } from "react";
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
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
  CheckCircle,
  Close,
  DeleteOutline,
  EmailOutlined,
  LocationOnOutlined,
  PhoneOutlined,
  Refresh,
  StorefrontOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";

import {
  getRegistrationRequests,
  getRegistrationRequestById,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "../../services/adminService";

const MotionPaper = motion(Paper);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const RegistrationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [confirmDialog, setConfirmDialog] =
    useState({
      open: false,
      type: null,
      request: null,
    });

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getRegistrationRequests();

      setRequests(
        response?.data?.requests || []
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load registration requests."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleView = async (id) => {
    try {
      setError("");

      const response =
        await getRegistrationRequestById(id);

      setSelectedRequest(
        response?.data?.request || null
      );

      setDetailsOpen(true);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load registration details."
        )
      );
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
    const { type, request } =
      confirmDialog;

    if (type === "approveAll") {
      if (!requests.length) return;

      try {
        setActionLoading("approveAll");
        setError("");
        setSuccess("");

        let approvedCount = 0;
        let failedCount = 0;

        for (const item of requests) {
          try {
            await approveRegistrationRequest(
              item._id
            );

            approvedCount += 1;
          } catch {
            failedCount += 1;
          }
        }

        if (failedCount === 0) {
          setSuccess(
            `${approvedCount} registration ${
              approvedCount === 1
                ? "request has"
                : "requests have"
            } been approved successfully.`
          );

          setRequests([]);
        } else {
          setSuccess(
            `${approvedCount} ${
              approvedCount === 1
                ? "request was"
                : "requests were"
            } approved successfully.`
          );

          await loadRequests();

          setError(
            `${failedCount} ${
              failedCount === 1
                ? "request could not"
                : "requests could not"
            } be approved.`
          );
        }

        closeConfirm();
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Failed to approve all registration requests."
          )
        );
      } finally {
        setActionLoading(null);
      }

      return;
    }

    if (!request?._id || !type) return;

    try {
      setActionLoading(request._id);
      setError("");
      setSuccess("");

      if (type === "approve") {
        const response =
          await approveRegistrationRequest(
            request._id
          );

        setSuccess(
          response?.data?.message ||
            "Business approved successfully."
        );
      }

      if (type === "reject") {
        const response =
          await rejectRegistrationRequest(
            request._id
          );

        setSuccess(
          response?.data?.message ||
            "Registration request rejected successfully."
        );
      }

      setRequests((previous) =>
        previous.filter(
          (item) =>
            item._id !== request._id
        )
      );

      if (
        selectedRequest?._id ===
        request._id
      ) {
        setSelectedRequest(null);
        setDetailsOpen(false);
      }

      closeConfirm();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          `Failed to ${
            type === "approve"
              ? "approve"
              : "reject"
          } registration request.`
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1400,
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "1.5rem",
                sm: "2rem",
              },
            }}
          >
            Registration Requests
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Review and approve new business
            registration requests.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadRequests}
            disabled={
              loading ||
              Boolean(actionLoading)
            }
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Refresh
          </Button>

          {requests.length > 0 && (
            <Button
              variant="contained"
              color="success"
              startIcon={
                actionLoading ===
                "approveAll" ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <CheckCircle />
                )
              }
              onClick={() =>
                openConfirm("approveAll")
              }
              disabled={Boolean(actionLoading)}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              {actionLoading === "approveAll"
                ? "Approving All..."
                : `Approve All (${requests.length})`}
            </Button>
          )}
        </Stack>
      </Box>

      {/* ALERTS */}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
          >
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
              onClose={() =>
                setError("")
              }
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
          >
            <Alert
              severity="success"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
              onClose={() =>
                setSuccess("")
              }
            >
              {success}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}

      {loading ? (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 4,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CheckCircle
            sx={{
              fontSize: 58,
              mb: 2,
              opacity: 0.45,
            }}
          />

          <Typography
            variant="h6"
            fontWeight={800}
          >
            No pending requests
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            New business registration requests
            will appear here.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {requests.map(
            (request, index) => (
              <MotionPaper
                key={request._id}
                elevation={0}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.04,
                }}
                sx={{
                  p: {
                    xs: 2,
                    sm: 2.5,
                  },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition:
                    "all 0.2s ease",
                  "&:hover": {
                    boxShadow:
                      "0 8px 30px rgba(0,0,0,0.07)",
                    transform:
                      "translateY(-2px)",
                  },
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  spacing={2}
                  alignItems={{
                    xs: "stretch",
                    md: "center",
                  }}
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 0.7 }}
                    >
                      <StorefrontOutlined fontSize="small" />

                      <Typography
                        fontWeight={800}
                        sx={{
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {request.businessName ||
                          request.name ||
                          "Unnamed Business"}
                      </Typography>

                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        sx={{
                          fontWeight: 700,
                        }}
                      />
                    </Stack>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={{
                        xs: 0.5,
                        sm: 2,
                      }}
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    >
                      <Typography variant="body2">
                        Owner:{" "}
                        <strong>
                          {request.name ||
                            "—"}
                        </strong>
                      </Typography>

                      <Typography variant="body2">
                        {request.email}
                      </Typography>

                      {request.phone && (
                        <Typography variant="body2">
                          {request.phone}
                        </Typography>
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mt: 1,
                      }}
                    >
                      Submitted{" "}
                      {formatDate(
                        request.createdAt
                      )}
                    </Typography>
                  </Box>

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    spacing={1}
                    sx={{
                      flexShrink: 0,
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={
                        <VisibilityOutlined />
                      }
                      onClick={() =>
                        handleView(
                          request._id
                        )
                      }
                      disabled={Boolean(
                        actionLoading
                      )}
                      sx={{
                        borderRadius: 2,
                        textTransform:
                          "none",
                        fontWeight: 700,
                      }}
                    >
                      View
                    </Button>

                    <Button
                      variant="contained"
                      color="success"
                      startIcon={
                        actionLoading ===
                        request._id ? (
                          <CircularProgress
                            size={18}
                            color="inherit"
                          />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      onClick={() =>
                        openConfirm(
                          "approve",
                          request
                        )
                      }
                      disabled={Boolean(
                        actionLoading
                      )}
                      sx={{
                        borderRadius: 2,
                        textTransform:
                          "none",
                        fontWeight: 700,
                      }}
                    >
                      {actionLoading ===
                      request._id
                        ? "Approving..."
                        : "Approve"}
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={
                        <DeleteOutline />
                      }
                      onClick={() =>
                        openConfirm(
                          "reject",
                          request
                        )
                      }
                      disabled={Boolean(
                        actionLoading
                      )}
                      sx={{
                        borderRadius: 2,
                        textTransform:
                          "none",
                        fontWeight: 700,
                      }}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              </MotionPaper>
            )
          )}
        </Stack>
      )}

      {/* DETAILS DIALOG */}

      <Dialog
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            pr: 6,
          }}
        >
          Registration Details

          <IconButton
            onClick={() =>
              setDetailsOpen(false)
            }
            sx={{
              position: "absolute",
              right: 12,
              top: 12,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedRequest && (
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Business Name
                </Typography>

                <Typography
                  fontWeight={800}
                >
                  {selectedRequest.businessName ||
                    "—"}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Owner Name
                </Typography>

                <Typography>
                  {selectedRequest.name ||
                    "—"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Email
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <EmailOutlined fontSize="small" />

                  <Typography>
                    {selectedRequest.email ||
                      "—"}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Phone
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <PhoneOutlined fontSize="small" />

                  <Typography>
                    {selectedRequest.phone ||
                      "—"}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Category
                </Typography>

                <Typography>
                  {selectedRequest.category ||
                    "—"}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Address
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="flex-start"
                >
                  <LocationOnOutlined fontSize="small" />

                  <Typography>
                    {[
                      selectedRequest.address,
                      selectedRequest.city,
                      selectedRequest.state,
                      selectedRequest.country,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                      "—"}
                  </Typography>
                </Stack>
              </Box>

              {selectedRequest.website && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Website
                  </Typography>

                  <Typography
                    sx={{
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {selectedRequest.website}
                  </Typography>
                </Box>
              )}

              {selectedRequest.description && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Description
                  </Typography>

                  <Typography>
                    {
                      selectedRequest.description
                    }
                  </Typography>
                </Box>
              )}

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Submitted
                </Typography>

                <Typography>
                  {formatDate(
                    selectedRequest.createdAt
                  )}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() =>
              setDetailsOpen(false)
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Close
          </Button>

          {selectedRequest && (
            <>
              <Button
                color="error"
                variant="outlined"
                onClick={() =>
                  openConfirm(
                    "reject",
                    selectedRequest
                  )
                }
                disabled={Boolean(
                  actionLoading
                )}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Reject
              </Button>

              <Button
                color="success"
                variant="contained"
                onClick={() =>
                  openConfirm(
                    "approve",
                    selectedRequest
                  )
                }
                disabled={Boolean(
                  actionLoading
                )}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* CONFIRMATION DIALOG */}

      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {confirmDialog.type ===
          "approveAll"
            ? "Approve All Registrations?"
            : confirmDialog.type ===
              "approve"
            ? "Approve Registration?"
            : "Reject Registration?"}
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            {confirmDialog.type ===
            "approveAll"
              ? `Approve all ${requests.length} pending registration ${
                  requests.length === 1
                    ? "request"
                    : "requests"
                }? Each approved business will be activated and receive an approval email containing its Business ID and login link.`
              : confirmDialog.type ===
                "approve"
              ? `Approve ${
                  confirmDialog.request
                    ?.businessName ||
                  "this business"
                }? The business will be activated and an approval email containing the Business ID and login link will be sent.`
              : `Reject ${
                  confirmDialog.request
                    ?.businessName ||
                  "this registration"
                }? The business will remain inactive.`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={closeConfirm}
            disabled={Boolean(
              actionLoading
            )}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={
              confirmDialog.type ===
                "approve" ||
              confirmDialog.type ===
                "approveAll"
                ? "success"
                : "error"
            }
            onClick={handleAction}
            disabled={Boolean(
              actionLoading
            )}
            startIcon={
              actionLoading ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : confirmDialog.type ===
                  "approve" ||
                confirmDialog.type ===
                  "approveAll" ? (
                <CheckCircle />
              ) : (
                <DeleteOutline />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {actionLoading
              ? confirmDialog.type ===
                "approveAll"
                ? "Approving All..."
                : "Processing..."
              : confirmDialog.type ===
                "approveAll"
              ? "Approve All"
              : confirmDialog.type ===
                "approve"
              ? "Approve"
              : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistrationRequests;