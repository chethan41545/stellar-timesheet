import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Backdrop,
    Paper,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import Button from '../Button/Button';
import { CustomThemeProvider } from '../../contexts/themeContext';
// import { CustomThemeProvider } from '../../context/themeContext';

interface CommentModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    modalMaxWidth?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
    open,
    onClose,
    onConfirm,
    modalMaxWidth = '400px'
}) => {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        if (reason.trim()) {
            onConfirm(reason);
            setReason('');
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    return (
        <CustomThemeProvider>
            <Backdrop open={open} sx={{ zIndex: 1300 }}>
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: modalMaxWidth,
                        // p: 3,
                        borderRadius: 2,
                        position: 'relative',
                    }}
                >
                    <Box display="flex" justifyContent="flex-end">
                        <IconButton onClick={handleClose} disableRipple>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box p={2} pt={0}>

                        <TextField
                            label="Reason / comment (required)"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter Reason / comment"
                        />

                        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                            <Button
                                onClick={handleConfirm}
                                variant="primary"
                                disabled={!reason.trim()}
                            >
                                Confirm
                            </Button>
                            <Button onClick={handleClose} variant="secondary">
                                Cancel
                            </Button>

                        </Box>

                    </Box>



                </Paper>
            </Backdrop>
        </CustomThemeProvider>
    );
};

export default CommentModal;
