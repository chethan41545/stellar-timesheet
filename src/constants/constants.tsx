


const STATUS_COLORS: Record<string, string> = {
    new: "#0954D5",
    "pending approval": "#FB8C00",
    pending: "#FB8C00",
    approved: "#5CD862",
    rejected: "#C62828",
    default: "#7F7F7F",
};

export const getStatusColor = (status?: string) => {
    if (!status) return STATUS_COLORS.default;
    const key = status.toLowerCase().trim();
    if (key === "new") return STATUS_COLORS.new;
    if (key.includes("pending")) return STATUS_COLORS.pending;
    if (key.includes("in progress")) return STATUS_COLORS["pending approval"];
    if (key.includes("approved")) return STATUS_COLORS.approved;
    if (key.includes("completed")) return STATUS_COLORS.approved;
    if (key.includes("reject")) return STATUS_COLORS.rejected;
    if (key.includes("not started")) return STATUS_COLORS.rejected;
    return STATUS_COLORS[key] ?? STATUS_COLORS.default;
};
