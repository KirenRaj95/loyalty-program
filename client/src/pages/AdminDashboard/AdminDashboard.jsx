import { useState, useEffect } from "react";
import { Typography, Box, Paper, CircularProgress, Alert } from "@mui/material";
import { getAdminDashboard } from "../../utils/api_dashboard";
import PageLayout from "../../components/PageLayout/PageLayout";

const StatCard = ({ label, value, color }) => (
  <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
    <Typography variant="h3" color={color} fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body1" color="text.secondary" mt={1}>
      {label}
    </Typography>
  </Paper>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getAdminDashboard();
        setData(result);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <CircularProgress />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Alert severity="error">{error}</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Typography variant="h4" mb={1}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Overview of all receipts and vouchers across the platform.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <StatCard
          label="Pending Receipts"
          value={data.pendingReceipts}
          color="warning.main"
        />
        <StatCard
          label="Approved Receipts"
          value={data.approvedReceipts}
          color="success.main"
        />
        <StatCard
          label="Rejected Receipts"
          value={data.rejectedReceipts}
          color="error.main"
        />
        <StatCard
          label="Vouchers Issued"
          value={data.vouchersIssued}
          color="primary.main"
        />
      </Box>
    </PageLayout>
  );
};

export default AdminDashboard;
