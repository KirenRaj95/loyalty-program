import { Chip, Tooltip } from "@mui/material";

const statusConfig = {
  PENDING: { label: "Pending", color: "warning" },
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  ACTIVE: { label: "Active", color: "success" },
  REDEEMED: { label: "Redeemed", color: "default" },
  EXPIRED: { label: "Expired", color: "error" },
};

const StatusBadge = ({ status, reason }) => {
  const config = statusConfig[status] || { label: status, color: "default" };
  const chip = <Chip label={config.label} color={config.color} size="small" />;

  if (status === "REJECTED" && reason) {
    return (
      <Tooltip title={reason} arrow>
        <span>{chip}</span>
      </Tooltip>
    );
  }

  return chip;
};

export default StatusBadge;
