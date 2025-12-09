
import { Controller, useFormContext } from "react-hook-form";
import { TextField, MenuItem } from "@mui/material";
import styles from "./SelectField.module.css";

type Option = { label: string; value: string | number };

type Props = {
	name: string;
	options: Option[];
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	rules?: object; // 👈 allow validation rules
	onValueChange?: (value: any) => void;
	defaultValue?: string | number;
	value?: string | number
};

export default function SelectField({
	name,
	options,
	label = "Select option",
	placeholder = "Select option",
	disabled = false,
	rules = {}, // 👈 default empty
	onValueChange,
	defaultValue,
	value
}: Props) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			rules={rules} // 👈 plug in validation rules
			defaultValue={defaultValue}
			render={({ field, fieldState }) => (
				<TextField

					select
					fullWidth
					size="small"
					variant="outlined"
					label={label}
					value={value ?? field.value ?? ""} // 🔹 use parent value if provided
					onChange={(e) => {
						field.onChange(e.target.value);      // update RHF state
						onValueChange?.(e.target.value);    // notify parent
					}}
					onBlur={field.onBlur}
					// disabled={disabled}
					InputProps={{
						readOnly: disabled, // ✅ use readOnly when in "View" mode
						classes: { root: styles.selectFieldOutlined },
					}}
					aria-readonly={disabled ? true : undefined} //
					aria-labelledby={`${name}-label`} // ✅ connects to visible label
					aria-describedby={`${name}-helper`} // ✅ connects to helper/error text



					error={!!fieldState.error} // 👈 shows red border
					helperText={
						fieldState.error ? (
							<span className="errorText" style={{ fontSize: "12px", fontWeight: "500", color: "var(--error)" }}>{fieldState.error.message}</span>
						) : null
					}
					// InputProps={{
					// 	classes: {
					// 		root: styles.selectFieldOutlined, // attach CSS class to root
					// 	},
					// }}
					InputLabelProps={{
						shrink: true,
					}}
					SelectProps={{
						displayEmpty: true,
						renderValue: (selected) => {
							if (!selected) {
								return (
									<span style={{ color: "#9e9e9e" }}>
										{placeholder}
									</span>
								);
							}
							const opt = options.find((o) => o.value === selected);
							return opt ? opt.label : "";
						},
					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: "8px",
							// opacity: disabled ? 0.6 : 1, // 
							// pointerEvents: disabled ? "none" : "auto", // prevent clicks when read-only
							color: disabled ? "var(--text)" : "var(--text)",
						},
						"& .MuiSelect-select": {
							paddingTop: "10px",    // enough space for label
							paddingBottom: "10px",
							paddingLeft: "12px",   // space from left border to avoid overlap
							cursor: disabled ? "not-allowed" : "pointer",
						},
						"& .MuiInputLabel-outlined": {
							backgroundColor: "#ffffffff", // match your field background
							paddingLeft: "4px",         // optional, prevents overlap with left border
							paddingRight: "10px",
							color: "var(--label) !important",
						},
					}}
				>
					{/* <MenuItem value="">
						<em>None</em>
					</MenuItem> */}

					{!(rules as any)?.required && (
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
					)}

					{options.map((opt) => (
						<MenuItem key={opt.value} value={opt.value}>
							{opt.label}
						</MenuItem>
					))}
				</TextField>
			)}
		/>
	);
}
