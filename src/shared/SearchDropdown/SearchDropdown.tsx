// SearchDropdown.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./SearchDropdown.module.css";

import { FormProvider, useForm } from "react-hook-form";
import CheckboxField from "../CheckboxField/CheckboxField"; // <-- adjust path if needed

export type Option = { label: string; value: any };

type CommonProps = {
  name: string;
  options: Option[];
  icon?: React.ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  defaultSelectAll?: boolean;
  allSelectedHeading?: string;
};

/** SINGLE-SELECT props (backward compatible) */
type SingleProps = CommonProps & {
  multiple?: false;
  value: any;
  onChange: (value: any) => void;
  values?: never;
};

/** MULTI-SELECT props (opt-in) */
type MultiProps = CommonProps & {
  multiple: true;
  values: any;
  onChange: (values: any[]) => void;
  value?: never;
};

type Props = SingleProps | MultiProps;

const SearchDropdown: React.FC<Props> = (props) => {
  const {
    name,
    options = [],
    icon,
    className,
    disabled,
    placeholder = "Select options",
    allSelectedHeading = "All Selected"
  } = props;

  const isMulti = !!(props as MultiProps).multiple;

  /** ---------------------- Shared popup state ---------------------- */
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // search term
  const [q, setQ] = useState("");

  // close on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // filtered options (shared)
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(t) || o.value.toLowerCase().includes(t)
    );
  }, [q, options]);

  /** ---------------------- MULTI-SELECT ---------------------- */
  if (isMulti) {
    const { values = [], onChange } = props as MultiProps;

    const fieldName = (val: string) => `${name}__${val}`;
    const ALL_NAME = `${name}__ALL`;
    const allSelected = options.length > 0 && values.length === options.length;

    // RHF form only for this dropdown
    const form = useForm<Record<string, boolean>>({
      defaultValues: {
        [ALL_NAME]: allSelected,
        ...Object.fromEntries(
          options.map((o) => [fieldName(o.value), values.includes(o.value)])
        ),
      },
    });

    // keep RHF in sync when parent values/options change
    useEffect(() => {
      form.reset({
        [ALL_NAME]: allSelected,
        ...Object.fromEntries(
          options.map((o) => [fieldName(o.value), values.includes(o.value)])
        ),
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options, values, allSelected]);

    // watch & propagate
    useEffect(() => {
      const sub = form.watch((_, info) => {
        const optionKeys = options.map((o) => fieldName(o.value));
        const snapshot = form.getValues();

        if (info?.name === ALL_NAME) {
          const turnOn = !!snapshot[ALL_NAME];
          const nextMap: Record<string, boolean> = { [ALL_NAME]: turnOn };
          optionKeys.forEach((k) => (nextMap[k] = turnOn));
          form.reset(nextMap, { keepDirty: true, keepTouched: true });
          onChange(turnOn ? options.map((o) => o.value) : [placeholder]);
          return;
        }

        const selectedVals = options
          .filter((o) => snapshot[fieldName(o.value)])
          .map((o) => o.value);

        const newAll = selectedVals.length === options.length && options.length > 0;
        if (snapshot[ALL_NAME] !== newAll) {
          form.setValue(ALL_NAME, newAll, { shouldDirty: true, shouldTouch: true });
        }

        onChange(selectedVals.length > 0 ? selectedVals : [placeholder]);
      });
      return () => sub.unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, options, onChange]);

    const triggerText = useMemo(() => {
      if (allSelected) return allSelectedHeading;
      if (!values.length) return placeholder;
      const map = new Map(options.map((o) => [o.value, o.label]));
      const labs = values.map((v: any) => map.get(v) ?? v);
      return labs.length <= 2 ? labs.join(", ") : `${labs.slice(0, 2).join(", ")} +${labs.length - 2}`;
    }, [allSelected, values, options, placeholder]);

    return (
      <div
        ref={rootRef}
        className={`${styles.dropdownWrapper} ${className || ""}`}
        aria-disabled={disabled ? "true" : "false"}
      >
        {icon && <span className={styles.icon}>{icon}</span>}

        <button
          type="button"
          className={styles.trigger}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          name={name}
        >
          <span className={styles.triggerText}>{triggerText}</span>
          <span className={styles.caret}>▼</span>
        </button>

        {open && (
          <div
            className={`${styles.menu} ${styles.dropdownPanel}`}
            role="listbox"
            aria-multiselectable="true"
          >
            {filtered.length > 10 ? (
            <input
              className={styles.searchInput}
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          ) : null}

            <div className={styles.options} ref={listRef}>
              <FormProvider {...form}>
                {/* <div className={styles.optionRow}>
                  <CheckboxField label="All" name={ALL_NAME} />
                </div> */}

                {filtered.length ? (
                  filtered.map((opt) => (
                    <div key={opt.value} className={styles.optionRow}>
                      <CheckboxField label={opt.label} name={fieldName(opt.value)} />
                    </div>
                  ))
                ) : (
                  <div className={styles.noData}>No results</div>
                )}
              </FormProvider>
            </div>
          </div>
        )}
      </div>
    );
  }

  /** ---------------------- SINGLE-SELECT (same UI, no checkboxes) ---------------------- */
  const { value, onChange } = props as SingleProps;

  const currentIndexInFiltered = useMemo(
    () => filtered.findIndex((o) => o.value === value),
    [filtered, value]
  );
  const [focusedIndex, setFocusedIndex] = useState<number>(
    currentIndexInFiltered >= 0 ? currentIndexInFiltered : 0
  );

  useEffect(() => {
    // keep focus index aligned when filter/value changes
    setFocusedIndex(currentIndexInFiltered >= 0 ? currentIndexInFiltered : 0);
  }, [currentIndexInFiltered]);

  const selectOption = useCallback(
    (opt: Option) => {
      onChange(opt.value);
      setOpen(false);
    },
    [onChange]
  );

  const triggerText = useMemo(() => {
    if (!value) return placeholder;
    const map = new Map(options.map((o) => [o.value, o.label]));
    return map.get(value) ?? placeholder;
  }, [value, options, placeholder]);

  // keyboard support inside popup
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (!filtered.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[focusedIndex];
      if (opt) selectOption(opt);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  useEffect(() => {
    // ensure the focused item is visible
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLElement>(`.${styles.optionRow}`);
    const el = items[focusedIndex];
    if (!el) return;
    const listRect = list.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.top < listRect.top) {
      list.scrollTop -= listRect.top - elRect.top;
    } else if (elRect.bottom > listRect.bottom) {
      list.scrollTop += elRect.bottom - listRect.bottom;
    }
  }, [focusedIndex]);

  return (
    <div
      ref={rootRef}
      className={`${styles.dropdownWrapper} ${className || ""}`}
      aria-disabled={disabled ? "true" : "false"}
      onKeyDown={onKeyDown}
    >
      {icon && <span className={styles.icon}>{icon}</span>}

      <button
        type="button"
        className={styles.trigger}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        name={name}
      >
        <span className={styles.triggerText}>{triggerText}</span>
        <span className={styles.caret}>▼</span>
      </button>

      {open && (
        <div className={`${styles.menu} ${styles.dropdownPanel}`} role="listbox" aria-multiselectable="false">
          {filtered.length > 10 ? (
            <input
              className={styles.searchInput}
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          ) : null}


          <div className={styles.options} ref={listRef}>
            {filtered.length ? (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isFocused = idx === focusedIndex;
                return (
                  <div
                    key={opt.value}
                    className={`${styles.optionRow} ${isSelected ? styles.selected : ""} ${isFocused ? styles.focused : ""}`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    onClick={() => selectOption(opt)}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                    {/* {isSelected && <span className={styles.checkmark}>✓</span>} */}
                  </div>
                );
              })
            ) : (
              <div className={styles.noData}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
