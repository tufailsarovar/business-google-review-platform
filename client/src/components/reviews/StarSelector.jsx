import {
  Rating,
  Stack,
  Typography,
} from "@mui/material";

import { STAR_LABELS } from "../../utils/constants";

export default function StarSelector({
  value = 0,
  onChange,
  disabled = false,
}) {
  const rating = Number(value) || 0;

  const handleChange = (_, newValue) => {
    if (disabled) {
      return;
    }

    onChange?.(newValue || 0);
  };

  return (
    <Stack
      alignItems="center"
      spacing={0.8}
      sx={{
        width: "100%",
      }}
    >
      <Rating
        value={rating}
        onChange={handleChange}
        disabled={disabled}
        precision={1}
        max={5}
        size="large"
        sx={{
          fontSize: {
            xs: "2.7rem",
            sm: "3.4rem",
          },
          "& .MuiRating-iconEmpty": {
            opacity: 0.45,
          },
        }}
        aria-label="Select your rating"
      />

      <Typography
        variant="body2"
        color={rating ? "text.primary" : "text.secondary"}
        fontWeight={rating ? 700 : 400}
        textAlign="center"
        sx={{
          minHeight: 22,
        }}
      >
        {rating
          ? STAR_LABELS[rating] || "Selected rating"
          : "Choose a rating"}
      </Typography>
    </Stack>
  );
}