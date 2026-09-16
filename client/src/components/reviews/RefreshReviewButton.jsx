import {
  Button,
  CircularProgress,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export default function RefreshReviewButton({
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  children = "Generate another",
}) {
  const handleClick = async () => {
    if (disabled || loading || !onClick) {
      return;
    }

    await onClick();
  };

  return (
    <Button
      type="button"
      variant="outlined"
      onClick={handleClick}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={
        loading ? (
          <CircularProgress size={18} />
        ) : (
          <RefreshRoundedIcon />
        )
      }
    >
      {loading ? "Generating..." : children}
    </Button>
  );
}