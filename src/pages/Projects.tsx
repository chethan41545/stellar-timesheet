import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Divider,
    IconButton,
    Grid,
    Avatar,
    alpha,
    useTheme,
    Paper,
    InputBase,
} from "@mui/material";
import {
    CalendarToday,
    EventAvailable,
    MoreVert,
    Search
} from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import apiService from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSkeleton from "../shared/CustomSkeleton/CustomSkeleton";
import Button from "../shared/Button/Button";

const Projects = () => {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
        const [mode, setMode] = useState('grid');


    const theme = useTheme();

    const handleSearch = (event: any) => {
        setSearchQuery(event.target.value);
    };

    // const projects = [
    //     {
    //         active: true,
    //         code: "5a880f5e-1fce-4aaa-8a0c-25438801fd88",
    //         description: "Modern vehicle management system with real-time tracking and analytics dashboard",
    //         end_date: "Wed, 30 Dec 2026 00:00:00 GMT",
    //         name: "Veltrix VMS",
    //         start_date: "Sun, 01 Jun 2025 00:00:00 GMT",
    //         progress: 75,
    //         team: 12,
    //         priority: "High",
    //         category: "Transportation",
    //     },
    //     {
    //         active: true,
    //         code: "f14b7659-ead4-4973-ac01-8bac1f6d8be8",
    //         description: "Stock trading platform with AI-powered insights and portfolio management",
    //         end_date: "Wed, 30 Dec 2026 00:00:00 GMT",
    //         name: "Stocklete",
    //         start_date: "Sun, 01 Jun 2025 00:00:00 GMT",
    //         progress: 45,
    //         team: 8,
    //         priority: "Medium",
    //         category: "Finance",
    //     },
    //     {
    //         active: false,
    //         code: "8b2c6e1a-3d4f-4b5c-9d6e-7f8g9h0i1j2k",
    //         description: "Legacy system migration to cloud infrastructure",
    //         end_date: "Sat, 15 Mar 2025 00:00:00 GMT",
    //         name: "Cloud Migration",
    //         start_date: "Mon, 01 Jan 2024 00:00:00 GMT",
    //         progress: 100,
    //         team: 6,
    //         priority: "Low",
    //         category: "Infrastructure",
    //     },
    // ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiService.getMethod(API_ENDPOINTS.PROJECT_LIST);
            setProjects(response.data.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("API Error:", error.response?.data);
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    // const getPriorityColor = (priority) => {
    //     switch (priority.toLowerCase()) {
    //         case 'high': return theme.palette.error.main;
    //         case 'medium': return theme.palette.warning.main;
    //         case 'low': return theme.palette.success.main;
    //         default: return theme.palette.grey[500];
    //     }
    // };

    useEffect(() => {
        fetchData()
    }, [])


    // const calculateDaysRemaining = (endDate) => {
    //     const end = new Date(endDate);
    //     const today = new Date();
    //     const diffTime = end - today;
    //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    //     return diffDays > 0 ? `${diffDays} days left` : 'Completed';
    // };

    return (
        <Box
            sx={{
                minHeight: "100vh"
            }}
        >

            <Paper
                elevation={0}
                sx={{
                    // mb: 3,
                    borderRadius: 3,
                }}
            >
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    {/* Search */}
                    <Paper
                        component="form"
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: { xs: '100%', md: 400 },
                            borderRadius: 2,
                            // border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <Search />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search users by name or email"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </Paper>



                    {/* Refresh Button */}
                    {/* <Button
                        variant="secondary"
                        onClick={() => fetchData()}
                    >
                        Refresh
                    </Button> */}

                    <Button
                        variant="primary"
                        label="Create"
                        onClick={() => navigate("/projects/create")}
                    />
                </Stack>
            </Paper>

            <Box display={'flex'} justifyContent={'flex-end'} px={2} pb={2}>
                <IconButton
                    color={mode === "grid" ? "primary" : "default"}
                    onClick={() => setMode("grid")}
                >
                    <GridViewIcon />
                </IconButton>

                <IconButton
                    color={mode === "list" ? "primary" : "default"}
                    onClick={() => setMode("list")}
                >
                    <ViewListIcon />
                </IconButton>
            </Box>

            {
                loading ? (
                    <Grid container spacing={3} >
                        <Grid size={{ xs: 12, md: 3, }} >
                            <CustomSkeleton height={200} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3, }} >
                            <CustomSkeleton height={200} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3, }} >
                            <CustomSkeleton height={200} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3, }} >
                            <CustomSkeleton height={200} />
                        </Grid>
                    </Grid>

                )
                    : (
                        <Grid container spacing={3}>
                            {projects.map((project: any) => (
                                <Grid size={{ xs: 12, md: 3, }} key={project.code}>
                                    <Card
                                        elevation={0}
                                        sx={{
                                            height: '100%',
                                            borderRadius: 3,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            transition: 'all 0.3s ease-in-out',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme.shadows[8],
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                            },
                                        }}
                                        onClick={() => navigate(`/projects/${project.code}`)}


                                    >
                                        <CardContent sx={{ p: 3 }} >
                                            {/* Project Header */}
                                            <Stack
                                                direction="row"
                                                justifyContent="space-between"
                                                alignItems="flex-start"
                                                spacing={2}
                                            >
                                                <Box sx={{ flex: 1 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                color: theme.palette.primary.main,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {project.name.charAt(0)}
                                                        </Avatar>
                                                        <Box display={'flex'} justifyContent={'center'}>
                                                            <Typography variant="h6" fontWeight={600}>
                                                                {project.name}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Box>
                                                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                                    <Chip
                                                        label={project.active ? "Active" : "Completed"}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: project.active
                                                                ? alpha(theme.palette.success.main, 0.1)
                                                                : alpha(theme.palette.grey[500], 0.1),
                                                            color: project.active
                                                                ? theme.palette.success.main
                                                                : theme.palette.grey[600],
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <IconButton size="small">
                                                        <MoreVert />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>

                                            {/* Project Description */}
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mt: 2,
                                                    mb: 3,
                                                    lineHeight: 1.6,
                                                }}
                                            >
                                                {project.description}
                                            </Typography>

                                            {/* Progress Bar */}
                                            {/* <Box sx={{ mb: 3 }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" fontWeight={600}>
                                            Progress
                                        </Typography>
                                        <Typography variant="caption" fontWeight={600} color="primary">
                                            {project.progress}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={project.progress}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(theme.palette.grey[400], 0.2),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                bgcolor: project.active
                                                    ? theme.palette.primary.main
                                                    : theme.palette.success.main,
                                            },
                                        }}
                                    />
                                </Box> */}

                                            <Divider sx={{ my: 2 }} />

                                            {/* Project Details */}
                                            <Grid container spacing={2}>
                                                <Grid size={{ xs: 6 }}>
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" fontWeight={500}>
                                                                Start Date
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {project.start_date}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid size={{ xs: 6 }}>
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <EventAvailable sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                            <Typography variant="caption" fontWeight={500}>
                                                                End Date
                                                            </Typography>
                                                        </Stack>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {project.end_date}
                                                        </Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>


                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                    )
            }




            {/* Header */}
            {/* <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Projects
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                            {projects.filter(p => p.active).length} active projects • {projects.length} total
                        </Typography>
                    </Box>
                    <Chip
                        label={`${projects.filter(p => p.active).length} Active`}
                        sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            px: 1,
                        }}
                    />
                </Stack>
            </Paper> */}

            {/* Projects Grid */}

        </Box>
    );
};

export default Projects;