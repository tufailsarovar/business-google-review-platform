import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "error",
  loading = false,
}) {
  const handleClose = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const handleConfirm = async () => {
    if (loading) {
      return;
    }

    await onConfirm?.();
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          fontWeight: 800,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="confirm-dialog-description"
          color="text.secondary"
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          gap: 1,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          color={confirmColor}
          variant="contained"
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}