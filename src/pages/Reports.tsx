import React, { useEffect, useState } from "react";
import apiService from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import axios from "axios";
import { Skeleton, Card, CardContent, Box } from "@mui/material";

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
} from "recharts";
import GraphTooltip from "../shared/GraphTooltip/GraphTooltip";
import { customScrollbar } from "../shared/Styles/CommonStyles";
import MultiSelect from "../shared/MultiSelect/MultiSelectWithoutController";
// import MultiSelectField from "../shared/MultiSelect/MultiSelectField";
// import WeekPicker from "../shared/DatePicker/WeekPicker";
// import dayjs, { Dayjs } from 'dayjs';
// import WeekPicker from "../shared/DatePicker/WeekPicker";

// import WeekPicker from "../shared/DatePicker/WeekPicker";
// import MultiWeekPicker from "../shared/DatePicker/WeekPicker";
// import dayjs from "dayjs";
// import DateRangeSelector from "../shared/DatePicker/WeekPicker";
// import WeekPicker from "../shared/DatePicker/WeekPicker";

interface ReportResponse {
    employee_summary: { user_full_name: string; total_hours: number }[];
    project_summary: { project_name: string; total_hours: number }[];
    task_summary: any[]; // already in grouped bar chart format
}


const COLORS = [
    "#009EF1", "#00CFFF", "#006BB3", "#00A0E3",
    "#FF7043", "#FFB74D", "#4CAF50", "#AED581", "#BA68C8"
];

const ReportsScreen: React.FC = () => {
    const [data, setData] = useState<ReportResponse | null>(null);
    const [users, setUsers] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<any>("");

    // const options = [
    //     { label: 'Oliver Hansen', value: 'oliver' },
    //     { label: 'Van Henry', value: 'van' },
    //     { label: 'April Tucker', value: 'april' },
    // ];

    const [selected, setSelected] = React.useState<string[]>([]);





    useEffect(() => {
        fetchReports();
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [selected]);

    const fetchUsers = async () => {
        try {
            const payload = {show_all:true}
            const response = await apiService.postMethod(API_ENDPOINTS.GET_USER_LIST, payload);

            const usersList = response.data.data.map((user:any) => ({
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
                user_codes: selected
            }
            const response = await apiService.postMethod(API_ENDPOINTS.PROJECT_REPORTS, payload);
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
            <>
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" width="100%" height={300} />
            </>
        );
    }

    const totalHours = data?.project_summary.reduce((a, b) => a + b.total_hours, 0) || 0;

    // ===========================
    // TASK DATA
    // ===========================
    // task_summary is already grouped by project with tasks as keys
    const taskNames = Object.keys(data?.task_summary[0] || {}).filter((k) => k !== "project_name");

    const employee_summary = [
        { user_full_name: "Vikram KM", total_hours: 23 },
        { user_full_name: "Chetan S", total_hours: 2 },
        { user_full_name: "Amit R", total_hours: 15 },
        { user_full_name: "Sneha P", total_hours: 18 },
        { user_full_name: "Rahul D", total_hours: 12 },
        { user_full_name: "Priya M", total_hours: 20 },
        { user_full_name: "Karan V", total_hours: 9 },
        { user_full_name: "Neha S", total_hours: 14 },
        { user_full_name: "Ankit T", total_hours: 17 },
        { user_full_name: "Pooja L", total_hours: 6 },
        { user_full_name: "Rohit K", total_hours: 21 },
        { user_full_name: "Tanya C", total_hours: 8 },
        { user_full_name: "Manish G", total_hours: 13 },
        { user_full_name: "Sonal B", total_hours: 19 },
        { user_full_name: "Vivek H", total_hours: 11 },
        { user_full_name: "Riya J", total_hours: 16 },
        { user_full_name: "Naveen F", total_hours: 7 },
        { user_full_name: "Simran D", total_hours: 10 },
        { user_full_name: "Aditya S", total_hours: 22 },
        { user_full_name: "Shreya N", total_hours: 5 }
    ];

    // const [selectedDate, setSelectedDate] = React.useState<Dayjs | null>(dayjs());
    // const [selectedDate, setSelectedDate] = useState(true);



    return (
        <div style={{ padding: "20px" }}>

            {/* <WeekPicker
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
            /> */}

            {/* <WeekPicker
                onWeekSelect={(r) => {
                    setRange(r);
                }}
            />a */}
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}

            {/* <WeekPicker value={selectedRange} onChange={setSelectedRange} /> */}

            {/* </LocalizationProvider> */}

            {/* <div>
                {weeks.map((w, i) => (
                    <p key={i}>
                        {w.weekStart} → {w.weekEnd}
                    </p>
                ))}
            </div> */}
            <MultiSelect
                label="Users"
                options={users}
                value={selected}
                onChange={setSelected}
            />

            {/* <MultiSelectField name={"Users"}  options={[{value:"Vikram",label:"vikram"}]}/> */}


            {/* SUMMARY CARDS */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <h3>Total Hours</h3>
                        <h2>{totalHours}</h2>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <h3>Total Projects</h3>
                        <h2>{data?.project_summary.length}</h2>
                    </CardContent>
                </Card>

                <Card sx={{ flex: 1 }}>
                    <CardContent>
                        <h3>Employees</h3>
                        <h2>{new Set(data?.employee_summary.map((e) => e.user_full_name)).size}</h2>
                    </CardContent>
                </Card>
            </div>

            {/* EMPLOYEE HOURS */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <h3>Employee Hours</h3>
                    <Box sx={{ overflowX: "auto", ...customScrollbar }}>
                        {/* Make the inner chart wider than container */}
                        <div style={{ width: `${data?.employee_summary?.length ? data.employee_summary.length * 120 : 800}px`, height: "400px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.employee_summary}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <XAxis dataKey="user_full_name" angle={-45} textAnchor="end" interval={0} />
                                    <YAxis />
                                    <Tooltip
                                        content={
                                            <GraphTooltip
                                                values={{ user_full_name: "User Name", total_hours: "Total Hours" }}
                                            />
                                        }
                                    />
                                    <Bar dataKey="total_hours">
                                        {data?.employee_summary.map((_, idx) => {

                                            const fill = COLORS[idx % COLORS.length];
                                            return <Cell key={`cell-${idx}`} fill={fill} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Box>
                </CardContent>
            </Card>




            {/* PROJECT HOURS PIE */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <h3>Hours by Project</h3>
                    <div style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.project_summary || []}
                                    dataKey="total_hours"
                                    nameKey="project_name"
                                    label
                                >
                                    {(data?.project_summary || []).map((_, i) => {
                                        const fill = COLORS[i % COLORS.length];
                                        return <Cell key={`cell-${i}`} fill={fill} />;
                                    })}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>


            {/* TASK HOURS GROUPED BAR */}
            <Card>
                <CardContent>
                    <h3>Task Hours (Grouped by Project)</h3>
                    <div style={{ height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data?.task_summary || []}
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                                <XAxis
                                    dataKey="project_name"
                                    angle={-30}
                                    textAnchor="end"
                                    interval={0}
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />

                                {taskNames.map((task, idx) => {
                                    return (
                                        <Bar
                                            key={task}
                                            dataKey={task}
                                            fill={COLORS[idx % COLORS.length]}
                                        />
                                    );
                                })}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
};

export default ReportsScreen;
