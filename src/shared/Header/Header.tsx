import React, { useState } from 'react';
import {
	AppBar,
	Toolbar,
	Box,
	IconButton,
	Avatar,
	Menu,
	MenuItem,
	Typography,
	Divider,
} from '@mui/material';
import {
	Logout,
} from '@mui/icons-material';

import logo from "../../assets/logos/main-logo.png";


interface HeaderProps {
	userName?: string;
	userEmail?: string;
	userRole?: string;
	onLogout: () => void;
	companyName?: string;
	notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
	userName = 'User',
	userEmail,
	userRole,
	onLogout,
}) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

	const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};



	const handleClose = () => {
		setAnchorEl(null);
	};


	const handleLogout = () => {
		handleClose();
		onLogout();
	};

	return (
		<AppBar
			position="static"
			elevation={0}
			sx={{
				backgroundColor: 'white',
				borderBottom: '1px solid',
				borderColor: 'divider',
				boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
			}}
		>
			<Toolbar sx={{
				justifyContent: 'space-between',
				minHeight: 64,
				px: { xs: 2, sm: 3 }
			}}>
				{/* Logo Section */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<img src={logo} alt="main logo" width="160px" />

				</Box>

				{/* Right Section - Icons and Profile */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>


					{/* Profile Section */}
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
						<Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
							<Typography variant="body2" fontWeight={500}>
								{userName}
							</Typography>
							{userRole && (
								<Typography variant="caption" color="text.secondary">
									{userRole}
								</Typography>
							)}
							{userEmail && !userRole && (
								<Typography variant="caption" color="text.secondary">
									{userEmail}
								</Typography>
							)}
						</Box>

						<IconButton
							onClick={handleProfileClick}
							size="small"
							sx={{
								border: '2px solid',
								borderColor: 'transparent',
								'&:hover': {
									borderColor: 'primary.light'
								}
							}}
						>
							<Avatar
								sx={{
									width: 36,
									height: 36,
									fontSize: 16,
									fontWeight: 600,
									bgcolor: 'primary.main',
								}}
							>
								{userName.charAt(0).toUpperCase()}
							</Avatar>
						</IconButton>
					</Box>

					{/* Profile Menu */}
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={handleClose}
						PaperProps={{
							elevation: 3,
							sx: {
								mt: 1.5,
								minWidth: 220,
								borderRadius: 1,
							},
						}}
					>
						{/* User Info */}
						<Box sx={{ px: 2, py: 1.5 }}>
							<Typography variant="subtitle2" fontWeight={600}>
								{userName}
							</Typography>
							{userEmail && (
								<Typography variant="caption" color="text.secondary" display="block">
									{userEmail}
								</Typography>
							)}
							{userRole && (
								<Typography variant="caption" color="primary" display="block">
									{userRole}
								</Typography>
							)}
						</Box>
						<Divider sx={{ my: 1 }} />

						<Divider sx={{ my: 1 }} />

						{/* Logout */}
						<MenuItem
							onClick={handleLogout}
							sx={{
								color: 'error.main'
							}}
						>
							<Logout sx={{ mr: 2, fontSize: 20 }} />
							Logout
						</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Header;