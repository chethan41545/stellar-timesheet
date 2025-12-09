import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface CustomLoaderProps {
    open: boolean;
    status?: 'loading' | 'success' | 'error';
    message?: string;
    successMessage?: string;
    errorMessage?: string;
}

export const CustomLoader: React.FC<CustomLoaderProps> = ({
    open,
    message = 'Processing...',

}) => {
    return (
        <Backdrop
            open={open}
            sx={{
                zIndex: (theme) => theme.zIndex.modal + 1,
                color: '#3B6F8D',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(57, 55, 55, 0.8)',
                backdropFilter: 'blur(2px)'
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                p: 4,
                textAlign: 'center'
            }}>
                <CircularProgress
                    size={60}
                    thickness={4}
                    color="inherit"
                />
                <Typography variant="h6">
                    {message}
                </Typography>

            </Box>
        </Backdrop>
    );
};