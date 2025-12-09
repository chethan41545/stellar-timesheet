// Import of react
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCog, FaUser, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import logo from "../../assets/logos/main-logo.svg"

// Imports of MUI
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

// Imports Custom components
import { API_ENDPOINTS } from "../../constants/apiUrls";
import { ROUTES } from "../../constants/routes";
import { LOCAL_STORAGE_VARIABLES } from "../../constants/storageVariables";
import styles from "./Header.module.css";
import Apiservice from "../../services/apiService";
import { USER_COLORS } from "../../constants/constants";

type User = { name: string; email: string };

const readFromStorage = (key: string) =>
	(typeof window !== "undefined" && (localStorage.getItem(key) ?? sessionStorage.getItem(key))) || "";

const getInitials = (fullName: string) => {
	const clean = String(fullName || "").trim();
	if (!clean) return "U";
	const parts = clean.split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	}
	// single word: take first 2 letters if possible
	return clean.slice(0, 2).toUpperCase();
};

const Header = () => {
	const [open, setOpen] = useState(false);
	const btnRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();

	const [user, setUser] = useState<User>(() => ({
		name: readFromStorage(LOCAL_STORAGE_VARIABLES.USER_FULL_NAME) || "User",
		email: readFromStorage(LOCAL_STORAGE_VARIABLES.USER_EMAIL) || "user@example.com",
	}));

	// Close on outside click or ESC
	useEffect(() => {
		const onDocClick = (e: MouseEvent) => {
			if (
				open &&
				!menuRef.current?.contains(e.target as Node) &&
				!btnRef.current?.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onEsc);
		};
	}, [open]);

	// Read name/email from storage on mount + update if changed in other tabs
	useEffect(() => {
		const readUser = () =>
			setUser({
				name: readFromStorage(LOCAL_STORAGE_VARIABLES.USER_FULL_NAME) || "User",
				email: readFromStorage(LOCAL_STORAGE_VARIABLES.USER_EMAIL) || "user@example.com",
			});
		readUser();
		window.addEventListener("storage", readUser);
		return () => window.removeEventListener("storage", readUser);
	}, []);

	const handleSignOut = () => {
		Apiservice.postMethod(API_ENDPOINTS.LOGOUT, {})
			.catch(() => { })
			.finally(() => {
				try { localStorage.clear(); sessionStorage.clear(); } catch { }
				navigate(ROUTES.LOGIN, { replace: true });
			});
	};

	const initials = getInitials(user.name);

	let roles: string[] = JSON.parse(localStorage.getItem("roles") || "[]");
	let role: string = "";
	let roleName: string = ""

	role = roles[0];
	// let userName = localStorage.getItem("user_full_name");

	if (roles.length > 0) {
		roleName = roles.length > 1 ? roles[roles.length - 1] : roles[0];
	}

	const roleColor = role ? USER_COLORS[role as keyof typeof USER_COLORS] : undefined;



	return (
		<div>
			{
				roleColor && (
					<>
						<p className={styles.role_badge_parent}
							style={{
								backgroundColor: roleColor,
							}} />

						<p className={styles.role_badge}
							style={{
								backgroundColor: roleColor
							}}>
							{roleName.toUpperCase().replace(/_/g, " ")}
							{/* {userName} */}
						</p></>

				)
			}


			<div className={styles.header}>
				<div className={styles.left}>
					<img src={logo} alt="main logo" className={styles.logo} onClick={() => navigate(ROUTES.DASHBOARD)}></img>
				</div>

				{/* <div className={styles.center} style={{ visibility: "hidden" }}>
					<div className={`${styles.tab} ${styles.active}`}>Dashboard</div>
					<div className={styles.tab}>
						Announcement <span className={styles.badge}>8</span>
					</div>
				</div> */}

				<div className={styles.right}>
					<button className={styles.circle} aria-label="notification">
						<NotificationsNoneOutlinedIcon sx={{ fontSize: "18px" }} />
						{/* <FaSearch /> */}
					</button>
					<button className={styles.circle2} aria-label="Notifications">
						{/* <FaBell /> */}
						<CalendarTodayOutlinedIcon sx={{ fontSize: "12px" }} />
					</button>

					{/* Profile button (initials avatar) */}
					<button
						ref={btnRef}
						className={styles.profileBtn}
						onClick={() => setOpen((v) => !v)}
						aria-haspopup="menu"
						aria-expanded={open}
						title={`${user.name} (${user.email})`}
					>
						<div className={styles.avatarInitials} aria-hidden="true">{initials}</div>
						<FaChevronDown className={styles.chev} />
					</button>

					{/* Dropdown */}
					{open && (
						<div ref={menuRef} className={styles.menu} role="menu" aria-label="User menu">
							<div className={styles.menuHeader}>
								<div className={styles.menuAvatarInitials} aria-hidden="true">{initials}</div>
								<div className={styles.menuWho}>
									<div className={styles.menuName}>{user.name}</div>
									<div className={styles.menuEmail}>{user.email}</div>
								</div>
							</div>

							<button className={styles.menuItem} role="menuitem" onClick={() => navigate(ROUTES.SETTINGS)}>
								<FaCog />
								<span>Settings</span>
							</button>

							<button className={styles.menuItem} role="menuitem" onClick={() => navigate(ROUTES.PROFILE)}>
								<FaUser />
								<span>Profile</span>
							</button>

							<button className={styles.menuItem} role="menuitem" onClick={handleSignOut}>
								<FaSignOutAlt />
								<span>Sign out</span>
							</button>
						</div>
					)}

					{/* <p style={{padding:0, margin:0}}>
						{userName}
					</p> */}
				</div>
			</div>


		</div>
	);
};

export default Header;
