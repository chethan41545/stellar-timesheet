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
import { useFormik } from 'formik';
import * as yup from 'yup';
import apiService from '../../services/apiService';
import { API_ENDPOINTS } from '../../constants/apiUrls';
import axios from 'axios';
import { toast } from 'react-toastify';

interface TaskFormData {
    name: string;
    description: string;
    project_code: string;
}

const validationSchema = yup.object({
    name: yup
        .string()
        .min(3, 'Task name must be at least 3 characters')
        .max(100, 'Task name must be less than 100 characters')
        .required('Task name is required'),
    description: yup.string(),
    project_code: yup.string().required('Please select a project'),
});

const CreateTaskScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getMethod(API_ENDPOINTS.PROJECT_LIST); // Assuming GET endpoint
            const projectList = response.data.data.map((project: any) => ({
                label: project.name,
                value: project.code,
            }));
            setProjects(projectList);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data);
            } else {
                console.error(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const createTask = async (payload: any) => {
        setIsLoading(true);
        try {
            const response = await apiService.postMethod(API_ENDPOINTS.CREATE_TASK, payload);
            toast.success(response.data.message || 'Task created successfully!');
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || 'Failed to create task');
            } else {
                toast.error('Failed to create task');
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const formik = useFormik<TaskFormData>({
        initialValues: {
            name: '',
            description: '',
            project_code: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setError(null);
            setSuccess(null);
            try {
                await createTask(values);
                setSuccess('Task created successfully!');
                formik.resetForm();
            } catch (err) {
                // Error handled in createTask
            }
        },
    });

    return (
        <Box sx={{ mt: 4, mb: 4 }
        }>
            <Typography variant="body1" color="text.secondary" paragraph >
                Fill in the task details below.All required fields are marked with an asterisk(*).
            </Typography>

            < form onSubmit={formik.handleSubmit} >
                <Grid container spacing={3} >
                    {/* Error/Success Messages */}
                    {
                        error && (
                            <Grid size={{xs:12}} >
                                <Alert severity="error" onClose={() => setError(null)
                                }>
                                    {error}
                                </Alert>
                            </Grid>
                        )}
                    {
                        success && (
                            <Grid size={{xs:12}} >
                                <Alert severity="success" onClose={() => setSuccess(null)
                                }>
                                    {success}
                                </Alert>
                            </Grid>
                        )}

                    {/* Task Name */}
                    <Grid size={{xs:12, md:4}}>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Task Name *"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                            disabled={isLoading}
                        />
                    </Grid>

                    {/* Project Selection */}
                    <Grid size={{xs:12, md:4}} >
                        <TextField
                            fullWidth
                            select
                            id="project_code"
                            name="project_code"
                            label="Select Project *"
                            value={formik.values.project_code}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.project_code && Boolean(formik.errors.project_code)}
                            helperText={formik.touched.project_code && formik.errors.project_code}
                            disabled={isLoading}
                        >
                            <MenuItem value="" >
                                <em>Select a project </em>
                            </MenuItem>
                            {
                                projects.map((project) => (
                                    <MenuItem key={project.value} value={project.value} >
                                        {project.label}
                                    </MenuItem>
                                ))
                            }
                        </TextField>
                    </Grid>

                    {/* Description */}
                    <Grid size={{xs:12}} >
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

                    {/* Submit Button */}
                    <Grid size={{xs:12}} >
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={() => formik.resetForm()} disabled={isLoading} >
                                Reset
                            </Button>
                            < Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading || !formik.isValid}
                                startIcon={isLoading && <CircularProgress size={20} />}
                            >
                                {isLoading ? 'Creating...' : 'Create Task'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Form Validation Summary */}
                {
                    !formik.isValid && formik.submitCount > 0 && (
                        <Alert severity="warning" sx={{ mt: 2 }
                        }>
                            Please fix the errors in the form before submitting.
                        </Alert>
                    )}
            </form>
        </Box>
    );
};

export default CreateTaskScreen;
