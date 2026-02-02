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
    ListItem,
    List,
} from "@mui/material";
import apiService from "../../services/apiService";
import { API_ENDPOINTS } from "../../constants/apiUrls";
import axios from "axios";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { format, isToday, isValid, parse } from "date-fns";

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
            {/* <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    📅 Holidays Calendar {year}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View all public holidays and floater leaves in an interactive calendar view
                </Typography>
            </Box> */}

            {/* Stats Summary */}
            {/* <Grid container spacing={3} sx={{ mb: 4 }}>
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
            </Grid> */}

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">

                    <Stack direction="row" spacing={1} alignItems="center">
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
                <List sx={{ py: 0 }}>
                    {holidays.map((holiday) => {
                        const { dayName, day, monthYear } = formatHolidayDate(holiday.date);
                        const month = monthYear.split(' ')[0];

                        return (
                            <ListItem
                                key={holiday.code}
                                sx={{
                                    px: 0,
                                    py: 1,
                                    alignItems: 'flex-start',
                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                    '&:last-child': { borderBottom: 'none' }
                                }}
                            >
                                <Box sx={{ minWidth: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {month.slice(0, 3)}
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {day}
                                    </Typography>
                                </Box>

                                <Box sx={{ flexGrow: 1, ml: 1.5 }}>
                                    <Typography variant="body2" fontWeight={500} noWrap>
                                        {holiday.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {dayName.slice(0, 3)} • {holiday.type === 'floater' ? 'Floater' : 'Public'}
                                    </Typography>
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>


            )}


        </Box>
    );
};

export default HolidayScreen;