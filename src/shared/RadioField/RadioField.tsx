import { useFormContext } from "react-hook-form";
import styles from "./RadioField.module.css";

type RadioOption = {
	label: any;
	value: string | number | boolean;
	labelClassName?: string;
	disabled?: boolean;
};

type RadioFieldProps = {
	name: string;
	question: string; // 👈 main text before the radios
	options: RadioOption[];
	rules?: object;
	disabled?: boolean;
};

const RadioField = ({ name, question, options, rules = {}, disabled }: RadioFieldProps) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	const error = name
		.split(".")
		.reduce((acc: any, key) => acc?.[key], errors)?.message as string | undefined;

	return (
		<div className={styles.radioGroupInline}>
			{/* Question */}

			<span
				className={
					name.includes("agencyQueries")
						? styles.agencyQueriesquestion
						: name.includes("usermodule")
							? styles.usermoduleradio
							: name.includes("internalQueries")
								? styles.internalQueriesquestion
								: styles.question // default
				}
			>
				{question}
			</span>

			{/* Radios inline */}
			{options.map((opt, idx) => (
				<label
					key={idx}
					className={`${styles.radioWrapper} ${opt.labelClassName || ""}`}
				>
					<input
						type="radio"
						value={opt.value as any}
						{...register(name, rules)}
						className={styles.radio}
						// disabled={disabled}
						readOnly={disabled}
						aria-readonly={disabled}
						aria-label={`${question}: ${opt.label}`}
						onClick={(e) => disabled && e.preventDefault()}
						onKeyDown={(e) => {
							if (disabled && (e.key === " " || e.key === "Enter")) e.preventDefault();
						}}
						tabIndex={0} // keep it focusable
					/>
					<span className={disabled ? styles.customRadiodisabled : styles.customRadio}></span>
					<span className={`${styles.label} ${opt.labelClassName || ""}`}>
						{opt.label}
					</span>
				</label>
			))}

			{error && (
				<p className={styles.errorText}>
					{error}
				</p>
			)}
		</div>
	);
};

export default RadioField;
