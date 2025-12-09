import { Controller, useFormContext } from "react-hook-form";
import {
	TextField,
	MenuItem,
	Checkbox,
	ListItemText,
	Chip,
	Box,
} from "@mui/material";
import styles from "./MultiSelectField.module.css"; // ✅ same CSS as SelectField

type Option = { label: string; value: string | number };

type Props = {
	name: string;
	options: Option[];
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	rules?: object;
	onValueChange?: (value: any) => void;
	defaultValue?: (string | number)[];
	value?: (string | number)[];
	showChips?: boolean;
};

export default function MultiSelectField({
	name,
	options,
	label = "Select options",
	placeholder = "Select options",
	disabled = false,
	rules = {},
	onValueChange,
	defaultValue = [],
	value,
	showChips = false,
}: Props) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			rules={rules}
			defaultValue={defaultValue}
			render={({ field, fieldState }) => (
				<TextField
					select
					fullWidth
					size="small"
					variant="outlined"
					label={label}
					value={value !== undefined ? value : field.value || []}
					onChange={(e) => {
						const val = e.target.value as unknown as (string | number)[];
						field.onChange(val);
						onValueChange?.(val);
					}}
					onBlur={field.onBlur}
					InputProps={{
						readOnly: disabled,
						classes: { root: styles.selectFieldOutlined },
					}}
					error={!!fieldState.error}
					helperText={
						fieldState.error ? (
							<span className={styles.errorText}>
								{fieldState.error.message}
							</span>
						) : null
					}
					InputLabelProps={{
						shrink: true,
					}}
					SelectProps={{
						multiple: true,
						displayEmpty: true,
						renderValue: (selected) => {
							const selectedValues = selected as (string | number)[];
							if (selectedValues.length === 0) {
								return <span style={{ color: "#9e9e9e" }}>{placeholder}</span>;
							}

							const labels = selectedValues
								.map((val) => options.find((o) => o.value === val)?.label || val)
								.join(", ");

							if (showChips) {
								// show only first 3 chips, rest as +N more
								return (
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											overflow: "hidden",
											gap: 0.5,
											maxWidth: "100%",
											whiteSpace: "nowrap",
										}}
									>
										{selectedValues.slice(0, 2).map((val) => {
											const opt = options.find((o) => o.value === val);
											return (
												<Chip
													key={val}
													label={opt?.label ?? val}
													size="small"
													sx={{
														borderRadius: "6px",
														flexShrink: 0,
														maxWidth: "100px",     // limit width per chip
														padding: "0 6px",
														textOverflow: "ellipsis",
														overflow: "hidden",
													}}
												/>
											);
										})}

										{selectedValues.length > 2 && (
											<span
												style={{
													fontSize: "13px",
													color: "#555",
													marginLeft: "4px",
													flexShrink: 0,
												}}
											>
												+{selectedValues.length - 2} more
											</span>
										)}
									</Box>
								);
							}

							return (
								<Box
									sx={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{labels.length > 40 ? labels.slice(0, 40) + "..." : labels}
								</Box>
							);
						},


					}}
					sx={{
						"& .MuiOutlinedInput-root": {
							borderRadius: "8px",
							color: "var(--text)",
						},
						"& .MuiSelect-select": {
							paddingTop: "10px",
							paddingBottom: "10px",
							paddingLeft: "12px",
							cursor: disabled ? "not-allowed" : "pointer",
						},
						"& .MuiInputLabel-outlined": {
							backgroundColor: "#fff",
							paddingLeft: "4px",
							paddingRight: "10px",
							color: "var(--label) !important",
						},
					}}
				>
					{options.map((opt) => (
						<MenuItem key={opt.value} value={opt.value} sx={{ marginTop: "-10px" }}>
							<Checkbox
								size="small"
								sx={{ ml: -2 }}
								checked={(value !== undefined ? value : field.value || []).includes(opt.value)}
							/>
							<ListItemText primary={opt.label} />
						</MenuItem>
					))}
				</TextField>
			)}
		/>
	);
}
