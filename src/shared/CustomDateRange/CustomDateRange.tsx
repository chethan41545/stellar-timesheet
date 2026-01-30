// CustomDateRange.tsx (FULL UPDATED - FREE MUI + RANGE HIGHLIGHT)
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CustomDateRange.module.css";

import Tooltip from "@mui/material/Tooltip";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs, { Dayjs } from "dayjs";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import Button from "../Button/Button";
import type { PickerValue } from "@mui/x-date-pickers/internals";

export type DateRangeValue = {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD
};

type Props = {
  name: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;

  value: DateRangeValue;
  onChange: any;

  min?: string; // YYYY-MM-DD
  max?: string; // YYYY-MM-DD

  cancelText?: string;
  applyText?: string;
};

const toYMD = (d: Dayjs | null) => (d ? d.format("YYYY-MM-DD") : null);
const fromYMD = (s: string | null) => (s ? dayjs(s, "YYYY-MM-DD") : null);

const isSameDay = (a: Dayjs, b: Dayjs) => a.isSame(b, "day");

const isBetweenExclusive = (day: Dayjs, start: Dayjs, end: Dayjs) => {
  const s = start.startOf("day");
  const e = end.startOf("day");
  const lo = s.isBefore(e) ? s : e;
  const hi = s.isBefore(e) ? e : s;
  return day.isAfter(lo, "day") && day.isBefore(hi, "day");
};

function clamp(d: Dayjs, min?: Dayjs, max?: Dayjs) {
  if (min && d.isBefore(min, "day")) return min;
  if (max && d.isAfter(max, "day")) return max;
  return d;
}

const CustomDateRange: React.FC<Props> = ({
  name,
  className,
  disabled,
  placeholder = "MM/DD/YYYY - MM/DD/YYYY",
  value,
  onChange,
  min,
  max,
  cancelText = "Cancel",
  applyText = "Apply",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const minD = min ? dayjs(min, "YYYY-MM-DD") : undefined;
  const maxD = max ? dayjs(max, "YYYY-MM-DD") : undefined;

  // Draft range (commit only on Apply)
  const [draftStart, setDraftStart] = useState<Dayjs | null>(fromYMD(value.startDate));
  const [draftEnd, setDraftEnd] = useState<Dayjs | null>(fromYMD(value.endDate));

  // Which field the big calendar should fill
  const [activeField, setActiveField] = useState<"start" | "end">("start");

  // Calendar cursor/value (single value, but we paint range ourselves)
  const [calendarValue, setCalendarValue] = useState<Dayjs>(() => fromYMD(value.startDate) ?? dayjs());

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // sync draft when parent changes
  useEffect(() => {
    const s = fromYMD(value.startDate);
    const e = fromYMD(value.endDate);
    setDraftStart(s);
    setDraftEnd(e);
    setCalendarValue(s ?? dayjs());
    setActiveField("start");
  }, [value.startDate, value.endDate]);

  const triggerText = useMemo(() => {
    if (!value.startDate && !value.endDate) return placeholder;

    const s = value.startDate
      ? dayjs(value.startDate, "YYYY-MM-DD").format("MM/DD/YYYY")
      : "MM/DD/YYYY";

    const e = value.endDate
      ? dayjs(value.endDate, "YYYY-MM-DD").format("MM/DD/YYYY")
      : "MM/DD/YYYY";

    return `${s} - ${e}`;
  }, [value.startDate, value.endDate, placeholder]);


  const tooltipText = useMemo(() => {
    if (!value.startDate && !value.endDate) return "";
    const s = value.startDate ? dayjs(value.startDate).format("MM/DD/YYYY") : "";
    const e = value.endDate ? dayjs(value.endDate).format("MM/DD/YYYY") : "";
    return s && e ? `${s} - ${e}` : triggerText;
  }, [value.startDate, value.endDate, triggerText]);

  const openPanel = () => {
    if (disabled) return;
    setOpen((o) => !o);
  };

  const onCancel = () => {
    setDraftStart(fromYMD(value.startDate));
    setDraftEnd(fromYMD(value.endDate));
    setCalendarValue(fromYMD(value.startDate) ?? dayjs());
    setActiveField("start");
    setOpen(false);
  };

  const onApply = () => {
    let s = draftStart;
    let e = draftEnd;

    if (s) s = clamp(s.startOf("day"), minD, maxD);
    if (e) e = clamp(e.startOf("day"), minD, maxD);

    // normalize order
    if (s && e && s.isAfter(e, "day")) {
      const tmp = s;
      s = e;
      e = tmp;
    }

    onChange({ startDate: toYMD(s), endDate: toYMD(e) });
    setOpen(false);
  };

  // clicking a day in big calendar
  // const onPickFromCalendar = (picked: Dayjs | null) => {
  const onPickFromCalendar = (value: PickerValue) => {

    if (!value) return;
    // const d = clamp(picked.startOf("day"), minD, maxD);
    const picked = dayjs(value); // 🔥 normalize here
    const d = clamp(picked.startOf("day"), minD, maxD);

    setCalendarValue(d);

    if (activeField === "start") {
      setDraftStart(d);
      if (draftEnd && draftEnd.isBefore(d, "day")) setDraftEnd(null);
      setActiveField("end");
      return;
    }

    // end
    if (!draftStart) {
      setDraftStart(d);
      setActiveField("end");
      return;
    }
    setDraftEnd(d);
  };

  // Custom day renderer to paint range highlight
  const CustomDay = (props: any) => {
    const { day, outsideCurrentMonth, ...other } = props;

    const start = draftStart?.startOf("day") ?? null;
    const end = draftEnd?.startOf("day") ?? null;

    const hasBoth = !!start && !!end;
    const isStart = !!start && isSameDay(day, start);
    const isEnd = !!end && isSameDay(day, end);
    const between = hasBoth ? isBetweenExclusive(day, start!, end!) : false;

    // dayjs().day(): 0=Sun ... 6=Sat
    const dow = day.day();
    const isSunday = dow === 0;
    const isSaturday = dow === 6;

    const startEqEnd = hasBoth && isSameDay(start!, end!);

    return (
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        {...other}
        sx={{
          // base hover
          "&:hover": { backgroundColor: "rgba(9,84,213,0.10)" },

          // in-range background strip
          ...(between && {
            backgroundColor: "rgba(9,84,213,0.12)",
            borderRadius: 0,
            "&:hover": { backgroundColor: "rgba(9,84,213,0.16)" },
          }),

          // week boundary rounding for strip
          ...(between && {
            ...(isSunday && { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }),
            ...(isSaturday && { borderTopRightRadius: 999, borderBottomRightRadius: 999 }),
          }),

          // start marker
          ...(isStart && {
            backgroundColor: "#0954D5",
            color: "#fff",
            "&:hover": { backgroundColor: "#0954D5" },
            ...(hasBoth && !startEqEnd
              ? { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }
              : { borderRadius: 999 }),
          }),

          // end marker
          ...(isEnd && {
            backgroundColor: "#0954D5",
            color: "#fff",
            "&:hover": { backgroundColor: "#0954D5" },
            ...(hasBoth && !startEqEnd
              ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 999, borderBottomRightRadius: 999 }
              : { borderRadius: 999 }),
          }),

          // prevent default selected styles from breaking our strip
          "&.Mui-selected": {
            backgroundColor: isStart || isEnd ? "#0954D5" : between ? "rgba(9,84,213,0.12)" : undefined,
            color: isStart || isEnd ? "#fff" : undefined,
          },
        }}
      />
    );
  };

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdownWrapper} ${className || ""}`}
      aria-disabled={disabled ? "true" : "false"}
    >
      {/* Trigger */}
      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        onClick={openPanel}
        aria-haspopup="dialog"
        aria-expanded={open}
        name={name}
      >
        <Tooltip title={tooltipText} arrow placement="top">
          <span className={styles.triggerText}>{triggerText}</span>
        </Tooltip>

        <span className={styles.triggerIcon} aria-hidden>
          <CalendarMonthRoundedIcon fontSize="small" />
        </span>
      </button>

      {open && (
        <div className={`${styles.menu} ${styles.dropdownPanel}`} role="dialog" aria-label="Date range filter">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Inputs Row */}
            <div className={styles.inputsRow}>
              <div className={`${styles.inputWrap} ${activeField === "start" ? styles.activeWrap : ""}`}>
                <DatePicker
                  value={draftStart}
                  onChange={(d) => {
                    // const next = d ? clamp(d.startOf("day"), minD, maxD) : null;
                    const next = d ? clamp(dayjs(d).startOf("day"), minD, maxD) : null;


                    setDraftStart(next);
                    if (next) setCalendarValue(next);
                    setActiveField("start");
                    if (draftEnd && next && draftEnd.isBefore(next, "day")) setDraftEnd(null);
                  }}
                  format="MM/DD/YYYY"
                  minDate={minD}
                  maxDate={draftEnd ?? maxD}
                  slots={{ openPickerIcon: CalendarMonthRoundedIcon as any }}
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "MM/DD/YYYY",
                      onFocus: () => setActiveField("start"),
                      fullWidth: true,
                    } as any,
                  }}
                />
              </div>

              <div className={`${styles.inputWrap} ${activeField === "end" ? styles.activeWrap : ""}`}>
                <DatePicker
                  value={draftEnd}
                  onChange={(d) => {
                    // const next = d ? clamp(d.startOf("day"), minD, maxD) : null;
                    const next = d ? clamp(dayjs(d).startOf("day"), minD, maxD) : null;

                    setDraftEnd(next);
                    if (next) setCalendarValue(next);
                    setActiveField("end");
                    if (draftStart && next && next.isBefore(draftStart, "day")) setDraftStart(null);
                  }}
                  format="MM/DD/YYYY"
                  minDate={draftStart ?? minD}
                  maxDate={maxD}
                  slots={{ openPickerIcon: CalendarMonthRoundedIcon as any }}
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "MM/DD/YYYY",
                      onFocus: () => setActiveField("end"),
                      fullWidth: true,
                    } as any,
                  }}
                />
              </div>
            </div>

            {/* Big Calendar */}
            <div className={styles.calendarWrap}>
              <StaticDatePicker
                value={calendarValue}
                onChange={onPickFromCalendar}
                minDate={minD}
                maxDate={maxD}
                displayStaticWrapperAs="desktop"
                slots={{ day: CustomDay }}
                slotProps={{
                  actionBar: { actions: [] },
                  toolbar: { hidden: true } as any,
                }}
              />
            </div>
          </LocalizationProvider>

          {/* Footer */}
          <div className={styles.footer}>
            <Button
              variant="secondary"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={onApply}
            >
              {applyText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDateRange;
