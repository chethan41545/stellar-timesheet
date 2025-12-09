import { NavLink } from "react-router-dom";

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { ROUTES } from "../../constants/routes";
import styles from "./Sidebar.module.css";
import { normalize, readRole } from "../../utils/userUtils";
import { LOCAL_STORAGE_VARIABLES } from "../../constants/storageVariables";
import { LuCalendarCheck2 } from "react-icons/lu";
import { GrUserAdmin } from "react-icons/gr";

export default function Sidebar() {
	let mainItems: any;
	const role = normalize(readRole());

	const permissions = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VARIABLES.USER_PERMISSIONS) || "{}");

	// if (role === "msp") {
	mainItems = [
		permissions.menu_dashboard && { to: ROUTES.DASHBOARD, label: "Dashboard", icon: <DashboardOutlinedIcon fontSize={"small"} /> },
		permissions.menu_requisition && { to: ROUTES.REQUESITIONS, label: "Requisitions", icon: <WorkOutlineIcon fontSize={"small"} /> },
		permissions.menu_candidate && { to: ROUTES.CANDIDATES, label: "Candidates", icon: <GroupOutlinedIcon fontSize={"small"} /> },
		permissions.menu_placement && { to: ROUTES.PLACEMENTS, label: "Placements", icon: <AssignmentTurnedInOutlinedIcon fontSize={"small"} /> },
		permissions.menu_expenses && { to: ROUTES.EXPENSES, label: "Expenses", icon: <AccountBalanceWalletIcon fontSize={"small"} /> },
		permissions.menu_reports && { to: ROUTES.REPORTS, label: "Reports", icon: <DescriptionOutlinedIcon fontSize={"small"} /> },
		permissions.menu_admin && { to: ROUTES.ADMIN, label: "Admin", icon: <GrUserAdmin fontSize={"18px"} /> },
		// permissions.menu_timesheet && { to: ROUTES.TIMESHEETS, label: "Timesheets", icon: <LuCalendarCheck2 fontSize={"18px"} /> },
		permissions.menu_timesheet && {
			to: role === "candidate" ? ROUTES.TIMESHEETS_CANDIDATE : ROUTES.TIMESHEETS,
			label: "Timesheets",
			icon: <LuCalendarCheck2 fontSize={"18px"} />
		},
	].filter(Boolean);
	// }
	// else {
	// 	mainItems = [
	// 		{ to: ROUTES.DASHBOARD, label: "Dashboard", icon: <DashboardOutlinedIcon fontSize={"small"} /> },
	// 		{ to: ROUTES.REQUESITIONS, label: "Requisitions", icon: <WorkOutlineIcon fontSize={"small"} /> },
	// 		{ to: ROUTES.CANDIDATES, label: "Candidates", icon: <GroupOutlinedIcon fontSize={"small"} /> },
	// 		{ to: ROUTES.PLACEMENTS, label: "Placements", icon: <AssignmentTurnedInOutlinedIcon fontSize={"small"} /> },
	// 		{ to: ROUTES.EXPENSES, label: "Expenses", icon: <AccountBalanceWalletIcon fontSize={"small"} /> },
	// 		{ to: ROUTES.REPORTS, label: "Reports", icon: <DescriptionOutlinedIcon fontSize={"small"} /> },
	// 	];

	// }

	const bottomItems = [
		{ to: ROUTES.SETTINGS, label: "Settings", icon: <SettingsOutlinedIcon fontSize={"medium"} /> },
		{ to: ROUTES.HELP, label: "Help", icon: <ErrorOutlineOutlinedIcon fontSize={"small"} /> },
	];
	return (
		<aside className={styles.sidebar}>
			<nav className={styles.nav}>
				{mainItems.map((item: any) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`${styles.item} ${isActive ? styles.active : ""}`
						}
					>
						<span className={styles.icon}>{item.icon}</span><br></br>
						<span className={styles.text}>{item.label}</span>
					</NavLink>
				))}
			</nav>

			{/* <div className={styles.divider} /> */}
			<hr className={styles.divider} />

			<nav className={styles.bottom}>
				{bottomItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`${styles.item} ${isActive ? styles.active : ""}`
						}
					>
						<span className={styles.icon}>{item.icon}</span><br></br>
						<span className={styles.text}>{item.label}</span>
					</NavLink>
				))}
			</nav>
		</aside>
	);
}
