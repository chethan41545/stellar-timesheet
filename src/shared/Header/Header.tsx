import React from 'react';
import {
	AppBar,
	Toolbar,
	Box,

	Typography,
} from '@mui/material';


import logo from "../../assets/logos/main-logo.png";


interface HeaderProps {
	userName?: any;
	userRole?: any;
	onLogout: () => void;
	companyName?: any;
	notificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({
	userName ,
	userRole,
}) => {

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
					<img src={logo} alt="main logo" width="120px" />

				</Box>

				{/* Right Section - Icons and Profile */}
				<Box sx={{ textAlign: 'right' }}>
	<Typography variant="body2" fontWeight={600} style={{color :'#3c4856',fontSize: '14px'}}>
		Welcome back, {userName}
	</Typography>

	{userRole && (
		<Typography variant="caption" color="text.secondary" style={{color :'#3c4856'}}>
			{userRole}
		</Typography>
	)}
</Box>

			</Toolbar>
		</AppBar>
	);
};

export default Header;