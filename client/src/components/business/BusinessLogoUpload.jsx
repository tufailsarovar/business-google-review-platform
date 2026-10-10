import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Box, Button, Stack, Typography } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function BusinessLogoUpload({
  value = "",
  onChange,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const previewRef = useRef("");
  const [preview, setPreview] = useState(value || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Logo size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    previewRef.current = previewUrl;
    setPreview(previewUrl);

    // Pass the preview and original file to the parent.
    onChange?.(previewUrl, file);
  };

  const handleRemove = () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }

    setPreview("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange?.("", null);
  };

  return (
    <Stack spacing={2} alignItems="flex-start">
      {error && <Alert severity="error">{error}</Alert>}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          src={preview || undefined}
          alt="Business logo preview"
          variant="rounded"
          imgProps={{
            onError: () => setPreview(""),
          }}
          sx={{
            width: 100,
            height: 100,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.secondary",
            borderRadius: 3,
          }}
        >
          <CloudUploadRoundedIcon fontSize="large" />
        </Avatar>

        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Upload your business logo. JPG, PNG, or WEBP, up to 5 MB.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadRoundedIcon />}
              disabled={disabled}
            >
              Choose logo
              <input
                ref={inputRef}
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
              />
            </Button>

            {preview && (
              <Button
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={handleRemove}
                disabled={disabled}
              >
                Remove
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
