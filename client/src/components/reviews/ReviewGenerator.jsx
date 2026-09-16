import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { motion } from "framer-motion";

import {
  generateReview,
} from "../../services/reviewService";

import {
  getErrorMessage,
} from "../../utils/formatters";

const MotionPaper = motion(Paper);

export default function ReviewGenerator({
  business,
  businessId,
  rating,
  onReviewChange,
}) {
  const [review, setReview] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const generate = useCallback(async () => {
    if (
      !business ||
      !businessId ||
      !rating
    ) {
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const response =
        await generateReview({
          businessId,
          rating: Number(rating),
          keywords: [],
          customerName: "",
        });

      const generatedReview =
        response?.data?.review?.trim() ||
        "";

      if (!generatedReview) {
        throw new Error(
          "No review suggestion was returned."
        );
      }

      setReview(generatedReview);
      setEditing(false);

      onReviewChange?.(
        generatedReview
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to generate a review suggestion."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [
    business,
    businessId,
    rating,
    onReviewChange,
  ]);

  useEffect(() => {
    setReview("");
    setEditing(false);
    setCopied(false);
    setError("");

    if (
      rating &&
      businessId
    ) {
      generate();
    }
  }, [
    rating,
    businessId,
    generate,
  ]);

  const handleChange = (event) => {
    const value =
      event.target.value;

    setReview(value);
    setCopied(false);

    onReviewChange?.(value);
  };

  const handleCopy = async () => {
    const text =
      review.trim();

    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        text
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      try {
        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value = text;
        textarea.style.position =
          "fixed";
        textarea.style.left =
          "-9999px";

        document.body.appendChild(
          textarea
        );

        textarea.focus();
        textarea.select();

        const success =
          document.execCommand(
            "copy"
          );

        document.body.removeChild(
          textarea
        );

        if (!success) {
          throw new Error();
        }

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1800);
      } catch {
        setError(
          "Unable to copy the review."
        );
      }
    }
  };

  const handleEdit = () => {
    if (!review.trim()) {
      return;
    }

    setEditing(
      (previous) => !previous
    );

    setCopied(false);
  };

  if (!rating) {
    return null;
  }

  return (
    <MotionPaper
      initial={{
        opacity: 0,
        y: 12,
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
        p: {
          xs: 1.75,
          sm: 2.5,
        },
        borderRadius: {
          xs: 3.5,
          sm: 4,
        },
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(145deg,#ffffff 0%,#f8faff 100%)",
      }}
    >
      <Stack
        spacing={{
          xs: 1.5,
          sm: 2,
        }}
      >
        {/* HEADER */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.2}
        >
          <Box
            component={motion.div}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
            }}
            sx={{
              width: {
                xs: 40,
                sm: 46,
              },
              height: {
                xs: 40,
                sm: 46,
              },
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              backgroundColor:
                "primary.main",
              color:
                "primary.contrastText",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeRoundedIcon
              fontSize="small"
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                fontSize: {
                  xs: "0.95rem",
                  sm: "1rem",
                },
              }}
            >
              Review suggestion
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: {
                  xs: "0.7rem",
                  sm: "0.75rem",
                },
              }}
            >
              AI-generated from your{" "}
              {rating}-star rating
            </Typography>
          </Box>

          <Tooltip title="Generate another">
            <span>
              <IconButton
                onClick={generate}
                disabled={loading}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor:
                    "divider",
                  width: 38,
                  height: 38,
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={18}
                  />
                ) : (
                  <RefreshRoundedIcon
                    fontSize="small"
                  />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* ERROR */}
        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError("")
            }
            sx={{
              borderRadius: 2.5,
              py: 0.2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* REVIEW BOX */}
        <Box
          sx={{
            p: {
              xs: 1.5,
              sm: 2,
            },
            minHeight: {
              xs: 115,
              sm: 135,
            },
            borderRadius: 3,
            background:
              "rgba(37,99,235,0.035)",
            border: "1px solid",
            borderColor:
              "rgba(37,99,235,0.11)",
          }}
        >
          {loading && !review ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{
                minHeight: 95,
              }}
            >
              <CircularProgress
                size={25}
              />

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Preparing your review...
              </Typography>
            </Stack>
          ) : editing ? (
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={review}
              onChange={handleChange}
              disabled={loading}
              autoFocus
              placeholder="Edit your review..."
              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    backgroundColor:
                      "#fff",
                    borderRadius: 2.5,
                    fontSize: {
                      xs: "0.88rem",
                      sm: "0.95rem",
                    },
                    lineHeight: 1.7,
                  },
              }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.75,
                whiteSpace:
                  "pre-wrap",
                fontSize: {
                  xs: "0.88rem",
                  sm: "0.95rem",
                },
                color:
                  review
                    ? "text.primary"
                    : "text.secondary",
              }}
            >
              {review ||
                "No suggestion available."}
            </Typography>
          )}
        </Box>

        {/* ACTION BUTTONS */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            variant={
              editing
                ? "contained"
                : "outlined"
            }
            startIcon={
              editing ? (
                <DoneRoundedIcon />
              ) : (
                <EditRoundedIcon />
              )
            }
            onClick={handleEdit}
            disabled={
              !review.trim() ||
              loading
            }
            fullWidth
            size="small"
            sx={{
              minHeight: {
                xs: 42,
                sm: 46,
              },
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform:
                "none",
            }}
          >
            {editing
              ? "Done"
              : "Edit"}
          </Button>

          <Button
            variant="outlined"
            startIcon={
              <RefreshRoundedIcon />
            }
            onClick={generate}
            disabled={loading}
            fullWidth
            size="small"
            sx={{
              minHeight: {
                xs: 42,
                sm: 46,
              },
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform:
                "none",
            }}
          >
            {loading
              ? "Generating..."
              : "Generate Another"}
          </Button>

          <Button
            variant={
              copied
                ? "contained"
                : "outlined"
            }
            startIcon={
              copied ? (
                <DoneRoundedIcon />
              ) : (
                <ContentCopyRoundedIcon />
              )
            }
            onClick={handleCopy}
            disabled={
              !review.trim() ||
              loading
            }
            fullWidth
            size="small"
            sx={{
              minHeight: {
                xs: 42,
                sm: 46,
              },
              borderRadius: 2.5,
              fontWeight: 800,
              textTransform:
                "none",
            }}
          >
            {copied
              ? "Copied"
              : "Copy"}
          </Button>
        </Stack>
      </Stack>
    </MotionPaper>
  );
}