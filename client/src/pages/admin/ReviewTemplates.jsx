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
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import adminService from "../../services/adminService";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const emptyForm = {
  title: "",
  description: "",
  template: "",
  rating: 5,
};

const compactFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: { xs: 1.5, sm: 2 },
    fontSize: { xs: "0.82rem", sm: "0.9rem" },
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.82rem", sm: "0.9rem" },
  },
};

export default function ReviewTemplates() {
  const reduceMotion = useReducedMotion();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminService.getReviewTemplates();
      const data =
        response?.data?.templates || response?.data || response || [];

      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to load review templates.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (template) => {
    setSelectedTemplate(template);
    setForm({
      title: template?.title || "",
      description: template?.description || "",
      template: template?.template || template?.content || "",
      rating: template?.rating || 5,
    });
    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setSelectedTemplate(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Template title is required.");
      return;
    }

    if (!form.template.trim()) {
      setError("Review template content is required.");
      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      setError("Star rating must be between 1 and 5.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (selectedTemplate) {
        const id = selectedTemplate?._id || selectedTemplate?.id;

        if (!id) {
          setError("Template ID is missing.");
          return;
        }

        await adminService.updateReviewTemplate(id, form);
        setSuccess("Review template updated successfully.");
      } else {
        await adminService.createReviewTemplate(form);
        setSuccess("Review template created successfully.");
      }

      await loadTemplates();

      setDialogOpen(false);
      setSelectedTemplate(null);
      setForm(emptyForm);
      setSuccess("");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to save review template.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (template) => {
    setSelectedTemplate(template);
    setError("");
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    if (saving) return;

    setDeleteDialogOpen(false);
    setSelectedTemplate(null);
    setError("");
  };

  const handleDelete = async () => {
    const id = selectedTemplate?._id || selectedTemplate?.id;

    if (!id) {
      setError("Template ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await adminService.deleteReviewTemplate(id);

      setTemplates((previous) =>
        previous.filter((item) => (item?._id || item?.id) !== id),
      );

      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      setSuccess("Review template deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to delete review template.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0, pb: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <MotionBox
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
        sx={{
          display: "flex",
          alignItems: { xs: "center", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
          mb: { xs: 1.5, sm: 2.5 },
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.6}
            sx={{ mb: 0.4 }}
          >
            <AutoAwesomeRoundedIcon
              color="primary"
              sx={{ fontSize: { xs: 16, sm: 20 } }}
            />
            <Typography
              color="primary"
              fontWeight={850}
              sx={{
                fontSize: { xs: "0.6rem", sm: "0.74rem" },
                letterSpacing: "0.04em",
              }}
            >
              AI REVIEW CONTENT
            </Typography>
          </Stack>

          <Typography
            component="h1"
            fontWeight={900}
            sx={{
              fontSize: { xs: "1.35rem", sm: "2rem", md: "2.3rem" },
              letterSpacing: "-0.035em",
              lineHeight: 1.15,
            }}
          >
            Review Templates
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.4,
              fontSize: { xs: "0.7rem", sm: "0.875rem" },
              lineHeight: 1.5,
            }}
          >
            Manage reusable customer review templates.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={0.6}
          sx={{ flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadTemplates}
            disabled={loading || saving}
            size="small"
            sx={{
              minWidth: { xs: 0, sm: 95 },
              minHeight: { xs: 31, sm: 40 },
              px: { xs: 0.8, sm: 1.4 },
              borderRadius: { xs: 1.2, sm: 2 },
              fontSize: { xs: "0.67rem", sm: "0.8rem" },
              textTransform: "none",
              "& .MuiButton-startIcon": {
                mr: 0.5,
                ml: 0,
              },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            size="small"
            sx={{
              minHeight: { xs: 32, sm: 40 },
              px: { xs: 1, sm: 1.5 },
              borderRadius: { xs: 1.2, sm: 2 },
              fontSize: { xs: "0.67rem", sm: "0.8rem" },
              fontWeight: 800,
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
              "& .MuiButton-startIcon": {
                mr: 0.5,
                ml: 0,
              },
            }}
          >
            Add Template
          </Button>
        </Stack>
      </MotionBox>

      {/* Page feedback */}
      {error && !dialogOpen && !deleteDialogOpen && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 1.5,
            borderRadius: 1.5,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
          }}
        >
          {error}
        </Alert>
      )}

      {success && !dialogOpen && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 1.5,
            borderRadius: 1.5,
            fontSize: { xs: "0.75rem", sm: "0.85rem" },
          }}
        >
          {success}
        </Alert>
      )}

      {/* Template list */}
      {loading ? (
        <Box
          sx={{
            minHeight: "25vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress size={28} />
        </Box>
      ) : templates.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: { xs: 1.8, sm: 2.5 },
          }}
        >
          <CardContent
            sx={{
              py: { xs: 3, sm: 6 },
              px: { xs: 1.5, sm: 3 },
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: { xs: 48, sm: 60 },
                height: { xs: 48, sm: 60 },
                mx: "auto",
                mb: 1,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                bgcolor: "action.hover",
                color: "text.secondary",
              }}
            >
              <DescriptionRoundedIcon sx={{ fontSize: { xs: 25, sm: 32 } }} />
            </Box>

            <Typography
              fontWeight={850}
              sx={{ fontSize: { xs: "0.95rem", sm: "1.15rem" } }}
            >
              No review templates
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
                mb: 1.8,
                fontSize: { xs: "0.73rem", sm: "0.85rem" },
              }}
            >
              Create your first template to get started.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreate}
              size="small"
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={{ xs: 1, sm: 1.8 }}>
          {templates.map((template, index) => {
            const id = template?._id || template?.id;
            const title = template?.title || "Untitled Template";
            const description = template?.description || "";
            const content = template?.template || template?.content || "";
            const rating = Number(template?.rating) || 5;

            return (
              <Grid key={id || index} size={{ xs: 12, sm: 6, lg: 4 }}>
                <MotionCard
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.25,
                    delay: reduceMotion ? 0 : Math.min(index * 0.035, 0.2),
                  }}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  elevation={0}
                  sx={{
                    height: "100%",
                    minWidth: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: { xs: 1.7, sm: 2.2 },
                    overflow: "hidden",
                    transition: "border-color .2s ease, box-shadow .2s ease",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 1.25, sm: 1.8 },
                      "&:last-child": {
                        pb: { xs: 1.25, sm: 1.8 },
                      },
                    }}
                  >
                    {/* Card heading */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box
                        sx={{
                          width: { xs: 36, sm: 44 },
                          height: { xs: 36, sm: 44 },
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: { xs: 1.2, sm: 1.6 },
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          boxShadow: "0 3px 10px rgba(37,99,235,0.16)",
                        }}
                      >
                        <AutoAwesomeRoundedIcon
                          sx={{ fontSize: { xs: 19, sm: 23 } }}
                        />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          fontWeight={850}
                          sx={{
                            fontSize: { xs: "0.85rem", sm: "0.98rem" },
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {title}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{
                            mt: 0.2,
                            fontSize: { xs: "0.64rem", sm: "0.72rem" },
                          }}
                        >
                          Review template
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(template)}
                          aria-label={`Edit ${title}`}
                          sx={{
                            width: { xs: 30, sm: 34 },
                            height: { xs: 30, sm: 34 },
                            borderRadius: 1.2,
                          }}
                        >
                          <EditRoundedIcon
                            sx={{ fontSize: { xs: 17, sm: 19 } }}
                          />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDelete(template)}
                          aria-label={`Delete ${title}`}
                          sx={{
                            width: { xs: 30, sm: 34 },
                            height: { xs: 30, sm: 34 },
                            borderRadius: 1.2,
                          }}
                        >
                          <DeleteRoundedIcon
                            sx={{ fontSize: { xs: 17, sm: 19 } }}
                          />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {description && (
                      <Typography
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          fontSize: { xs: "0.72rem", sm: "0.8rem" },
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {description}
                      </Typography>
                    )}

                    {/* Metadata */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.6}
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        icon={
                          <StarRoundedIcon
                            sx={{ fontSize: "14px !important" }}
                          />
                        }
                        size="small"
                        label={`${rating} Star`}
                        color="primary"
                        variant="outlined"
                        sx={{
                          height: 23,
                          fontSize: "0.65rem",
                          fontWeight: 750,
                          "& .MuiChip-label": { px: 0.7 },
                          "& .MuiChip-icon": { ml: 0.5 },
                        }}
                      />

                      <Chip
                        size="small"
                        label="AI Ready"
                        color="success"
                        variant="outlined"
                        sx={{
                          height: 23,
                          fontSize: "0.65rem",
                          fontWeight: 750,
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                    </Stack>

                    <Divider sx={{ my: { xs: 1, sm: 1.4 } }} />

                    {/* Template preview */}
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.69rem", sm: "0.77rem" },
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: { xs: "4.25em", sm: "4.8em" },
                      }}
                    >
                      {content || "No template content available."}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        fullScreen={false}
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 2 },
            width: { xs: "calc(100% - 16px)", sm: "100%" },
            maxHeight: { xs: "92dvh", sm: "90vh" },
            borderRadius: { xs: 2, sm: 2.5 },
            overflowY: "auto",
          },
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 1.3, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              fontSize: { xs: "1rem", sm: "1.2rem" },
              fontWeight: 850,
            }}
          >
            {selectedTemplate
              ? "Edit Review Template"
              : "Create Review Template"}

            <IconButton
              onClick={handleCloseDialog}
              disabled={saving}
              size="small"
              aria-label="Close dialog"
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent
            sx={{
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <Stack spacing={{ xs: 1.4, sm: 2 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.8rem",
                  }}
                >
                  {error}
                </Alert>
              )}

              <TextField
                name="title"
                label="Template Title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
                size="small"
                disabled={saving}
                sx={compactFieldSx}
              />

              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                size="small"
                disabled={saving}
                sx={compactFieldSx}
              />

              <TextField
                name="rating"
                label="Star Rating"
                value={form.rating}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                size="small"
                disabled={saving}
                inputProps={{ min: 1, max: 5 }}
                sx={compactFieldSx}
              />

              <TextField
                name="template"
                label="Review Template"
                value={form.template}
                onChange={handleChange}
                fullWidth
                required
                multiline
                minRows={5}
                disabled={saving}
                placeholder="Write the reusable review template here..."
                sx={compactFieldSx}
              />
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              p: { xs: 1.3, sm: 2 },
              gap: 0.8,
            }}
          >
            <Button
              onClick={handleCloseDialog}
              disabled={saving}
              size="small"
              sx={{
                borderRadius: 1.3,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress size={15} color="inherit" />
                ) : selectedTemplate ? (
                  <EditRoundedIcon />
                ) : (
                  <AddRoundedIcon />
                )
              }
              sx={{
                minHeight: 36,
                px: { xs: 1.3, sm: 2 },
                borderRadius: 1.4,
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "none",
              }}
            >
              {saving
                ? "Saving..."
                : selectedTemplate
                  ? "Update Template"
                  : "Create Template"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            m: { xs: 1.5, sm: 2 },
            width: { xs: "calc(100% - 24px)", sm: "100%" },
            borderRadius: { xs: 2, sm: 2.5 },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            pt: { xs: 1.5, sm: 2.5 },
            fontSize: { xs: "1rem", sm: "1.2rem" },
            fontWeight: 850,
          }}
        >
          Delete Template?
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 1.5, sm: 2.5 },
            pb: 1,
          }}
        >
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 1.5,
                borderRadius: 1.5,
                fontSize: "0.8rem",
              }}
            >
              {error}
            </Alert>
          )}

          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.9rem" },
              lineHeight: 1.6,
              overflowWrap: "anywhere",
            }}
          >
            Are you sure you want to delete{" "}
            <Box component="strong" sx={{ color: "text.primary" }}>
              {selectedTemplate?.title || "this template"}
            </Box>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 1.3, sm: 2 },
            gap: 0.5,
          }}
        >
          <Button
            onClick={handleCloseDelete}
            disabled={saving}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={15} color="inherit" />
              ) : (
                <DeleteRoundedIcon />
              )
            }
            sx={{
              borderRadius: 1.4,
              fontSize: { xs: "0.75rem", sm: "0.85rem" },
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            {saving ? "Deleting..." : "Delete Template"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
