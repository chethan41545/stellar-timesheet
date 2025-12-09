// shared/CheckboxField/CheckboxField.tsx
import { useFormContext } from 'react-hook-form';
import styles from './CheckboxField.module.css';

type CheckboxFieldProps = {
	label: string;
	name: string;
	rules?: any;           // RHF rules; we'll merge an onChange if provided
	checked?: boolean;     // ✅ optional controlled
	onChange?: (checked: boolean) => void; // ✅ optional controlled
	disabled?: boolean;
};

const CheckboxField = ({ label, name, rules = {}, checked, onChange, disabled }: CheckboxFieldProps) => {
	const { register, formState: { errors } } = useFormContext?.() ?? ({} as any);

	const r =
		typeof register === 'function'
			? register(name, {
				...rules,
				// Make sure RHF's and external onChange both fire
				onChange: (e: any) => {
					rules?.onChange?.(e);
					onChange?.(!!e?.target?.checked);
				},
			})
			: {
				// Fallback if not inside RHF (still usable as a plain checkbox)
				onChange: (e: any) => onChange?.(!!e?.target?.checked),
			};

	// Allow controlled or uncontrolled seamlessly
	const controlledProps = checked === undefined ? {} : { checked };

	const error = (errors && errors[name]?.message) as string | undefined;

	return (
		<div>
			<label className={styles.checkboxWrapper}>
				<input
					type="checkbox"
					id={name}
					className={styles.checkbox}
					{...r}
					{...controlledProps}
					readOnly={disabled} // ✅ ensures keyboard focus but no interaction
					aria-readonly={disabled} // ✅ announces "read only"
					aria-label={`${label} ${disabled ? "(read only)" : ""}`} // ✅ accessible label
					onClick={(e) => {
						// prevent changes if readonly
						if (disabled) e.preventDefault();
					}}
				/>
				<span  className={disabled ? styles.customCheckdisabled : styles.customCheck}></span>
				<span className={styles.label}>{label}</span>
			</label>

			{error && (
				<p
					className={styles.errorText}
					style={{ color: 'var(--error)', fontSize: '12px', fontWeight: 500, marginLeft: '15px' }}
				>
					{error}
				</p>
			)}
		</div>
	);
};

export default CheckboxField;
