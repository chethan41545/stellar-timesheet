import React, { useEffect, useState } from 'react';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import axios from 'axios';
import CustomTable from '../../shared/CustomTable/CustomTable';
import { Box, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

import SearchField from '../../shared/SearchField/SearchField';
import { useDebouncedValue } from '../../utils/commonUtils';
// import { useNavigate } from 'react-router-dom';
import MultiSelect from '../../shared/MultiSelect/MultiSelectWithoutController';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { formatDate, getCurrentWeekDates } from '../../utils/dateUtils';
import Button from '../../shared/Button/Button';
import { getStatusColor } from '../../constants/constants';
// import { enGB } from 'date-fns/locale/en-GB';



interface TimesheetResponse {
    timesheet: any;
    meta: any;
    // {
    //     page: number;
    //     per_page: number;
    //     total: number;
    //     total_pages: number;
    // };
}


const TimesheetList: React.FC = () => {

    // const [data, setData] = useState<TimesheetResponse[]>([]);
    const [data, setData] = useState<TimesheetResponse | null>(null);

    const lookUpData = JSON.parse(
        localStorage.getItem("lookup") || "{}"
    );

    const timesheetStatus = lookUpData?.timesheet_status ?? [];

    const getInitialTimesheetStatus = () => {

        const saved = localStorage.getItem("selected_timesheet_status");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            } catch {
                // ignore invalid storage
            }
        }

        // fallback → select all
        return timesheetStatus.map((s: any) => s.value);
    };

    const [selectedTimesheetStatus, setSelectedTimesheetStatus] =
        React.useState<string[]>(getInitialTimesheetStatus);


    // const [selectedTimesheetStatus, setSelectedTimesheetStatus] = React.useState<string[]>(
    //     timesheetStatus.map((s: any) => s.value)
    // );

    const validationSchema = yup.object({
        start_date: yup.date().nullable().required('Start date is required'),
        end_date: yup
            .date()
            .nullable()
            .min(yup.ref('start_date'), 'End date must be after start date'),
    });

    // const { monday, sunday } = getCurrentWeekDates();

    const getInitialDates = () => {
        const savedStart = localStorage.getItem("start_date");
        const savedEnd = localStorage.getItem("end_date");

        const { monday, sunday } = getCurrentWeekDates();

        return {
            start_date: savedStart ? new Date(savedStart) : monday,
            end_date: savedEnd ? new Date(savedEnd) : sunday,
        };
    };


    const initialDates = getInitialDates();

    const formik = useFormik({
        initialValues: {
            start_date: initialDates.start_date,
            end_date: initialDates.end_date,
        },
        validationSchema,
        onSubmit: async () => {
            fetchData();
        },
    });




    // const formik = useFormik<any>({
    //     initialValues: {
    //         start_date: monday,
    //         end_date: sunday
    //     },
    //     validationSchema,
    //     onSubmit: async () => {
    //         fetchData();
    //     }
    // })

    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [search, setSearch] = useState<any>('');

    const debouncedSearch = useDebouncedValue(search, 350);

    const [sortBy, setSortBy] = useState('week_start');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');


    const handleSortChange = (sb: any, sd: 'asc' | 'desc') => {
        setSortBy(sb);
        setSortDirection(sd);
    };

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setSize(newPageSize);
    };


    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(true);
    // const navigate = useNavigate();

    // const submitTimesheet = (row: any) => {
    //     navigate(`/timesheets/${row.timesheet_code}`);
    // };

    const columns = [
        {
            id: 'user_name',
            label: 'User',
            width: '120px',
            sortable: true,
            format: (value: string, row: any) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            component={'a'}
                            href={`/timesheets/${row.timesheet_code}`}
                            fontSize="12px"
                            role="button"
                            tabIndex={0}
                            // onClick={() => submitTimesheet(row)}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline', color: 'primary.main' },
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {value}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            id: 'timesheet_status',
            label: 'Status',
            width: '120px',
            // sortable: true,
            format: (value: string) => {

                return (
                    <span
                        style={{
                            background: 'transparent',
                            fontWeight: 500,
                            borderRadius: '999px',
                            color: getStatusColor(value),
                        }}
                    >
                        {value}
                    </span>
                );
            }
        },
        {
            id: 'week_start',
            label: 'Start',
            width: '120px',
            sortable: true
        },
        {
            id: 'week_end',
            label: 'End',
            width: '120px',
            sortable: true
        },
        {
            id: 'total_hours',
            label: 'Total Hours',
            width: '120px',
            sortable: true
        },
    ]

    useEffect(() => {
        fetchData()
    }, [
        page,
        size,
        sortBy,
        sortDirection,
        debouncedSearch,
        selectedTimesheetStatus
    ])

    const fetchData = async () => {
        setTableLoading(true);

        // if (typed.length === 1) return;
        const payload = {
            'page': page,
            'per_page': size,
            'sort_by': sortBy,
            'sort_direction': sortDirection,
            'search': debouncedSearch,
            "timesheet_status": selectedTimesheetStatus,
            "start_date": formik.values.start_date ? formatDate(formik.values.start_date, 'YYYY-MM-DD') : null,
            "end_date": formik.values.end_date ? formatDate(formik.values.end_date, 'YYYY-MM-DD') : null
        }

        try {

            const response = await apiService.postMethod(API_ENDPOINTS.ALL_CANDIDATE_TIMESHEET_SEARCH, payload);

            setData(response.data.data);

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error('API Error:', err.response?.data?.message || err.message);
            } else {
                console.error('Unexpected Error:', err);
            }
        } finally {
            setLoading(false);
            setTableLoading(false);
        }
    };

    const handleDownload = async () => {

        const payload = {
            'page': page,
            'per_page': size,
            'sort_by': sortBy,
            'sort_direction': sortDirection,
            'search': debouncedSearch,
            "timesheet_status": selectedTimesheetStatus,
            "start_date": formik.values.start_date ? formatDate(formik.values.start_date, 'YYYY-MM-DD') : null,
            "end_date": formik.values.end_date ? formatDate(formik.values.end_date, 'YYYY-MM-DD') : null
        }

        try {

            const response = await apiService.postMethod(API_ENDPOINTS.DOWNLOAD_TIMESHEET, payload);

            // Assuming your backend returns { data: "<base64_string>", filename: "timesheets.xlsx" }
            const base64String = response.data.data;
            const filename = response.data.filename || "timesheets.xlsx";

            // Convert Base64 to Blob
            const byteCharacters = atob(base64String); // decode base64
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            // Create a link and trigger download
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();


        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error('API Error:', err.response?.data?.message || err.message);
            } else {
                console.error('Unexpected Error:', err);
            }
        }
    }

    const handleSubmit = () => {
        formik.handleSubmit();

    }


    return (
        <>
            {
                loading ? (
                    <>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ my: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} />
                    </>
                ) : (

                    <Grid container justifyContent={"space-between"}>

                        <Grid size={{ xs: 12, md: 11 }}>
                            <Grid container columnSpacing={2}>

                                <Grid size={{ xs: 12, md: 3 }} sx={{ margin: "8px", marginLeft: 0 }}>
                                    <SearchField
                                        name="searchUser"
                                        value={search}
                                        onChange={(v) => {
                                            setSearch(v);
                                            setPage(1);
                                        }}
                                        placeholder="Search by Employee"
                                    />

                                </Grid>

                                <Grid size={{ xs: 12, md: 2.5 }}>
                                    {
                                        timesheetStatus && (
                                            <MultiSelect
                                                label="Timesheet Status"
                                                options={timesheetStatus}
                                                value={selectedTimesheetStatus}
                                                // onChange={setSelectedTimesheetStatus}
                                                onChange={(values) => {
                                                    setSelectedTimesheetStatus(values);
                                                    localStorage.setItem(
                                                        "selected_timesheet_status",
                                                        JSON.stringify(values)
                                                    );
                                                }}
                                                selectAllByDefault={selectedTimesheetStatus.length > 0 ? false : true}
                                                width={"96%"}
                                            />

                                        )
                                    }
                                </Grid>

                                <LocalizationProvider dateAdapter={AdapterDateFns}
                                >

                                    <Grid size={{ xs: 12, md: 2.5 }} mt={1}>
                                        <DatePicker
                                            label="Start Date *"
                                            value={formik.values.start_date}
                                            // onChange={(v) => formik.setFieldValue('start_date', v)}
                                            onChange={(v) => {
                                                formik.setFieldValue("start_date", v);
                                                localStorage.setItem("start_date", v?.toISOString() ?? "");
                                            }}
                                            format="dd/MM/yyyy"  // Indian date format
                                            slotProps={{
                                                textField: {
                                                    sx: {
                                                        "& .MuiPickersSectionList-root": {
                                                            padding: "9px 6px",
                                                        },
                                                    },
                                                },
                                            }}

                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12, md: 2.5 }} mt={1}>
                                        <DatePicker
                                            label="End Date *"
                                            value={formik.values.end_date}
                                            onChange={(v) => {
                                                formik.setFieldValue('end_date', v);
                                                localStorage.setItem("end_date", v?.toISOString() ?? "");
                                            }
                                            }
                                            format="dd/MM/yyyy"

                                            slotProps={{
                                                textField: {
                                                    sx: {
                                                        "& .MuiPickersSectionList-root": {
                                                            padding: "9px 6px",
                                                        },
                                                    },
                                                },
                                            }}

                                        />
                                    </Grid>

                                    <Grid size={{ xs: 4, md: 1 }} mt={1}>

                                        <Button
                                            type="submit"
                                            onClick={handleSubmit}

                                            label='Submit' />

                                    </Grid>
                                </LocalizationProvider>
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 1 }} display={"flex"} justifyContent={"flex-end"}>
                            <Tooltip title="Download Timesheets">
                                <IconButton
                                    onClick={handleDownload}
                                    color="primary"
                                    sx={{
                                        padding: 1, // adjust size
                                        borderRadius: '50%', // ensures perfect circle
                                        width: 40, // fixed width
                                        height: 40, // fixed height
                                        minWidth: 0, // remove default MUI minWidth
                                    }}
                                >
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>



                        <Grid mt={2} size={{ xs: 12 }}>
                            {
                                tableLoading ? (
                                    <Skeleton variant="rectangular" width="100%" height={400} />

                                ) : (
                                    <CustomTable<any>
                                        columns={columns}
                                        data={data?.timesheet}
                                        totalRows={data?.meta.total}
                                        defaultPage={page}
                                        defaultPageSize={size}
                                        defaultSortBy={sortBy}
                                        defaultSortDirection={sortDirection}
                                        onRefresh={fetchData}
                                        onSortChange={handleSortChange}
                                        onPageChange={handlePageChange}
                                        // loading={tableLoading}
                                        rowPadding='12px 8px'
                                    />

                                )
                            }

                        </Grid>
                    </Grid>
                )
            }
        </>
    );
};

export default TimesheetList;
