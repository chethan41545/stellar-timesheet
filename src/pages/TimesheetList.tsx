import React, { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../constants/apiUrls';
import axios from 'axios';
import CustomTable from '../shared/CustomTable/CustomTable';
import { Skeleton } from '@mui/material';

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


    const [loading, setLoading] = useState(true);

    const columns = [
        {
            id: 'user_name',
            label: 'User',
            width: '120px',
        },
        {
            id: 'timesheet_status',
            label: 'Status',
            width: '120px',
            format: (value: string) => {
                const colorMap: Record<string, string> = {
                    "Approved": '#4caf50',
                    Draft: '#ff9800',
                    "Partial Approved": '#81c946ff',
                    Rejected: '#f44336',
                };

                return (
                    <span
                        style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: `${colorMap[value]}`,
                            // color: `${colorMap[value]}`,
                            // color: colorMap[value],
                            fontWeight: 600,
                            fontSize: '12px',
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
        },
        {
            id: 'week_end',
            label: 'End',
            width: '120px',
        },
    ]

    useEffect(() => {
        fetchData()
    }, [
        page,
        size
    ])

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage);
        setSize(newPageSize);
    };


    const fetchData = async () => {

        // if (typed.length === 1) return;
        const payload = {
            'page': page,
            'per_page': size
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

                    <CustomTable<any>
                        columns={columns}
                        data={data?.timesheet}
                        totalRows={data?.meta.total}
                        defaultPage={page}
                        defaultPageSize={size}
                        // defaultSortBy={sortBy}
                        // defaultSortDirection={sortDirection}
                        onRefresh={fetchData}
                        // onSortChange={handleSortChange}
                        onPageChange={handlePageChange}
                        rowPadding='10px 8px'
                    />
                )
            }
        </>
    );
};

export default TimesheetList;
