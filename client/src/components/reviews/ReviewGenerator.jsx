import { useState } from "react";
import { Alert, Button, CircularProgress } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { generateReview } from "../../services/reviewService";

export default function ReviewGenerator({
  business,
  businessId,
  rating,
  onReviewChange,
  aiSuggestionsEnabled = true,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!business || !businessId || !rating || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await generateReview({
        businessId,
        rating: Number(rating),
        keywords: [],
        customerName: "",
      });

      const data = response?.data?.data || response?.data || response;
      const generatedReview =
        data?.review?.trim() ||
        data?.suggestion?.trim() ||
        data?.text?.trim() ||
        "";

      if (!generatedReview) {
        throw new Error("EMPTY_REVIEW");
      }

      // Insert into the existing page editor, not a second text box.
      onReviewChange?.(generatedReview);
    } catch (err) {
      const status = err?.response?.status || err?.status;
      const message = String(
        err?.response?.data?.message || err?.message || "",
      );

      if (
        status === 429 ||
        message.includes("429") ||
        message.toLowerCase().includes("quota") ||
        message.toLowerCase().includes("resource_exhausted")
      ) {
        setError(
          "AI suggestions are temporarily unavailable because the API quota has been reached. You can still write your review manually.",
        );
      } else if (message === "EMPTY_REVIEW") {
        setError("No suggestion was returned. Please try again later.");
      } else {
        setError(
          "Couldn't generate a suggestion. You can write your review manually.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        onClick={handleGenerate}
        disabled={
          !aiSuggestionsEnabled ||
          !business ||
          !businessId ||
          !rating ||
          loading
        }
        startIcon={
          loading ? <CircularProgress size={16} /> : <AutoAwesomeRoundedIcon />
        }
        sx={{
          minHeight: 38,
          px: 1.5,
          borderRadius: 2,
          fontWeight: 750,
          textTransform: "none",
          whiteSpace: "nowrap",
        }}
      >
        {loading ? "Generating..." : "Generate with AI"}
      </Button>

      {error && (
        <Alert
          severity="info"
          onClose={() => setError("")}
          sx={{
            mt: 1,
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 2,
            overflowWrap: "anywhere",
            "& .MuiAlert-message": {
              minWidth: 0,
              overflowWrap: "anywhere",
            },
          }}
        >
          {error}
        </Alert>
      )}
    </>
  );
}
