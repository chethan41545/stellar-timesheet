import { useEffect, useState } from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Box,
} from "@mui/material";
import axios from "axios";

interface TimesheetReportRow {
    timesheet_id: number;
    user_name: string;
    week_start: string;
    week_end: string;
    status: string;
    total_hours: number;
}

const TimesheetReport = () => {
    const [data, setData] = useState<TimesheetReportRow[]>([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     axios
    //         .get("/api/reports/timesheets")
    //         .then((res) => setData(res.data))
    //         .finally(() => setLoading(false));
    // }, []);

    if (loading) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Week Start</TableCell>
                        <TableCell>Week End</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Total Hours</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {/* {data.map((row) => (
                        <TableRow key={row.timesheet_id}>
                            <TableCell>{row.user_name}</TableCell>
                            <TableCell>{row.week_start}</TableCell>
                            <TableCell>{row.week_end}</TableCell>
                            <TableCell>{row.status}</TableCell>
                            <TableCell align="right">{row.total_hours}</TableCell>
                        </TableRow>
                    ))} */}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TimesheetReport;
