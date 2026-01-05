import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Grid,
    Alert,
    MenuItem,
    Paper,
    Switch,
    Card,
    CardContent,
    Chip,
    Avatar,
    Divider,
    Stack,
    Tooltip,
    alpha,
    useTheme,
    FormControlLabel,
    Fade,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as yup from 'yup';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../shared/Button/Button';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupsIcon from '@mui/icons-material/Groups';

import DescriptionIcon from '@mui/icons-material/Description';
import TaskAltIcon from '@mui/icons-material/Task';
import CustomSkeleton from '../../shared/CustomSkeleton/CustomSkeleton';
import TaskCreateDialog from './TaskCreateDialog';
import CustomSwitch from '../../shared/Switch/CustomSwitch';

interface ProjectFormData {
    name: string;
    description: string;
    start_date: Date | null;
    end_date: Date | null;
    active: boolean;
    manager_code: string;
}

const validationSchema = yup.object({
    name: yup.string().min(3).max(100).required('Project name is required'),
    description: yup.string(),
    start_date: yup.date().nullable().required('Start date is required'),
    end_date: yup
        .date()
        .nullable()
        .min(yup.ref('start_date'), 'End date must be after start date'),
    manager_code: yup.string(),
});

const CreateProjectScreen: React.FC = () => {
    const { id } = useParams();

    const navigate = useNavigate();

    const isCreateMode = !id;
    const theme = useTheme();

    const [isEdit, setIsEdit] = useState(isCreateMode);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const [success, setSuccess] = useState<string | null>(null);
    const [managers, setManagers] = useState<any[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [assignedEmployees, setAssignedEmployees] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState("");

    const [open, setOpen] = useState(false);

    const handleCreateTask = async (name: string) => {
        const payload = {
            name,
            description: '',
            project_code: id,
        }
        try {
            const response = await apiService.postMethod(API_ENDPOINTS.CREATE_TASK, payload);
            setOpen(false);
            toast.success(response.data.message);
        }
        catch (err) {
            console.error(err);
            // toast.error('Failed to Create Task');
        }

    };

    /* ---------------- Fetch Managers ---------------- */
    const fetchUsers = async (assigned: any[] = assignedEmployees) => {
        try {
            const response = await apiService.postMethod(API_ENDPOINTS.GET_USER_LIST);

            // Managers
            setManagers(
                response.data.data
                    .filter((u: any) => u.role === "Manager")
                    .map((u: any) => ({
                        label: u.name,
                        value: u.code,
                        avatar: u.avatar || u.name.charAt(0)
                    }))
            );

            const assignedCodes = new Set(assigned.map(e => e.code));

            const usersList = response.data.data
                .filter((user: any) => !assignedCodes.has(user.code))
                .map((user: any) => ({
                    label: user.name,
                    value: user.code,
                    role: user.role,
                    avatar: user.avatar || user.name.charAt(0)
                }));

            setAllEmployees(usersList);

        } catch (err) {
            console.error(err);
            toast.error('Failed to load users');
        }
    };

    /* ---------------- Fetch Project Details ---------------- */
    const fetchProjectDetails = async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const response = await apiService.getMethodParams(
                API_ENDPOINTS.GET_PROJECT_DETAILS, { "project_code": id }
            );

            const project = response.data.data;
            await fetchUsers(project.user_list);

            formik.setValues({
                name: project.name,
                description: project.description,
                start_date: new Date(project.start_date),
                end_date: project.end_date ? new Date(project.end_date) : null,
                manager_code: project.manager_code,
                active: project.active
            });

            setAssignedEmployees(project.user_list);
            setTasks(project.task_list);

        } catch (err) {
            toast.error('Failed to load project details');
        } finally {
            setIsLoading(false);
        }
    };

    const assignUser = async (userCode: string) => {
        if (!userCode || !id) return;

        setIsAssigning(true);
        const payload = {
            user_code: userCode,
            project_code: id,
            action: "assign"
        };

        try {
            const response = await apiService.postMethod(
                API_ENDPOINTS.MANAGE_USER_PROJECT,
                payload
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                // Refresh the user list
                await fetchProjectDetails();
                setSelectedUser("");
            }
        } catch (err) {
            toast.error('Failed to assign user');
        } finally {
            setIsAssigning(false);
        }
    };

    const handleToggle = async (employee: any) => {
        try {
            setIsLoading(true);
            const updated = assignedEmployees.map((emp) =>
                emp.code === employee.code ? { ...emp, is_active: !emp.is_active } : emp
            );


            const payload = {
                project_code: id,
                user_code: employee.code,
                is_active: !employee.is_active,
                action: "status_change"

            }

            const response = await apiService.postMethod(API_ENDPOINTS.MANAGE_USER_PROJECT, payload)
            setAssignedEmployees(updated);
            toast.success(response.data.message);

        } catch (err) {
            toast.error('Failed to update user status');
            // Revert on error
            const reverted = assignedEmployees.map((emp) =>
                emp.code === employee.code ? { ...emp, is_active: employee.is_active } : emp
            );
            setAssignedEmployees(reverted);
        }
        finally {
            setIsLoading(false);
        }
    };

    /* ---------------- Formik ---------------- */
    const formik = useFormik<ProjectFormData>({
        initialValues: {
            name: '',
            description: '',
            start_date: null,
            end_date: null,
            manager_code: '',
            active: false
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setError(null);
            // setSuccess(null);

            const payload = {
                ...values,
                project_code: id,
                manager_code: values.manager_code,
                start_date: values.start_date?.toISOString().split('T')[0],
                end_date: values.end_date?.toISOString().split('T')[0],
            };

            try {
                if (isCreateMode) {
                    const response = await apiService.postMethod(
                        API_ENDPOINTS.CREATE_PROJECT,
                        payload
                    );
                    navigate(`/projects/${response.data.data.code}`);
                    toast.success('Project created successfully');
                    formik.resetForm();
                } else {
                    await apiService.putMethod(
                        API_ENDPOINTS.UPDATE_PROJECT,
                        payload
                    );
                    toast.success('Project updated successfully');
                    setIsEdit(false);
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Something went wrong');
                    toast.error(err.response?.data?.message || 'Operation failed');
                }
            } finally {
                setIsLoading(false);
            }
        },
    });

    /* ---------------- Effects ---------------- */
    useEffect(() => {
        if (id) {
            fetchProjectDetails();
        } else {
            fetchUsers(); // call users API when no project id
        }
    }, [id]);


    const isDisabled = isLoading || (!isEdit && !isCreateMode);

    /* ---------------- UI ---------------- */
    return (
        <>

            {
                isLoading ? (
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <CustomSkeleton height={90} />
                        </Grid>

                        <Grid size={{ xs: 8 }}>
                            <CustomSkeleton height={320} />
                        </Grid>

                        <Grid size={{ xs: 4 }} >
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12 }}>
                                    <CustomSkeleton height={120} />
                                </Grid>
                                <Grid size={{ xs: 12 }}>

                                    <CustomSkeleton height={220} />
                                </Grid>
                            </Grid>
                        </Grid>


                    </Grid>

                )
                    :
                    (
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Box sx={{
                                // mt: 4,
                                // px: { xs: 2, sm: 3, md: 4 }
                            }}>
                                {/* Header */}
                                <Card
                                    elevation={0}
                                    sx={{
                                        mb: 4,
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        borderRadius: 2
                                    }}
                                >
                                    <CardContent>
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            alignItems={{ xs: 'stretch', sm: 'center' }}
                                            justifyContent="space-between"
                                            spacing={2}
                                        >
                                            <Box>
                                                <Typography variant="h5" fontWeight="600" gutterBottom>
                                                    {isCreateMode ? 'Create New Project' : 'Project Details'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {isCreateMode
                                                        ? 'Fill in the details below to create a new project'
                                                        : 'View and manage project information and team members'}
                                                </Typography>
                                            </Box>


                                        </Stack>
                                    </CardContent>
                                </Card>

                                {error && (
                                    <Alert
                                        severity="error"
                                        sx={{ mb: 3 }}
                                        onClose={() => setError(null)}
                                    >
                                        {error}
                                    </Alert>
                                )}

                                <Grid container spacing={3}>
                                    {/* Left Column - Project Form */}

                                    <Grid size={{ xs: 12, lg: 8 }}>
                                        <Grid container rowSpacing={2}>
                                            <Grid size={{ xs: 12 }} >
                                                <Card elevation={1} sx={{ borderRadius: 2 }}>
                                                    <CardContent>
                                                        <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <DescriptionIcon color="primary" />
                                                            Project Information
                                                        </Typography>
                                                        <Divider sx={{ mb: 3 }} />

                                                        <form onSubmit={formik.handleSubmit}>
                                                            <Grid container spacing={3}>
                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Project Name *"
                                                                        {...formik.getFieldProps('name')}
                                                                        disabled={isDisabled}
                                                                        error={formik.touched.name && Boolean(formik.errors.name)}
                                                                        helperText={formik.touched.name && formik.errors.name}
                                                                        size="medium"
                                                                    />
                                                                </Grid>

                                                                <Grid size={{ xs: 12, sm: 6 }}>
                                                                    <TextField
                                                                        select
                                                                        fullWidth
                                                                        label="Project Manager"
                                                                        {...formik.getFieldProps('manager_code')}
                                                                        disabled={isDisabled}
                                                                        value={formik.values.manager_code || ""}
                                                                        size="medium"
                                                                    >
                                                                        <MenuItem value="">
                                                                            <em>Select a manager</em>
                                                                        </MenuItem>
                                                                        {managers.map((m) => (
                                                                            <MenuItem key={m.value} value={m.value}>
                                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                                    <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                                                                        {m.avatar}
                                                                                    </Avatar>
                                                                                    <Typography>{m.label}</Typography>
                                                                                </Stack>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </TextField>
                                                                </Grid>

                                                                <Grid size={{ xs: 12, md: 3 }}>
                                                                    <DatePicker
                                                                        label="Start Date *"
                                                                        value={formik.values.start_date}
                                                                        onChange={(v) =>
                                                                            formik.setFieldValue('start_date', v)
                                                                        }
                                                                        disabled={isDisabled}

                                                                        slotProps={{
                                                                            textField: {
                                                                                sx: {
                                                                                    "& .MuiPickersSectionList-root": {
                                                                                        padding: "11px 6px",
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}

                                                                    />
                                                                </Grid>

                                                                <Grid size={{ xs: 12, md: 3 }}>
                                                                    <DatePicker
                                                                        label="End Date"
                                                                        value={formik.values.end_date}
                                                                        onChange={(v) =>{
                                                                            formik.setFieldValue('end_date', v)
                                                                        }
                                                                        }
                                                                        disabled={isDisabled}

                                                                        slotProps={{
                                                                            textField: {
                                                                                sx: {
                                                                                    "& .MuiPickersSectionList-root": {
                                                                                        padding: "11px 6px",
                                                                                    },
                                                                                },
                                                                            },
                                                                        }}
                                                                    />
                                                                </Grid>

                                                                <Grid size={{ xs: 12, md: 3 }}>
                                                                    <CustomSwitch
                                                                        checked={formik.values.active}
                                                                        onChange={(v) => {
                                                                            formik.setFieldValue('active', v.target.checked)
                                                                        }

                                                                        }
                                                                    />
                                                                </Grid>

                                                                <Grid size={{ xs: 12 }}>
                                                                    <TextField
                                                                        fullWidth
                                                                        multiline
                                                                        rows={3}
                                                                        label="Description"
                                                                        {...formik.getFieldProps('description')}
                                                                        disabled={isDisabled}
                                                                        sx={{
                                                                            "& .MuiOutlinedInput-root": {
                                                                                borderRadius: "4px",
                                                                                height: "100px !important",
                                                                                color: '#202224',
                                                                            },
                                                                        }}
                                                                    />
                                                                </Grid>

                                                                {!isCreateMode && (
                                                                    // <Stack display={'flex'} justifyContent={'flex-end'}>
                                                                    <Stack direction="row" >
                                                                        {!isEdit ? (
                                                                            <Button
                                                                                variant="secondary"
                                                                                onClick={() => setIsEdit(true)}
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                        ) : (
                                                                            <>
                                                                                <Button
                                                                                    variant="secondary"
                                                                                    // startIcon={<CancelIcon />}
                                                                                    onClick={() => {
                                                                                        fetchProjectDetails();
                                                                                        setIsEdit(false);
                                                                                    }}
                                                                                // sx={{ minWidth: 100 }}
                                                                                >
                                                                                    Cancel
                                                                                </Button>



                                                                            </>
                                                                        )}
                                                                    </Stack>
                                                                )}

                                                                {(isEdit || isCreateMode) && (
                                                                    <Button
                                                                        type="submit"
                                                                        variant="primary"
                                                                        disabled={isLoading || !formik.isValid}
                                                                    >
                                                                        {isLoading
                                                                            ? 'Saving...'
                                                                            : isCreateMode
                                                                                ? 'Create Project'
                                                                                : 'Save Changes'}
                                                                    </Button>
                                                                )}


                                                            </Grid>
                                                        </form>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            {/* Tasks */}
                                            {
                                                !isCreateMode && (
                                                    <Grid size={{ xs: 12 }}>
                                                        <Card elevation={1} sx={{ borderRadius: 2, p: 2 }} >
                                                            <Box display={"flex"} justifyContent={"space-between"} sx={{ mb: 2 }}>
                                                                <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <TaskAltIcon color="primary" />
                                                                    Tasks

                                                                </Typography>

                                                                <Button
                                                                    label="Create"
                                                                    onClick={() => setOpen(true)} />
                                                            </Box>

                                                            <Grid container spacing={2}>

                                                                {tasks.map((task) => (
                                                                    <Fade in key={task.code}>
                                                                        <Grid size={{ xs: 6 }}>
                                                                            <Paper
                                                                                variant="outlined"
                                                                                sx={{
                                                                                    p: 2,
                                                                                    borderRadius: 1,
                                                                                    bgcolor: task.is_active
                                                                                        ? alpha(theme.palette.success.main, 0.05)
                                                                                        : alpha(theme.palette.error.main, 0.05)
                                                                                }}
                                                                            >
                                                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                                                        <Avatar sx={{ width: 36, height: 36 }}>
                                                                                            {task.name.charAt(0)}
                                                                                        </Avatar>
                                                                                        <Box>
                                                                                            <Typography variant="body2" fontWeight="500">
                                                                                                {task.name}
                                                                                            </Typography>
                                                                                        </Box>
                                                                                    </Stack>
                                                                                    <Tooltip title={task.is_active ? "Active - Click to deactivate" : "Inactive - Click to activate"}>
                                                                                        {/* <FormControlLabel
                                                                                            control={
                                                                                                <Switch
                                                                                                    checked={task.is_active}
                                                                                                    onChange={() => handleToggle(task)}
                                                                                                    size="small"
                                                                                                    color="success"
                                                                                                />
                                                                                            }
                                                                                            label={
                                                                                                <Chip
                                                                                                    label={task.is_active ? "Active" : "Inactive"}
                                                                                                    size="small"
                                                                                                    color={task.is_active ? "success" : "error"}
                                                                                                    variant="outlined"
                                                                                                    sx={{ minWidth: 70 }}
                                                                                                />
                                                                                            }
                                                                                            labelPlacement="start"
                                                                                        /> */}
                                                                                        {/* <Switch
                                                                                            checked={task.is_active}
                                                                                            onChange={() => handleToggle(task)}
                                                                                        /> */}

                                                                                        <CustomSwitch
                                                                                            checked={task.is_active}
                                                                                            onChange={() => handleToggle(task)}
                                                                                        />
                                                                                    </Tooltip>
                                                                                </Stack>
                                                                            </Paper>
                                                                        </Grid>
                                                                    </Fade>
                                                                ))}
                                                            </Grid>
                                                        </Card>
                                                    </Grid>
                                                )
                                            }

                                        </Grid>

                                    </Grid>

                                    {/* Right Column - Team Management */}

                                    {
                                        !isCreateMode && (
                                            <Grid size={{ xs: 12, lg: 4 }}>
                                                <Stack spacing={3}>
                                                    {/* Assign User Card */}
                                                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                                                        <CardContent>
                                                            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <PersonAddIcon color="primary" />
                                                                Assign Team Member
                                                            </Typography>

                                                            <Stack spacing={2}>
                                                                <TextField
                                                                    select
                                                                    fullWidth
                                                                    label="Select User"
                                                                    value={selectedUser}
                                                                    onChange={(e) => setSelectedUser(e.target.value)}
                                                                    // disabled={isDisabled || isAssigning || allEmployees.length === 0}
                                                                    size="small"
                                                                >
                                                                    <MenuItem value="">
                                                                        <em>Choose a user to assign</em>
                                                                    </MenuItem>
                                                                    {allEmployees.map((employee) => (
                                                                        <MenuItem key={employee.value} value={employee.value}>
                                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                                                                    {employee.avatar}
                                                                                </Avatar>
                                                                                <Box>
                                                                                    <Typography variant="body2">{employee.label}</Typography>
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        {employee.role}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Stack>
                                                                        </MenuItem>
                                                                    ))}
                                                                </TextField>

                                                                <Button
                                                                    onClick={() => assignUser(selectedUser)}
                                                                    disabled={!selectedUser || isAssigning}
                                                                    variant="primary"
                                                                    // startIcon={isAssigning ? <CircularProgress size={20} /> : <AddIcon />}
                                                                    fullWidth
                                                                >
                                                                    {isAssigning ? 'Assigning...' : 'Assign User'}
                                                                </Button>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Team Members Card */}
                                                    <Card elevation={1} sx={{ borderRadius: 2 }}>
                                                        <CardContent>
                                                            <Typography variant="h6" fontWeight="600" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <GroupsIcon color="primary" />
                                                                Team Members
                                                                <Chip
                                                                    label={assignedEmployees.length}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </Typography>

                                                            {assignedEmployees.length === 0 ? (
                                                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                                                    <GroupsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                                                                    <Typography color="text.secondary">
                                                                        No team members assigned yet
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Stack spacing={1}>
                                                                    <Grid container spacing={2}>
                                                                        {assignedEmployees.map((employee) => (
                                                                            <Grid size={{ xs: 12, md: 6, lg: 12 }}>
                                                                                <Fade in key={employee.code}>
                                                                                    <Paper
                                                                                        variant="outlined"
                                                                                        sx={{
                                                                                            p: 2,
                                                                                            borderRadius: 1,
                                                                                            bgcolor: employee.is_active
                                                                                                ? alpha(theme.palette.success.main, 0.05)
                                                                                                : alpha(theme.palette.error.main, 0.05)
                                                                                        }}
                                                                                    >
                                                                                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                                                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                                                                                <Avatar sx={{ width: 36, height: 36 }}>
                                                                                                    {employee.name.charAt(0)}
                                                                                                </Avatar>
                                                                                                <Box>
                                                                                                    <Typography variant="body2" fontWeight="500">
                                                                                                        {employee.name}
                                                                                                    </Typography>
                                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                                        {employee.role || 'Team Member'}
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            </Stack>
                                                                                            <Tooltip title={employee.is_active ? "Active - Click to deactivate" : "Inactive - Click to activate"}>
                                                                                                <CustomSwitch
                                                                                                    checked={employee.is_active}
                                                                                                    onChange={() => handleToggle(employee)}
                                                                                                />
                                                                                            </Tooltip>
                                                                                        </Stack>
                                                                                    </Paper>
                                                                                </Fade>
                                                                            </Grid>
                                                                        ))}
                                                                    </Grid>
                                                                </Stack>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Stack>
                                            </Grid>

                                        )
                                    }

                                </Grid>

                                <TaskCreateDialog
                                    open={open}
                                    onClose={() => setOpen(false)}
                                    onCreate={handleCreateTask}
                                />
                            </Box>
                        </LocalizationProvider>
                    )
            }
        </>

    );
};

export default CreateProjectScreen;