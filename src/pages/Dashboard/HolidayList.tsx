import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    alpha,
    useTheme,
    Chip,
    Paper,
    Stack,
} from "@mui/material";
import apiService from "../../services/apiService";
import { API_ENDPOINTS } from "../../constants/apiUrls";
import axios from "axios";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
// import CelebrationIcon from "@mui/icons-material/Celebration";
// import EventIcon from "@mui/icons-material/Event";
// import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import { format, isValid, parse } from "date-fns";
import { customCard } from "../../shared/Styles/CommonStyles";
import CustomSkeleton from "../../shared/CustomSkeleton/CustomSkeleton";

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
    const year = new Date().getFullYear();

    const formatHolidayDate = (dateStr?: string) => {
        if (!dateStr) return { dayName: '-', day: '-', month: '-', monthYear: '-' };

        const formatsToTry = [
            "yyyy-MM-dd'T'HH:mm:ssXXX",
            "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
            "dd/MM/yyyy",
        ];

        let parsedDate: Date | null = null;

        for (const fmt of formatsToTry) {
            const d = parse(dateStr, fmt, new Date());
            if (isValid(d)) {
                parsedDate = d;
                break;
            }
        }

        if (!parsedDate) return { dayName: '-', day: '-', month: '-', monthYear: '-' };

        return {
            dayName: format(parsedDate, 'EEEE'),
            day: format(parsedDate, 'dd'),
            month: format(parsedDate, 'MMM'),
            monthYear: format(parsedDate, 'MMM yyyy'),
        };
    };

    // const getHolidayIcon = (type?: string) => {
    //     switch (type) {
    //         case 'floater':
    //             return <BeachAccessIcon fontSize="small" />;
    //         case 'optional':
    //             return <EventIcon fontSize="small" />;
    //         default:
    //             return <CelebrationIcon fontSize="small" />;
    //     }
    // };

    const getTypeColor = (type?: string) => {
        switch (type) {
            case 'floater':
                return theme.palette.info.main;
            case 'optional':
                return theme.palette.warning.main;
            default:
                return theme.palette.success.main;
        }
    };

    const getTypeLabel = (type?: string) => {
        switch (type) {
            case 'floater':
                return 'Floater';
            case 'optional':
                return 'Optional';
            default:
                return 'Public';
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const payload = { year };
            const response = await apiService.getMethodParams(
                API_ENDPOINTS.HOLIDAY_LIST,
                payload
            );
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
    }, []);

    return (
        <Box sx={{ height: '100%' }}>

            {loading ? (
                <CustomSkeleton height={"100%"} />
            ) : holidays.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{
                        textAlign: 'center',
                        py: 4,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.grey[100], 0.8),
                        border: `1px dashed ${alpha(theme.palette.grey[400], 0.5)}`
                    }}
                >
                    <CalendarTodayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.6 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No holidays found for {year}
                    </Typography>
                </Paper>
            ) : (
                <Box
                    sx={{
                        p: 1,
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: '1fr 1fr'
                        },
                        gap: 2
                    }}
                >
                    {holidays.map((holiday) => {
                        const { dayName, day, month } = formatHolidayDate(holiday.date);
                        const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';

                        return (
                            <Box
                                key={holiday.code}
                                sx={{
                                    ...customCard,
                                    transition: 'all 0.2s ease',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.light, 0.04),
                                        transform: 'translateY(-2px)'
                                    },
                                    display: 'flex',
                                    gap: 2

                                }}
                            >
                                <Box display={'flex'} justifyContent={'center'}>
                                    {/* Date box */}
                                    <Box
                                        sx={{
                                            minWidth: 56,
                                            maxWidth: 64,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 2,
                                                bgcolor: isWeekend
                                                    ? alpha(theme.palette.warning.light, 0.15)
                                                    : alpha(theme.palette.primary.light, 0.15),
                                                border: `1px solid ${isWeekend
                                                    ? alpha(theme.palette.warning.light, 0.3)
                                                    : alpha(theme.palette.primary.light, 0.3)
                                                    }`
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                color={isWeekend ? 'warning.main' : 'primary.main'}
                                                fontWeight={600}
                                                sx={{ display: 'block', lineHeight: 1 }}
                                            >
                                                {month}
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                                color={isWeekend ? 'warning.dark' : 'primary.dark'}
                                                sx={{ lineHeight: 1.2 }}
                                            >
                                                {day}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color={isWeekend ? 'warning.main' : 'text.secondary'}
                                                sx={{ display: 'block', lineHeight: 1 }}
                                            >
                                                {dayName.slice(0, 3)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Content */}
                                <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
                                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>

                                        <Typography variant="body1" fontWeight={600} noWrap>
                                            {holiday.name}
                                        </Typography>
                                    </Stack>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                            label={getTypeLabel(holiday.type)}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(getTypeColor(holiday.type), 0.1),
                                                color: getTypeColor(holiday.type),
                                                fontWeight: 400,
                                                '& .MuiChip-label': { px: 1 }
                                            }}
                                        />

                                        {isWeekend && (
                                            <Chip
                                                label="Weekend"
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderColor: alpha(theme.palette.warning.main, 0.3),
                                                    color: theme.palette.warning.dark
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>

            )}
        </Box>
    );
};

export default HolidayScreen;