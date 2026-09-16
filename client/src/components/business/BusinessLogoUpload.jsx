import { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

export default function BusinessLogoUpload({
  value = "",
  onChange,
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || "");

  const handleFileChange = event => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    setPreview(objectUrl);
    onChange?.(objectUrl, file);
  };

  const handleRemove = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setPreview("");
    onChange?.("", null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Avatar
        src={preview || value}
        alt="Business logo"
        sx={{
          width: 76,
          height: 76,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.100",
        }}
      />

      <Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
        >
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
          >
            Choose logo

            <input
              ref={inputRef}
              hidden
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
            />
          </Button>

          {(preview || value) && (
            <Button
              color="error"
              variant="text"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 1,
          }}
        >
          PNG, JPG, WEBP or GIF. Maximum size: 5 MB.
        </Typography>
      </Box>
    </Stack>
  );
}