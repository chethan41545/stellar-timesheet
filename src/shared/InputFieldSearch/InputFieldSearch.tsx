import  { useState, useRef, useEffect, useMemo } from "react";
import { useController, useFormContext } from "react-hook-form";
import styles from "./InputFieldSearch.module.css"; // ✅ reuse your existing CSS

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
	onValueSelect?: (value: any, item: any) => void;
};

export default function InputFieldSearch({
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
			{/* Notched Outline */}
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

				{/* Search Input */}
				<input
					id={name}
					name={name}
					type="text"
					value={field.value ?? ""}
					placeholder={placeholder}
					className={disabled ? styles.disabled : styles.input}
					readOnly={disabled}
					aria-readonly={disabled}
					autoComplete="off"
					onFocus={() => {
						setFocused(true);
						setOpen(true);
					}}
					onBlur={() => setFocused(false)}
					onChange={(e) => {
						const val = e.target.value;
						field.onChange(val);
						onSearchChange?.(val);
						setOpen(true);
					}}
				/>
			</fieldset>

			{/* Dropdown Suggestions */}
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
						return (
							<li
								key={i}
								onMouseDown={() => {
									field.onChange(labelText);
									setOpen(false);
									onValueSelect?.(value, opt);
								}}
								style={{
									padding: "8px 12px",
									cursor: "pointer",
									fontSize: "14px",
									color: "var(--text)",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.05)")}
								onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
							>
								{labelText}
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
