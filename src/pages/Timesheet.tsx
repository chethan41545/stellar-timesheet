// Timesheet.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Timesheet.module.css";
import { toast } from "react-toastify";
import { normalize, readRole } from "../utils/userUtils";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../shared/Button/Button";
import { BiCommentDetail } from "react-icons/bi";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import Apiservice from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import CustomSkeleton from "../shared/CustomSkeleton/CustomSkeleton";
import {
	Autocomplete,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Tooltip,
	Typography,
} from "@mui/material";
import { LuTrash2 } from "react-icons/lu";
import { CustomLoader } from "../shared/CustomLoader/CustomLoader";

/* ========= Types ========= */



type Frequency = "WEEKLY" | "BIWEEKLY" | "SEMI_MONTHLY" | "MONTHLY";

type TaskOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

/* ========= API Types (legacy internal shape) ========= */

type TimesheetApiTimeRecord = {
	date: string;
	hours: string;
	comments: string;
	holiday: boolean;
	weekend: boolean;
	enabled: boolean;
};


type TimesheetApiTimesheet = {
	costCenterId?: string;
	costCenterName?: string;
	chargeCodeId?: string;
	chargeCode?: string;
	chargeCodeName?: string;
	timeRecords: TimesheetApiTimeRecord[];
};

type TimesheetApiStatusHistoryItem = {
	date: string; // "11/20/2025 06:10 pm"
	history_id: number;
	userId: number;
	old_status: string; // "Draft"
	timesheetConfig: string;
	user: string; // "Brown, Olivia"
};

type TimesheetApiData = {
	userId: number;
	timesheetId: number | null;
	startDate: string; // "11/24/2025"
	endDate: string; // "12/07/2025"
	status: string;
	history: TimesheetApiStatusHistoryItem[];
	timesheets: TimesheetApiTimesheet[];
	createdAt: string | null;
	lastUpdate: string | null;
};

/* ========= Props ========= */
type TimesheetProps = {
	periodStartOverride?: any;
	periodEndOverride?: any;
	freqOverride?: Frequency;
	onReloadPeriods?: () => void;
	timesheetCode?: string;
};

/* ========= Helpers ========= */
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(n, max));
const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

function addDays(d: Date, days: number) {
	const x = new Date(d);
	x.setDate(x.getDate() + days);
	x.setHours(0, 0, 0, 0);
	return x;
}

function buildHeaderParts(d: Date) {
	const dd = d.getDate().toString().padStart(2, "0");
	const mon = d
		.toLocaleDateString("en-GB", { month: "short" })
		.toUpperCase();
	const dow = d
		.toLocaleDateString("en-GB", { weekday: "short" })
		.toUpperCase();
	return { top: `${dd} ${mon}`, bottom: dow };
}

// Parse hours (dec, hh:mm, "30min")
function parseToHours(raw: string): number {
	const s = raw.trim();
	if (!s) return 0;

	const mMatch = s.match(/^(\d{1,4})\s*m(?:in)?$/i);
	if (mMatch) return parseInt(mMatch[1], 10) / 60;

	if (s.includes(":")) {
		const [hStr, mStr = "0"] = s.split(":");
		const h = parseInt((hStr || "0").replace(/[^\d-]/g, ""), 10);
		const m = parseInt(mStr.replace(/[^\d]/g, ""), 10);
		if (isNaN(h) || isNaN(m)) return 0;
		return h + clamp(m, 0, 59) / 60;
	}

	const dec = parseFloat(s.replace(",", "."));
	if (!isNaN(dec)) return dec;
	return 0;
}

function formatHours(h: number) {
	const total = Math.round((h || 0) * 60);
	const hh = Math.floor(total / 60);
	const mm = (total % 60).toString().padStart(2, "0");
	return `${hh}:${mm}`;
}

function normalizeDayMinutes(mins: number[], cap = 24 * 60) {
	const tot = mins.reduce((s, n) => s + n, 0);
	if (!tot || tot <= cap) return mins.slice();
	const scaled = mins.map((m) => (m * cap) / tot);
	const floors = scaled.map(Math.floor);
	let rem = cap - floors.reduce((s, n) => s + n, 0);
	const order = scaled
		.map((v, i) => [v - Math.floor(v), i] as [number, number])
		.sort((a, b) => b[0] - a[0])
		.map((x) => x[1]);
	const out = floors.slice();
	for (const i of order) {
		if (!rem) break;
		out[i] += 1;
		rem -= 1;
	}
	return out;
}

/* ========= Frequency helpers ========= */
const startOfDay = (d = new Date()) => {
	const x = new Date(d);
	x.setHours(0, 0, 0, 0);
	return x;
};
const startOfWeekMon = (d = new Date()) => {
	const x = startOfDay(d);
	const dow = (x.getDay() + 6) % 7;
	x.setDate(x.getDate() - dow);
	return x;
};
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfSemiMonthly = (date = new Date()) => {
	const d = startOfDay(date);
	d.setDate(d.getDate() <= 15 ? 1 : 16);
	return d;
};

const BIWEEK_ANCHOR = startOfWeekMon(new Date(2024, 0, 1));
const startOfBiWeekly = (date = new Date()) => {
	const mon = startOfWeekMon(date);
	const diffDays = Math.floor(
		(mon.getTime() - BIWEEK_ANCHOR.getTime()) / (24 * 60 * 60 * 1000)
	);
	const mod = ((diffDays % 14) + 14) % 14;
	return new Date(mon.getTime() - mod * (24 * 60 * 60 * 1000));
};

const startOfPeriodByFreq = (freq: Frequency, date = new Date()) => {
	switch (freq) {
		case "WEEKLY":
			return startOfWeekMon(date);
		case "BIWEEKLY":
			return startOfBiWeekly(date);
		case "SEMI_MONTHLY":
			return startOfSemiMonthly(date);
		case "MONTHLY":
			return firstOfMonth(date);
	}
};


/* strict MM/DD/YYYY parsing */
const parseMDY = (s: string): Date => {
	const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (!m) throw new Error(`Invalid format, expected MM/DD/YYYY: ${s}`);
	const month = Number(m[1]);
	const day = Number(m[2]);
	const year = Number(m[3]);
	if (month < 1 || month > 12) throw new Error(`Invalid month in date: ${s}`);
	if (year < 0) throw new Error(`Invalid year in date: ${s}`);
	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		throw new Error(`Invalid day for given month/year: ${s}`);
	}
	return date;
};

const toDateStrict = (input: Date | string): Date => {
	if (input instanceof Date) {
		if (Number.isNaN(input.getTime())) throw new Error("Invalid Date object");
		return new Date(input.getTime());
	}
	return parseMDY(input);
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const formatDateMDY = (d: Date) =>
	`${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;

const formatDateMDYLocal = (d: Date | string) => {
	const date = d instanceof Date ? d : new Date(d);
	return `${pad2(date.getMonth() + 1)}/${pad2(
		date.getDate()
	)}/${date.getFullYear()}`;
};

// const toRequestDate = (input: Date | string): string => {
// 	if (typeof input === "string") return input;
// 	return formatDateMDY(input);
// };

/* ========= Adapt /timesheet/user response → legacy TimesheetApiData ========= */

function adaptNewApiToLegacy(apiRaw: any): TimesheetApiData {
	const rows = apiRaw?.timesheet_data || [];
	const topStatus = apiRaw?.timesheet_status ?? "";

	if (!rows.length) {
		return {
			userId: 0,
			timesheetId: null,
			startDate: "",
			endDate: "",
			status: topStatus,
			history: [],
			timesheets: [],
			createdAt: null,
			lastUpdate: null,
		};
	}

	const first = rows[0];

	const timesheets: TimesheetApiTimesheet[] = rows.map((row: any) => ({
		costCenterId: row.project_code,
		costCenterName: row.project_name,
		chargeCodeId: row.task_code,
		chargeCode: row.task_name,
		chargeCodeName: row.task_name,
		timeRecords: (row.time_records || []).map((tr: any) => ({
			date: tr.date ? formatDateMDY(new Date(tr.date)) : "",
			hours: String(tr.hours ?? 0),
			comments: tr.note ?? "",
			holiday: Boolean(tr.is_holiday),
			weekend: Boolean(tr.is_weekend),
			enabled: tr.is_editable,
		})),
		can_delete: row.can_delete,
		can_approve: row.can_approve,
		timesheet_entry_code: row.timesheet_entry_code
	}));

	return {
		userId: 0,
		timesheetId: null,
		startDate: formatDateMDY(new Date(first.week_start)),
		endDate: formatDateMDY(new Date(first.week_end)),
		status: apiRaw.timesheet_status,
		history: apiRaw.timesheet_data[0]?.history || [], // ✅ FIX
		timesheets,
		createdAt: null,
		lastUpdate: null,
	};
}

/* ========= Mapping API → state ========= */
function mapApiDataToState(api: any): {
	days: Date[];
	entries: any;
	holidayByDay: boolean[];
	history: any[];
} {
	const start = parseMDY(api.startDate);
	const end = parseMDY(api.endDate);
	const days: Date[] = [];
	let cur = new Date(start);
	while (cur.getTime() <= end.getTime()) {
		days.push(new Date(cur));
		cur = addDays(cur, 1);
	}

	const holidayByDay: boolean[] = Array(days.length).fill(false);
	const entries: any = [];

	(api.timesheets || []).forEach((ts: any) => {
		const costCenterName: any = ts.costCenterName;
		const chargeCodeName: any = ts.chargeCode;
		const can_delete: any = ts.can_delete;
		const can_approve: any = ts.can_approve;
		const timesheet_entry_code: any = ts.timesheet_entry_code;


		const hours: number[] = Array(days.length).fill(0);
		const comments: string[] = Array(days.length).fill("");
		const enabled: any[] = Array(days.length).fill("");

		(ts.timeRecords || []).forEach((tr: any) => {
			const idx = days.findIndex((d) => formatDateMDY(d) === tr.date);
			if (idx === -1) return;

			const h = parseFloat(tr.hours);
			hours[idx] = isNaN(h) ? 0 : clamp(h, 0, 24);
			comments[idx] = (tr.comments || "").slice(0, 250);
			enabled[idx] = tr.enabled;
			if (tr.holiday) {
				holidayByDay[idx] = true;
			}
		});

		entries.push({
			id: uid(),
			costCenterId: ts.costCenterId,
			costCenterName,
			chargeCodeId: ts.chargeCodeId,
			chargeCodeName,
			notes: "",
			hours,
			comments,
			enabled,
			can_delete,
			can_approve,
			timesheet_entry_code
		});
	});
	const history = (api.history || []).map((item: any) => ({
		id: uid(),
		status: item.new_status,
		by: item.user,
		at: item.date,
		comment: null,
		prevStatus: item.old_status,
		newStatus: item.new_status,
		changeType: "StatusUpdate",
	}));


	return { days, entries, holidayByDay, history };
}

/* ========= Confirm Modals ========= */
function Modal({
	open,
	children,
}: {
	open: boolean;
	children: React.ReactNode;
}) {
	if (!open) return null;
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modal} role="dialog" aria-modal="true">
				{children}
			</div>
		</div>
	);
}

function MaxHoursModal({
	open,
	date,
	onClose,
}: {
	open: boolean;
	date: Date | null;
	onClose: () => void;
}) {
	if (!open) return null;
	const dateLabel = date
		? date.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
		: "";
	const message = `Hours cannot exceed 24 hours per day for ${dateLabel}. Please adjust your entry.`;

	return (
		<Modal open={open}>
			<div className={styles.modalTitleRow}>
				<span className={styles.alertIcon} aria-hidden="true">
					<FiAlertTriangle />
				</span>
				<h3 className={styles.modalTitle} style={{ margin: 0 }}>
					{message}
				</h3>
			</div>
			<div className={styles.modalActions}>
				<button className={styles.submit} type="button" onClick={onClose}>
					OK
				</button>
			</div>
		</Modal>
	);
}

function HolidayConfirmModal({
	open,
	date,
	isNonWorking,
	isOver8,
	onConfirm,
	onCancel,
}: {
	open: boolean;
	date: Date | null;
	isNonWorking: boolean;
	isOver8: boolean;
	hours: number | null;
	comment: string | null;
	onConfirm: () => void;
	onCancel: () => void;
}) {
	const dateLabel = date
		? date.toLocaleDateString(undefined, {
			weekday: "short",
			month: "short",
			day: "numeric",
		})
		: "";

	let message = "";
	if (isOver8 && isNonWorking) {
		message = `You have entered more than 8 hours on a non-working day (Weekend/Holiday) for ${dateLabel}. Please confirm if this is correct.`;
	} else if (isOver8) {
		message = `You have entered more than 8 hours for ${dateLabel}. Please confirm if this is correct.`;
	} else if (isNonWorking) {
		message = `You are entering hours on a non-working day (Weekend/Holiday) for ${dateLabel}. Please confirm if this is correct.`;
	} else {
		message = `Log hours on ${dateLabel}?`;
	}

	return (
		<Modal open={open}>
			<div className={styles.modalTitleRow}>
				<span className={styles.alertIcon} aria-hidden="true">
					<FiAlertTriangle />
				</span>
				<h3 className={styles.modalTitle} style={{ margin: 0 }}>
					{message}
				</h3>
			</div>

			<div className={styles.modalActions}>
				<button className={styles.secondary} onClick={onCancel} type="button">
					Cancel
				</button>
				<button className={styles.submit} onClick={onConfirm} type="button">
					Confirm
				</button>
			</div>
		</Modal>
	);
}

// function ApproveConfirmModal({
// 	open,
// 	title,
// 	confirmLabel = "Approve",
// 	onConfirm,
// 	onCancel,
// }: {
// 	open: boolean;
// 	title: string;
// 	message: string;
// 	confirmLabel?: string;
// 	onConfirm: () => void;
// 	onCancel: () => void;
// }) {
// 	return (
// 		<Modal open={open}>
// 			<h3 className={styles.modalTitle}>{title}</h3>
// 			<div className={styles.modalActions}>
// 				<button className={styles.secondary} onClick={onCancel} type="button">
// 					Cancel
// 				</button>
// 				<button className={styles.submit} onClick={onConfirm} type="button">
// 					{confirmLabel}
// 				</button>
// 			</div>
// 		</Modal>
// 	);
// }

/* ========= Component ========= */
export default function Timesheet({
	periodStartOverride,
	periodEndOverride,
	freqOverride,
	onReloadPeriods,
	timesheetCode,
}: TimesheetProps) {
	const role = normalize(readRole());
	// const isCandidate = role === "employee";
	// const isAgency = role === "manager";
	const { id } = useParams();

	const [freq, setFreq] = useState<Frequency>(freqOverride ?? "BIWEEKLY");

	const initialPeriodStart = periodStartOverride
		? startOfPeriodByFreq(freq, toDateStrict(periodStartOverride))
		: startOfPeriodByFreq(freq, new Date());
	const [periodStart, setPeriodStart] = useState<Date>(initialPeriodStart);

	const [days, setDays] = useState<Date[]>([]);
	const [holidayByDay, setHolidayByDay] = useState<any>([]);
	const [entries, setEntries] = useState<any[]>([]);
	const [history, setHistory] = useState<any[]>([]);
	const [timesheetStatus, setTimesheetStatus] = useState<any>(null);
	const [agencyName, setagencyName] = useState<any>(null);

	const [saving, setSaving] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [rejecting, setRejecting] = useState(false);
	const [candidateName, setCandidatename] = useState("");

	const [loading, setLoading] = useState(false);
	const [pageLoading, setPageLoading] = useState(false);
	const [_timesheetId, setTimesheetId] = useState<number | null>(null);
	const [prevTimesheetId, setPrevTimesheetId] = useState<number | null>(null);
	const [nextTimesheetId, setNextTimesheetId] = useState<number | null>(null);
	const [alignRight, setAlignRight] = useState(false);
	// const [alertMessage, setAlertMessage] = useState("");
	const [apiStartDate, setApiStartDate] = useState<any>("");
	const [apiEndDate, setApiEndDate] = useState<any>("");

	/* === Add Entry modal state + project/task API === */
	const [showAddEntryModal, setShowAddEntryModal] = useState(false);
	const [selectedProjectId, setSelectedProjectId] = useState<string>("");
	const [selectedTaskId, setSelectedTaskId] = useState<string>("");
	const [addEntryError, setAddEntryError] = useState<string>("");

	const [projectList, setProjectList] = useState<ProjectOption[]>([]);
	const [taskList, setTaskList] = useState<TaskOption[]>([]);
	const [projectLoading, setProjectLoading] = useState(false);
	const [taskLoading, setTaskLoading] = useState(false);
	const [selectedEntryCode, setSelectedEntryCode] = useState<string | null>(null);


	/* sync freq if parent changes it */
	useEffect(() => {
		if (freqOverride) {
			setFreq(freqOverride);
		}
	}, [freqOverride]);

	/* sync periodStart if parent changes override */
	useEffect(() => {
		if (periodStartOverride) {
			const useFreq = freqOverride ?? freq;
			setPeriodStart(
				startOfPeriodByFreq(useFreq, toDateStrict(periodStartOverride))
			);
		}
	}, [periodStartOverride, freqOverride, freq]);

	/* ===== Comment popup state ===== */
	const [drafts, setDrafts] = useState<Record<string, string>>({});
	const keyFor = (entryId: string, day: number) => `${entryId}:${day}`;

	const [popupCell, setPopupCell] = useState<{
		entryId: string;
		dayIdx: number;
	} | null>(null);
	const [popupComment, setPopupComment] = useState<string>("");
	const popupRef = useRef<HTMLDivElement | null>(null);

	const openPopup = (entryId: string, dayIdx: number) => {
		const ex = entries.find((x) => x.id === entryId);
		setPopupCell({ entryId, dayIdx });
		setPopupComment(ex?.comments?.[dayIdx] ?? "");
	};

	const [holidayConfirm, setHolidayConfirm] = useState<{
		open: boolean;
		entryId: string | null;
		dayIdx: number | null;
		date: Date | null;
		hours: number | null;
		comment: string | null;
		applyFromPopup: boolean;
		isNonWorking: boolean;
		isOver8: boolean;
	}>({
		open: false,
		entryId: null,
		dayIdx: null,
		date: null,
		hours: null,
		comment: null,
		applyFromPopup: false,
		isNonWorking: false,
		isOver8: false,
	});

	const [maxHourAlert, setMaxHourAlert] = useState<{
		open: boolean;
		entryId: string | null;
		dayIdx: number | null;
		date: Date | null;
	}>({
		open: false,
		entryId: null,
		dayIdx: null,
		date: null,
	});

	const requestHolidayConfirm = (
		entryId: string,
		dayIdx: number,
		newHours: number,
		newComment: string | null,
		fromPopup: boolean
	) => {
		const date = days[dayIdx];
		// const isHol = holidayByDay[dayIdx];
		// const wknd = isWeekend(date);
		const isNonWorking = holidayByDay[dayIdx] || isWeekend(days[dayIdx]);

		const isOver8 = newHours > 8;

		setHolidayConfirm({
			open: true,
			entryId,
			dayIdx,
			date,
			hours: newHours,
			comment: newComment,
			applyFromPopup: fromPopup,
			isNonWorking,
			isOver8,
		});
	};

	const onFocusCell = (e: any) => {
		const rect = e.target.getBoundingClientRect();
		const spaceRight = window.innerWidth - rect.right;
		setAlignRight(spaceRight < 320);
	};

	const applyHolidayChange = () => {
		const { entryId, dayIdx, hours, comment } = holidayConfirm;
		if (entryId == null || dayIdx == null || hours == null) {
			setHolidayConfirm((prev) => ({ ...prev, open: false }));
			return;
		}

		setEntries((prev) =>
			prev.map((e) => {
				if (e.id !== entryId) return e;
				const hoursArr = [...e.hours];
				const commentsArr = [...e.comments];
				hoursArr[dayIdx] = hours;
				if (comment !== null) commentsArr[dayIdx] = comment.trim();
				return { ...e, hours: hoursArr, comments: commentsArr };
			})
		);

		const k = keyFor(entryId, dayIdx);
		setDrafts((prev) => {
			const { [k]: _omit, ...rest } = prev;
			return rest;
		});

		setHolidayConfirm({
			open: false,
			entryId: null,
			dayIdx: null,
			date: null,
			hours: null,
			comment: null,
			applyFromPopup: false,
			isNonWorking: false,
			isOver8: false,
		});
		setPopupCell(null);

	};

	const cancelHolidayChange = () => {
		const { entryId, dayIdx } = holidayConfirm;
		if (entryId != null && dayIdx != null) {
			const k = keyFor(entryId, dayIdx);
			setDrafts((prev) => {
				const { [k]: _omit, ...rest } = prev;
				return rest;
			});
		}
		setHolidayConfirm({
			open: false,
			entryId: null,
			dayIdx: null,
			date: null,
			hours: null,
			comment: null,
			applyFromPopup: false,
			isNonWorking: false,
			isOver8: false,
		});
	};

	const savePopup = () => {
		if (!popupCell) return;
		const { entryId, dayIdx } = popupCell;
		const k = keyFor(entryId, dayIdx);
		const ex = entries.find((x) => x.id === entryId)!;
		const prevHours = ex.hours[dayIdx] || 0;

		const draftVal = (drafts[k] ?? "").trim();
		const parsedHours = draftVal.length ? parseToHours(draftVal) : prevHours;
		const nextComment = (popupComment || "").trim();

		if (parsedHours > 24) {
			setMaxHourAlert({
				open: true,
				entryId,
				dayIdx,
				date: days[dayIdx],
			});
			return;
		}

		// const d = days[dayIdx];
		// const isHol = holidayByDay[dayIdx];
		// const wknd = isWeekend(d);
		const isNonWorking = holidayByDay[dayIdx] || isWeekend(days[dayIdx]);

		const isOver8 = parsedHours > 8;

		if ((isNonWorking || isOver8) && parsedHours > 0) {
			requestHolidayConfirm(entryId, dayIdx, parsedHours, nextComment, true);
			return;
		}

		setEntries((prev) =>
			prev.map((e) => {
				if (e.id !== entryId) return e;
				const hours = [...e.hours];
				const comments = [...e.comments];
				if (draftVal.length) hours[dayIdx] = parsedHours;
				comments[dayIdx] = nextComment;
				return { ...e, hours, comments };
			})
		);


		setDrafts(({ [k]: _omit, ...rest }) => rest);
	};

	const closePopup = () => {
		setPopupCell(null);
		setPopupComment("");
	};

	useEffect(() => {
		if (!popupCell) return;
		const onDown = (e: MouseEvent) => {
			const el = popupRef.current;
			if (el && el.contains(e.target as Node)) return;
			savePopup();
			closePopup();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				savePopup();
				closePopup();
			}
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [popupCell, popupComment, drafts]);

	/* ===== API: fetch timesheet ===== */
	useEffect(() => {
		fetchTimesheet("");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		periodStart,
		freq,
		periodStartOverride,
		periodEndOverride,
		timesheetCode,
		id
	]);

	const fetchTimesheet = async (type: any) => {
		setLoading(true);
		try {
			const effectiveTimesheetCode =
				timesheetCode || (typeof id === "string" ? id : "");

			if (!effectiveTimesheetCode) {
				setLoading(false);
				return;
			}

			const payload: any = { timesheet_code: effectiveTimesheetCode, action: id ? 'review' : 'view' };
			if (type === "Recall") {
				payload.recall = true;
			}

			// const response = await Apiservice.getMethod(
			// 	API_ENDPOINTS.GET_TIMESHEET_USER + `?timesheet_code=${effectiveTimesheetCode}`
			// );

			const response = await Apiservice.getMethodParams(API_ENDPOINTS.GET_TIMESHEET_USER, payload)

			const apiRaw: any | null = response?.data?.data ?? null;

			if (!apiRaw) {
				setDays([]);
				setEntries([]);
				setHistory([]);
				setHolidayByDay([]);
				setTimesheetStatus(null);
				setApiStartDate("");
				setApiEndDate("");
				return;
			}
			const adapted: any = adaptNewApiToLegacy(apiRaw);

			setTimesheetId(adapted.timesheetId ?? null);
			setApiStartDate(apiRaw.week_start);
			setApiEndDate(apiRaw.week_end);
			setPrevTimesheetId(apiRaw.previous_timesheet_code);
			setNextTimesheetId(apiRaw.next_timesheet_code);
			setTimesheetStatus(adapted.status ?? null);
			const history = (apiRaw.history || []).map((item: any) => ({
				id: uid(),
				status: item.new_status,
				by: item.user,
				at: item.date,
				comment: null,
				project: item.project_name,
				prevStatus: item.old_status,
				newStatus: item.new_status,
				changeType: "StatusUpdate",
			}))
			setHistory(history);

			setagencyName(apiRaw?.agencyName);
			setCandidatename(apiRaw?.candidateName || "");

			const mapped = mapApiDataToState(adapted);
			setDays(mapped.days);
			setEntries(mapped.entries);
			setHolidayByDay(mapped.holidayByDay);
		} catch (err: unknown) {

			setDays([]);
			setEntries([]);
			setHistory([]);
			setHolidayByDay([]);
		} finally {
			setLoading(false);
		}
	};

	const STATUS_COLORS: Record<string, string> = {
		new: "#002e71",
		"pending approval": "#FB8C00",
		pending: "#FB8C00",
		approved: "#34ac51",
		rejected: "#C62828",
		default: "#7F7F7F",
	};

	const getStatusColor = (status?: string) => {
		if (!status) return STATUS_COLORS.default;
		const key = status.toLowerCase();
		if (key === "new") return STATUS_COLORS.new;
		if (key.includes("pending")) return STATUS_COLORS.pending;
		if (key.includes("approved")) return STATUS_COLORS.approved;
		if (key.includes("rejected") || key.includes("reject"))
			return STATUS_COLORS.rejected;
		if (STATUS_COLORS[key]) return STATUS_COLORS[key];
		return STATUS_COLORS.default;
	};

	const formatDateForApi = (d: Date) => {
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		const yyyy = d.getFullYear();
		return `${yyyy}-${mm}-${dd}`;
	};



	const buildFullUpdatePayload = (status: any) => {
		return {
			timesheets: entries.map((e) => ({
				timesheet_entry_code: e.timesheet_entry_code,
				comment: "",
				time_records: days.map((d, idx) => ({
					date: formatDateForApi(d),
					hours: Number(e.hours[idx] || 0),
					note: (e.comments?.[idx] || "").slice(0, 250),
				})),
			})),
			action: status,
			timesheet_code: timesheetCode
		};
	};



	const periodTotal = useMemo(
		() =>
			entries.reduce(
				(s, e) => s + e.hours.reduce((ss: any, n: any) => ss + (n || 0), 0),
				0
			),
		[entries]
	);

	const validateTimesheet = (mode: "save" | "submit"): boolean => {
		if (!days.length) {
			toast.error("No timesheet period loaded.");
			return false;
		}

		let hasPositive = false;

		for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
			let dayTotal = 0;

			for (const e of entries) {
				const h = e.hours[dayIdx] ?? 0;

				if (h < 0) {
					toast.error(
						`Negative hours are not allowed on ${formatDateMDYLocal(
							days[dayIdx]
						)}.`
					);
					return false;
				}

				if (h > 24) {
					toast.error(
						`Total hours for ${formatDateMDYLocal(
							days[dayIdx]
						)} cannot exceed 24 hours.`
					);
					return false;
				}

				if (Number.isNaN(h)) {
					toast.error(
						`Hours must be numeric on ${formatDateMDYLocal(days[dayIdx])}.`
					);
					return false;
				}

				if (h > 0) hasPositive = true;

				dayTotal += h;
			}

			if (dayTotal > 24) {
				toast.error(
					`Combined hours for ${formatDateMDYLocal(
						days[dayIdx]
					)} exceed 24 hours.`
				);
				return false;
			}
		}

		for (const e of entries) {
			for (const c of e.comments) {
				if ((c || "").length > 250) {
					toast.error("Comments cannot exceed 250 characters.");
					return false;
				}
			}
		}

		if (mode === "submit") {
			if (!hasPositive || periodTotal <= 0) {
				toast.error(
					"You must enter at least one non-zero hour before submitting."
				);
				return false;
			}
		}

		return true;
	};

	const copyTimesheet = async () => {
		setPageLoading(true);

		const canEditStatus =
			!timesheetStatus ||
			timesheetStatus === "Draft" ||
			timesheetStatus === "New";

		if (id || !canEditStatus) return;

		try {
			setSaving(true);

			const res = await Apiservice.postMethod(
				API_ENDPOINTS.TIMESHEET_COPY, { "timesheet_code": timesheetCode }

			);
			toast.success(res.data.message);
			fetchTimesheet("");
		}
		catch (err: unknown) {
		} finally {

			setPageLoading(false);
			setSaving(false);
		}
	}



	const savePeriod = async () => {
		setPageLoading(true);
		const isRejectedStatus = timesheetStatus === "Rejected" ||
			timesheetStatus === "Partially Rejected";
		const canEditStatus =
			!timesheetStatus ||
			timesheetStatus === "Draft" ||
			timesheetStatus === "New" ||
			isRejectedStatus;

		if (id || !canEditStatus) return;
		if (!validateTimesheet("save")) return;

		try {
			setSaving(true);

			const payload = buildFullUpdatePayload('save');

			const res = await Apiservice.putMethod(
				API_ENDPOINTS.TIMESHEET_UPDATE,
				payload
			);

			if (res?.data?.status === "success") {
				setTimesheetStatus("Draft");
				// toast.success(res.data.message || "Timesheet updated successfully");
				onReloadPeriods?.();
				fetchTimesheet("");
			} else {
				toast.error("Failed to update timesheet.");
			}
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				toast.error(
					err.response?.data?.message || "Error while updating timesheet."
				);
			} else {
				toast.error("Unexpected error while updating timesheet.");
			}
		} finally {
			setPageLoading(false);
			setSaving(false);
		}
	};



	const Recall = async () => {
		const effectiveTimesheetCode =
			timesheetCode || (typeof id === "string" ? id : "");

		if (!effectiveTimesheetCode) {
			toast.error("Missing timesheet code");
			return;
		}

		const firstEntry = entries.find(e => e.timesheet_entry_code);
		if (!firstEntry) {
			toast.error("No timesheet entries found");
			return;
		}

		const payload = {
			timesheet_code: effectiveTimesheetCode,
			timesheet_entry_code: "",
			action: "cancel",
			comment: ""
		};

		try {
			const res = await Apiservice.postMethod(
				API_ENDPOINTS.TIMESHEET_REVIEW,
				payload
			);

			if (res?.data?.status === "success") {
				toast.success(res.data.message || "Timesheet recalled successfully");
				fetchTimesheet(""); // ✅ NOW it will run
			} else {
				toast.error(res?.data?.message || "Recall failed");
			}
		} catch (error) {
			toast.error("Failed to recall timesheet");
			console.error(error);
		}
	};



	const submitPeriod = async () => {
		const isRejectedStatus = timesheetStatus === "Rejected" ||
			timesheetStatus === "Partially Rejected";
		const canEditStatus =
			!timesheetStatus ||
			timesheetStatus === "Draft" ||
			timesheetStatus === "New" ||
			isRejectedStatus;

		if (id || !canEditStatus) return;
		if (!validateTimesheet("submit")) return;

		try {
			setSubmitting(true);

			const payload = buildFullUpdatePayload('submit');

			const res = await Apiservice.putMethod(
				API_ENDPOINTS.TIMESHEET_UPDATE,
				payload
			);

			if (res?.data?.status === "success") {
				setTimesheetStatus("Draft");
				// toast.success(res.data.message || "Timesheet updated successfully");
				onReloadPeriods?.();
				fetchTimesheet("");
			} else {
				toast.error("Failed to update timesheet.");
			}
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				toast.error(
					err.response?.data?.message || "Error while updating timesheet."
				);
			} else {
				toast.error("Unexpected error while updating timesheet.");
			}
		} finally {
			setSubmitting(false);
			setSaving(false);
		}
	};


	const navigate = useNavigate();

	// const updateTimesheetCell = async (
	// 	entry: any,
	// 	dayIdx: number
	// ) => {
	// 	try {
	// 		const payload = {
	// 			timesheets: [
	// 				{
	// 					timesheet_entry_code: entry.timesheet_entry_code,
	// 					comment: "",
	// 					time_records: [
	// 						{
	// 							date: formatDateMDY(days[dayIdx]),
	// 							hours: entry.hours[dayIdx] || 0,
	// 							note: (entry.comments?.[dayIdx] || "").trim(),
	// 						},
	// 					],
	// 				},
	// 			],
	// 		};

	// 		await Apiservice.putMethod(API_ENDPOINTS.TIMESHEET_UPDATE, payload);
	// 	} catch (e) {
	// 		toast.error("Failed to update hours");
	// 	}
	// };


	const prevPeriod = () => {
		if (!prevTimesheetId) return;
		navigate(`/timesheets/${prevTimesheetId}`, {
			state: {
				timesheetId: prevTimesheetId,
				title: prevTimesheetId,
				status: candidateName,
				replaceTab: true,
			},
		});
	};

	const nextPeriod = () => {
		if (!nextTimesheetId) return;
		navigate(`/timesheets/${nextTimesheetId}`, {
			state: {
				timesheetId: nextTimesheetId,
				title: nextTimesheetId,
				status: candidateName,
				replaceTab: true,
			},
		});
	};

	const isRejected =
		timesheetStatus === "Rejected" ||
		timesheetStatus === "Partially Rejected";

	const editable =
		(!timesheetStatus ||
			timesheetStatus === "Draft" ||
			timesheetStatus === "New" ||
			isRejected);

	const isWorkingDay = (d: Date, idx: number) =>
		!isWeekend(d) && !holidayByDay[idx];

	const hasEnabledEntryForDay = (dayIdx: number) =>
		entries.some((e) => e.enabled?.[dayIdx] !== false);

	const requiredDayIdxs = useMemo(
		() =>
			days
				.map((d, i) =>
					isWorkingDay(d, i) && hasEnabledEntryForDay(i) ? i : -1
				)
				.filter((i) => i >= 0),
		[days, holidayByDay, entries]
	);

	const colTotal = (dayIdx: number) =>
		entries.reduce((sum, e) => {
			if (e.enabled?.[dayIdx] === false) return sum;
			return sum + (e.hours[dayIdx] || 0);
		}, 0);

	const emptyRequiredDays = useMemo(
		() => requiredDayIdxs.filter((i) => colTotal(i) <= 0),
		[requiredDayIdxs, entries]
	);

	const hasNonZeroHours = periodTotal > 0;
	const canSubmit = emptyRequiredDays.length === 0 && hasNonZeroHours;

	const rowTotal = (e: any) =>
		e.hours.reduce((s: any, n: any) => s + (n || 0), 0);

	// const formatDateTimeMDY = (d: string) => {
	// 	const [dd, mm, yyyy] = d.split("/");
	// 	const date = new Date(+yyyy, +mm - 1, +dd);
	// 	return `${formatDateMDYLocal(date)}`;
	// };


	// const onApproveConfirm = () => {
	// 	apicall_approveReject(timesheetCode || id, "Approved", "");
	// };

	const handleConfirmReject = async () => {
		if (!selectedEntryCode) {
			toast.error("Missing timesheet entry code");
			return;
		}

		setRejecting(true);
		apicall_approveReject(
			selectedEntryCode, // ✅ correct entry code
			"Reject",
			rejectReason
		);
	};


	const apicall_approveReject = async (
		timesheetEntryCode: string,
		action: any,
		rejectReason: string
	) => {
		const effectiveTimesheetCode =
			timesheetCode || (typeof id === "string" ? id : "");

		if (!effectiveTimesheetCode) {
			toast.error("Missing timesheet code");
			return;
		}

		if (!timesheetEntryCode) {
			toast.error("Missing timesheet entry code");
			return;
		}

		const payload = {
			timesheet_code: effectiveTimesheetCode,
			timesheet_entry_code: timesheetEntryCode,
			action: action.toLowerCase(), // approved | rejected
			comment: rejectReason || "",
		};

		try {
			setLoading(true);

			const res = await Apiservice.postMethod(
				API_ENDPOINTS.TIMESHEET_REVIEW,
				payload
			);

			if (res?.data?.status === "success") {
				toast.success(res.data.message);
				fetchTimesheet("");
			}
		} catch (error) {
			console.error(error);
			toast.error("Failed to update timesheet");
		} finally {
			setLoading(false);
			setRejecting(false);
			setShowRejectModal(false);
			setRejectReason("");
		}
	};


	// const downloadTimesheet = async () => {
	// 	try {
	// 		setLoading(true);

	// 		const identifier = timesheetCode || id;
	// 		if (!identifier) {
	// 			setLoading(false);
	// 			toast.error("Missing timesheet identifier");
	// 			return;
	// 		}

	// 		const url = API_ENDPOINTS.EXPORT_TIMESHEET + "/" + identifier + "/export";

	// 		const response = await Apiservice.getMethod(url);

	// 		setLoading(false);
	// 		if (response?.data?.status !== "success") {
	// 			toast.error("Download failed");
	// 			return;
	// 		}

	// 		const base64 = response.data.file;
	// 		const filename = response.data.filename;

	// 		const byteCharacters = atob(base64);
	// 		const byteNumbers = [...byteCharacters].map((c) =>
	// 			c.charCodeAt(0)
	// 		);
	// 		const byteArray = new Uint8Array(byteNumbers);
	// 		const blob = new Blob([byteArray], {
	// 			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	// 		});

	// 		const link = document.createElement("a");
	// 		link.href = URL.createObjectURL(blob);
	// 		link.download = filename;
	// 		link.click();
	// 	} catch (error) {
	// 		setLoading(false);
	// 		toast.error("Download failed");
	// 	}
	// };

	/* ===== Project & Task API helpers ===== */
	const fetchProjects = async () => {
		try {
			setProjectLoading(true);
			// GET /user/projects  (user_code usually from token/server-side)
			const res = await Apiservice.getMethod("/user/projects");
			const rawList: any[] = res?.data?.data || res?.data || [];

			const mapped: ProjectOption[] = rawList
				.map((p: any) => ({
					id:
						p.project_code ||
						p.code ||
						p.id ||
						p.projectCode ||
						"",
					name:
						p.project_name ||
						p.name ||
						p.title ||
						p.projectName ||
						"",
				}))
				.filter((p: ProjectOption) => p.id && p.name);

			setProjectList(mapped);
		} catch (err) {
			console.error("Error fetching projects", err);
			toast.error("Unable to load projects");
		} finally {
			setProjectLoading(false);
		}
	};

	const fetchTasksForProject = async (projectCode: string) => {
		if (!projectCode) {
			setTaskList([]);
			return;
		}
		try {
			setTaskLoading(true);
			// GET /project/task/search?project_code=...
			const url = `/project/task/search?project_code=${encodeURIComponent(
				projectCode
			)}`;
			const res = await Apiservice.getMethod(url);
			const rawList: any[] = res?.data?.data || res?.data || [];

			const mapped: TaskOption[] = rawList
				.map((t: any) => ({
					id:
						t.task_code ||
						t.code ||
						t.id ||
						t.taskCode ||
						"",
					name:
						t.task_name ||
						t.name ||
						t.title ||
						t.taskName ||
						"",
				}))
				.filter((t: TaskOption) => t.id && t.name);

			setTaskList(mapped);
		} catch (err) {
			console.error("Error fetching tasks", err);
			toast.error("Unable to load tasks");
		} finally {
			setTaskLoading(false);
		}
	};

	const handleOpenAddEntry = async () => {

		setSelectedProjectId("");
		setSelectedTaskId("");
		setAddEntryError("");
		setTaskList([]);

		// if (!projectList.length) {
		await fetchProjects();
		// }

		setShowAddEntryModal(true);
	};

	const handleProjectChange = async (value: string) => {
		setSelectedProjectId(value);
		setSelectedTaskId("");
		setAddEntryError("");
		setTaskList([]);
		if (value) {
			await fetchTasksForProject(value);
		}
	};

	const handleTaskChange = (value: string) => {
		setSelectedTaskId(value);
		setAddEntryError("");
	};

	const handleConfirmAddEntry = async () => {
		if (!selectedProjectId) {
			setAddEntryError("Please select a project.");
			return;
		}
		if (!selectedTaskId) {
			setAddEntryError("Please select a task.");
			return;
		}

		const proj = projectList.find((p) => p.id === selectedProjectId);
		const task = taskList.find((t) => t.id === selectedTaskId);

		if (!proj || !task) {
			setAddEntryError("Invalid project/task selection.");
			return;
		}

		// figure out which timesheet_code to send (same logic as fetchTimesheet)
		const effectiveTimesheetCode =
			timesheetCode || (typeof id === "string" ? id : "");

		if (!effectiveTimesheetCode) {
			setAddEntryError("Missing timesheet code.");
			return;
		}

		try {
			setAddEntryError("");

			// 🔹 Call /timesheet/create
			const payload = {
				timesheet_code: effectiveTimesheetCode,
				project_code: selectedProjectId,
				task_code: selectedTaskId,
			};

			const res = await Apiservice.postMethod("/timesheet/create-entry", payload);

			if (res?.data?.status === "success") {
				toast.success(res.data.message || "Entry added successfully");

				// close modal
				setShowAddEntryModal(false);

				// reload timesheet rows from API
				await fetchTimesheet("");
			} else {
				setAddEntryError(
					res?.data?.message || "Failed to add entry. Please try again."
				);
			}
		} catch (err) {
			console.error("Error creating timesheet entry", err);
			setAddEntryError("Something went wrong while adding entry.");
		}
	};

	const handleDeleteEntry = async (timesheetEntryCode: any) => {
		if (!timesheetEntryCode) {
			toast.error("Missing timesheet entry code.");
			return;
		}

		try {
			setLoading(true);

			const res = await Apiservice.deleteMethod(
				"/timesheet/delete-entry" + `?timesheet_entry_code=${timesheetEntryCode}`
			);

			if (res?.data?.status === "success") {
				toast.success(res.data.message || "Entry deleted successfully.");
				await fetchTimesheet(""); // reload grid
			} else {
				toast.error(
					res?.data?.message || "Failed to delete entry. Please try again."
				);
			}
		} catch (err) {
			console.error("Error deleting timesheet entry", err);
			toast.error("Unable to delete entry.");
		} finally {
			setLoading(false);
		}
	};


	/* ===== UI ===== */
	return (
		<div className={styles.wrap}>
			{!periodStartOverride && (
				<div className={styles.header}>
					<div>
						<h1 className={styles.h1}>{candidateName}</h1>
					</div>
				</div>
			)}

			<div className={styles.topbar}>
				<div className={styles.leftControls}>
					{id && (
						<button
							type="button"
							className={styles.iconBtn}
							onClick={prevPeriod}
							aria-label="Previous period"
							disabled={!prevTimesheetId}
						>
							◀
						</button>
					)}
					<div className={styles.range}>
						{periodStartOverride && periodEndOverride
							? `${periodStartOverride} - ${periodEndOverride}`
							: `${apiStartDate} - ${apiEndDate}`}
					</div>
					{id && (
						<button
							type="button"
							className={styles.iconBtn}
							onClick={nextPeriod}
							aria-label="Next period"
							disabled={!nextTimesheetId}
						>
							▶
						</button>
					)}
					<span
						style={{
							fontWeight: "500",
							color: getStatusColor(timesheetStatus),
						}}
					>
						{timesheetStatus}
					</span>

					{(role === "vendor" || role === "msp") && (
						<span
							style={{
								fontWeight: "500",
								color: "#0b1324",
							}}
						>
							{agencyName}
						</span>
					)}
				</div>

				<div className={styles.rightControls}>
					{!id && editable && (
						<Button
							label={"Copy from last week"}
							type="button"
							variant="secondary"
							onClick={() => copyTimesheet()}
							disabled={saving || !editable}
						/>
					)}
					{!id && editable && (
						<Button
							// variant="secondary"
							type="button"
							label={projectLoading ? "Loading…" : "Add Entry"}
							onClick={handleOpenAddEntry}
						/>
					)}
					{/* {timesheetStatus === "Approved" && (
						<FiDownload
							style={{
								fontSize: "20px",
								fontWeight: "600",
								cursor: "pointer",
								marginLeft: "12px",
							}}
							onClick={downloadTimesheet}
						/>
					)} */}
				</div>
			</div>

			{loading ? (
				<CustomSkeleton height={150} />
			) : (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<colgroup>
							<col className={styles.firstColWidth} />
							{days.map((_, i) => (
								<col key={i} className={styles.midCol} />
							))}
							<col className={styles.lastColWidth} />
						</colgroup>

						<thead>
							<tr>
								<th className={`${styles.th} ${styles.firstCol}`}>
									Project <br />
									(Task)
								</th>

								{days.map((d, i) => {
									const p = buildHeaderParts(d);
									const wknd = isWeekend(d);
									const isHol = holidayByDay[i];

									const headClass = [
										styles.th,
										styles.dayHead,
										wknd ? styles.weekendHead : "",
										isHol ? styles.holidayHead : "",
									].join(" ");

									const formattedDate = `${pad2(
										d.getMonth() + 1
									)}/${pad2(d.getDate())}`;

									return (
										<th
											key={i}
											className={headClass}
											title={isHol ? "Holiday" : wknd ? "Weekend" : undefined}
										>
											<div className={styles.headTop}>{formattedDate}</div>
											<div className={styles.headBottom}>{p.bottom}</div>
										</th>
									);
								})}

								<th
									className={`${styles.th} ${styles.totalHead} ${styles.lastCol}`}
								>
									TOTAL
									<br />
									HRS
								</th>
								{entries.some(e => e.can_approve === true) && (
									<th className={`${styles.th} `} style={{ width: '80px', textAlign: 'center' }}>
										Actions
									</th>
								)}
							</tr>
						</thead>

						<tbody>
							{entries.length === 0 ? (
								<tr>
									<td
										className={styles.td}
										colSpan={days.length + 2}
										style={{ textAlign: "center", padding: "24px 0" }}
									>
										No entries yet.
									</td>
								</tr>
							) : (
								entries.map((e) => (
									<tr key={e.id} className={styles.row}>
										<td className={`${styles.td} ${styles.firstCol}`}>
											<div className={styles.projTaskCell}>
												<div className={styles.names} style={{ minWidth: 0, width: '100%' }}>
													<div
														className={styles.projectTitle}
														style={{
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
															display: 'flex',
															alignItems: 'center',
															justifyContent: 'space-between'
														}}
													>
														<Tooltip title={e.costCenterName} arrow>
															<span key={e.costCenterName}>
																{e.costCenterName}
															</span>
														</Tooltip>
														{e.can_delete && (<button
															type="button"
															className={styles.iconBtn} // or define a small delete btn class
															style={{ marginLeft: "8px" }}
															onClick={() => handleDeleteEntry(e.timesheet_entry_code)}
															title="Delete entry"
														>
															<LuTrash2 />
														</button>)}
													</div>

													<div
														className={styles.taskTitle}
														style={{
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														<Tooltip title={e.chargeCodeName} arrow>
															<span key={e.chargeCodeName}>
																{e.chargeCodeName}
															</span>
														</Tooltip>
													</div>

												</div>
											</div>
										</td>

										{days.map((d, i) => {
											const key = keyFor(e.id, i);
											const isHol = holidayByDay[i];
											const wknd = isWeekend(d);
											const h = e.hours[i] || 0;
											const existingComment = (e.comments?.[i] || "").trim();
											const focused =
												popupCell?.entryId === e.id &&
												popupCell?.dayIdx === i;
											const display =
												key in drafts ? drafts[key] : h ? formatHours(h) : "";

											const commit = (valStr: any) => {
												const val = parseToHours(valStr);
												setEntries((prev) =>
													prev.map((x) =>
														x.id !== e.id
															? x
															: {
																...x,
																hours: Object.assign([], x.hours, {
																	[i]: val,
																}),
															}
													)
												);
												setDrafts(({ [key]: _o, ...rest }) => rest);
											};

											return (
												<td
													key={i}
													className={[
														styles.td,
														wknd ? styles.weekendCell : "",
														isHol ? styles.holidayCell : "",
													].join(" ")}
													title={
														isHol ? "Holiday" : wknd ? "Weekend" : undefined
													}
													style={{ position: "relative" }}
												>
													<div className={styles.cellStack}>
														<input
															type="text"
															className={styles.hourInput}
															value={display}
															placeholder="0:00"
															disabled={e.enabled?.[i] === false}
															onClick={onFocusCell}
															onFocus={() =>
																e.enabled?.[i] === true && openPopup(e.id, i)
															}
															onChange={(ev) =>
																e.enabled?.[i] === true &&
																setDrafts((d2) => ({
																	...d2,
																	[key]: ev.target.value,
																}))
															}
															onBlur={(ev) => {
																if (e.enabled?.[i] === false || focused)
																	return;
																const val = parseToHours(ev.target.value);

																if (val > 24) {
																	setMaxHourAlert({
																		open: true,
																		entryId: e.id,
																		dayIdx: i,
																		date: d,
																	});
																	return;
																}

																const isNonWorking = holidayByDay[i] || isWeekend(days[i]);

																const isOver8 = val > 8;

																if ((isNonWorking || isOver8) && val > 0) {
																	requestHolidayConfirm(
																		e.id,
																		i,
																		val,
																		null,
																		false
																	);
																} else {
																	commit(ev.target.value);
																}
															}}
														/>

														{focused && (
															<div
																className={`${styles.inlineCommentOnly} ${alignRight
																	? styles.inlineCommentRight
																	: ""
																	}`}
																ref={popupRef}
															>
																<textarea
																	className={styles.inlineCommentInput}
																	rows={1}
																	value={popupComment}
																	placeholder="Add comment (optional)"
																	onChange={(e2) =>
																		setPopupComment(e2.target.value)
																	}
																	onKeyDown={(e2) => {
																		if (
																			(e2.ctrlKey || e2.metaKey) &&
																			e2.key === "Enter"
																		) {
																			e2.preventDefault();
																			savePopup();
																			closePopup();
																		}
																	}}
																	onBlur={() => {
																		savePopup();
																		closePopup();
																	}}
																/>
															</div>
														)}
													</div>

													{!!existingComment && (
														<span
															className={styles.holChip}
															title={existingComment}
														>
															<BiCommentDetail />
														</span>
													)}
												</td>
											);
										})}

										<td
											className={`${styles.td} ${styles.totalCell} ${styles.lastCol}`}
										>
											{rowTotal(e).toFixed(2)}
										</td>
										{e.can_approve && (
											<td className={`${styles.td} ${styles.lastCol}`}>
												<div style={{ display: "flex", gap: 8, justifyContent: 'center' }}>
													<Button
														variant="success"
														// size="small"
														onClick={() =>
															apicall_approveReject(
																e.timesheet_entry_code,
																"Approve",
																""
															)
														}
														style={{ padding: '5px 10px', fontSize: 13, fontWeight: 600 }}
													>
														Approve
													</Button>

													<Button
														variant="danger"
														// size="small"
														onClick={() => {
															setSelectedEntryCode(e.timesheet_entry_code);
															setShowRejectModal(true);
															setRejectReason("");
														}}
														style={{ padding: '5px 10px', fontSize: 13, fontWeight: 600 }}
													>
														Reject
													</Button>
												</div>
											</td>
										)}

									</tr>
								))
							)}
						</tbody>

						<tfoot>
							<tr>
								<td className={`${styles.td} ${styles.firstCol}`}>
									<strong style={{ fontSize: 14 }}>
										Total hours/
										<br />
										day
									</strong>
								</td>

								{days.map((_, i) => (
									<td key={i} className={`${styles.td} ${styles.totalCol}`}>
										{formatHours(
											clamp(
												entries.reduce(
													(s, e) => s + (e.hours[i] || 0),
													0
												),
												0,
												24
											)
										)}
									</td>
								))}

								<td
									className={`${styles.td} ${styles.totalCell} ${styles.lastCol}`}
								>
									<strong>{periodTotal.toFixed(2)}</strong>
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			)}

			<div className={styles.footerBar}>
				<div className={styles.footerActions}>
					{!id && editable && entries[0]?.costCenterName ? (
						<>

							<Button
								label={
									saving
										? "Saving…"
										: isRejected
											? "Save changes"
											: "Save"
								}
								variant="secondary"
								type="button"
								onClick={() => savePeriod()}
								disabled={saving || !editable}
							/>
							<Button
								label={
									submitting
										? isRejected
											? "Resubmitting…"
											: "Submitting…"
										: isRejected
											? "Resubmit"
											: "Submit"
								}
								variant="primary"
								onClick={submitPeriod}
								disabled={submitting || !canSubmit || !editable}
								type="button"
							/>
						</>
					) : !id && timesheetStatus === "Pending Approval" ? (
						<Button
							label="Recall"
							variant="primary"
							type="button"
							onClick={Recall}
						/>
					) : null}
				</div>
			</div>

			<div className={styles.summaryWrap}>
				<div className={styles.summaryCol}>
					<h3 className={styles.h3}>Entries</h3>
					{(() => {
						if (!entries.length)
							return (
								<div className={styles.empty}>No day entries yet.</div>
							);
						const dayRows = days
							.map((d, idx) => {
								const perEntry = entries
									.map((e) => {
										const hrs = e.hours[idx] || 0;
										if (hrs <= 0) return null;
										return {
											cc: e.costCenterName,
											code: e.chargeCodeName,
											minutes: Math.round(hrs * 60),
											comment: (e.comments?.[idx] || "").trim(),
										};
									})
									.filter(Boolean) as {
										cc: string;
										code: string;
										minutes: number;
										comment: string;
									}[];
								if (!perEntry.length) return null;
								const capped = normalizeDayMinutes(
									perEntry.map((p) => p.minutes),
									24 * 60
								);
								const items = perEntry
									.map((p, i) => ({
										...p,
										minutes: capped[i],
									}))
									.filter((it) => it.minutes > 0);
								const totalMinutes = items.reduce(
									(s, it) => s + it.minutes,
									0
								);

								return {
									key: idx,
									dateLabel: formatDateMDYLocal(d),
									items,
									totalMinutes,
								};
							})
							.filter(Boolean) as Array<{
								key: number;
								dateLabel: string;
								items: {
									cc: string;
									code: string;
									minutes: number;
									comment: string;
								}[];
								totalMinutes: number;
							}>;
						if (!dayRows.length)
							return (
								<div className={styles.empty}>No day entries yet.</div>
							);
						return (
							<div className={styles.boardListWrap}>
								<table
									className={`${styles.boardTable} ${styles.entriesSingleRow}`}
								>
									<thead>
										<tr>
											<th>Date</th>
											<th>Work (Project / Task)</th>
											<th>Total</th>
										</tr>
									</thead>
									<tbody>
										{dayRows.map((r) => (
											<tr key={r.key} className={styles.boardRow}>
												<td className={styles.boardCellWeek}>
													{r.dateLabel}
												</td>
												<td>
													<div className={styles.workList}>
														{r.items.map((it, i) => (
															<div key={i} className={styles.workRow}>
																<div
																	className={styles.workLabel}
																	title={`${it.cc} • ${it.code}`}
																>
																	<span className={styles.workCC}>
																		{it.cc}
																	</span>
																	<span className={styles.workDot}>•</span>
																	<span className={styles.workCode}>
																		{it.code}
																	</span>
																</div>
																<div className={styles.workBadges}>
																	<span className={styles.workHours}>
																		{formatHours(it.minutes / 60)}
																	</span>
																</div>
																{it.comment && (
																	<div className={styles.workComment}>
																		{it.comment}
																	</div>
																)}
															</div>
														))}
													</div>
												</td>
												<td className={styles.singleTotal}>
													<strong>
														{formatHours(r.totalMinutes / 60)}
													</strong>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						);
					})()}
				</div>

				<div className={styles.summaryCol}>
					<h3 className={styles.h3}>Approval History</h3>
					{!history.length && (
						<div className={styles.empty}>No activity yet.</div>
					)}
					{!!history.length && (
						<ul className={styles.timeline}>
							{history.map((ev: any) => (
								<li key={ev.id} className={styles.event}>
									<div className={styles.eventBody}>
										<div className={styles.eventHeader}>
											<strong>
												{ev.status !== "Pending Approval" ? ev.status : "Submitted"}
											</strong>
											• {ev.by}
										</div>
										<div className={styles.eventMeta}>
											{ev.at}

										</div>
									</div>
									{ev.comment && (
										<div className={styles.eventNote}>{ev.comment}</div>
									)}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>

			<Dialog
				open={showRejectModal}
				onClose={() => !rejecting && setShowRejectModal(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 2 } }}
			>
				<DialogContent dividers>
					<TextField
						label="Reason for rejection"
						value={rejectReason}
						onChange={(e) => setRejectReason(e.target.value)}
						fullWidth
						multiline
						minRows={3}
						inputProps={{ maxLength: 500 }}
						helperText={`${rejectReason.trim().length}/500`}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						variant="secondary"
						onClick={() => setShowRejectModal(false)}
						disabled={rejecting}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={handleConfirmReject}
						disabled={rejecting || !rejectReason}
					>
						{rejecting ? "Rejecting..." : "Reject"}
					</Button>
				</DialogActions>
			</Dialog>

			<HolidayConfirmModal
				open={holidayConfirm.open}
				date={holidayConfirm.date}
				isNonWorking={holidayConfirm.isNonWorking}
				isOver8={holidayConfirm.isOver8}
				hours={holidayConfirm.hours}
				comment={holidayConfirm.comment}
				onCancel={cancelHolidayChange}
				onConfirm={applyHolidayChange}
			/>

			<MaxHoursModal
				open={maxHourAlert.open}
				date={maxHourAlert.date}
				onClose={() => {
					if (maxHourAlert.entryId && maxHourAlert.dayIdx !== null) {
						const k = keyFor(maxHourAlert.entryId, maxHourAlert.dayIdx);
						setDrafts((prev) => {
							const { [k]: _omit, ...rest } = prev;
							return rest;
						});
					}
					setMaxHourAlert({
						open: false,
						entryId: null,
						dayIdx: null,
						date: null,
					});
				}}
			/>

			{/* Add Entry Modal */}
			<Dialog
				open={showAddEntryModal}
				onClose={() => !projectLoading && setShowAddEntryModal(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
					},
				}}
			>
				{/* ===== Header ===== */}
				<DialogTitle sx={{ pb: 0 }}>
					<Typography fontSize={18} fontWeight={600}>
						Add Timesheet Entry
					</Typography>
					<Typography fontSize={13} color="text.secondary" style={{ margin: '10px 0' }}>
						Select a project and task to log hours
					</Typography>
				</DialogTitle>

				{/* ===== Content ===== */}
				<DialogContent sx={{ pt: 3 }}>
					<Box display="flex" flexDirection="column" gap={2.5}>
						{/* Project */}
						<Autocomplete
							options={projectList}
							getOptionLabel={(option) => option.name}
							value={projectList.find(p => p.id === selectedProjectId) || null}
							onChange={(_, value) => handleProjectChange(value?.id || "")}
							loading={projectLoading}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Project"
									placeholder="Select project"
									size="small"
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<>
												{projectLoading ? (
													<Typography fontSize={12} mr={1}>
														Loading…
													</Typography>
												) : null}
												{params.InputProps.endAdornment}
											</>
										),
									}}
								/>
							)}
						/>

						{/* Task */}
						<Autocomplete
							options={taskList}
							getOptionLabel={(option) => option.name}
							value={taskList.find(t => t.id === selectedTaskId) || null}
							onChange={(_, value) => handleTaskChange(value?.id || "")}
							disabled={!selectedProjectId}
							loading={taskLoading}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Task"
									placeholder={
										selectedProjectId ? "Select task" : "Select project first"
									}
									size="small"
								/>
							)}
						/>

						{/* Error */}
						{addEntryError && (
							<Typography fontSize={12} color="error">
								{addEntryError}
							</Typography>
						)}
					</Box>
				</DialogContent>

				{/* ===== Actions ===== */}
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						variant="secondary"
						onClick={() => setShowAddEntryModal(false)}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						onClick={handleConfirmAddEntry}
						disabled={!selectedProjectId || !selectedTaskId}
					>
						Add Entry
					</Button>
				</DialogActions>
			</Dialog>

			<CustomLoader open={pageLoading} message="" />

		</div>
	);
}

/* ===== Agency Approve/Reject controls with confirm ===== */
// function AgencyActions({
// 	onApproveConfirm,
// 	onReject,
// 	alertMessage,
// }: {
// 	onApproveConfirm: (note?: string) => void;
// 	onReject: () => void;
// 	alertMessage: any;
// }) {
// 	const [approveOpen, setApproveOpen] = useState(false);
// 	const title = alertMessage;
// 	const message = "";
// 	return (
// 		<>
// 			<Button variant="success" onClick={() => setApproveOpen(true)}>
// 				Approve
// 			</Button>
// 			<Button variant="danger" onClick={onReject}>
// 				Reject
// 			</Button>
// 			<ApproveConfirmModal
// 				open={approveOpen}
// 				title={title}
// 				message={message}
// 				confirmLabel="Approve"
// 				onCancel={() => setApproveOpen(false)}
// 				onConfirm={() => {
// 					setApproveOpen(false);
// 					onApproveConfirm();
// 				}}
// 			/>
// 		</>
// 	);
// }
