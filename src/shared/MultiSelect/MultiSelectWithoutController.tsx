import * as React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 24;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  label: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  width?: number;
  selectAllByDefault?: boolean;
};

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: 'transparent !important',
  },
  '&.Mui-selected:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  width = 300,
  selectAllByDefault = false,
}) => {
  // ✅ Fix: Only initialize once on mount if selectAllByDefault is true
  React.useEffect(() => {
    if (selectAllByDefault && options.length > 0 && value.length === 0) {
      onChange(options.map(o => o.value));
    }
  }, [options, selectAllByDefault]); // Remove value from dependencies

  const isAllSelected = options.length > 0 && value.length === options.length;
  const isIndeterminate = value.length > 0 && value.length < options.length;

  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    const selected =
      typeof event.target.value === 'string'
        ? event.target.value.split(',')
        : event.target.value;

    // Handle "All" checkbox click
    if (selected.includes('select-all')) {
      const newValue = isAllSelected ? [] : options.map(o => o.value);
      onChange(newValue);
      return;
    }

    onChange(selected);
  };

  const getDisplayText = () => {
    if (isAllSelected) {
      return 'All';
    }
    
    if (value.length === 0) {
      return '';
    }

    const selectedLabels = options
      .filter(option => value.includes(option.value))
      .map(option => option.label);

    return selectedLabels.join(', ');
  };

  return (
    <FormControl sx={{ m: 1, width }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={getDisplayText}
        MenuProps={MenuProps}
      >
        {/* "All" option - using a special value that won't conflict with actual option values */}
        <StyledMenuItem value="select-all">
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
          />
          <ListItemText primary="All" />
        </StyledMenuItem>

        {/* Options */}
        {options.map((option) => (
          <StyledMenuItem key={option.value} value={option.value}>
            <Checkbox checked={value.includes(option.value)} />
            <ListItemText primary={option.label} />
          </StyledMenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelect;