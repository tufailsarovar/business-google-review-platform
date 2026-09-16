import { useMemo } from "react";
import {
  Alert,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import { PUBLIC_BUSINESS_ROUTE } from "../../utils/constants";

export default function PublicPageSettings({ business }) {
  const publicUrl = useMemo(() => {
    const businessId = business?.businessId;

    if (!businessId) {
      return "";
    }

    return `${window.location.origin}${PUBLIC_BUSINESS_ROUTE(
      encodeURIComponent(businessId)
    )}`;
  }, [business?.businessId]);

  const handleCopy = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      const textarea = document.createElement("textarea");

      textarea.value = publicUrl;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleOpenPublicPage = () => {
    if (!business?.businessId) {
      return;
    }

    const route = PUBLIC_BUSINESS_ROUTE(
      encodeURIComponent(business.businessId)
    );

    const url = `${window.location.origin}${route}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!business?.businessId) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Your public review page is not available yet.
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={800}>
          Your public review page
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7 }}
        >
          Share this page with customers so they can rate their experience
          and continue to your Google review page.
        </Typography>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          backgroundColor: "grey.50",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 0.7,
            fontWeight: 700,
          }}
        >
          PUBLIC URL
        </Typography>

        <Typography
          variant="body2"
          sx={{
            wordBreak: "break-all",
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          {publicUrl}
        </Typography>
      </Paper>

      <Divider />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.2}
      >
        <Button
          variant="outlined"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={handleCopy}
          disabled={!publicUrl}
        >
          Copy link
        </Button>

        <Button
          variant="contained"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={handleOpenPublicPage}
          disabled={!publicUrl}
        >
          Open public page
        </Button>
      </Stack>
    </Stack>
  );
}