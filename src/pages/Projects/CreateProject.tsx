import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress,
    MenuItem,
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

interface ProjectFormData {
    name: string;
    description: string;
    start_date: Date | null;
    end_date: Date | null;
    manager_code: string;
}


const validationSchema = yup.object({
    name: yup
        .string()
        .min(3, 'Project name must be at least 3 characters')
        .max(100, 'Project name must be less than 100 characters')
        .required('Project name is required'),
    description: yup.string(),
    start_date: yup
        .date()
        .nullable()
        .required('Start date is required')
        .typeError('Please enter a valid date'),
    end_date: yup
        .date()
        .nullable()
        .min(
            yup.ref('start_date'),
            'End date must be after start date'
        )
        .typeError('Please enter a valid date'),
    manager_code: yup.string(),
});

const CreateProjectScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [managers, setManagers] = useState<any>([]);

    const fetchUsers = async () => {
        try {
            const payload = { variant: "manager" }
            const response = await apiService.postMethod(API_ENDPOINTS.GET_USER_LIST, payload);

            const usersList = response.data.data.map((user: any) => ({
                label: user.name,
                value: user.code,
            }));

            setManagers(usersList);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("API Error:", error.response?.data);
            } else {
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const createProject = async (payload: any) => {
        setIsLoading(true); // start loading
        try {
            const response = await apiService.postMethod(API_ENDPOINTS.CREATE_PROJECT, payload);
            console.log("Project created:", response.data);

            toast.success(response.data.message)
            return response.data;
        } finally {
            setIsLoading(false); // stop loading
        }
    };


    useEffect(() => {
        fetchUsers()
    }, [])

    const formik = useFormik<ProjectFormData>({
        initialValues: {
            name: '',
            description: '',
            start_date: null,
            end_date: null,
            manager_code: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            setError(null);
            setSuccess(null);

            const formattedData = {
                ...values,
                start_date: values.start_date?.toISOString().split('T')[0], // YYYY-MM-DD
                end_date: values.end_date?.toISOString().split('T')[0],
            };

            try {
                await createProject(formattedData);
                setSuccess("Project created successfully!");
                formik.resetForm();
            } catch (error) {
                // createProject already handles error logging/toast
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Fill in the project details below. All required fields are marked with an asterisk (*).
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Error/Success Messages */}
                        {error && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="error" onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            </Grid>
                        )}
                        {success && (
                            <Grid size={{ xs: 12 }}>
                                <Alert severity="success" onClose={() => setSuccess(null)}>
                                    {success}
                                </Alert>
                            </Grid>
                        )}

                        {/* Project Name */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Project Name *"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                                disabled={isLoading}
                            />
                        </Grid>

                        {/* Start Date */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <DatePicker
                                label="Start Date *"
                                value={formik.values.start_date}
                                onChange={(date) => formik.setFieldValue('start_date', date)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        id: 'start_date',
                                        name: 'start_date',
                                        error: formik.touched.start_date && Boolean(formik.errors.start_date),
                                        helperText: formik.touched.start_date && formik.errors.start_date,
                                        onBlur: formik.handleBlur,
                                        disabled: isLoading,
                                    },
                                }}
                            />
                        </Grid>

                        {/* End Date */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <DatePicker
                                label="End Date"
                                value={formik.values.end_date}
                                onChange={(date) => formik.setFieldValue('end_date', date)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        id: 'end_date',
                                        name: 'end_date',
                                        error: formik.touched.end_date && Boolean(formik.errors.end_date),
                                        helperText: formik.touched.end_date && formik.errors.end_date,
                                        onBlur: formik.handleBlur,
                                        disabled: isLoading,
                                    },
                                }}
                            />
                        </Grid>

                        {/* Description */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                disabled={isLoading}
                            />
                        </Grid>



                        {/* Manager Code */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                select
                                id="manager_code"
                                name="manager_code"
                                label="Project Manager"
                                value={formik.values.manager_code}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.manager_code && Boolean(formik.errors.manager_code)}
                                helperText={formik.touched.manager_code && formik.errors.manager_code}
                                disabled={isLoading}
                            >
                                <MenuItem value="">
                                    <em>Select a manager</em>
                                </MenuItem>
                                {managers.map((manager: any) => (
                                    <MenuItem key={manager.value} value={manager.value}>
                                        {manager.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Submit Button */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => formik.resetForm()}
                                    disabled={isLoading}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isLoading || !formik.isValid}
                                    startIcon={isLoading && <CircularProgress size={20} />}
                                >
                                    {isLoading ? 'Creating...' : 'Create Project'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>


                {/* Form Validation Summary */}
                {!formik.isValid && formik.submitCount > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Please fix the errors in the form before submitting.
                    </Alert>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default CreateProjectScreen;