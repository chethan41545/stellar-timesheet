import React, { useEffect, useState } from 'react';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import axios from 'axios';
import CustomTable from '../../shared/CustomTable/CustomTable';
import { Box, Grid, IconButton, Skeleton, Tooltip, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

import SearchField from '../../shared/SearchField/SearchField';
import { useDebouncedValue } from '../../utils/commonUtils';
import { useNavigate } from 'react-router-dom';
import MultiSelect from '../../shared/MultiSelect/MultiSelectWithoutController';

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

    const [selectedTimesheetStatus, setSelectedTimesheetStatus] = React.useState<string[]>(
        timesheetStatus.map((s: any) => s.value)
    );

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
    const navigate = useNavigate();

    const submitTimesheet = (row: any) => {
        navigate(`/timesheets/${row.timesheet_code}`);
    };

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
                            fontSize="12px"
                            role="button"
                            tabIndex={0}
                            onClick={() => submitTimesheet(row)}
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
            // format: (value: string) => {
            //     const colorMap: Record<string, string> = {
            //         "Approved": '#4caf50',
            //         Draft: '#ff9800',
            //         "Partial Approved": '#81c946ff',
            //         Rejected: '#f44336',
            //     };

            //     return (
            //         <span
            //             style={{
            //                 padding: '4px 8px',
            //                 borderRadius: '6px',
            //                 background: `${colorMap[value]}`,
            //                 // color: `${colorMap[value]}`,
            //                 // color: colorMap[value],
            //                 fontWeight: 600,
            //                 fontSize: '12px',
            //             }}
            //         >
            //             {value}
            //         </span>
            //     );
            // }
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
            "timesheet_status": selectedTimesheetStatus
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
            "timesheet_status": selectedTimesheetStatus
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
                            <Grid container >


                                <Grid size={{ xs: 12, md: 3 }} sx={{ margin: "8px" }}>
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
                                <Grid size={{ xs: 12, md: 3 }}>

                                    {
                                        timesheetStatus && (
                                            <MultiSelect
                                                label="Timesheet Status"
                                                options={timesheetStatus}
                                                value={selectedTimesheetStatus}
                                                onChange={setSelectedTimesheetStatus}
                                                selectAllByDefault={true}
                                            />

                                        )
                                    }
                                </Grid>
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
