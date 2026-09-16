import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loader({
  minHeight = 220,
  message = "",
  size = 32,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      <CircularProgress size={size} thickness={4} />

      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}