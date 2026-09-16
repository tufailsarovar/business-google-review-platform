import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import adminService from "../../services/adminService";

const MotionCard = motion(Card);

export default function ManageBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedBusiness, setSelectedBusiness] =
    useState(null);
  const [actionLoading, setActionLoading] =
    useState(false);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await adminService.getBusinesses();

      const data =
        response?.data?.businesses ||
        response?.data ||
        response ||
        [];

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load businesses."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(
    business => {
      const active =
        business?.isActive !== false &&
        business?.status !== "inactive";

      if (statusFilter === "active") {
        return active;
      }

      if (statusFilter === "inactive") {
        return !active;
      }

      return true;
    }
  );

  const openActionDialog = business => {
    setActionError("");
    setSelectedBusiness(business);
  };

  const closeActionDialog = () => {
    if (!actionLoading) {
      setSelectedBusiness(null);
      setActionError("");
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedBusiness) return;

    const id =
      selectedBusiness?._id ||
      selectedBusiness?.id;

    if (!id) {
      setActionError("Business ID is missing.");
      return;
    }

    const currentlyActive =
      selectedBusiness?.isActive !== false &&
      selectedBusiness?.status !== "inactive";

    try {
      setActionLoading(true);
      setActionError("");

      if (currentlyActive) {
        await adminService.deactivateBusiness(id);
      } else {
        await adminService.activateBusiness(id);
      }

      setSelectedBusiness(null);
      await loadBusinesses();
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          "Unable to update business status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 2,
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <BusinessRoundedIcon color="primary" />

            <Typography
              color="primary"
              fontWeight={800}
              fontSize={14}
            >
              BUSINESS CONTROL
            </Typography>
          </Stack>

          <Typography
            component="h1"
            variant="h4"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: "1.8rem",
                sm: "2.3rem",
              },
            }}
          >
            Manage Businesses
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              lineHeight: 1.7,
            }}
          >
            Control business account availability from the
            admin panel.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRoundedIcon />}
          onClick={loadBusinesses}
          disabled={loading}
          sx={{
            minHeight: 44,
            borderRadius: 2.5,
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <FormControl
            fullWidth
            size="small"
            sx={{ maxWidth: 300 }}
          >
            <InputLabel id="business-status-filter">
              Status
            </InputLabel>

            <Select
              labelId="business-status-filter"
              value={statusFilter}
              label="Status"
              onChange={event =>
                setStatusFilter(event.target.value)
              }
            >
              <MenuItem value="all">
                All Businesses
              </MenuItem>

              <MenuItem value="active">
                Active Businesses
              </MenuItem>

              <MenuItem value="inactive">
                Inactive Businesses
              </MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <Box
          sx={{
            minHeight: "30vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : filteredBusinesses.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent
            sx={{
              p: 5,
              textAlign: "center",
            }}
          >
            <BusinessRoundedIcon
              sx={{
                fontSize: 48,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mt: 1 }}
            >
              No businesses found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              There are no businesses matching the selected
              status.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
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
                "No email provided";

              const category =
                business?.category ||
                business?.businessCategory ||
                "Business";

              const active =
                business?.isActive !== false &&
                business?.status !== "inactive";

              return (
                <Grid
                  key={id || `${name}-${index}`}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <MotionCard
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.04,
                    }}
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 3,
                            backgroundColor:
                              "primary.main",
                            color:
                              "primary.contrastText",
                          }}
                        >
                          <BusinessRoundedIcon />
                        </Box>

                        <Chip
                          label={
                            active
                              ? "Active"
                              : "Inactive"
                          }
                          size="small"
                          color={
                            active
                              ? "success"
                              : "default"
                          }
                        />
                      </Stack>

                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{
                          mt: 2,
                          wordBreak: "break-word",
                        }}
                      >
                        {name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.75,
                          wordBreak: "break-word",
                        }}
                      >
                        {email}
                      </Typography>

                      <Chip
                        label={category}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1.5 }}
                      />

                      <Divider sx={{ my: 2.5 }} />

                      <Button
                        fullWidth
                        variant={
                          active
                            ? "outlined"
                            : "contained"
                        }
                        color={
                          active
                            ? "error"
                            : "success"
                        }
                        startIcon={
                          active ? (
                            <BlockRoundedIcon />
                          ) : (
                            <CheckCircleRoundedIcon />
                          )
                        }
                        disabled={!id}
                        onClick={() =>
                          openActionDialog(business)
                        }
                        sx={{
                          minHeight: 44,
                          borderRadius: 2.5,
                        }}
                      >
                        {active
                          ? "Deactivate Business"
                          : "Activate Business"}
                      </Button>
                    </CardContent>
                  </MotionCard>
                </Grid>
              );
            }
          )}
        </Grid>
      )}

      {/* Confirmation dialog */}
      <Dialog
        open={Boolean(selectedBusiness)}
        onClose={closeActionDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight={800}>
          {selectedBusiness?.isActive !== false &&
          selectedBusiness?.status !== "inactive"
            ? "Deactivate Business?"
            : "Activate Business?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            {selectedBusiness?.isActive !== false &&
            selectedBusiness?.status !== "inactive"
              ? `This will make ${
                  selectedBusiness?.businessName ||
                  selectedBusiness?.name ||
                  "this business"
                } inactive.`
              : `This will make ${
                  selectedBusiness?.businessName ||
                  selectedBusiness?.name ||
                  "this business"
                } active again.`}
          </Typography>

          {actionError && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                borderRadius: 2,
              }}
            >
              {actionError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeActionDialog}
            disabled={actionLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleToggleStatus}
            variant="contained"
            color={
              selectedBusiness?.isActive !== false &&
              selectedBusiness?.status !== "inactive"
                ? "error"
                : "success"
            }
            disabled={actionLoading}
          >
            {actionLoading
              ? "Updating..."
              : selectedBusiness?.isActive !== false &&
                  selectedBusiness?.status !== "inactive"
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}