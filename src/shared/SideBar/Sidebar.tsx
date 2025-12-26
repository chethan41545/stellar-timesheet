import React from 'react';
import {
	Box,
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	useTheme,
	Tooltip,
} from '@mui/material';
import { RiLogoutBoxLine } from "react-icons/ri";
import {
	Dashboard,
	Today,
	CalendarMonth,
	BarChart,
	People,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';

interface SidebarItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	path: string;
}

interface SidebarProps {
	width?: number;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
	width = 190,
	collapsed = true,
	onToggleCollapse,
}) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const location = useLocation();

	// alert(collapsed);
	// Sidebar navigation items
	const menuItems: SidebarItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <Dashboard />,
			path: '/dashboard',
		},
		{
			id: 'timesheets',
			label: 'Timesheets',
			icon: <Today />,
			path: '/timesheets',
		},
		{
			id: 'calendar',
			label: 'Calendar',
			icon: <CalendarMonth />,
			path: '/users-timesheet',
		},
		{
			id: 'reports',
			label: 'Reports',
			icon: <BarChart />,
			path: '/reports',
		},
		{
			id: 'team',
			label: 'Team',
			icon: <People />,
			path: '/team',
		},
		{
			id: 'projects',
			label: 'Projects',
			icon: <DisplaySettingsIcon />,
			path: '/projects',
		},
	];

	const handleNavigation = (path: string) => {
		navigate(path);
	};

	const isActive = (path: string) => {
		return location.pathname === path;
	};

	return (
		<Paper
			elevation={0}
			sx={{
				width: collapsed ? 72 : width,
				height: '91vh',
				position: 'fixed',
				borderRadius: 0,
				borderRight: '1px solid',
				borderColor: 'divider',
				backgroundColor: '#6f94bc',
				display: 'flex',
				flexDirection: 'column',
				overflowX: 'hidden', // <-- add this
				transition: theme.transitions.create('width', {
					easing: theme.transitions.easing.sharp,
					duration: theme.transitions.duration.enteringScreen,
				}),
				zIndex: theme.zIndex.appBar - 1,
			}}
		>


			{/* Navigation Items */}
			<Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2 }}>

				<List>
					{menuItems.map((item) => (
						<ListItem
							key={item.id}
							disablePadding
							sx={{
								mb: '20px',
								px: collapsed ? 1 : 2
							}}
						>
							<ListItemButton
								onClick={() => handleNavigation(item.path)}
								selected={isActive(item.path)}
								sx={{
									borderRadius: 1,
									py: 1.25,
									justifyContent: collapsed ? 'center' : 'flex-start',
									minHeight: 48,

									/* ACTIVE STATE */
									'&.Mui-selected': {
										backgroundColor: '#edf7fa',
										color: 'secondary.main',
										'& .MuiListItemIcon-root': {
											color: '#3c4856',
										},
										'&:hover': {
											backgroundColor: '#edf7fa',
										},
									},

									/* HOVER STATE */
									'&:hover': {
										backgroundColor: '#edf7fa',

										'& .MuiListItemIcon-root': {
											color: '#3c4856',
										},

										'& .MuiTypography-root': {
											color: '#3c4856',
										},
									},
								}}
							>


								<Tooltip title={item.label} placement="right"
									disableHoverListener={!collapsed} // Only active when collapsed
									disableFocusListener={!collapsed}
									disableTouchListener={!collapsed}>

									<ListItemIcon
										sx={{
											minWidth: 0,
											mr: collapsed ? 0 : 2,
											justifyContent: 'center',
											color: isActive(item.path) ? 'primary.main' : '#effaff',
										}}
									>
										{item.icon}
									</ListItemIcon>

								</Tooltip>

								{!collapsed && (
									<ListItemText
										primary={item.label}
										sx={{
											opacity: 1,
											'& .MuiTypography-root': {
												fontWeight: isActive(item.path) ? 600 : 400,
												fontSize: '0.875rem',
											},
										}}
									/>
								)}
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>

			{/* Optional: Collapse Toggle */}
			{onToggleCollapse && (
				<Box sx={{
					p: 2,
					borderTop: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					justifyContent: 'center',
					
							
								
				}}>
					<ListItemButton
						onClick={() => {localStorage.clear();sessionStorage.clear();navigate('/login')}}
						sx={{
							borderRadius: 1,
							justifyContent: 'center',
							p: 1,
							minHeight: 40,
							width: collapsed ? 32 : 'auto',
						}}
					>
						<Box >
							<Box sx={{
								width: 24,
								height: 24,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								border: '1px solid #3c4856'
							}}>
								<RiLogoutBoxLine style={{ fontSize: 'larger',color :'#3c4856' }} />
							</Box>
						</Box>

					</ListItemButton>
				</Box>
			)}
		</Paper>
	);
};

export default Sidebar;