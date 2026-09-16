import { Alert } from "@mui/material";

export default function ErrorMessage({
  message,
  severity = "error",
  onClose,
}) {
  if (!message) {
    return null;
  }

  return (
    <Alert
      severity={severity}
      onClose={onClose}
      sx={{
        width: "100%",
        borderRadius: 2,
      }}
    >
      {message}
    </Alert>
  );
}