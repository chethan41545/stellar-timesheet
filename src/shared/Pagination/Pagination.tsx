import { Select, MenuItem, IconButton, Typography, Box } from "@mui/material";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

type Props = {
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  smallFont?: boolean;
};

export default function PaginationBar({
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  smallFont = false 
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalRows / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startIdx = (safePage - 1) * pageSize;
  const start = totalRows === 0 ? 0 : startIdx + 1;
  const end = Math.min(startIdx + pageSize, totalRows);

  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  const formatNumber = (num: number) =>
    new Intl.NumberFormat().format(num);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={!smallFont ? 2 : 0}
      py={1}
    >
      {/* Left: Rows per page */}
      <Box display="flex" alignItems="center" gap={1}>
        <Typography
          fontSize={13}
          color="text.secondary"
          sx={{ lineHeight: 1.5, display: 'flex', alignItems: 'center' }}
        >
          Rows per page:
        </Typography>

        <Select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          size="small"
          variant="standard"
          disableUnderline
          sx={{
            fontSize: 13,
            paddingX: 1,
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            '& .MuiSelect-select': {
              paddingY: 0,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiSelect-icon': {
              top: 'calc(50% - 0.5em)',
              color: 'text.primary',
            },
          }}
          MenuProps={{ disableScrollLock: true }}
        >
          {pageSizeOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      </Box>


      {/* Right: Range + Chevron buttons */}
      <Box display="flex" alignItems="center" gap={!smallFont ? 1 : 0}>
        <Typography fontSize={13} color="text.secondary" minWidth={!smallFont ? 90 : 70} textAlign="right">
          {formatNumber(start)}–{formatNumber(end)} of {formatNumber(totalRows)}
        </Typography>

        <IconButton
          onClick={() => canPrev && onPageChange(safePage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          size="small"
          sx={{
            width: 30,
            height: 30,
            color: canPrev ? 'text.primary' : 'text.secondary',
            '&:disabled': {
              backgroundColor: 'transparent',
              cursor: 'not-allowed',
            },
          }}
        >
          <LuChevronLeft size={18} />
        </IconButton>

        <IconButton
          onClick={() => canNext && onPageChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          size="small"
          sx={{
            width: 30,
            height: 30,
            color: canNext ? 'text.primary' : 'text.secondary',
            '&:disabled': {
              backgroundColor: 'transparent',
              cursor: 'not-allowed',
            },
          }}
        >
          <LuChevronRight size={18} />
        </IconButton>
      </Box>
    </Box>
  );
}
