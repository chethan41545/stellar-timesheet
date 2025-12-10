import React from 'react';
import {
	Box,
	Paper,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
	useTheme,
	Tooltip,
} from '@mui/material';
import {
	Dashboard,
	Today,
	CalendarMonth,
	BarChart,
	People,
	Settings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

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
	width = 240,
	collapsed = false,
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
			id: 'settings',
			label: 'Settings',
			icon: <Settings />,
			path: '/settings',
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
				backgroundColor: 'background.paper',
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
								mb: 0.5,
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
									'&.Mui-selected': {
										backgroundColor: 'primary.light',
										color: 'secondary.main',
										'&:hover': {
											backgroundColor: 'primary.light',
										},
										'& .MuiListItemIcon-root': {
											color: 'secondary.main',
										},
									},
									'&:hover': {
										backgroundColor: 'action.hover',
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
											color: isActive(item.path) ? 'primary.main' : 'text.secondary',
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
						onClick={onToggleCollapse}
						sx={{
							borderRadius: 1,
							justifyContent: 'center',
							p: 1,
							minHeight: 40,
							width: collapsed ? 32 : 'auto',
						}}
					>
						{collapsed ? (
							<Box >
								<Box sx={{
									width: 24,
									height: 24,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center'
								}}>
									→
								</Box>
							</Box>
						) : (
							<Box sx={{
								width: 24,
								height: 24,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center'
							}}>
								←
							</Box>
						)}
					</ListItemButton>
				</Box>
			)}
		</Paper>
	);
};

export default Sidebar;