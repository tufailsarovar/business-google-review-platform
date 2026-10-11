
import { useBusiness } from "../../hooks/useBusiness";
import PublicPageSettings from "../../components/business/PublicPageSettings";
import { Alert, Box, Typography } from "@mui/material";

export default function PublicRatingPage() {
  const { business, loading, error } = useBusiness();

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
          Public Rating Page
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            mt: 0.75,
            lineHeight: 1.7,
          }}
        >
          Customize how your business appears on the public customer rating
          page.
        </Typography>
      </Box>

      {error && (
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

      {!loading && !business && !error && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          Business profile could not be loaded.
        </Alert>
      )}

      {business && <PublicPageSettings business={business} />}
    </Box>
  );
}
