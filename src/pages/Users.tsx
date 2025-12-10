// src/components/Users.tsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
} from '@mui/material';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../constants/apiUrls';

interface User {
    code: string;
    created_at: string;
    email: string;
    is_active: boolean;
    name: string;
    org_name: string;
    role: string;
    updated_at: string;
}

const UserScreen: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const payload = {
                    page: 1,
                    per_page: 10,
                };

                const response = await apiService.postMethod(
                    API_ENDPOINTS.GET_USER_LIST,
                    payload
                );

                setUsers(response.data.data.users);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading)
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );

    if (error)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                <Typography color="error" variant="h6">
                    Error: {error}
                </Typography>
            </Box>
        );

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Users
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {[
                                'Name',
                                'Email',
                                'Role',
                                'Organization',
                                'Status',
                                'Created At',
                                'Updated At',
                            ].map((heading) => (
                                <TableCell key={heading} sx={{ fontWeight: 'bold' }}>
                                    {heading}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.code}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>{user.org_name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_active ? 'Active' : 'Inactive'}
                                            color={user.is_active ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.updated_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserScreen;
