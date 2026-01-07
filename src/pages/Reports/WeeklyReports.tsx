import React, { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { API_ENDPOINTS } from "../../constants/apiUrls";
import axios from "axios";
import {
    Skeleton,
    Box,
    Grid,
    Typography,
    Chip,
    Paper,
    useTheme,
    alpha,
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    CartesianGrid,
} from "recharts";
import MultiSelect from "../../shared/MultiSelect/MultiSelectWithoutController";
import {
    TrendingUp,
    Assignment,
    People,
    AccessTime,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    StackedBarChart,
} from "@mui/icons-material";

interface ReportResponse {
    employee_summary: { user_full_name: string; total_hours: number }[];
    project_summary: { project_name: string; total_hours: number }[];
    task_summary: any[];
}

const COLORS = [
    "#4F8EF7",
    "#5E99F7",
    "#6BA4F8",
    "#7BAFF9",
    "#8CBDF9",
    "#9DCBF9",
    "#AED9FA",
    "#BFE7FB",
];

const LESSER_COLORS = [
    "#4F8EF7",
    "#6BA4F8",
    "#8CBDF9",
    "#9DCBF9",
    "#BFE7FB",
];


const WeeklyReports: React.FC = () => {
    const [data, setData] = useState<ReportResponse | null>(null);
    const [users, setUsers] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = React.useState<string[]>([]);
    const theme = useTheme();

    useEffect(() => {
        fetchReports();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [selected]);

    const fetchUsers = async () => {
        try {
            const payload = { variant: "all" };
            const response = await apiService.postMethod(
                API_ENDPOINTS.GET_USER_LIST,
                payload
            );

            const usersList = response.data.data.map((user: any) => ({
                label: user.name,
                value: user.code,
            }));

            setUsers(usersList);
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

    const fetchReports = async () => {
        try {
            const payload = {
                user_codes: selected,
            };
            const response = await apiService.postMethod(
                API_ENDPOINTS.PROJECT_REPORTS,
                payload
            );
            setData(response.data.data);
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

    if (loading) {
        return (
            <Grid container>
                <Skeleton variant="rectangular" width="100%" height={150} sx={{ mb: 3, borderRadius: 2 }} />
                <Grid size={{ xs: 12}}>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {[1, 2, 3,4].map((i) => (
                            <Grid size={{ xs: 12, sm: 6, md: 2.5 }} key={i}>
                                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3, mb: 3 }} />
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
        );
    }

    const totalHours = data?.project_summary.reduce((a, b) => a + b.total_hours, 0) || 0;
    const uniqueEmployees = new Set(data?.employee_summary.map((e) => e.user_full_name)).size;
    const taskNames = Object.keys(data?.task_summary[0] || {}).filter((k) => k !== "project_name");

    const StatCard = ({
        title,
        value,
        icon: Icon,
        subtitle,
    }: {
        title: string;
        value: string | number;
        icon: React.ElementType;
        subtitle?: string;
    }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                // height: "100%",
                borderRadius: 3,
                position: "relative",
                border: "1px dashed black",
                overflow: "hidden",
            }}
        >
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Icon sx={{ fontSize: 32, opacity: 0.9 }} />
                </Box>
            </Box>
        </Paper>
    );

    return (
        <Grid container sx={{ py: 0 }}>

            <Grid size={{ xs: 12 }}>

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 4,
                        borderRadius: 3,
                        background: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Filter by Employees
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select employee to view their contribution reports
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            {users && (
                                <MultiSelect
                                    label="Users"
                                    options={users}
                                    value={selected}
                                    onChange={setSelected}
                                    selectAllByDefault={true}
                                />
                            )}
                            {selected.length > 0 && (
                                <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    <Chip
                                        label={`${selected.length} user${selected.length > 1 ? "s" : ""} selected`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <StatCard
                            title="Total Hours"
                            value={totalHours}
                            subtitle="This week"
                            icon={AccessTime}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <StatCard
                            title="Active Projects"
                            value={data?.project_summary.length || 0}
                            subtitle="Across team"
                            icon={Assignment}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <StatCard
                            title="Team Members"
                            value={uniqueEmployees}
                            subtitle="Contributing"
                            icon={People}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                        <StatCard
                            title="Avg Hours/Day"
                            value={(totalHours / 7).toFixed(1)}
                            subtitle="Team average"
                            icon={TrendingUp}
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid size={{ xs: 12 }}>

                {/* Charts Grid */}
                <Grid container spacing={3}>
                    {/* Employee Hours Bar Chart */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                pb: 0,
                                borderRadius: 3,
                                height: "100%",
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <BarChartIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Employee Hours Distribution
                                </Typography>
                            </Box>
                            <Box sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data?.employee_summary}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                        barGap={8}
                                        barCategoryGap="15%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                        <XAxis
                                            dataKey="user_full_name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{ fill: theme.palette.text.secondary }}
                                        />
                                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                boxShadow: theme.shadows[3],
                                            }}
                                            cursor={{ fill: alpha(theme.palette.primary.main, 0.1) }}
                                        />
                                        <Bar
                                            dataKey="total_hours"
                                            radius={[8, 8, 0, 0]}
                                            barSize={32}
                                            name="Hours Worked"
                                        >
                                            {data?.employee_summary.map((_, idx) => (
                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Project Hours Pie Chart */}
                    <Grid size={{ xs: 12, lg: 4 }} mt={{ xs: 4, lg: 0 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                pb: 0,
                                borderRadius: 3,
                                height: "100%",
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <PieChartIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Hours by Project
                                </Typography>
                            </Box>
                            <Box sx={{ height: 360 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        {/* <Pie
                                        data={data?.project_summary || []}
                                        dataKey="total_hours"
                                        nameKey="project_name"
                                        // cx="50%"
                                        // cy="50%"
                                        outerRadius={100}
                                        innerRadius={50}
                                        paddingAngle={2}
                                        label={(entry: any) => `${entry.project_name}: ${entry.total_hours}h`}
                                        labelLine={false}
                                    >
                                        {(data?.project_summary || []).map((_, i) => (
                                            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie> */}

                                        <Pie
                                            data={data?.project_summary || []}
                                            dataKey="total_hours"
                                            nameKey="project_name"
                                            outerRadius={100}
                                            innerRadius={50}
                                            paddingAngle={2}
                                        >
                                            {(data?.project_summary || []).map((_, i) => (
                                                <Cell key={`cell-${i}`} fill={LESSER_COLORS[i % LESSER_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend
                                            layout="vertical"
                                            verticalAlign="middle"
                                            align="right"
                                            wrapperStyle={{
                                                paddingLeft: "20px",
                                                fontSize: "12px"
                                            }}
                                        />

                                        <Tooltip
                                            formatter={(value) => [`${value} hours`, "Total Hours"]}
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                boxShadow: theme.shadows[3],
                                            }}
                                        />

                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Task Hours Grouped Bar Chart */}
                    <Grid size={{ xs: 12 }} mt={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                pb: 0,
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                <StackedBarChart sx={{ mr: 1.5, color: theme.palette.primary.main }} />
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Task Hours by Project
                                </Typography>
                            </Box>
                            <Box sx={{ height: 450 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={data?.task_summary || []}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        barGap={4}
                                        barCategoryGap="15%"
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                                        <XAxis
                                            dataKey="project_name"
                                            // angle={-45}
                                            textAnchor="middle"
                                            height={80}
                                            tick={{ fill: theme.palette.text.secondary }}
                                        />
                                        <YAxis tick={{ fill: theme.palette.text.secondary }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: 8,
                                                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                                boxShadow: theme.shadows[3],
                                            }}
                                        />
                                        <Legend
                                            wrapperStyle={{
                                                paddingTop: 20,
                                            }}
                                        />
                                        {taskNames.map((task, idx) => (
                                            <Bar
                                                key={task}
                                                dataKey={task}
                                                name={task.replace(/_/g, " ")}
                                                fill={LESSER_COLORS[idx % LESSER_COLORS.length]}
                                                radius={[8, 8, 0, 0]}
                                                barSize={32}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Grid>


        </Grid>
    );
};

export default WeeklyReports;