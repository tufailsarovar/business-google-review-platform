import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import QRCode from "qrcode";

const QR_SIZE = 600;

export default function QRCodeDownload({
  url,
  fileName = "tapreview-qr-code",
  logoUrl = "/taprating-logo.png",
}) {
  const canvasRef = useRef(null);
  const generatingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const generateQR = async () => {
    if (!url || !canvasRef.current || generatingRef.current) {
      return false;
    }

    generatingRef.current = true;
    setLoading(true);
    setError("");
    setReady(false);

    try {
      const canvas = canvasRef.current;

      await QRCode.toCanvas(canvas, url, {
        width: QR_SIZE,
        margin: 4,
        errorCorrectionLevel: "H",
        color: { dark: "#000000", light: "#FFFFFF" },
      });

      const ctx = canvas.getContext("2d");

      const logo = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Logo could not be loaded."));
        image.src = logoUrl;
      });

      const center = QR_SIZE / 2;
      const plateSize = 120;
      const logoSize = 96;
      const sourceSize = Math.min(logo.naturalWidth, logo.naturalHeight);

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(
        center - plateSize / 2,
        center - plateSize / 2,
        plateSize,
        plateSize,
      );

      ctx.drawImage(
        logo,
        (logo.naturalWidth - sourceSize) / 2,
        (logo.naturalHeight - sourceSize) / 2,
        sourceSize,
        sourceSize,
        center - logoSize / 2,
        center - logoSize / 2,
        logoSize,
        logoSize,
      );

      setReady(true);
      return true;
    } catch (err) {
      setError(
        err?.message?.includes("Logo")
          ? `Logo not found. Check ${logoUrl}.`
          : "Unable to generate QR code. Please try again.",
      );
      return false;
    } finally {
      generatingRef.current = false;
      setLoading(false);
    }
  };

  const handleView = () => {
    setOpen(true);
  };

  const handleDownload = async () => {
    if (!ready) {
      setOpen(true);
      return;
    }

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleDialogEntered = () => {
    if (!ready && !loading) {
      generateQR();
    }
  };

  if (!url) {
    return <Alert severity="info">Public rating link unavailable.</Alert>;
  }

  return (
    <>
      <Stack spacing={1} alignItems="flex-start" sx={{ width: "100%" }}>
        <Typography variant="subtitle1" fontWeight={800}>
          QR Code
        </Typography>

        <Typography variant="body2" color="text.secondary">
          View or download your branded QR code.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            width: "100%",
            flexWrap: "nowrap",
            overflowX: "auto",
            pb: 0.25,
          }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<QrCodeRoundedIcon />}
            onClick={handleView}
            sx={{
              minWidth: 0,
              minHeight: 32,
              px: 1.25,
              borderRadius: 1.8,
              fontSize: { xs: "0.7rem", sm: "0.78rem" },
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            View QR
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownload}
            disabled={loading}
            sx={{
              minWidth: 0,
              minHeight: 32,
              px: 1.25,
              borderRadius: 1.8,
              fontSize: { xs: "0.7rem", sm: "0.78rem" },
              fontWeight: 700,
              textTransform: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
              boxShadow: "none",
            }}
          >
            Download QR
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onTransitionEnter={handleDialogEntered}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              width: "calc(100% - 32px)",
              maxWidth: 390,
              m: 2,
              borderRadius: 3,
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.1rem", sm: "1.3rem" },
            pb: 1,
          }}
        >
          Public Rating QR Code
        </DialogTitle>

        <DialogContent sx={{ overflowX: "hidden", px: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Scan this code to open your public rating page.
          </Typography>

          <Box
            sx={{
              width: "100%",
              maxWidth: 320,
              mx: "auto",
              aspectRatio: "1 / 1",
              bgcolor: "#FFFFFF",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              p: 1,
            }}
          >
            <canvas
              ref={canvasRef}
              aria-label="QR code for the public rating page"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                aspectRatio: "1 / 1",
                objectFit: "contain",
              }}
            />
          </Box>

          {loading && (
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ mt: 1.5 }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2">Generating QR code...</Typography>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0,
            gap: 0.75,
            justifyContent: "flex-end",
            flexWrap: "nowrap",
          }}
        >
          <Button
            onClick={() => setOpen(false)}
            startIcon={<CloseRoundedIcon />}
            size="small"
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={<DownloadRoundedIcon />}
            size="small"
            disabled={!ready || loading}
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            Download PNG
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
