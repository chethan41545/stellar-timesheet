import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Divider,
    IconButton,
    Grid,
    Avatar,
    alpha,
    useTheme,
    Paper,
    InputBase,
    Menu,
    MenuItem,
    Pagination,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    Search,
    FilterList,
    Email,
    Business,
    Person,
    AdminPanelSettings,
    ManageAccounts,
    Badge,
    CheckCircle,
    Cancel,
    Edit,
    Delete,
    Visibility,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/apiService";
import { API_ENDPOINTS } from "../../constants/apiUrls";
import Button from "../../shared/Button/Button";
import CustomSkeleton from "../../shared/CustomSkeleton/CustomSkeleton";

const UserList = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [users, setUsers] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 1,
    });

    const roles = [
        { value: "all", label: "All Roles", icon: <Person /> },
        { value: "Super Admin", label: "Super Admin", icon: <AdminPanelSettings /> },
        { value: "Manager", label: "Manager", icon: <ManageAccounts /> },
        { value: "Employee", label: "Employee", icon: <Badge /> },
    ];

    const fetchData = async (page = 1, per_page = 10) => {
        setLoading(true);
        try {
            const payload = {
                page,
                per_page,
                variant: "paginated"
            };
            const response = await apiService.postMethod(API_ENDPOINTS.GET_USER_LIST, payload);
            setUsers(response.data.data.users);
            setPagination({
                page: response.data.data.meta.page,
                per_page: response.data.data.meta.per_page,
                total: response.data.data.meta.total,
                total_pages: response.data.data.meta.total_pages,
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = (_event:any, value:any) => {
        fetchData(value, pagination.per_page);
    };

    // const handleMenuOpen = (event:any, user) => {
    //     setAnchorEl(event.currentTarget);
    //     setSelectedUser(user);
    // };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleSearch = (event:any) => {
        setSearchQuery(event.target.value);
    };

    const handleFilterChange = (event:any) => {
        setFilterRole(event.target.value);
    };

    const getRoleColor = (role:string) => {
        switch (role) {
            case "Super Admin":
                return "error";
            case "Manager":
                return "warning";
            case "Employee":
                return "info";
            default:
                return "default";
        }
    };

    const getStatusIcon = (isActive:boolean) => {
        return isActive ? (
            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
        ) : (
            <Cancel sx={{ color: theme.palette.error.main, fontSize: 16 }} />
        );
    };

    const filteredUsers = users.filter((user:any) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "all" || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const formatDate = (dateString:any) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return dateString;
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
            }}
        >


            {/* Filters and Search Section */}
            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                }}
            >
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                    {/* Search */}
                    <Paper
                        component="form"
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: { xs: '100%', md: 400 },
                            borderRadius: 2,
                            // border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        }}
                    >
                        <IconButton sx={{ p: '10px' }} aria-label="search">
                            <Search />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1 }}
                            placeholder="Search users by name or email"
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </Paper>

                    {/* Role Filter */}
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Filter by Role</InputLabel>
                        <Select
                            value={filterRole}
                            label="Filter by Role"
                            onChange={handleFilterChange}
                            startAdornment={<FilterList sx={{ mr: 1, color: 'text.secondary' }} />}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        {role.icon}
                                        <Typography>{role.label}</Typography>
                                    </Stack>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Refresh Button */}
                    <Button
                        variant="secondary"
                        // startIcon={<Refresh />}
                        onClick={() => fetchData()}
                        // sx={{ ml: 'auto' }}
                    >
                        Refresh
                    </Button>
                </Stack>
            </Paper>

            {/* Loading State */}
            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((item) => (
                        <Grid size={{xs:12, sm:6, md:4}} key={item}>
                            <CustomSkeleton height={250} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <>
                    {/* User Cards Grid */}
                    <Grid container spacing={3}>
                        {filteredUsers.map((user:any) => (
                            <Grid size={{xs:12, sm:6, md:4, lg:3}} key={user.code}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        transition: 'all 0.3s ease-in-out',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: theme.shadows[8],
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                        },
                                    }}
                                    onClick={() => navigate(`/users/${user.code}`)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        {/* User Header */}
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Avatar
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                        fontSize: '1.5rem',
                                                    }}
                                                >
                                                    {user.name.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight={600}>
                                                        {user.name}
                                                    </Typography>
                                                    <Chip
                                                        label={user.role}
                                                        size="small"
                                                        color={getRoleColor(user.role)}
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                </Box>
                                            </Stack>
                                            {/* <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMenuOpen(e, user);
                                                }}
                                            >
                                                <MoreVert />
                                            </IconButton> */}
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        {/* User Details */}
                                        <Stack spacing={2}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.email}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Business sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {user.org_name}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                {getStatusIcon(user.is_active)}
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: user.is_active
                                                            ? theme.palette.success.main
                                                            : theme.palette.error.main,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="text.secondary">
                                                    Joined: {formatDate(user.created_at)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Last updated: {formatDate(user.updated_at)}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 8,
                                textAlign: 'center',
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.background.default, 0.5),
                                border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                            }}
                        >
                            <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No users found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery || filterRole !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Get started by adding your first user"}
                            </Typography>
                            {(!searchQuery && filterRole === "all") && (
                                <Button
                                    variant="secondary"
                                    // startIcon={<Add />}
                                    onClick={() => navigate("/users/create")}
                                    // sx={{ mt: 2 }}
                                >
                                    Add User
                                </Button>
                            )}
                        </Paper>
                    )}

                    {/* Pagination */}
                    {pagination.total_pages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 4 }}>
                            <Pagination
                                count={pagination.total_pages}
                                page={pagination.page}
                                onChange={handlePageChange}
                                color="primary"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
            >
                <MenuItem onClick={() => navigate(`/users/${selectedUser?.code}`)}>
                    <Visibility sx={{ mr: 1 }} /> View Details
                </MenuItem>
                <MenuItem onClick={() => navigate(`/users/${selectedUser?.code}/edit`)}>
                    <Edit sx={{ mr: 1 }} /> Edit User
                </MenuItem>
                <Divider />
                <MenuItem sx={{ color: 'error.main' }}>
                    <Delete sx={{ mr: 1 }} /> Delete User
                </MenuItem>
            </Menu>

            {/* Floating Create Button for Mobile */}
            <Button
                variant="primary"
                label="Create User"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    minWidth: 0,
                }}
                onClick={() => navigate("/users/create")}
            />
        </Box>
    );
};

export default UserList;