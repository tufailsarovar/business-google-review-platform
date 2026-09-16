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
import { motion } from "framer-motion";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";

import adminService from "../../services/adminService";

const MotionCard = motion(Card);

const emptyForm = {
  title: "",
  description: "",
  template: "",
  rating: 5,
};

export default function ReviewTemplates() {
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
        response?.data?.templates ||
        response?.data ||
        response ||
        [];

      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load review templates."
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

  const handleOpenEdit = template => {
    setSelectedTemplate(template);

    setForm({
      title: template?.title || "",
      description: template?.description || "",
      template:
        template?.template ||
        template?.content ||
        "",
      rating: template?.rating || 5,
    });

    setError("");
    setSuccess("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (!saving) {
      setDialogOpen(false);
      setSelectedTemplate(null);
      setForm(emptyForm);
    }
  };

  const handleChange = event => {
    const { name, value } = event.target;

    setForm(prev => ({
      ...prev,
      [name]:
        name === "rating"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Template title is required.");
      return;
    }

    if (!form.template.trim()) {
      setError("Review template content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (selectedTemplate) {
        const id =
          selectedTemplate?._id ||
          selectedTemplate?.id;

        await adminService.updateReviewTemplate(
          id,
          form
        );

        setSuccess(
          "Review template updated successfully."
        );
      } else {
        await adminService.createReviewTemplate(form);

        setSuccess(
          "Review template created successfully."
        );
      }

      await loadTemplates();

      setTimeout(() => {
        setDialogOpen(false);
        setSelectedTemplate(null);
        setForm(emptyForm);
        setSuccess("");
      }, 600);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save review template."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = template => {
    setSelectedTemplate(template);
    setError("");
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    if (!saving) {
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  const handleDelete = async () => {
    const id =
      selectedTemplate?._id ||
      selectedTemplate?.id;

    if (!id) {
      setError("Template ID is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await adminService.deleteReviewTemplate(id);

      setTemplates(prev =>
        prev.filter(
          template =>
            (template?._id || template?.id) !== id
        )
      );

      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
      setSuccess(
        "Review template deleted successfully."
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete review template."
      );
    } finally {
      setSaving(false);
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
            <AutoAwesomeRoundedIcon color="primary" />

            <Typography
              color="primary"
              fontWeight={800}
              fontSize={14}
            >
              AI REVIEW CONTENT
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
            Review Templates
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              lineHeight: 1.7,
            }}
          >
            Manage reusable templates used to generate
            customer review suggestions.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshRoundedIcon />}
            onClick={loadTemplates}
            disabled={loading}
            sx={{
              minHeight: 44,
              borderRadius: 2.5,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              minHeight: 44,
              borderRadius: 2.5,
            }}
          >
            Add Template
          </Button>
        </Stack>
      </Box>

      {error && !dialogOpen && !deleteDialogOpen && (
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

      {success && !dialogOpen && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {success}
        </Alert>
      )}

      {/* Template list */}
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
      ) : templates.length === 0 ? (
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
              py: 7,
              textAlign: "center",
            }}
          >
            <DescriptionRoundedIcon
              sx={{
                fontSize: 54,
                color: "text.disabled",
              }}
            />

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mt: 1 }}
            >
              No review templates
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.75,
                mb: 2.5,
              }}
            >
              Create your first template to start managing
              review content.
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenCreate}
              sx={{ borderRadius: 2.5 }}
            >
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {templates.map((template, index) => {
            const id =
              template?._id ||
              template?.id;

            const title =
              template?.title ||
              "Untitled Template";

            const description =
              template?.description || "";

            const content =
              template?.template ||
              template?.content ||
              "";

            const rating =
              template?.rating || 5;

            return (
              <Grid
                key={id || index}
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
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
                    duration: 0.35,
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
                          width: 46,
                          height: 46,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 3,
                          backgroundColor:
                            "primary.main",
                          color:
                            "primary.contrastText",
                        }}
                      >
                        <AutoAwesomeRoundedIcon />
                      </Box>

                      <Stack direction="row">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            handleOpenEdit(template)
                          }
                          aria-label="Edit template"
                        >
                          <EditRoundedIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          onClick={() =>
                            handleOpenDelete(template)
                          }
                          aria-label="Delete template"
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{
                        mt: 2,
                        wordBreak: "break-word",
                      }}
                    >
                      {title}
                    </Typography>

                    {description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.75,
                          lineHeight: 1.6,
                        }}
                      >
                        {description}
                      </Typography>
                    )}

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1.5 }}
                    >
                      <Chip
                        size="small"
                        label={`${rating} Star`}
                        color="primary"
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label="AI Ready"
                        color="success"
                        variant="outlined"
                      />
                    </Stack>

                    <Divider sx={{ my: 2.5 }} />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.7,
                        display: "-webkit-box",
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 110,
                      }}
                    >
                      {content ||
                        "No template content available."}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
        >
          <DialogTitle fontWeight={800}>
            {selectedTemplate
              ? "Edit Review Template"
              : "Create Review Template"}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{ borderRadius: 2 }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  sx={{ borderRadius: 2 }}
                >
                  {success}
                </Alert>
              )}

              <TextField
                name="title"
                label="Template Title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
              />

              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
              />

              <TextField
                name="rating"
                label="Star Rating"
                value={form.rating}
                onChange={handleChange}
                type="number"
                fullWidth
                required
                inputProps={{
                  min: 1,
                  max: 5,
                }}
              />

              <TextField
                name="template"
                label="Review Template"
                value={form.template}
                onChange={handleChange}
                fullWidth
                required
                multiline
                minRows={6}
                placeholder="Write the reusable review template here..."
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : selectedTemplate ? (
                  <EditRoundedIcon />
                ) : (
                  <AddRoundedIcon />
                )
              }
              sx={{
                minWidth: 130,
                borderRadius: 2.5,
              }}
            >
              {saving
                ? "Saving..."
                : selectedTemplate
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight={800}>
          Delete Template?
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          )}

          <Typography
            color="text.secondary"
            sx={{ lineHeight: 1.7 }}
          >
            Are you sure you want to delete{" "}
            <strong>
              {selectedTemplate?.title ||
                "this template"}
            </strong>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={handleCloseDelete}
            disabled={saving}
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
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : (
                <DeleteRoundedIcon />
              )
            }
            sx={{
              borderRadius: 2.5,
            }}
          >
            {saving ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}