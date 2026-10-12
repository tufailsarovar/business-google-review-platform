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
import QRCodeDownload from "../common/QRCodeDownload";
import { PUBLIC_BUSINESS_ROUTE } from "../../utils/constants";

export default function PublicPageSettings({ business }) {
  const publicUrl = useMemo(() => {
    if (!business?.businessId) return "";

    return `${window.location.origin}${PUBLIC_BUSINESS_ROUTE(
      encodeURIComponent(business.businessId)
    )}`;
  }, [business?.businessId]);

  const handleCopy = async () => {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = publicUrl;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handleOpenPublicPage = () => {
    if (publicUrl) {
      window.open(publicUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!business?.businessId) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Your public review page is not available yet.
      </Alert>
    );
  }

  const compactButtonSx = {
    minWidth: 0,
    minHeight: 36,
    px: { xs: 1, sm: 1.5 },
    borderRadius: 2,
    fontSize: { xs: "0.68rem", sm: "0.78rem" },
    fontWeight: 700,
    textTransform: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  return (
    <Stack spacing={2.5} sx={{ minWidth: 0, width: "100%" }}>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          bgcolor: "grey.50",
          minWidth: 0,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 0.7, fontWeight: 700 }}
        >
          PUBLIC URL
        </Typography>

        <Typography
          variant="body2"
          sx={{
            wordBreak: "break-all",
            overflowWrap: "anywhere",
            lineHeight: 1.7,
            fontWeight: 600,
          }}
        >
          {publicUrl}
        </Typography>
      </Paper>

      <Divider />

      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="nowrap"
        sx={{
          width: "100%",
          minWidth: 0,
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyRoundedIcon />}
          onClick={handleCopy}
          sx={compactButtonSx}
        >
          Copy link
        </Button>

        <Button
          variant="contained"
          size="small"
          endIcon={<OpenInNewRoundedIcon />}
          onClick={handleOpenPublicPage}
          sx={compactButtonSx}
        >
          Open public page
        </Button>
      </Stack>

      <Divider />

      <QRCodeDownload
        url={publicUrl}
        fileName={`tapreview-${business.businessId}`}
      />
    </Stack>
  );
}