import { useState } from "react";
import {
  Button,
  CircularProgress,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";

export default function CopyReviewButton({
  review = "",
  fullWidth = false,
  variant = "outlined",
  onCopied,
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    const text = String(review || "").trim();

    if (!text || loading) {
      return;
    }

    setLoading(true);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);
        textarea.select();

        const copiedSuccessfully =
          document.execCommand("copy");

        document.body.removeChild(textarea);

        if (!copiedSuccessfully) {
          throw new Error("Copy failed.");
        }
      }

      setCopied(true);
      onCopied?.();

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      onClick={handleCopy}
      disabled={!String(review || "").trim() || loading}
      startIcon={
        loading ? (
          <CircularProgress size={18} />
        ) : copied ? (
          <DoneRoundedIcon />
        ) : (
          <ContentCopyRoundedIcon />
        )
      }
    >
      {loading
        ? "Copying..."
        : copied
          ? "Copied"
          : "Copy review"}
    </Button>
  );
}