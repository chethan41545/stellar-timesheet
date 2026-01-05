import React, { useEffect, useState } from "react";
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent,
    Card,
    Typography,
    Grid,
    Chip,
    Paper,
    alpha,
    useTheme,
    Stack,
} from "@mui/material";
import apiService from "../../services/apiService";
import { API_ENDPOINTS } from "../../constants/apiUrls";
import axios from "axios";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { format,  isToday, isValid, parse } from "date-fns";

type Holiday = {
    code: string;
    date: string;
    description: string;
    name: string;
    type?: 'public' | 'floater' | 'optional';
};

const HolidayScreen: React.FC = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());

    const formatHolidayDate = (dateStr?: string) => {
        if (!dateStr) return { dayName: '-', day: '-', monthYear: '-' };

        // Try multiple formats
        const formatsToTry = [
            "yyyy-MM-dd'T'HH:mm:ssXXX", // ISO 8601
            "EEE, dd MMM yyyy HH:mm:ss 'GMT'", // RFC 1123
            "dd/MM/yyyy", // your DD/MM/YYYY format
        ];

        let parsedDate: Date | null = null;

        for (const fmt of formatsToTry) {
            const d = parse(dateStr, fmt, new Date());
            if (isValid(d)) {
                parsedDate = d;
                break;
            }
        }

        if (!parsedDate) return { dayName: '-', day: '-', monthYear: '-' };

        return {
            dayName: format(parsedDate, 'EEEE'),
            day: format(parsedDate, 'dd'),
            monthYear: format(parsedDate, 'MMM yyyy'),
        };
    };



    const fetchData = async () => {
        setLoading(true);
        try {
            const payload = { year };
            const response = await apiService.getMethodParams(
                API_ENDPOINTS.HOLIDAY_LIST,
                payload
            );
            // Add type to fetched holidays
            // const holidaysWithType = response.data.data.map((holiday: Holiday) => ({
            //     ...holiday,
            //     type: 'public'
            // }));
            setHolidays(response.data.data);
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

    useEffect(() => {
        fetchData();
    }, [year]);

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setYear(Number(event.target.value));
    };

    // Generate years for selector
    const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);


    const publicHolidayCount = holidays.filter(h => h.type === "public").length;
    const floaterLeaveCount = holidays.filter(h => h.type === "floater").length;

    const totalHolidays = publicHolidayCount + floaterLeaveCount;

    // Get holiday card background color
    const getCardBackground = (type: string, date: string) => {
        const holidayDate = new Date(date);

        if (isToday(holidayDate)) {
            return `linear-gradient(135deg, ${alpha(theme.palette.warning.light, 0.2)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`;
        }

        if (type === 'floater') {
            return `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.15)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`;
        }

        return `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.15)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`;
    };

    // Get border color
    const getBorderColor = (type: string, date: string) => {
        const holidayDate = new Date(date);

        if (isToday(holidayDate)) {
            return theme.palette.warning.main;
        }

        if (type === 'floater') {
            return theme.palette.success.main;
        }

        return theme.palette.primary.main;
    };

    // Get status chip
    // const getStatusChip = (date: string) => {
    //     const holidayDate = new Date(date);
    //     console.log(holidayDate,"holidayDate");

    //     if (isToday(holidayDate)) {
    //         return <Chip label="Today" size="small" color="warning" sx={{ fontWeight: 600 }} />;
    //     }

    //     if (isPast(holidayDate)) {
    //         return <Chip label="Passed" size="small" variant="outlined" color="default" />;
    //     }

    //     return <Chip label="Upcoming" size="small" color="success" variant="outlined" />;
    // };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    📅 Holidays Calendar {year}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View all public holidays and floater leaves in an interactive calendar view
                </Typography>
            </Box>

            {/* Stats Summary */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                        <Typography variant="h2" fontWeight={800} color="primary.main">
                            {totalHolidays}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Days Off
                        </Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(theme.palette.success.light, 0.1) }}>
                        <Typography variant="h2" fontWeight={800} color="success.main">
                            {floaterLeaveCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Floater Leaves
                        </Typography>
                    </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(theme.palette.primary.light, 0.1) }}>
                        <Typography variant="h2" fontWeight={800} color="primary.main">
                            {publicHolidayCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Public Holidays
                        </Typography>
                    </Card>
                </Grid>

                {/* <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: alpha(theme.palette.warning.light, 0.1) }}>
                        <Typography variant="h2" fontWeight={800} color="warning.main">
                            {filteredData.filter(item => isFuture(new Date(item.date)) || isToday(new Date(item.date))).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Upcoming
                        </Typography>
                    </Card>
                </Grid> */}
            </Grid>

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {/* <Button
                            variant={filter === 'all' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setFilter('all')}
                        >
                            All Days
                        </Button> */}
                        {/* <Button
                            variant={filter === 'public' ? 'contained' : 'outlined'}
                            size="small"
                            startIcon={<BeachAccessIcon />}
                            onClick={() => setFilter('public')}
                        >
                            Public Holidays
                        </Button>
                        <Button
                            variant={filter === 'floater' ? 'contained' : 'outlined'}
                            size="small"
                            startIcon={<EventNoteIcon />}
                            onClick={() => setFilter('floater')}
                            color="success"
                        >
                            Floater Leaves
                        </Button>
                        <Button
                            variant={filter === 'upcoming' ? 'contained' : 'outlined'}
                            size="small"
                            onClick={() => setFilter('upcoming')}
                            color="warning"
                        >
                            Upcoming
                        </Button> */}
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* <IconButton onClick={() => setViewMode('compact')} color={viewMode === 'compact' ? 'primary' : 'default'}>
                            <ViewListIcon />
                        </IconButton>
                        <IconButton onClick={() => setViewMode('grid')} color={viewMode === 'grid' ? 'primary' : 'default'}>
                            <ViewModuleIcon />
                        </IconButton> */}

                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={year}
                                onChange={handleYearChange}
                                label="Year"
                            >
                                {yearOptions.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Paper>

            {/* Holiday Cards Grid */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography>Loading holidays...</Typography>
                </Box>
            ) : holidays.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 10, bgcolor: alpha(theme.palette.grey[200], 0.5), borderRadius: 2 }}>
                    <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        No holidays found for {year}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try selecting a different year or filter
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {holidays.map((holiday) => {
                        const { dayName, day, monthYear } = formatHolidayDate(holiday.date);

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={holiday.code}>
                                <Card
                                    sx={{
                                        borderRadius: 2,
                                        border: `1.5px solid ${getBorderColor(holiday.type || 'public', holiday.date)}`,
                                        background: getCardBackground(holiday.type || 'public', holiday.date),
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        // height: '100%',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 6px 12px ${alpha(getBorderColor(holiday.type || 'public', holiday.date), 0.15)}`,
                                        }
                                    }}
                                >
                                    {/* Compact Calendar Header */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        {/* Calendar Date Box */}
                                        <Box
                                            sx={{
                                                mr: 2,
                                                textAlign: 'center',
                                                minWidth: 56,
                                                bgcolor: alpha(getBorderColor(holiday.type || 'public', holiday.date), 0.1),
                                                borderRadius: 1.5,
                                                p: 1,
                                                border: `1px solid ${alpha(getBorderColor(holiday.type || 'public', holiday.date), 0.3)}`
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                {monthYear.split(' ')[0]}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {day}
                                            </Typography>


                                        </Box>

                                        {/* Holiday Title - Compact */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                {holiday.name}
                                            </Typography>

                                            <Typography variant="caption" color="text.primary">
                                                {dayName.substring(0, 3)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                <Chip
                                                    icon={holiday.type === 'floater' ? <EventNoteIcon fontSize="small" /> : <BeachAccessIcon fontSize="small" />}
                                                    label={holiday.type === 'floater' ? 'Floater' : 'Public'}
                                                    size="small"
                                                    color={holiday.type === 'floater' ? 'success' : 'primary'}
                                                    variant="outlined"
                                                    sx={{
                                                        height: 24,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 500
                                                    }}
                                                />
                                                {/* <Typography variant="caption" color="text.secondary">
                                                    {holiday.description && holiday.description.length > 50
                                                        ? `${holiday.description.substring(0, 50)}...`
                                                        : holiday.description}
                                                </Typography> */}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            )}


        </Box>
    );
};

export default HolidayScreen;