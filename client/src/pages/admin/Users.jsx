import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
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

import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";

import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import adminService from "../../services/adminService";

import Dialog from "@mui/material/Dialog";

import DialogTitle from "@mui/material/DialogTitle";

import DialogContent from "@mui/material/DialogContent";

import DialogActions from "@mui/material/DialogActions";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const MotionCard = motion(Card);

const MotionBox = motion(Box);

const getUserName = (user) =>
  user?.name ||
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  "Unnamed User";

const getUserId = (user) => user?._id || user?.id || "";

const getUserRole = (user) => user?.role || user?.userType || "business";

const getInitials = (name) =>
  name

    .split(" ")

    .filter(Boolean)

    .slice(0, 2)

    .map((word) => word.charAt(0).toUpperCase())

    .join("") || "U";

export default function Users() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,

    type: "single",

    user: null,
  });

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  const [deleteSuccess, setDeleteSuccess] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminService.getUsers();

      const data = response?.data?.users || response?.data || response || [];

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) => {
      const name = getUserName(user).toLowerCase();

      const email = (user?.email || "").toLowerCase();

      const phone = (user?.phone || user?.mobile || "").toLowerCase();

      const role = getUserRole(user).toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        phone.includes(query) ||
        role.includes(query)
      );
    });
  }, [users, search]);

  const businessUsers = users.filter(
    (user) => getUserRole(user).toLowerCase() === "business",
  ).length;

  const adminUsers = users.filter(
    (user) => getUserRole(user).toLowerCase() === "admin",
  ).length;

  const activeUsers = users.filter(
    (user) => user?.isActive !== false && user?.status !== "inactive",
  ).length;

  const openDeleteDialog = (user = null) => {
    setDeleteError("");

    setDeleteSuccess("");

    setDeleteDialog({
      open: true,

      type: user ? "single" : "all",

      user,
    });
  };

  const closeDeleteDialog = () => {
    if (deleteLoading) return;

    setDeleteDialog({
      open: false,

      type: "single",

      user: null,
    });
  };

  const handleDeleteUsers = async () => {
    if (deleteLoading) return;

    setDeleteLoading(true);

    setDeleteError("");

    setDeleteSuccess("");

    try {
      if (deleteDialog.type === "all") {
        const response = await adminService.deleteAllUsers();

        setUsers([]);

        setDeleteSuccess(
          response?.data?.message || "All users deleted successfully.",
        );
      } else {
        const id = getUserId(deleteDialog.user);

        if (!id) throw new Error("User ID is missing.");

        const response = await adminService.deleteUser(id);

        setUsers((previous) =>
          previous.filter((user) => getUserId(user) !== id),
        );

        setDeleteSuccess(
          response?.data?.message || "User deleted successfully.",
        );
      }

      setDeleteDialog({
        open: false,

        type: "single",

        user: null,
      });
    } catch (error) {
      setDeleteError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to delete user(s).",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

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
            xs: 1.4,

            sm: 2.3,

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
              sx={{ mb: 0.35 }}
            >
              <PeopleRoundedIcon
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
                USER MANAGEMENT
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
              Users
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.3,

                fontSize: {
                  xs: "0.67rem",

                  sm: "0.84rem",
                },

                lineHeight: 1.45,
              }}
            >
              View registered accounts and their information.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              <RefreshRoundedIcon
                sx={{
                  fontSize: {
                    xs: 15,

                    sm: 18,
                  },
                }}
              />
            }
            onClick={loadUsers}
            disabled={loading}
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
                xs: "0.61rem",

                sm: "0.75rem",
              },

              flexShrink: 0,
            }}
          >
            Refresh
          </Button>
        </Stack>
      </MotionBox>

      {deleteSuccess && (
        <Alert
          severity="success"
          onClose={() => setDeleteSuccess("")}
          sx={{ mb: 1.3, borderRadius: 1.2 }}
        >
          {deleteSuccess}
        </Alert>
      )}

      {deleteError && (
        <Alert
          severity="error"
          onClose={() => setDeleteError("")}
          sx={{ mb: 1.3, borderRadius: 1.2 }}
        >
          {deleteError}
        </Alert>
      )}

      {/* Error */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 1.3,

            py: 0.2,

            px: 1,

            borderRadius: 1.7,

            fontSize: {
              xs: "0.66rem",

              sm: "0.78rem",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* Stats */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",

            sm: "repeat(4, minmax(0, 1fr))",
          },

          gap: {
            xs: 0.8,

            sm: 1.3,
          },

          mb: {
            xs: 1.2,

            sm: 1.8,
          },
        }}
      >
        <MiniStat
          icon={<PeopleRoundedIcon />}
          label="Total"
          value={users.length}
        />

        <MiniStat
          icon={<BusinessRoundedIcon />}
          label="Businesses"
          value={businessUsers}
        />

        <MiniStat
          icon={<AdminPanelSettingsRoundedIcon />}
          label="Admins"
          value={adminUsers}
        />

        <MiniStat
          icon={<PersonRoundedIcon />}
          label="Active"
          value={activeUsers}
        />
      </Box>

      {/* Search */}

      <MotionCard
        initial={{
          opacity: 0,

          y: 8,
        }}
        animate={{
          opacity: 1,

          y: 0,
        }}
        transition={{
          duration: 0.3,
        }}
        elevation={0}
        sx={{
          mb: {
            xs: 1.3,

            sm: 2,
          },

          borderRadius: {
            xs: 1.8,

            sm: 2.6,
          },

          border: "1px solid",

          borderColor: "divider",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1,

              sm: 1.5,
            },

            "&:last-child": {
              pb: {
                xs: 1,

                sm: 1.5,
              },
            },
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 0.6, sm: 1 }}
            alignItems="center"
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone or role..."
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
                  minHeight: {
                    xs: 37,

                    sm: 42,
                  },

                  borderRadius: {
                    xs: 1.4,

                    sm: 1.8,
                  },
                },

                "& input": {
                  fontSize: {
                    xs: "0.66rem",

                    sm: "0.77rem",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => openDeleteDialog()}
              disabled={loading || deleteLoading || users.length === 0}
              sx={{
                minWidth: { xs: 0, sm: 125 },
                minHeight: { xs: 37, sm: 42 },
                px: { xs: 1, sm: 1.5 },
                flexShrink: 0,
                borderRadius: 1.5,
                fontWeight: 800,
                fontSize: { xs: "0.65rem", sm: "0.78rem" },
                textTransform: "none",
                whiteSpace: "nowrap",
                "& .MuiButton-startIcon": {
                  mr: { xs: 0.4, sm: 0.7 },
                  ml: 0,
                  "& svg": { fontSize: { xs: 16, sm: 18 } },
                },
              }}
            >
              Delete All
            </Button>
          </Stack>
        </CardContent>
      </MotionCard>

      {/* Users */}

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
      ) : filteredUsers.length === 0 ? (
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
            <PeopleRoundedIcon
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
                mt: 0.6,

                fontSize: {
                  xs: "0.85rem",

                  sm: "1rem",
                },
              }}
            >
              No users found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.3,

                fontSize: {
                  xs: "0.63rem",

                  sm: "0.74rem",
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

              sm: 1.4,

              md: 2,
            },
          }}
        >
          {filteredUsers.map((user, index) => {
            const name = getUserName(user);

            const email = user?.email || "No email";

            const phone = user?.phone || user?.mobile || "No phone";

            const role = getUserRole(user);

            const isAdmin = role.toLowerCase() === "admin";

            const isActive =
              user?.isActive !== false && user?.status !== "inactive";

            return (
              <MotionCard
                key={user?._id || user?.id || `${email}-${index}`}
                initial={{
                  opacity: 0,

                  y: 14,
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

                    sm: 2.5,
                  },

                  border: "1px solid",

                  borderColor: "divider",

                  overflow: "hidden",

                  transition: "box-shadow .25s ease, border-color .25s ease",

                  "&:hover": {
                    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",

                    borderColor: "primary.light",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 1,

                      sm: 1.6,

                      md: 1.9,
                    },

                    "&:last-child": {
                      pb: {
                        xs: 1,

                        sm: 1.6,

                        md: 1.9,
                      },
                    },
                  }}
                >
                  {/* User header */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={0.5}
                  >
                    <Stack
                      direction="row"
                      spacing={{
                        xs: 0.55,

                        sm: 0.9,
                      }}
                      alignItems="center"
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Avatar
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

                          fontSize: {
                            xs: "0.63rem",

                            sm: "0.8rem",
                          },

                          fontWeight: 900,

                          bgcolor: isAdmin ? "secondary.main" : "primary.main",
                        }}
                      >
                        {getInitials(name)}
                      </Avatar>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          fontWeight={900}
                          sx={{
                            fontSize: {
                              xs: "0.7rem",

                              sm: "0.88rem",
                            },

                            lineHeight: 1.2,

                            overflow: "hidden",

                            textOverflow: "ellipsis",

                            whiteSpace: "nowrap",
                          }}
                        >
                          {name}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.15,

                            fontSize: {
                              xs: "0.53rem",

                              sm: "0.66rem",
                            },

                            overflow: "hidden",

                            textOverflow: "ellipsis",

                            whiteSpace: "nowrap",
                          }}
                        >
                          {email}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      label={isActive ? "Active" : "Inactive"}
                      color={isActive ? "success" : "default"}
                      sx={{
                        height: {
                          xs: 18,

                          sm: 23,
                        },

                        flexShrink: 0,

                        fontSize: {
                          xs: "0.5rem",

                          sm: "0.62rem",
                        },

                        fontWeight: 800,

                        "& .MuiChip-label": {
                          px: {
                            xs: 0.55,

                            sm: 0.8,
                          },
                        },
                      }}
                    />
                  </Stack>

                  <Divider
                    sx={{
                      my: {
                        xs: 0.8,

                        sm: 1.3,
                      },
                    }}
                  />

                  {/* Information grid */}

                  <Box
                    sx={{
                      display: "grid",

                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",

                      gap: {
                        xs: 0.55,

                        sm: 0.8,
                      },
                    }}
                  >
                    <InfoItem label="Role" value={role} chip admin={isAdmin} />

                    <InfoItem label="Phone" value={phone} />

                    <InfoItem
                      label="Joined"
                      value={
                        user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"
                      }
                    />

                    <InfoItem
                      label="Status"
                      value={isActive ? "Active" : "Inactive"}
                    />
                  </Box>

                  <Divider sx={{ my: 1 }} />
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<DeleteOutlineRoundedIcon />}
                    disabled={deleteLoading}
                    onClick={() => openDeleteDialog(user)}
                    sx={{
                      borderRadius: 1.2,
                      fontWeight: 800,
                      textTransform: "none",
                      minHeight: { xs: 27, sm: 34 },
                      py: { xs: 0.25, sm: 0.6 },
                      px: { xs: 0.7, sm: 1.2 },
                      fontSize: { xs: "0.58rem", sm: "0.75rem" },
                      "& .MuiButton-startIcon": {
                        mr: { xs: 0.35, sm: 0.7 },
                        ml: 0,
                        "& svg": { fontSize: { xs: 14, sm: 18 } },
                      },
                    }}
                  >
                    Delete User
                  </Button>
                </CardContent>
              </MotionCard>
            );
          })}
        </Box>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {deleteDialog.type === "all"
            ? "Delete all users?"
            : "Delete this user?"}
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            {deleteDialog.type === "all"
              ? `This will permanently delete all ${users.length} user records. This cannot be undone.`
              : `This will permanently delete ${getUserName(
                  deleteDialog.user,
                )}. This cannot be undone.`}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeDeleteDialog} disabled={deleteLoading}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteUsers}
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
            xs: 0.9,

            sm: 1.3,
          },

          "&:last-child": {
            pb: {
              xs: 0.9,

              sm: 1.3,
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={{
            xs: 0.55,

            sm: 0.8,
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
                  xs: "0.53rem",

                  sm: "0.64rem",
                },
              }}
            >
              {label}
            </Typography>

            <Typography
              fontWeight={900}
              sx={{
                fontSize: {
                  xs: "0.98rem",

                  sm: "1.3rem",
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

function InfoItem({ label, value, chip = false, admin = false }) {
  return (
    <Box
      sx={{
        minWidth: 0,

        p: {
          xs: 0.6,

          sm: 0.85,
        },

        borderRadius: {
          xs: 1,

          sm: 1.4,
        },

        bgcolor: "action.hover",
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          fontSize: {
            xs: "0.48rem",

            sm: "0.6rem",
          },

          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>

      {chip ? (
        <Chip
          size="small"
          icon={
            admin ? <AdminPanelSettingsRoundedIcon /> : <PersonRoundedIcon />
          }
          label={value}
          color={admin ? "secondary" : "primary"}
          variant="outlined"
          sx={{
            mt: 0.3,

            height: {
              xs: 18,

              sm: 22,
            },

            maxWidth: "100%",

            fontSize: {
              xs: "0.49rem",

              sm: "0.59rem",
            },

            "& .MuiChip-icon": {
              fontSize: {
                xs: 11,

                sm: 14,
              },

              ml: 0.35,
            },

            "& .MuiChip-label": {
              px: {
                xs: 0.45,

                sm: 0.7,
              },

              overflow: "hidden",

              textOverflow: "ellipsis",
            },
          }}
        />
      ) : (
        <Typography
          fontWeight={700}
          sx={{
            mt: 0.25,

            fontSize: {
              xs: "0.55rem",

              sm: "0.66rem",
            },

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}
