import React, { useState } from 'react';
import {
	Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
	Paper, Chip, CircularProgress, Typography, Box, Tooltip, IconButton
} from '@mui/material';
import PaginationBar from '../Pagination/Pagination';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ColumnOption {
	value: string;
	label: string;
	color: string;
}

interface Column<T extends Record<string, any>> {
	id: keyof T;
	label: string | React.ReactNode;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
	format?: (value: T[keyof T], row: T) => React.ReactNode;
	options?: ColumnOption[];
	width?: string | number;
	variant?: string;
	truncateWithEllipsis?: boolean;

}

interface CustomTableProps<T extends Record<string, any>> {
	columns: Column<T>[];
	data: T[];
	totalRows?: number;
	isAction?: boolean;
	loading?: boolean;
	defaultSortBy?: any;
	defaultSortDirection?: 'asc' | 'desc';
	defaultPage?: number;
	defaultPageSize?: number;
	pageSizeOptions?: number[];
	onSortChange?: (sortBy: keyof T, sortDirection: 'asc' | 'desc') => void;
	onPageChange?: (page: number, pageSize: number) => void;
	onCellChange?: (rowId: T['id'], columnId: keyof T, newValue: any) => void;
	emptyMessage?: string;
	showPagination?: boolean;
	rowPadding?: string;
	onRefresh?: () => void;
	onRowClick?: (row: T) => void;
	smallFont?: boolean;

	/* NEW: highlight control */
	highlightedRowValue?: any; // value to match for highlighting (e.g. selected id or selected timesheetStart)
	highlightedRowKey?: keyof T; // key to use for matching (defaults to 'id')
	highlightColor?: string; // highlight background color
	/* optional hook if parent wants to pass row props */
	getRowProps?: (row: T) => React.HTMLAttributes<HTMLTableRowElement>;
}

function CustomTable<T extends Record<string, any> & { id: string | number }>(props: CustomTableProps<T>) {
	const {
		columns,
		data,
		totalRows=0,
		isAction = false,
		loading = false,
		defaultSortBy,
		defaultSortDirection = 'asc',
		defaultPage = 0,
		defaultPageSize = 10,
		onSortChange,
		onPageChange,
		emptyMessage = 'No data available',
		showPagination = true,
		rowPadding = '2px 12px',
		onRefresh,
		onRowClick,
		highlightedRowValue,
		highlightedRowKey,
		highlightColor = '#E3F2FD',
		getRowProps,
		smallFont = false
	} = props;

	const [order, setOrder] = useState<'asc' | 'desc'>(defaultSortDirection);
	const [orderBy, setOrderBy] = useState<keyof T>(defaultSortBy || columns[0].id);
	const [page, setPage] = useState(defaultPage);
	const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);

	const handleRequestSort = (property: keyof T, isAsc: boolean) => {
		const newOrder = isAsc ? 'asc' : 'desc';
		setOrder(newOrder);
		setOrderBy(property);
		onSortChange?.(property, newOrder);
	};

	const renderCellContent = (column: Column<T>, value: T[keyof T], row: T): React.ReactNode => {
		if (column.format) return column.format(value, row);

		if (column.variant === 'box') {
			const num = Number(value);
			const showRefresh = value == null || Number.isNaN(num) || num === 0;

			return (
				<Box
					sx={(theme) => ({
						width: 20,
						height: 20,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						border: `1px solid ${theme.palette.primary.main}`,
						borderRadius: '4px',
						p: '2px',
						color: theme.palette.primary.main,
					})}
				>
					{showRefresh ? (
						<Tooltip title="Refresh list" >
							<span>
								<IconButton
									size="small"
									onClick={(e) => { e.stopPropagation(); onRefresh?.(); }}
									disabled={loading}
									sx={{ p: 0, opacity: loading ? 0.5 : 1 }}
								>
									<RefreshIcon sx={{ fontSize: 16 }} style={{ color: '#002e71' }} />
								</IconButton>
							</span>
						</Tooltip>
					) : (
						<Typography fontSize={12} variant="body2" color="inherit">
							{Math.floor(num)}
						</Typography>
					)}
				</Box>
			);
		}

		if (column.options) {
			const selectedOption = column.options.find(opt => opt.value === value) || column.options[0];
			return (
				<Chip
					label={selectedOption.label}
					style={{ backgroundColor: selectedOption.color, color: 'white' }}
				/>
			);
		}

		const istruncated = column.truncateWithEllipsis ?? true;

		const stringValue = String(value);

		if (istruncated) {
			return (
				<Tooltip title={stringValue} arrow>
					<Typography
						fontSize={12}
						variant="body2"
						color="text.main"
						sx={{
							cursor: 'pointer',
							maxWidth: '100%',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
							display: 'block',
						}}
					>
						{stringValue === "undefined" ? "-" : stringValue}
					</Typography>
				</Tooltip>
			);
		}

		return (
			<Typography fontSize={12} variant="body2" color="text.main">
				{stringValue === "undefined" ? "-" : stringValue}
			</Typography>
		);
	};

	const isEmpty = !loading && data?.length === 0;

	// helper to determine if a row should be highlighted
	const isRowHighlighted = (row: T) => {
		if (highlightedRowValue === undefined || highlightedRowValue === null) return false;
		const key: keyof T = highlightedRowKey ?? ('id' as keyof T);
		// compare as strings to avoid type mismatch (e.g. number vs string)
		const rowVal = row[key];
		return String(rowVal) === String(highlightedRowValue);
	};

	return (
		<>
			<TableContainer
				component={Paper}
				sx={{
					borderRadius: '12px',
					'&::-webkit-scrollbar': {
						width: '8px',
						height: '8px',
					},
					'&::-webkit-scrollbar-thumb': {
						backgroundColor: '#888',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						backgroundColor: '#555',
					},
					'&::-webkit-scrollbar-track': {
						backgroundColor: '#f1f1f1',
					},
				}}>
				<Table aria-label="Data table" role="table">
					<TableHead role="rowgroup">
						<TableRow role="rowgroup">
							{columns.map((column) => (
								<TableCell
									role="columnheader"
									key={String(column.id)}
									align={column.align || 'left'}
									sortDirection={orderBy === column.id ? order : false}
									sx={{
										padding: '14px 12px',
										width: column.width || 'auto',
										minWidth: column.width || 'auto',
										maxWidth: column.width || 'none',

										/* ✅ HEADER BACKGROUND */
										backgroundColor: '#F3F4F6',

										/* subtle bottom border */
										borderBottom: '1px solid #E5E7EB',

										fontWeight: 600,
									}}
								>

									{column.sortable ? (
										<TableSortLabel
											active={orderBy === column.id}
											direction={orderBy === column.id ? order : 'asc'}
											IconComponent={() => null}
											sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
										>
											<Typography fontSize={12} variant="body2" sx={{ fontWeight: 600, mr: 1 }}>
												{column.label}
											</Typography>
											<Box gap={0} sx={{ display: 'flex', flexDirection: 'row', lineHeight: 0, width: '25px' }}>
												<span
													role="button"
													tabIndex={0}
													aria-label={`Sort ${column.label} ascending`}
													onClick={() => handleRequestSort(column.id, true)}
													onKeyDown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') handleRequestSort(column.id, true);
													}}
													style={{ cursor: 'pointer', display: 'inline-flex' }}
												>
													<ArrowUpwardIcon
														sx={{
															color: orderBy === column.id && order === 'asc' ? 'text.primary' : 'text.disabled',
															fontSize: '12px'
														}}
														onClick={() => handleRequestSort(column.id, true)}
													/>
												</span>

												<span
													role="button"
													tabIndex={0}
													aria-label={`Sort ${column.label} descending`}
													onClick={() => handleRequestSort(column.id, false)}
													onKeyDown={(e) => {
														if (e.key === 'Enter' || e.key === ' ') handleRequestSort(column.id, true);
													}}
													style={{ cursor: 'pointer', display: 'inline-flex' }}
												>
													<ArrowDownwardIcon
														sx={{
															color: orderBy === column.id && order === 'desc' ? 'text.primary' : 'text.disabled',
															fontSize: '12px'
														}}
														onClick={() => handleRequestSort(column.id, false)}
													/>
												</span>
											</Box>
										</TableSortLabel>
									) : (
										<Typography fontSize={12} variant='body2' sx={{ fontWeight: 600 }}
											aria-label={`Sort ${column.label}`} tabIndex={0}>{column.label}</Typography>
									)}
								</TableCell>
							))}
							{isAction && (
								<TableCell key="actions" align="right">
									Actions
								</TableCell>
							)}
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={columns.length + (isAction ? 1 : 0)} align="center">
									<CircularProgress />
								</TableCell>
							</TableRow>
						) : isEmpty ? (
							<TableRow>
								<TableCell colSpan={columns.length + (isAction ? 1 : 0)} align="center">
									<Box py={4}>
										<Typography fontSize={12} variant="body2" color="text.main" tabIndex={0}>
											{emptyMessage}
										</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : (
							data?.map((row, index) => {
								const highlighted = isRowHighlighted(row);
								const rowProps = getRowProps?.(row) ?? {};
								return (
									<TableRow
										key={String(index)}
										hover
										{...rowProps}
										sx={{
											backgroundColor: highlighted ? highlightColor : undefined,
											// keep hover effect while highlighted
											'&:hover': { backgroundColor: highlighted ? highlightColor : 'rgba(0,0,0,0.04)' },
											...((rowProps as any).style || {}),
										}}
									>
										{columns.map((column) => (
											<TableCell
												key={String(column.id)}
												align={column.align || 'left'}
												width={column.width}
												onClick={() => onRowClick?.(row)}
												sx={{
													padding: `${rowPadding}`,
													width: column.width || 'auto',
													minWidth: column.width || 'auto',
													maxWidth: column.width || 'none',
													borderLeft: '0px !important',
												}}
											>
												<Box
													sx={{
														display: 'flex',
														justifyContent:
															column.align === 'center'
																? 'center'
																: column.align === 'right'
																	? 'flex-end'
																	: 'flex-start',
														width: '100%', '& > *': {
															mr: column.sortable ? '25px' : 0,
														},
													}}
												>
													{renderCellContent(column, row[column.id], row)}
												</Box>
											</TableCell>
										))}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			{showPagination &&
				<PaginationBar
					page={page}
					pageSize={rowsPerPage}
					totalRows={totalRows}
					pageSizeOptions={[10, 20, 50]}
					// pageSizeOptions={[2,3,4]}
					onPageChange={(newPage) => {
						setPage(newPage);
						onPageChange?.(newPage, rowsPerPage);
					}}
					onPageSizeChange={(newSize) => {
						setRowsPerPage(newSize);
						setPage(1); // Reset to first page when page size changes
						onPageChange?.(1, newSize);
					}}
					smallFont={smallFont}
				/>
			}
		</>
	);
}

export default CustomTable;
