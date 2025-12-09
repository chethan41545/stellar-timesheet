
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Container component="main" maxWidth="md">
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                    py: 4
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        p: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                >
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontSize: { xs: '6rem', md: '8rem' },
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 2,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}
                    >
                        404
                    </Typography>

                    <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                            fontWeight: '600',
                            mb: 2,
                            color: 'text.primary'
                        }}
                    >
                        Oops! Page Not Found
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            mb: 4,
                            color: 'text.secondary',
                            maxWidth: '400px'
                        }}
                    >
                        The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{
                                px: 4,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            Go Back
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<DashboardOutlinedIcon />}
                            onClick={() => navigate(ROUTES.DASHBOARD)}
                            sx={{
                                px: 4,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1.1rem'
                            }}
                        >
                            Dashboard
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default NotFound;