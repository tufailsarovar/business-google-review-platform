
import { useState } from "react";
import { Alert, Button, Snackbar } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";

export default function GoogleReviewButton({
  googleUrl = "",
  review = "",
  fullWidth = true,
  disabled = false,
}) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const reviewText = String(review ?? "").trim();

  const copySynchronously = (text) => {
    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.readOnly = true;

    Object.assign(textarea.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: "2px",
      height: "2px",
      padding: "0",
      border: "none",
      opacity: "0.01",
      fontSize: "16px",
      zIndex: "99999",
    });

    document.body.appendChild(textarea);

    let success = false;

    try {
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      success = document.execCommand("copy");
    } catch {
      success = false;
    } finally {
      textarea.remove();
    }

    return success;
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!reviewText) {
      setMessage("Write a review or generate one with AI first.");
      return;
    }

    let destination;

    try {
      destination = new URL(String(googleUrl).trim());

      if (
        !["https:", "http:"].includes(destination.protocol) ||
        !destination.hostname
      ) {
        throw new Error("Invalid URL");
      }
    } catch {
      setMessage("The Google review link is missing or invalid.");
      return;
    }

    setLoading(true);
    setCopied(false);
    setMessage("");

    // Attempt copying immediately, before any await.
    let copySucceeded = copySynchronously(reviewText);

    // Modern clipboard API fallback.
    if (!copySucceeded && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(reviewText);
        copySucceeded = true;
      } catch {
        copySucceeded = false;
      }
    }

    if (copySucceeded) {
      setCopied(true);
    }

    // Open Google Reviews directly; do not show a copy dialog.
    const openedWindow = window.open(
      destination.href,
      "_blank",
      "noopener,noreferrer"
    );

    setLoading(false);

    if (!openedWindow) {
      setMessage(
        copySucceeded
          ? "Review copied. Your browser blocked the Google Reviews tab; allow pop-ups to open it."
          : "Copying was blocked by your browser, and the Google Reviews tab was blocked too."
      );
      return;
    }

    if (copySucceeded) {
      setMessage("Review copied. Paste it into Google Reviews and submit.");
    } else {
      setMessage(
        "Google Reviews opened, but your browser blocked copying. Check clipboard permissions."
      );
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="contained"
        fullWidth={fullWidth}
        disabled={disabled || !googleUrl || !reviewText || loading}
        onClick={handleSubmit}
        startIcon={copied ? <DoneRoundedIcon /> : <GoogleIcon />}
        endIcon={<ArrowForwardRoundedIcon />}
        sx={{
          minHeight: { xs: 48, sm: 52 },
          borderRadius: 2,
          fontWeight: 800,
          fontSize: { xs: "0.88rem", sm: "0.96rem" },
          textTransform: "none",
          boxShadow: "0 7px 20px rgba(49,88,203,.18)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 10px 24px rgba(49,88,203,.25)",
          },
        }}
      >
        {loading
          ? "Preparing review..."
          : copied
          ? "Copied — Submit on Google"
          : "Copy & Submit Review"}
      </Button>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={5000}
        onClose={() => setMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={copied ? "success" : "warning"}
          variant="filled"
          onClose={() => setMessage("")}
          sx={{ width: "100%", overflowWrap: "anywhere" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
