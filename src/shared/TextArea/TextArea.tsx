import React, { useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import styles from "./TextArea.module.css";

type Props = {
	name: string;
	label: string;
	placeholder?: string;
	disabled?: boolean;
	readOnly?: boolean;
	rows?: number;
	maxLength?: number;
	showCharCount?: boolean;
	rules?: Parameters<typeof useController>[0]["rules"];
	requiredText?: string;
	helperText?: string;
	autoResize?: boolean;
	onValueChange?: (value: string) => void;
};

export default function TextArea({
	name,
	label,
	placeholder,
	disabled,
	readOnly,
	rows = 3,
	maxLength,
	showCharCount,
	rules,
	requiredText,
	helperText,
	autoResize = true,
	onValueChange,
}: Props) {
	const { control } = useFormContext();
	const [focused, setFocused] = useState(false);

	const mergedRules = useMemo(() => {
		if (requiredText) return { ...rules, required: requiredText };
		return rules;
	}, [rules, requiredText]);

	const {
		field,
		fieldState: { error },
	} = useController({ name, control, rules: mergedRules });

	const length = typeof field.value === "string" ? field.value.length : 0;

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		let value = e.target.value;

		if (maxLength && value.length > maxLength) value = value.slice(0, maxLength);

		field.onChange(value);
		onValueChange?.(value);

		// Auto-resize
		if (autoResize) {
			e.target.style.height = "auto";
			e.target.style.height = `${e.target.scrollHeight}px`;
		}
	};

	return (
		<div className={styles.field}>
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

				<textarea
					{...field}
					id={name}
					name={name}
					value={field.value ?? ""}
					placeholder={placeholder}
					rows={rows}
					className={disabled ? styles.textarea_disabled : styles.textarea}
					readOnly={disabled || readOnly}
					aria-readonly={disabled || readOnly}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					onChange={handleInput}
				/>

			</fieldset>

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
