// StatusLog.tsx
import { useEffect, useMemo, useState } from "react";
import { Box, Tooltip, Typography } from "@mui/material";
import Apiservice from "../../services/apiService";

// Reusable components (adjust paths if needed)
import CustomSkeleton from "../../shared/CustomSkeleton/CustomSkeleton";
import CustomTable from "../../shared/CustomTable/CustomTable";
import { customScrollbar } from "../../shared/Styles/CommonStyles";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../constants/apiUrls";

type StatusLogItemAPI = {
  before?: string;
  after?: string;
  changedBy?: string;
  reason?: string;
  changedAt?: string; // ISO timestamp or date string
};

type StatusLogRow = {
  before: string;
  after: string;
  changedBy: string;
  reason: string;
  changedAt: string;
};

type StatusLogProps = {
  requisitionId?: string | number;
  candidateId?: string | number;
  baseUrl?: string;
  title?: string;
  className?: string;
  maxHeight?: number | string;
  pageSize?: number;
  dense?: boolean;
};

function mapToRow(item: StatusLogItemAPI): StatusLogRow {
  return {
    before: item.before ?? "-",
    after: item.after ?? "-",
    changedBy: item.changedBy ?? "-",
    reason: item.reason ?? "-",
    changedAt: item.changedAt ?? "-",
  };
}

// Adapt API item -> internal shape
const adaptApiItem = (raw: any): StatusLogItemAPI => ({
  before: raw?.oldStatus ?? "-",
  after: raw?.newStatus ?? "-",
  changedBy: raw?.changedBy ?? "-",
  reason: raw?.comment ?? "-",
  changedAt: raw?.changedOn ?? "",
});

export default function StatusLog({
  requisitionId,
  candidateId,
  baseUrl = API_ENDPOINTS.STATUS_HISTORY,
  className,
  maxHeight = 360,
  pageSize = 10,
}: StatusLogProps) {
  const [rows, setRows] = useState<StatusLogRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);

  const canQuery = useMemo(
    () => Boolean(requisitionId) || Boolean(candidateId),
    [requisitionId, candidateId]
  );

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!canQuery) {
        setRows([]);
        return;
      }
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (requisitionId != null && requisitionId !== "") qs.set("requisitionId", String(requisitionId));
        if (candidateId != null && candidateId !== "") qs.set("candidateId", String(candidateId));
        const url = `${baseUrl}?${qs.toString()}`;

        const res = await Apiservice.getMethod(url);

        const listRaw: any[] = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.items)
          ? res.data.items
          : [];

        const list: StatusLogItemAPI[] = listRaw.map(adaptApiItem);

        if (!ignore) setRows(list.map(mapToRow));
      } catch (e: any) {
        if (!ignore) toast.error("Failed to load status history");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [requisitionId, candidateId, baseUrl, canQuery]);

  // Columns (all non-sortable now)
  const columns = [
    {
      id: "before",
      label: "Previous Status",
      width: "160px",
      sortable: false,
      format: (val: string) => (
        <Tooltip title={val} arrow>
          <span style={{padding:'5px 0',fontSize: 12}}>{val}</span>
        </Tooltip>
      ),
    },
    {
      id: "after",
      label: "New Status",
      width: "160px",
      sortable: false,
      format: (val: string) => (
        <Tooltip title={val} arrow>
          <span style={{padding:'5px 0',fontSize: 12}}>{val}</span>
        </Tooltip>
      ),
    },
    {
      id: "changedBy",
      label: "Changed By",
      width: "160px",
      sortable: false,
      format: (val: string) => (
        <Tooltip title={val} arrow>
          <span style={{padding:'5px 0',fontSize: 12}}>{val}</span>
        </Tooltip>
      ),
    },
    {
      id: "reason",
      label: "Reason/Comment",
      width: "auto",
      sortable: false,
      format: (val: string) => (
        <Tooltip title={val} arrow>
          <span
            style={{
              display: "inline-block",
              maxWidth: 420,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: '5px 0',
              fontSize: 12
            }}
          >
            {val}
          </span>
        </Tooltip>
      ),
    },
    {
      id: "changedAt",
      label: "Updated At",
      width: "180px",
      sortable: false, // ← not sortable anymore
    },
  ];

  return (
    <Box className={className} sx={{ maxHeight, overflow: "auto", ...customScrollbar }}>
      {!canQuery && (
        <Typography variant="body2" color="text.secondary">
          Provide a Requisition ID or Candidate ID to view the status history.
        </Typography>
      )}

      {canQuery && loading && <CustomSkeleton height={240} />}

      {canQuery && !loading && rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No history found.
        </Typography>
      )}

      {canQuery && !loading && rows.length > 0 && (
        <CustomTable<any>
          columns={columns}
          data={rows}
          totalRows={rows.length}
          defaultPage={page}
          defaultPageSize={size}
          onPageChange={(newPage: number, newSize: number) => {
            setPage(newPage);
            setSize(newSize);
          }}
        />
      )}
    </Box>
  );
}
