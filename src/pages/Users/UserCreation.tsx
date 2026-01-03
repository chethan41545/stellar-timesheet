import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Divider,
    Chip,
    Avatar,
    Grid,
    Alert,
    alpha,
    useTheme,
    Switch,
    FormControlLabel,
    FormHelperText,
    IconButton,

} from '@mui/material';
import {
    Person,
    Email,
    Business,
    CheckCircle,
    Cancel as CancelIcon,
    History,

} from '@mui/icons-material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import Button from '../../shared/Button/Button';
import CustomSkeleton from '../../shared/CustomSkeleton/CustomSkeleton';
import CustomSwitch from '../../shared/Switch/CustomSwitch';

const UserForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();

    const [mode, setMode] = useState(id ? (id === 'create' ? 'create' : 'view') : 'create');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState<any>({});
    const [roles, setRoles] = useState<any>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mock roles - you can fetch from API if needed
    // const roles = [
    //     { value: 'Employee', label: 'Employee', icon: <Badge />, description: 'Regular employee with basic access' },
    //     { value: 'Manager', label: 'Manager', icon: <ManageAccounts />, description: 'Can manage team and projects' },
    //     { value: 'Super Admin', label: 'Super Admin', icon: <AdminPanelSettings />, description: 'Full system access and administration' },
    // ];

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name must be less than 100 characters'),
        email: Yup.string()
            .required('Email is required')
            .email('Invalid email address')
            .matches(/@stellarit\.com$/, 'Email must be a Stellar IT email'),
        role: Yup.string()
            .required('Role is required'),
        // .oneOf(['Employee', 'Manager', 'Super Admin'], 'Invalid role'),
        is_active: Yup.boolean(),
    });

    // Formik initialization
    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            role: '',
            is_active: true,
        },
        validationSchema,
        onSubmit: async (values) => {
            await handleSubmit(values);
        },
    });

    // Fetch user data for edit/view mode
    useEffect(() => {
        fetchUserRoles();
        if (id && id !== 'create') {

            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const payload = {
                user_code: id
            }
            // Assuming you have an endpoint to get single user
            const response = await apiService.postMethod(`${API_ENDPOINTS.GET_USER_DETAILS}`, payload);
            const user = response.data.data;
            setUserData(user);

            // Set form values
            formik.setValues({
                name: user.name,
                email: user.email,
                role: user.role_code,
                is_active: user.is_active,
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };


    const fetchUserRoles = async () => {
        setLoading(true);
        try {
            // Assuming you have an endpoint to get single user
            const response = await apiService.getMethod(API_ENDPOINTS.GET_USER_ROLES);

            const roles = response.data.data;
            setRoles(roles);

        } catch (error) {
            console.error('Error fetching user:', error);
            setError('Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: any) => {
        setSaving(true);
        setError('');
        setSuccess('');

        console.log(values);

        try {
            if (mode === 'create') {
                // Create new user
                setLoading(true);
                const response = await apiService.postMethod(API_ENDPOINTS.CREATE_USER, values);
                setSuccess('User created successfully!');
                setMode('view');
                navigate(`/users/${response.data.data.user_code}`);
            } else {
                // Update existing user
                await apiService.putMethod(`${API_ENDPOINTS.UPDATE_USER}/${id}`, values);
                setSuccess('User updated successfully!');
                // Refresh data
                fetchUserData();
            }
        } catch (error: any) {
            console.error('Error saving user:', error);
            setError(error.response?.data?.message || 'Failed to save user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await apiService.deleteMethod(`${API_ENDPOINTS.DELETE_USER}/${id}`);
                navigate('/users');
            } catch (error) {
                console.error('Error deleting user:', error);
                setError('Failed to delete user');
            }
        }
    };

    const handleEditToggle = () => {
        setMode(mode === 'edit' ? 'view' : 'edit');
    };

    const formatDate = (dateString: any) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateString;
        }
    };

    const getRoleColor = (role: any) => {
        switch (role) {
            case 'Super Admin':
                return 'error';
            case 'Manager':
                return 'warning';
            case 'Employee':
                return 'info';
            default:
                return 'default';
        }
    };

    if (loading && mode !== 'create') {
        return (
            <Box sx={{ p: 3 }}>
                <CustomSkeleton height={400} />
            </Box>
        );
    }

    return (
        <Box sx={{ margin: '0 auto' }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => navigate("/users")}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>

                        <Typography variant="h4" fontWeight={700}>
                            {mode === 'create' ? 'Create New User' : userData?.name || 'User Details'}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {mode === 'create'
                                ? 'Add a new user to your organization'
                                : mode === 'edit'
                                    ? 'Edit user information and permissions'
                                    : 'View user details and information'
                            }
                        </Typography>

                    </Box>
                </Stack>
            </Stack>

            {/* Status Messages */}
            {
                error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )
            }

            {
                success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )
            }

            <Grid container spacing={3}>
                {/* Left Column - Form/Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        {mode === 'create' || mode === 'edit' ? (
                            // Form for create/edit
                            <form onSubmit={formik.handleSubmit}>
                                <Stack spacing={3}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                id="name"
                                                name="name"
                                                label="Full Name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.name && Boolean(formik.errors.name)}
                                                helperText={formik.touched.name && formik.errors.name}
                                                disabled={saving}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                                                    ),
                                                }}
                                            />
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <TextField
                                                fullWidth
                                                id="email"
                                                name="email"
                                                label="Email Address"
                                                type="email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                                helperText={formik.touched.email && formik.errors.email}
                                                disabled={saving || mode === 'edit'}
                                                InputProps={{
                                                    startAdornment: (
                                                        <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                                    ),
                                                }}
                                            />
                                        </Grid>


                                    </Grid>

                                    <Grid container spacing={2}>



                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <FormControl
                                                fullWidth
                                                error={formik.touched.role && Boolean(formik.errors.role)}
                                            >
                                                <InputLabel>Role</InputLabel>
                                                <Select
                                                    id="role"
                                                    name="role"
                                                    value={formik.values.role}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    disabled={saving}
                                                    label="Role"
                                                // startAdornment={
                                                //     roles.find(r => r.value === formik.values.role)?.icon
                                                // }
                                                >
                                                    {roles && roles.map((role: any) => (
                                                        <MenuItem key={role.value} value={role.value}>
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                {/* {role.icon} */}
                                                                <Typography>{role.label}</Typography>
                                                            </Stack>
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {formik.touched.role && formik.errors.role && (
                                                    <FormHelperText>{formik.errors.role}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <FormControlLabel
                                        control={
                                            <CustomSwitch
                                                checked={formik.values.is_active}
                                                onChange={()=>formik.handleChange}
                                            />
                                        }
                                        label={
                                                <Typography>
                                                    {formik.values.is_active ? 'Active User' : 'Inactive User'}
                                                </Typography>
                                        }
                                        sx={{ mt: 1 }}
                                    />

                                    <Typography variant="caption" color="text.secondary">
                                        {formik.values.is_active
                                            ? 'User can log in and access the system'
                                            : 'User account is disabled and cannot log in'
                                        }
                                    </Typography>
                                </Stack>
                            </form>
                        ) : (
                            // View mode - Display details
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            fontSize: '2rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {userData?.name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={600}>
                                            {userData?.name}
                                        </Typography>
                                        <Chip
                                            label={userData?.role}
                                            color={getRoleColor(userData?.role)}
                                            sx={{ mt: 1 }}
                                        />
                                    </Box>
                                </Stack>

                                <Divider />

                                <Stack spacing={2}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Email sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1">
                                                {userData?.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Business sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Organization
                                            </Typography>
                                            <Typography variant="body1">
                                                {userData?.org_name}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        {userData?.is_active ? (
                                            <CheckCircle sx={{ color: 'success.main' }} />
                                        ) : (
                                            <CancelIcon sx={{ color: 'error.main' }} />
                                        )}
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Status
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    color: userData?.is_active ? 'success.main' : 'error.main',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {userData?.is_active ? 'Active' : 'Inactive'}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <History sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                User ID
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                                                {userData?.code}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Stack>
                        )}
                    </Paper>

                    {/* Additional Information for View Mode */}
                    {mode === 'view' && userData && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mt: 3,
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Activity Timeline
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Created On
                                    </Typography>
                                    <Typography variant="body1">
                                        {userData.created_at}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body1">
                                        {userData.updated_at}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    )}
                </Grid>

                {/* Right Column - Actions & Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Actions
                        </Typography>
                        <Stack spacing={1}>
                            {mode === 'view' && (
                                <>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={handleEditToggle}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={fetchUserData}
                                    >
                                        Refresh
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={handleDelete}
                                        sx={{ color: 'error.main', borderColor: 'error.main' }}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}

                            {mode === 'edit' && (
                                <>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={() => formik.handleSubmit}
                                        disabled={saving || !formik.isValid}
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={handleEditToggle}
                                        disabled={saving}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}

                            {mode === 'create' && (
                                <Button
                                    variant="primary"
                                    fullWidth
                                    // onClick={formik.handleSubmit}
                                    onClick={() => formik.handleSubmit()}
                                    disabled={saving || !formik.isValid}
                                >
                                    {saving ? 'Creating...' : 'Create User'}
                                </Button>
                            )}
                        </Stack>
                    </Paper>


                    {/* Quick Stats for View Mode */}
                    {mode === 'view' && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                mt: 3,
                                borderRadius: 3,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                        >
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Quick Stats
                            </Typography>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Last Activity
                                    </Typography>
                                    <Typography variant="body1">
                                        {formatDate(userData?.updated_at)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box >
    );
};

export default UserForm;