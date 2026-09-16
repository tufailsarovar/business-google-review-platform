import { Box, Typography } from "@mui/material";
import GoogleReviewSetup from "../../components/business/GoogleReviewSetup";

export default function GoogleSettings() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
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
          Google Review Settings
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.75,
            lineHeight: 1.7,
          }}
        >
          Connect your Google review page so customers can
          continue directly to Google after preparing their
          feedback.
        </Typography>
      </Box>

      <GoogleReviewSetup />
    </Box>
  );
}