import * as React from "react";
import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

interface CustomDateFieldProps {
	value: Dayjs | null;
	onChange: (date: Dayjs | null) => void;
	label?: string;
	placeholder?: string;
	minDate?: Dayjs | null;
	maxDate?: Dayjs | null;
	error?: boolean;        // ✅ added
	helperText?: string;    // ✅ added
	disabled?: boolean;
}

const DateField: React.FC<CustomDateFieldProps> = ({
  value,
  onChange,
  label = "Select Date",
  placeholder = "MM/DD/YYYY",
  minDate,
  maxDate,
  error,
  helperText,
  disabled = false,
}) => {
  const datePickerProps: any = {};
  if (minDate) datePickerProps.minDate = minDate;
  if (maxDate) datePickerProps.maxDate = maxDate;

  return (
    <DatePicker
      value={value}
      onChange={(newValue) => onChange(newValue)}
      {...datePickerProps}
      // keep this false, it's fine
      enableAccessibleFieldDOMStructure={false}
      disabled={disabled} // use disabled only when you want full disable
      slots={{
        textField: (params) => (
          <>
            <TextField
              {...params}
              // ⬇️ make only the TEXT non-editable
              inputProps={{
                ...params.inputProps,
                readOnly: true,     // <-- key line
              }}
              variant="outlined"
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={null}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                  height: "40px",
                  color: "var(--text)",
                },
                "& .MuiOutlinedInput-input": {
                  padding: "8px 12px",
                  fontSize: "14px",
                  cursor: disabled ? "not-allowed" : "pointer",
                },
                "& input::placeholder": {
                  color: "#9e9e9e",
                  opacity: 1,
                },
                "& .MuiInputLabel-outlined": {
                  backgroundColor: "#ffffffff",
                  paddingLeft: "4px",
                  paddingRight: "10px",
                  color: "var(--label) !important",
                },
              }}
            />
            {error && (
              <div className="metaRow">
                <span
                  style={{
                    color: "var(--error)",
                    fontSize: "12px",
                    fontWeight: "500",
                    marginLeft: "15px",
                  }}
                >
                  {helperText}
                </span>
              </div>
            )}
          </>
        ),
      }}
    />
  );
};


export default DateField;
