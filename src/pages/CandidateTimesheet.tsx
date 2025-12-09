// src/pages/CandidateTimesheet.tsx
import { useMemo, useState, useEffect } from "react";
import { Box, Grid, Typography } from "@mui/material";

import CustomTable from "../shared/CustomTable/CustomTable";
import CustomSkeleton from "../shared/CustomSkeleton/CustomSkeleton";
import Timesheet from "./Timesheet";
import SearchDropdown from "../shared/SearchDropdown/SearchDropdown";
import Apiservice from "../services/apiService";
import { API_ENDPOINTS } from "../constants/apiUrls";
import { CustomLoader } from "../shared/CustomLoader/CustomLoader";

export default function CandidateTimesheet() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [PAGE_SIZE, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState<string[]>([
    "Draft",
    "Pending Approval",
    "Approved",
    "Rejected",
  ]);

  // ✅ use timesheet_code as selected row id
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const STATUS_OPTIONS = useMemo(
    () =>
      ["Draft", "Pending Approval", "Approved", "Rejected"].map((s) => ({
        label: s,
        value: s,
      })),
    []
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, PAGE_SIZE]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const payload = {
        page,
        per_page: PAGE_SIZE,
      };

      const response = await Apiservice.postMethod(
        API_ENDPOINTS.CANDIDATE_TIMESHEET_SEARCH,
        payload
      );

      const apiData = response?.data?.data ?? {};
      const list = apiData?.timesheet ?? [];
      const meta = apiData?.meta ?? {};

      setRows(list);
      setTotalPages(meta.total_pages || 1);
      setSelectedCode(list[0]?.timesheet_code ?? null);
    } catch (err: any) {
      console.error(
        "Timesheet fetch failed:",
        err?.response?.data?.message || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const activeRow = useMemo(
    () => rows.find((r) => r.timesheet_code === selectedCode),
    [rows, selectedCode]
  );

  const STATUS_COLORS: Record<string, string> = {
    "pending approval": "#FB8C00",
    approved: "#5CD862",
    draft: "#0954D5",
    rejected: "#C62828",
    default: "#7F7F7F",
  };

  const getStatusColor = (status?: string) =>
    STATUS_COLORS[status?.toLowerCase() || ""] || STATUS_COLORS.default;

  const columns: any = [
    {
      id: "dateRange",
      label: "Date Range",
      width: "100%",
      format: (_: any, r: any) => (
        <div
          onClick={() => setSelectedCode(r.timesheet_code)}
          style={{ cursor: "pointer", display: "flex", flexDirection: "column" }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {r.week_start} – {r.week_end}
          </span>
          <span
            style={{
              fontSize: 12,
              color: getStatusColor(r.timesheet_status),
            }}
          >
            {r.timesheet_status}
          </span>
        </div>
      ),
    },
  ];

  const getRowProps = (r: any) => ({
    onClick: () => setSelectedCode(r.timesheet_code),
    style: { cursor: "pointer" },
  });

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setSize(newPageSize);
  };

  return (
    <Box sx={{ width: "100%", height: "100%", background: "#EDF7FA" }}>
      <Grid container sx={{ height: "100%" }}>
        {/* LEFT LIST */}
        <Grid sx={{ width: "25%", minWidth: 300, borderRight: "1px solid #ddd" }}>
          <Box p={3}>
            <Typography fontSize={26} fontWeight={700} mb={2}>
              Timesheets
            </Typography>

            <SearchDropdown
              name="status"
              values={statusFilter}
              onChange={setStatusFilter}
              multiple
              options={STATUS_OPTIONS}
              placeholder="Status"
              allSelectedHeading="Status"
            />

            <Box mt={2}>
              {loading ? (
                <CustomSkeleton height={350} />
              ) : (
                <CustomTable
                  columns={columns}
                  data={rows}
                  totalRows={rows.length}
                  defaultPage={page}
                  defaultPageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                  highlightedRowValue={selectedCode}
                  highlightedRowKey="timesheet_code"
                  highlightedColor="#E3F2FD"
                  smallFont
                  getRowProps={getRowProps}
                />
              )}
            </Box>
          </Box>
        </Grid>

        {/* RIGHT PANEL */}
        <Grid sx={{ flex: 1 }}>
          <Box p={3}>
            {activeRow ? (
             <Timesheet
  timesheetCode={activeRow.timesheet_code}
  onReloadPeriods={fetchData}
/>


            ) : (
              <Typography>Select a timesheet to view</Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <CustomLoader open={loading} message="" />
    </Box>
  );
}
