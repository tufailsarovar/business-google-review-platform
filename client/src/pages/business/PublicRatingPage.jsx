import { useBusiness } from "../../hooks/useBusiness";
import PublicPageSettings from "../../components/business/PublicPageSettings";
import { Alert, Box, Paper, Skeleton, Stack, Typography } from "@mui/material";

export default function PublicRatingPage() {
  const { business, error, loading } = useBusiness();

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Public Rating Page
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, lineHeight: 1.7 }}
      >
        Manage your public review page, share its link, and download your QR
        code.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {business ? (
        <PublicPageSettings business={business} />
      ) : !error ? (
        <Stack spacing={2.5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
              Your public review page
            </Typography>

            <Skeleton
              variant="rounded"
              height={54}
              animation={loading ? "wave" : false}
            />

            <Skeleton
              variant="rounded"
              width={180}
              height={36}
              sx={{ mt: 2 }}
              animation={loading ? "wave" : false}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Typography variant="subtitle1" fontWeight={800}>
              QR Code
            </Typography>
            <Skeleton
              variant="rounded"
              width={120}
              height={36}
              sx={{ mt: 1.5 }}
              animation={loading ? "wave" : false}
            />
          </Paper>
        </Stack>
      ) : null}
    </Box>
  );
}
