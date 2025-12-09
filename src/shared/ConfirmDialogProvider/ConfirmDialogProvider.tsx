import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
  Box,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions"; 
import { WarningAmberRounded as WarningIcon } from "@mui/icons-material";

// ✅ Smooth slide-up animation
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface ConfirmDialogHandle {
  confirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
}

const ConfirmDialog = forwardRef<ConfirmDialogHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("Confirm");
  const [confirmText, setConfirmText] = useState("Yes");
  const [cancelText, setCancelText] = useState("No");
  const [resolver, setResolver] = useState<(result: boolean) => void>();

  useImperativeHandle(ref, () => ({
    confirm: ({ title, message, confirmText, cancelText }) => {
      setTitle(title || "Confirm");
      setMessage(message);
      setConfirmText(confirmText || "Yes");
      setCancelText(cancelText || "No");
      setOpen(true);
      return new Promise<boolean>((resolve) => {
        setResolver(() => resolve);
      });
    },
  }));

  const handleClose = (result: boolean) => {
    setOpen(false);
    if (resolver) resolver(result);
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={() => handleClose(false)}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 6,
          backgroundColor: "#fff",
        },
      }}
    >
      <Box sx={{ textAlign: "center", p: 2 }}>
        <WarningIcon
          sx={{
            fontSize: 48,
            color: "warning.main",
            mb: 1,
          }}
        />
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            p: 0,
            mb: 1,
            color: "text.primary",
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", fontSize: "0.95rem" }}
          >
            {message}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            mt: 3,
            display: "flex",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={() => handleClose(false)}
            variant="outlined"
            color="inherit"
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#ccc",
              "&:hover": { borderColor: "#999", backgroundColor: "#fafafa" },
            }}
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => handleClose(true)}
            variant="contained"
            color="error"
            sx={{
              px: 3,
              borderRadius: 2,
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(244,67,54,0.3)",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
});

export default ConfirmDialog;
