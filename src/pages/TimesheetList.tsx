import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../constants/apiUrls';
import axios from 'axios';
import CustomTable from '../shared/CustomTable/CustomTable';
import { Box, Grid, Skeleton } from '@mui/material';
import SearchField from '../shared/SearchField/SearchField';
import { useDebouncedValue } from '../utils/commonUtils';

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

    const columns = [
        {
            id: 'user_name',
            label: 'User',
            width: '120px',
            sortable: true
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
    ]

    useEffect(() => {
        fetchData()
    }, [
        page,
        size,
        sortBy,
        sortDirection,
        debouncedSearch
    ])

    const fetchData = async () => {
        setTableLoading(true);

        // if (typed.length === 1) return;
        const payload = {
            'page': page,
            'per_page': size,
            'sort_by': sortBy,
            'sort_direction': sortDirection,
            'search' : debouncedSearch
        }

        try {

            const response = await apiService.postMethod(API_ENDPOINTS.CANDIDATE_TIMESHEET_SEARCH, payload);

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


    return (
        <>
            {
                loading ? (
                    <>
                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ my: 1 }} />
                        <Skeleton variant="rectangular" width="100%" height={400} />
                    </>
                ) : (

                    <Grid container>
                        <Grid size={{ md: 4 }}>
                            <SearchField
                                name="searchJob"
                                value={search}
                                onChange={(v) => {
                                    setSearch(v);
                                    setPage(1);
                                }}
                                placeholder="Search by Employee"
                            />

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
