import React, { useEffect, useMemo, useState } from 'react';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import axios from 'axios';
import CustomTable from '../../shared/CustomTable/CustomTable';
import { Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, Skeleton, TextField, Tooltip, Typography } from '@mui/material';
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
import { toast } from 'react-toastify';
// import { enGB } from 'date-fns/locale/en-GB';



interface TimesheetResponse {
    timesheet: any;
    meta: any;
}


const TimesheetList: React.FC = () => {

    // const [data, setData] = useState<TimesheetResponse[]>([]);
    const [data, setData] = useState<TimesheetResponse>();
    const [rejecting, setRejecting] = useState(false);

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');


    const lookUpData = JSON.parse(
        localStorage.getItem("lookup") || "{}"
    );

    const timesheetStatus = lookUpData?.timesheet_status ?? [];
    const projectsLk = lookUpData?.projects ?? [];

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

    const getInitialProjects = () => {

        const saved = localStorage.getItem("selected_projects");

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
        return []

        // fallback → select all
        // return projectsLk.map((s: any) => s.value);
    };



    const [selectedTimesheetStatus, setSelectedTimesheetStatus] =
        React.useState<string[]>(getInitialTimesheetStatus);

    const [selectedProjects, setSelectedProjects] =
        React.useState<string[]>(getInitialProjects);

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

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());



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

    const allIdsOnPage = useMemo(
        () =>
            (data?.timesheet ?? [])
                .map((r: any) =>
                    r.timesheet_status === 'Pending Approval' ? String(r.timesheet_code) : null
                )
                .filter(
                    (timesheet_code: any): timesheet_code is string =>
                        timesheet_code !== null
                ),
        [data]
    );


    const isSelected = (row: any) => selectedIds.has(`${row.timesheet_code}`);

    const toggleOne = (row: any) => {
        const key = `${row.timesheet_code}`;
        setSelectedIds(prev => {
            const copy = new Set(prev);
            if (copy.has(key)) copy.delete(key);
            else copy.add(key);
            return copy;
        });
    };


    const toggleAllOnPage = () => {

        setSelectedIds(prev => {
            const copy = new Set(prev);
            if (allSelectedOnPage) {
                allIdsOnPage.forEach((code: string) => copy.delete(code));
            } else {
                allIdsOnPage.forEach((code: string) => {

                    copy.add(code)
                });
            }
            return copy;
        });
    };




    const allSelectedOnPage = allIdsOnPage.length > 0 && allIdsOnPage.every((id: string) => selectedIds.has(id));
    const someSelectedOnPage = allIdsOnPage.some((id: string) => selectedIds.has(id));

    const columns = [
        {
            id: 'select',
            // align: 'center',
            label: (
                <>
                    {
                        selectedProjects.length === 1 && (
                            <Checkbox
                                size="small"
                                indeterminate={someSelectedOnPage && !allSelectedOnPage}
                                checked={allSelectedOnPage}
                                onChange={toggleAllOnPage}
                                inputProps={{ 'aria-label': 'Select all on page' }}
                                style={{ padding: 0, color: '#007bff', display: 'flex', justifyContent: 'center', }}
                            />
                        )}
                </>
            ),
            width: '20px',
            sortable: false,
            format: (_: any, row: any) => (
                < div style={{justifyContent: 'center !important',}}>
                    {
                        selectedProjects.length === 1 && (
                            <Checkbox
                                size="small"
                                checked={isSelected(row)}
                                onChange={() => toggleOne(row)}
                                inputProps={{ 'aria-label': `Select ${row.timesheet_code}` }}
                                sx={{
                                    p: 0,
                                    color: '#007bff !important',                                    
                                    '&.Mui-disabled': {
                                        color: '#ccc !important', // greyed out
                                    },
                                }}
                                disabled={(row.timesheet_status === "Pending Approval" || row.timesheet_status === "PreApprovalRequested") ? false : true}
                            />
                        )
                    }
                </div>
            ),
        },
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
        selectedTimesheetStatus,
        selectedProjects
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
            "projects": selectedProjects,
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


    const handleBulkApprove = async (status: string) => {
        setLoading(true);
        const count = selectedIds.size;
        if (!count) return;

        const payload = {
            timesheet_codes: Array.from(selectedIds),
            action: status,
            project_code: selectedProjects[0],
            comment: rejectReason
        }

        try {
            const response = await apiService.postMethod(API_ENDPOINTS.TIMESHEET_BULK_REVIEW, payload);
            setSelectedIds(new Set());
            setRejecting(false);
            setShowRejectModal(false);
            setRejectReason('');
            // toast.success(response.data.)
            if (response.data.status === "success") {
                toast.success(response.data.message);
            }

            fetchData();

        }
        catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                console.error('API Error:', err.response?.data?.message || err.message);
            } else {
                console.error('Unexpected Error:', err);
            }

        } finally {
            setLoading(false);
        }

        // toast.success("Expenses approved successfully.");
        // setSelectedIds(new Set());
        // setRejecting(false);
        // setShowRejectModal(false);
        // setRejectReason('');
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

                                <Grid size={{ xs: 12, md: 2.5 }}>
                                    {
                                        projectsLk && (
                                            <MultiSelect
                                                label="Projects"
                                                options={projectsLk}
                                                value={selectedProjects}
                                                onChange={(values) => {
                                                    setSelectedProjects(values);
                                                    localStorage.setItem(
                                                        "selected_projects",
                                                        JSON.stringify(values)
                                                    );
                                                }}
                                                selectAllByDefault={selectedProjects.length > 0 ? false : true}
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

                        <Grid>
                            {selectedIds.size > 0 && (
                                <Box
                                    sx={{
                                        p: '4px 12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        background: '#F8FAFF',
                                    }}
                                >
                                    <Typography variant="body2">{selectedIds.size} Selected</Typography>
                                    <Box sx={{ flex: 1 }} />
                                    <Button variant="secondary" onClick={() => setSelectedIds(new Set())} style={{ fontSize: '14px', padding: '5px 10px' }}>
                                        Clear
                                    </Button>
                                    <Button variant="danger" onClick={() => setShowRejectModal(true)} style={{ fontSize: '14px', padding: '5px 10px' }}>
                                        Reject
                                    </Button>
                                    <Button variant="success" onClick={() => handleBulkApprove("approve")} style={{ fontSize: '14px', padding: '5px 10px' }}>
                                        Approve
                                    </Button>
                                </Box>
                            )}
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

                        <Dialog
                            open={showRejectModal}
                            onClose={() => !rejecting && setShowRejectModal(false)}
                            maxWidth="sm"
                            fullWidth
                            PaperProps={{ sx: { borderRadius: 2 } }}
                        >
                            <DialogTitle sx={{ pb: 1 }}>
                                Reject 1 item
                            </DialogTitle>
                            <DialogContent dividers>
                                <TextField
                                    label="Reason for rejection"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    inputProps={{ maxLength: 500 }}
                                    helperText={`${rejectReason.trim().length}/500`}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button variant="secondary" onClick={() => setShowRejectModal(false)} disabled={rejecting}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={() => handleBulkApprove("reject")} disabled={rejecting || !rejectReason}>
                                    {rejecting ? 'Rejecting...' : 'Reject'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                )
            }
        </>
    );
};

export default TimesheetList;
