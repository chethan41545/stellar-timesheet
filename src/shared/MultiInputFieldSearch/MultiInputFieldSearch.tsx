import { useState, useRef, useEffect, useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";
import styles from "./MultiInputFieldSearch.module.css"; // reuse same styling

type Props = {
	name: string;
	label: string;
	placeholder?: string;
	disabled?: boolean;
	rules?: Parameters<typeof useController>[0]["rules"];
	requiredText?: string;
	helperText?: string;
	options?: any[];
	onSearchChange?: (query: string) => void;
	getOptionLabel?: (opt: any) => string;
	getOptionValue?: (opt: any) => any;
	onValueSelect?: (values: any[]) => void;
};

export default function MultiInputFieldSearch({
	name,
	label,
	placeholder,
	disabled,
	rules,
	requiredText,
	helperText,
	options = [],
	onSearchChange,
	getOptionLabel,
	getOptionValue,
	onValueSelect,
}: Props) {
	const { control } = useFormContext();
	const [focused, setFocused] = useState(false);
	const [open, setOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	const mergedRules = useMemo(() => {
		if (requiredText) return { ...rules, required: requiredText };
		return rules;
	}, [rules, requiredText]);

	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules: mergedRules });

	// Local state for selected items
	const [selected, setSelected] = useState<any[]>(field.value || []);

	useEffect(() => {
		field.onChange(selected);
		onValueSelect?.(selected);
	}, [selected]);

	// Close dropdown on outside click
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={wrapperRef} className={styles.field} style={{ position: "relative" }}>
			<fieldset
				className={[
					styles.fieldset,
					focused ? styles.focused : "",
					error ? styles.error : "",
				].join(" ")}
			>
				<legend className={styles.legend}>
					<span>{label}</span>
				</legend>

				{/* Chips + Input */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						gap: "4px",
						cursor: disabled ? "not-allowed" : "text",
					}}
					onClick={() => !disabled && setOpen(true)}
				>
					{selected.map((opt, i) => {
						const labelText = getOptionLabel ? getOptionLabel(opt) : opt.label ?? opt.name ?? opt;
						return (
							<div
								key={i}
								style={{
									display: "flex",
									alignItems: "center",
									background: "#e0e0e0",
									borderRadius: "12px",
									padding: "2px 8px",
									fontSize: "13px",
								}}
							>
								{labelText}
								<span
									onClick={(e) => {
										e.stopPropagation();
										setSelected(selected.filter((o) => o !== opt));
									}}
									style={{
										marginLeft: "6px",
										cursor: "pointer",
										fontWeight: "bold",
									}}
								>
									×
								</span>
							</div>
						);
					})}

					<input
						type="text"
						placeholder={placeholder}
						disabled={disabled}
						className={disabled ? styles.disabled : styles.input}
						onFocus={() => {
							setFocused(true);
							setOpen(true);
						}}
						onBlur={() => setFocused(false)}
						onChange={(e) => {
							const val = e.target.value;
							onSearchChange?.(val);
							setOpen(true);
						}}
						style={{ flex: 1, border: "none", outline: "none", minWidth: "60px" }}
					/>
				</div>
			</fieldset>

			{/* Dropdown Suggestions with Checkboxes */}
			{open && options.length > 0 && (
				<ul
					style={{
						position: "absolute",
						top: "70%",
						left: 0,
						width: "100%",
						background: "#fff",
						border: "1px solid var(--border)",
						borderRadius: "var(--radius)",
						boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
						zIndex: 10,
						maxHeight: "180px",
						overflowY: "auto",
						listStyle: "none",
						padding: 0,
						margin: 0,
					}}
				>
					{options.map((opt, i) => {
						const labelText = getOptionLabel ? getOptionLabel(opt) : opt.label ?? opt.name ?? opt;
						const value = getOptionValue ? getOptionValue(opt) : opt.value ?? opt;
						const isSelected = selected.some(
							(s) => (getOptionValue ? getOptionValue(s) : s) === value
						);
						return (
							<li
								key={i}
								onMouseDown={(e) => {
									e.preventDefault();
									if (isSelected) {
										setSelected(selected.filter((s) => (getOptionValue ? getOptionValue(s) : s) !== value));
									} else {
										setSelected([...selected, opt]);
									}
								}}
								className={styles.optionRow}
							>
								<input
									type="checkbox"
									checked={isSelected}
									readOnly
									className={styles.checkbox}
									id={`checkbox-${name}-${i}`}
								/>
								<span className={styles.customCheck}></span>
								<label htmlFor={`checkbox-${name}-${i}`} className={styles.optionLabel}>
									{labelText}
								</label>
							</li>


						);
					})}
				</ul>
			)}

			{/* Helper / Error */}
			<div className={styles.metaRow}>
				<span className={error ? styles.errorText : styles.helperText}>
					{error ? error.message?.toString() : helperText}
				</span>
			</div>
		</div>
	);
}
