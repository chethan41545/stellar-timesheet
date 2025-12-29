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
// import {
// 	Dashboard,
// 	Today,
// 	CalendarMonth,
// 	BarChart,
// 	People,
// } from '@mui/icons-material';

import DashboardIcon from "@mui/icons-material/Dashboard";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleIcon from "@mui/icons-material/People";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline"; // Projects

import { useNavigate, useLocation } from 'react-router-dom';


import { normalize, readRole } from '../../utils/userUtils';

interface SidebarItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	path: string;
	roles?: string[];
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

	const role = normalize(readRole());


	const menuItems: SidebarItem[] = [
		// {
		// 	id: "dashboard",
		// 	label: "Dashboard",
		// 	icon: <DashboardIcon />,
		// 	path: "/dashboard",
		// 	roles: ["super admin", "manager", "hr"],
		// },
		{
			id: "timesheets",
			label: "Timesheets",
			icon: <TodayIcon />,
			path: "/timesheets",
			roles: ["all"],
		},
		{
			id: "calendar",
			label: "Calendar",
			icon: <CalendarMonthIcon />,
			path: "/users-timesheet",
			roles: ["super admin", "manager", "hr"],
		},
		{
			id: "reports",
			label: "Reports",
			icon: <BarChartIcon />,
			path: "/reports",
			roles: ["super admin", "manager", "hr"],
		},
		{
			id: "users",
			label: "Users",
			icon: <PeopleIcon />,
			path: "/users",
			roles: ["super admin", "manager", "hr"],
		},
		{
			id: "projects",
			label: "Projects",
			icon: <WorkOutlineIcon />,
			path: "/projects",
			roles: ["super admin", "manager", "hr"],
		},
	];


	const filteredMenuItems = menuItems.filter(
		(item) =>
			!item.roles ||
			item.roles.includes('all') ||
			item.roles.includes(role)
	);



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
					{filteredMenuItems.map((item) => (
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
						onClick={() => { localStorage.clear(); sessionStorage.clear(); navigate('/login') }}
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
								<RiLogoutBoxLine style={{ fontSize: 'larger', color: '#3c4856' }} />
							</Box>
						</Box>

					</ListItemButton>
				</Box>
			)}
		</Paper>
	);
};

export default Sidebar;