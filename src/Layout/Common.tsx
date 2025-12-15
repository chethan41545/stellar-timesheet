import React, { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../shared/Header/Header';
import Sidebar from '../shared/SideBar/Sidebar';


const routeTitles: Record<string, string> = {
    '/timesheets': 'My Timesheets',
    '/users-timesheet': 'Users Timesheet',
};


const CommonLayout: React.FC = () => {

    const location = useLocation();
    const title = routeTitles[location.pathname] || 'Default Title';

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        console.log('Logging out...');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Header - Fixed at top */}
            <Box position={"sticky"} top={0} zIndex={1000}>
                <Header
                    userName="John Doe"
                    onLogout={handleLogout}
                />
            </Box>

            {/* Main content area with sidebar and page content */}
            <Box sx={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden'
            }}>
                {/* Sidebar */}
                <Box sx={{
                    width: sidebarCollapsed ? 72 : 190,
                    flexShrink: 0,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    overflowY: 'auto',
                    transition: 'width 0.3s ease'
                }}>
                    <Sidebar
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                    />
                </Box>

                {/* Page Content */}
                <Box
                    sx={(theme) => ({
                        flex: 1,
                        p: 3,
                        minWidth: 0,
                        overflow: 'auto',
                        backgroundColor: theme.customColors.surfaceDark, // <- correct way
                    })}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: 'text.main',
                            mb: 3,
                        }}
                    >
                        {title}
                    </Typography>

                    <Paper
                        sx={{
                            p: 3,
                            width: '100%',
                            maxWidth: '100%',
                            minHeight: '70vh',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            border: '1px solid',
                            borderColor: 'divider',
                            backgroundColor: 'white',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Outlet />
                    </Paper>
                </Box>

            </Box>
        </Box>
    );
};

export default CommonLayout;