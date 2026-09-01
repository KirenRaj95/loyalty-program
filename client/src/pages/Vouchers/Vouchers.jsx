import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  MenuItem,
} from "@mui/material";
import { getMyVouchers, redeemVoucher } from "../../utils/api_voucher";
import PageLayout from "../../components/PageLayout/PageLayout";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import { formatDate } from "../../utils/formatDate";
import { useSnackbar } from "notistack";

const formatAmount = (amount) => `RM ${parseFloat(amount).toFixed(2)}`;

const getVoucherStatus = (voucher) => {
  if (voucher.isRedeemed) return "REDEEMED";
  if (voucher.isExpired) return "EXPIRED";
  return "ACTIVE";
};

const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy, sortOrder };
      if (statusFilter) params.status = statusFilter;

      const result = await getMyVouchers(params);
      setVouchers(result.vouchers);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load vouchers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortBy, sortOrder]);

  const handleRedeem = async (id) => {
    setRedeemingId(id);
    setMessage("");
    setError("");
    try {
      await redeemVoucher(id);
      setMessage("Voucher redeemed successfully!");
      enqueueSnackbar("Voucher redeemed successfully!", { variant: "success" });
      fetchVouchers();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to redeem voucher";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setRedeemingId(null);
    }
  };

  const hasAnyFilterApplied = Boolean(statusFilter);

  return (
    <PageLayout>
      <Typography variant="h4" mb={1.5}>
        My Vouchers
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Vouchers issued from your approved receipts.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="REDEEMED">Redeemed</MenuItem>
          <MenuItem value="EXPIRED">Expired</MenuItem>
        </TextField>
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="createdAt">Date Issued</MenuItem>
          <MenuItem value="expiryDate">Expiry Date</MenuItem>
        </TextField>
        <TextField
          select
          label="Order"
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="desc">Newest First</MenuItem>
          <MenuItem value="asc">Oldest First</MenuItem>
        </TextField>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : vouchers.length === 0 ? (
        <Alert severity="info">
          {hasAnyFilterApplied
            ? "No vouchers match this filter."
            : "You don't have any vouchers yet. Vouchers are issued automatically once an admin approves your receipt."}
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {vouchers.map((v) => {
              const status = getVoucherStatus(v);
              const canRedeem = status === "ACTIVE";

              return (
                <Card
                  key={v.id}
                  variant="outlined"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography variant="h6" fontFamily="monospace">
                        {v.code}
                      </Typography>
                      <StatusBadge status={status} />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      From Order: {v.Receipt?.orderId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Purchase Amount:{" "}
                      {v.Receipt ? formatAmount(v.Receipt.amount) : "—"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {formatDate(v.expiryDate)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={v.isRedeemed ? "text.secondary" : "text.disabled"}
                    >
                      Redeemed on:{" "}
                      {v.isRedeemed ? formatDate(v.redeemedAt) : "—"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={!canRedeem || redeemingId === v.id}
                      onClick={() => handleRedeem(v.id)}
                    >
                      {redeemingId === v.id
                        ? "Redeeming..."
                        : canRedeem
                          ? "Redeem"
                          : status}
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </Box>

          {pagination && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Vouchers;
