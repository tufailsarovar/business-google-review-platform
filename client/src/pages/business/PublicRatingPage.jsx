import { useBusiness } from "../../hooks/useBusiness";
import PublicPageSettings from "../../components/business/PublicPageSettings";
import { Alert, Box, Typography } from "@mui/material";

export default function PublicRatingPage() {
  const { business, error } = useBusiness();

  return (
    <Box sx={{ width: "100%", minHeight: "60vh" }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        Public Rating Page
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage your public business rating page.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {business && <PublicPageSettings business={business} />}
    </Box>
  );
}
