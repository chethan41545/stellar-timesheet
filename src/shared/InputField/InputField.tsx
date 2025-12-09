import React, { useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import styles from "./InputField.module.css";

type Props = {
	name: string;
	label: string;
	type?: React.HTMLInputTypeAttribute;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	rules?: Parameters<typeof useController>[0]["rules"];
	requiredText?: string;             // overrides rules.required message
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;         // you can still pass custom end icon
	helperText?: string;
	maxLength?: number;
	showCharCount?: boolean;
	autoComplete?: string;
	onValueChange?: (value: any) => void;
	onValueChange1?: (value: any, value1: any) => void;
};

export default function InputField({
	name,
	label,
	type = "text",
	placeholder,
	disabled,
	// readOnly,
	rules,
	requiredText,
	startIcon,
	endIcon,
	helperText,
	maxLength,
	showCharCount,
	autoComplete,
	onValueChange,
	onValueChange1

}: Props) {
	const { control } = useFormContext();
	const [focused, setFocused] = useState(false);
	const [showPwd, setShowPwd] = useState(false);

	const isPassword = type === "password";

	const mergedRules = useMemo(() => {
		if (requiredText) return { ...rules, required: requiredText };
		return rules;
	}, [rules, requiredText]);

	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules: mergedRules });

	const inputType = isPassword && showPwd ? "text" : type;
	const length = typeof field.value === "string" ? field.value.length : 0;

	return (
		<div className={styles.field}>
			{/* Notched outline container */}
			<fieldset
				className={[
					styles.fieldset,
					focused ? styles.focused : "",
					error ? styles.error : "",
					// disabled ? styles.disabled : "",
				].join(" ")}
			>
				<legend className={styles.legend}>
					<span>{label}</span>
				</legend>

				{startIcon && <span className={styles.startIcon}>{startIcon}</span>}

				<input
					{...field}
					id={name}
					name={name}
					type={inputType}
					value={field.value ?? ""} // ✅ make it always controlled
					placeholder={placeholder}
					className={disabled ? styles.disabled : styles.input}
					// disabled={disabled}
					readOnly={disabled}
					aria-readonly={disabled} // ✅ announces "read only" state
					aria-label={`${label}: ${field.value || "None"}`} // ✅ announces the label + value
					maxLength={maxLength}
					autoComplete={autoComplete}
					onFocus={(e) => {
						setFocused(true);
						// open native UI for date inputs when supported
						if (type === "date") (e.currentTarget as any).showPicker?.();
						(field as any).onFocus?.(e);
					}}
					onBlur={(_e) => {
						setFocused(false);
						field.onBlur();
					}}

					onKeyDown={(e) => {

						if (type === "number") {
							if (e.key === 'e' || e.key === 'E') e.preventDefault();
						};
					}}

					onPaste={(e) => {

						const txt = e.clipboardData.getData('text');

						if (type === "number") {
							if (/[eE]/.test(txt)) e.preventDefault();
						};

					}}

					onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}


					onChange={(e) => {
						let value = e.target.value;

						if (type === "number" && parseFloat(value) < 0) return;

						if (type === "mfa"){
							value = value.replace(/\D/g, '').slice(0, 6);
						}

						// ✅ Handle custom "textOnly" type to restrict special characters

						if (type === "textOnly") {
							// Allow only alphanumeric and space
							value = value.replace(/[^a-zA-Z]/g, "");
						}

						// ✅ Create a synthetic event to pass sanitized value to RHF
						const syntheticEvent = {
							...e,
							target: {
								...e.target,
								value,
							},
						};

						field.onChange(syntheticEvent);
						onValueChange?.(value);
						onValueChange1?.(e, field);
					}}
				/>

				{/* Right-side controls */}
				<span className={styles.endSlot}>
					{isPassword ? (
						<button
							type="button"
							className={styles.iconBtn}
							onClick={() => setShowPwd((s) => !s)}
							tabIndex={-1}
						>
							{showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
						</button>
					) : endIcon ? (
						<span className={styles.endIcon}>{endIcon}</span>
					) : null}
				</span>
			</fieldset>

			{/* Helper / Error / Counter */}
			<div className={styles.metaRow}>
				<span className={error ? styles.errorText : styles.helperText}>
					{error ? error.message?.toString() : helperText}
				</span>
				{showCharCount && typeof maxLength === "number" && (
					<span className={styles.counter}>
						{length}/{maxLength}
					</span>
				)}
			</div>
		</div>
	);
}
