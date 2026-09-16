import { useState } from "react";

import {
  Alert,
  Button,
  Snackbar,
} from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function GoogleReviewButton({
  googleUrl = "",
  review = "",
  fullWidth = true,
  disabled = false,
}) {
  const [error, setError] =
    useState("");

  const reviewText =
    String(review || "").trim();

  const isConfigured =
    Boolean(
      String(googleUrl || "").trim()
    );

  const handleSubmit = async () => {
    if (!isConfigured) {
      setError(
        "Google review link is not configured."
      );
      return;
    }

    if (!reviewText) {
      setError(
        "Please generate your review first."
      );
      return;
    }

    let googleWindow = null;

    try {
      const parsedUrl =
        new URL(googleUrl);

      if (
        !["http:", "https:"].includes(
          parsedUrl.protocol
        )
      ) {
        throw new Error(
          "Invalid Google review URL."
        );
      }

      /*
       * Open immediately from the user's
       * click to avoid popup blocking.
       */
      googleWindow =
        window.open(
          "",
          "_blank"
        );

      let copied = false;

      try {
        await navigator.clipboard.writeText(
          reviewText
        );

        copied = true;
      } catch {
        try {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            reviewText;

          textarea.style.position =
            "fixed";
          textarea.style.left =
            "-9999px";
          textarea.style.top = "0";

          document.body.appendChild(
            textarea
          );

          textarea.focus();
          textarea.select();

          copied =
            document.execCommand(
              "copy"
            );

          document.body.removeChild(
            textarea
          );
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        if (googleWindow) {
          googleWindow.close();
        }

        throw new Error(
          "Unable to copy the review. Please use the Copy button first."
        );
      }

      if (googleWindow) {
        googleWindow.location.href =
          parsedUrl.toString();
      } else {
        window.location.href =
          parsedUrl.toString();
      }
    } catch (err) {
      if (googleWindow) {
        googleWindow.close();
      }

      setError(
        err?.message ||
          "Unable to open Google review page."
      );
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="contained"
        color="primary"
        fullWidth={fullWidth}
        disabled={
          disabled ||
          !isConfigured ||
          !reviewText
        }
        onClick={handleSubmit}
        startIcon={
          <GoogleIcon />
        }
        endIcon={
          <ArrowForwardRoundedIcon />
        }
        sx={{
          minHeight: {
            xs: 50,
            sm: 54,
          },
          borderRadius: 2.8,
          fontWeight: 800,
          fontSize: {
            xs: "0.9rem",
            sm: "1rem",
          },
          textTransform:
            "none",
          boxShadow:
            "0 8px 24px rgba(37,99,235,0.20)",
          transition:
            "all 0.25s ease",
          "&:hover": {
            transform:
              "translateY(-2px)",
            boxShadow:
              "0 12px 28px rgba(37,99,235,0.28)",
          },
        }}
      >
        Submit Review on Google
      </Button>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={4000}
        onClose={() =>
          setError("")
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() =>
            setError("")
          }
          sx={{
            width: "100%",
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}