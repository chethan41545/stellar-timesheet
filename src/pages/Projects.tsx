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
} from "@mui/material";
import {
    CalendarToday,
    EventAvailable,
} from "@mui/icons-material";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import apiService from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CustomSkeleton from "../shared/CustomSkeleton/CustomSkeleton";
import Button from "../shared/Button/Button";
import CustomTable from "../shared/CustomTable/CustomTable";
import SearchField from "../shared/SearchField/SearchField";

const Projects = () => {

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mode, setMode] = useState('list');

    const [_page, setPage] = useState(1);

    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSortChange = (sb: any, sd: 'asc' | 'desc') => {
        setSortBy(sb);
        setSortDirection(sd);
    };


    const theme = useTheme();

    // const handleSearch = (event: any) => {
    //     setSearchQuery(event.target.value);
    // };

    const ALL_COLUMNS: any[] = [

        {
            id: 'code',
            label: 'Name',
            width: '100px',
            visibleFor: ['all'],
            // sortable: true,
            format: (_value: string, row: any) => {
                return (
                    <Typography
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                        }}
                        onClick={() => {
                            navigate(`/users/${row.code}`);
                        }}
                    >
                        {row.name}
                    </Typography>


                )
            }
        },
        {
            id: 'name',
            label: 'Name',
            width: '100px',
            visibleFor: ['all'],
            truncateWithEllipsis: false
        },
        {
            id: 'active',
            label: 'Status',
            width: '100px',
            visibleFor: ['all'],
            truncateWithEllipsis: false,
            format: (_value: string, row: any) => {
                return (
                    <Typography
                        variant="body2"
                    // sx={{
                    //     color: row.is_active
                    //         ? theme.palette.success.main
                    //         : theme.palette.error.main,
                    //     fontWeight: 500,
                    // }}
                    >
                        {row.active ? "Active" : "Inactive"}
                    </Typography>

                )
            }
        },

        {
            id: 'description',
            label: 'Description',
            width: '100px',
            visibleFor: ['all'],
            truncateWithEllipsis: true
        }
    ]

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
                    {/* <Paper
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
                    </Paper> */}

                    <Box minWidth="180px">
                        <SearchField
                            // sx={{ ml: 1, flex: 1 }}
                            name="searchProjacr"
                            placeholder="Search Project by name"
                            value={searchQuery}
                            // onChange={handleSearch}
                            onChange={(v) => {
                                setSearchQuery(v);
                                setPage(1);
                            }}
                        />
                    </Box>



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
                    //     <Grid container spacing={3}>
                    //     {[1, 2, 3,4].map((item) => (
                    //         <Grid size={{ xs: 12, sm: 6, md: 4, lg:3}} key={item}>
                    //             <CustomSkeleton height={250} />
                    //         </Grid>
                    //     ))}
                    // </Grid>

                    <CustomSkeleton height={300} />

                )
                    : (
                        <>
                            {
                                (mode === "grid") ? (
                                    <Grid container spacing={3}>
                                        {projects.map((project: any) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={project.code}>
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

                                ) :
                                    (
                                        <CustomTable<any>
                                            showPagination={false}
                                            columns={ALL_COLUMNS}
                                            data={projects}
                                            defaultSortBy={sortBy}
                                            defaultSortDirection={sortDirection}
                                            onSortChange={handleSortChange}
                                            rowPadding='10px 12px'
                                        />

                                    )
                            }
                        </>


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