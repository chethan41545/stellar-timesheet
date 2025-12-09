import { Select, MenuItem, Box, Typography, Tooltip } from '@mui/material';
import { keyframes } from '@mui/system';
import React from 'react';

type Option = { label: string; value: string; color?: string };

interface TableSelectDropdownProps {
  value: string;
  onChange: (newValue: string) => void;
  options: Option[];
  withPillColors?: boolean;  
  withBlink?: boolean;  
}

/* status → colors (option.color overrides) */
const getThemeFor = (labelOrValue: string, override?: string) => {
  if (override) return { bg: `${override}1A`, fg: override };
  const k = (labelOrValue || '').toLowerCase();
  if (k === 'active') return { bg: '#D6FFD9', fg: '#292929' };
  if (k === 'pending approval') return { bg: '#D6FFD9', fg: '#292929' };
  if (k === 'on hold') return { bg: '#FFE39F', fg: '#292929' };
  if (k === 'draft') return { bg: '#DAECEF', fg: '#292929' };
  if (k === 'closed') return { bg: '#fde8e8', fg: '#292929' };
  if (k === 'approved') return { bg: '#D6FFD9', fg: '#292929' };
  if (k === 'interview scheduled') return { bg: '#D6FFD9', fg: '#292929' };
  if (k === 'shortlisted' || k === 'submitted' || k === 'interview requested' || k === 'reschedule interview' 
    || k === 'qualified' || k === 'placement requested'  || k === 'offer made' || k === 'onboarding' || k === 'onboarded') return { bg: '#D6FFD9', fg: '#292929' };
  return { bg: '#f1f5f9', fg: '#292929' };
};

const blink = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.75); }
`;

export const TableSelectDropdown: React.FC<TableSelectDropdownProps> = ({
  value,
  onChange,
  options,
  withPillColors,
  withBlink,
}) => {
  const selected = options.find((o) => o.value === value) || options[0];
  const selectedLabel = selected?.label ?? selected?.value ?? '';
  const theme = withPillColors ? getThemeFor(selectedLabel, selected?.color) : { bg: 'transparent', fg: 'inherit' };
  const otherOptions = options.filter((o) => o.value !== value);

  return (
    <Select
      value={value}
      onChange={(e) => onChange(String(e.target.value))}
      size="small"
      sx={{
        maxWidth: '110px',
        backgroundColor: theme.bg,
        color: theme.fg,
        borderRadius: withPillColors ? '999px' : '999px',
        height: 24,
        position: 'relative',
        marginLeft:withPillColors ? '-10px': '0',
        // no outline
        '& fieldset': { border: '1px solid transparent!important' },
        '&:hover fieldset': { borderColor: 'transparent!important' },
        '&.Mui-focused fieldset': { borderColor: 'transparent!important' },
        // NO PADDING for the input; keep room for the chevron
        '& .MuiSelect-select': {
          padding: withPillColors ? "4px 26px 4px 10px" : '0',
          paddingRight: '24px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '20px',
          width: '100%',
          minWidth: 0, 
        },
        '& .MuiSvgIcon-root': { color: theme.fg, right: 8 },
      }}
      MenuProps={{
        PaperProps: { sx: { mt: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } },
      }}
      renderValue={(selectedValue) => {
        const opt = options.find((o) => o.value === selectedValue) || options[0];
        const label = opt?.label ?? opt?.value ?? '';
        const t = withPillColors ? getThemeFor(label, opt?.color) : { bg: 'transparent', fg: 'inherit' };
        const blinkNow = withBlink;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: t.fg, width: '100%', minWidth: 0 }}>
            {/* corner dot (blinks only for On Hold when flag is true) */}
            {blinkNow && (
              <Box
                sx={{
                  width: 8, height: 8, borderRadius: '50%', background:'#FB8C00;',
                  position: 'absolute', top: '-3px', right: '0px',
                  animation: `${blink} 1s ease-in-out infinite`,
                }}
                aria-hidden
              />
            )}
            <Tooltip title={value} arrow>
            <Typography variant="body2"  sx={{ fontWeight: 500, textTransform: 'capitalize', lineHeight: 1.2,flex: 1,minWidth: 0,overflow: 'hidden',textOverflow: 'ellipsis',whiteSpace: 'nowrap', }}>
              {opt.label}
            </Typography>
            </Tooltip>
          </Box>
        );
      }}
    >
      {otherOptions.length === 0 ? (
  <MenuItem disabled>
    <Typography variant="body2" color="text.secondary">No other options</Typography>
  </MenuItem>
) : (
  otherOptions.map((option) => {

    return (
      <MenuItem key={option.value} value={option.value}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', position: 'relative' }}>
          <Typography variant="body2">{option.label}</Typography>
        </Box>
      </MenuItem>
    );
  })
)}

    </Select>
  );
};
