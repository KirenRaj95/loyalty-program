import { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Box,
  Card,
  CardContent,
  Stack,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getAllReceipts,
  approveReceipt,
  rejectReceipt,
} from "../../utils/api_admin";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/StyledTable/StyledTable";
import PageLayout from "../../components/PageLayout/PageLayout";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import ReceiptPreview from "../../components/ReceiptPreview/ReceiptPreview";
import { useSnackbar } from "notistack";
import { formatDate } from "../../utils/formatDate";

const REJECTION_REASON_MAX_LENGTH = 100;

const formatAmount = (amount) => `RM ${parseFloat(amount).toFixed(2)}`;

const AdminReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const fetchReceipts = async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        page: overrides.page ?? page,
        limit: 10,
        sortBy: overrides.sortBy ?? sortBy,
        sortOrder: overrides.sortOrder ?? sortOrder,
      };

      const statusVal =
        overrides.status !== undefined ? overrides.status : statusFilter;
      if (statusVal) params.status = statusVal;

      const searchVal =
        overrides.search !== undefined ? overrides.search : search;
      if (searchVal) params.search = searchVal;

      const amountMinVal =
        overrides.amountMin !== undefined ? overrides.amountMin : amountMin;
      if (amountMinVal) params.amountMin = amountMinVal;

      const amountMaxVal =
        overrides.amountMax !== undefined ? overrides.amountMax : amountMax;
      if (amountMaxVal) params.amountMax = amountMaxVal;

      const dateFromVal =
        overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom;
      if (dateFromVal) params.dateFrom = dateFromVal;

      const dateToVal =
        overrides.dateTo !== undefined ? overrides.dateTo : dateTo;
      if (dateToVal) params.dateTo = dateToVal;

      const result = await getAllReceipts(params);
      setReceipts(result.receipts);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReceipts();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setAmountMin("");
    setAmountMax("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);

    fetchReceipts({
      page: 1,
      status: "",
      search: "",
      amountMin: "",
      amountMax: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog(null);
    setRejectionReason("");
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { id, action } = confirmDialog;
    const trimmedReason = rejectionReason.trim();

    if (action === "reject" && !trimmedReason) {
      setError("Please provide a reason for rejecting this receipt.");
      return;
    }

    setActioningId(id);
    setError("");
    setMessage("");
    enqueueSnackbar(
      action === "approve"
        ? "Receipt approved and voucher issued."
        : "Receipt rejected.",
      { variant: "success" },
    );
    setConfirmDialog(null);

    try {
      if (action === "approve") {
        await approveReceipt(id);
        setMessage("Receipt approved and voucher issued.");
      } else {
        await rejectReceipt(id, trimmedReason);
        setMessage("Receipt rejected.");
      }
      setRejectionReason("");
      fetchReceipts();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} receipt`);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <PageLayout>
      <Typography variant="h4" mb={3}>
        Receipt Validation
      </Typography>

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

      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
          alignItems: "end",
        }}
      >
        <TextField
          label="Search Name, Email, or Order ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          fullWidth
          sx={{ gridColumn: "1 / -1" }}
        />

        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          size="small"
          fullWidth
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
        </TextField>

        <TextField
          label="Min Amount"
          type="number"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ step: "0.01" }}
        />
        <TextField
          label="Max Amount"
          type="number"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ step: "0.01" }}
        />

        <TextField
          label="Purchase Date From"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Purchase Date To"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Sort By"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          size="small"
          fullWidth
        >
          <MenuItem value="createdAt">Submission Date</MenuItem>
          <MenuItem value="purchaseDate">Purchase Date</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
          <MenuItem value="orderId">Order ID</MenuItem>
          <MenuItem value="userName">Submitter Name</MenuItem>
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
          fullWidth
        >
          <MenuItem value="desc">Newest / Highest</MenuItem>
          <MenuItem value="asc">Oldest / Lowest</MenuItem>
        </TextField>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignSelf: "flex-end",
            mb: "10px",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            size="small"
            sx={{ flex: 1, height: 40, whiteSpace: "nowrap" }}
          >
            Apply Filters
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
            size="small"
            sx={{ flex: 1, height: 40, whiteSpace: "nowrap" }}
          >
            Clear
          </Button>
        </Box>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : receipts.length === 0 ? (
        <Alert severity="info">No receipts match your filters.</Alert>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              display: { xs: "none", lg: "block" },
              width: "100%",
            }}
          >
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">No.</StyledTableCell>
                  <StyledTableCell
                    sx={{
                      maxWidth: 180,
                      overflowWrap: "anywhere",
                    }}
                  >
                    Order ID
                  </StyledTableCell>
                  <StyledTableCell>Submitted By</StyledTableCell>
                  <StyledTableCell>Purchase Date</StyledTableCell>
                  <StyledTableCell>Amount</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </StyledTableRow>
              </TableHead>

              <TableBody>
                {receipts.map((r, index) => (
                  <StyledTableRow key={r.id}>
                    <StyledTableCell align="center">
                      {(page - 1) * 10 + index + 1}
                    </StyledTableCell>

                    <StyledTableCell
                      sx={{
                        maxWidth: 180,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {r.orderId}
                    </StyledTableCell>

                    <StyledTableCell>
                      <Typography variant="body2">{r.User?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.User?.email || r.User?.phone}
                      </Typography>
                    </StyledTableCell>

                    <StyledTableCell>
                      {formatDate(r.purchaseDate)}
                    </StyledTableCell>

                    <StyledTableCell>{formatAmount(r.amount)}</StyledTableCell>

                    <StyledTableCell>
                      <StatusBadge
                        status={r.status}
                        reason={r.rejectionReason}
                      />
                    </StyledTableCell>

                    <StyledTableCell
                      align="center"
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      <Box
                        display="flex"
                        gap={0.5}
                        justifyContent="center"
                        flexWrap="nowrap"
                      >
                        <Tooltip title="Preview receipt">
                          <IconButton
                            size="small"
                            onClick={() => setPreviewReceipt(r)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {r.status === "PENDING" ? (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                disabled={actioningId === r.id}
                                onClick={() =>
                                  setConfirmDialog({
                                    id: r.id,
                                    action: "approve",
                                  })
                                }
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={actioningId === r.id}
                                onClick={() =>
                                  setConfirmDialog({
                                    id: r.id,
                                    action: "reject",
                                  })
                                }
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack
            spacing={2}
            sx={{
              display: { xs: "flex", lg: "none" },
              width: "100%",
            }}
          >
            {receipts.map((r) => (
              <Card
                key={r.id}
                variant="outlined"
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    "&:last-child": {
                      pb: { xs: 2, sm: 2.5 },
                    },
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1.5,
                      mb: 2,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      sx={{
                        minWidth: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.orderId}
                    </Typography>

                    <Box
                      sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <StatusBadge
                        status={r.status}
                        reason={r.rejectionReason}
                      />
                    </Box>
                  </Box>

                  {/* Receipt Details */}
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: {
                          xs: "column",
                          sm: "row",
                        },
                        gap: {
                          xs: 0.25,
                          sm: 1,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        Submitted By:
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflowWrap: "anywhere",
                          minWidth: 0,
                        }}
                      >
                        {r.User?.name || "Unknown User"} (
                        {r.User?.email ||
                          r.User?.phone ||
                          "No contact information"}
                        )
                      </Typography>
                    </Box>

                    {/* Purchase Date */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Purchase Date:
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: "right",
                        }}
                      >
                        {formatDate(r.purchaseDate)}
                      </Typography>
                    </Box>

                    {/* Amount */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Amount:
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatAmount(r.amount)}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Rejection Reason */}
                  {r.status === "REJECTED" && r.rejectionReason && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        mt: 2,
                        p: 1.25,
                        border: 1,
                        borderColor: "error.main",
                        borderRadius: 1.5,
                        bgcolor: "error.lighter",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <CancelIcon
                        color="error"
                        fontSize="small"
                        sx={{
                          mt: "2px",
                          flexShrink: 0,
                        }}
                      />

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={700}
                          display="block"
                          sx={{
                            mb: 0.25,
                          }}
                        >
                          Rejection Reason
                        </Typography>

                        <Typography
                          variant="body2"
                          color="error.main"
                          sx={{
                            minWidth: 0,
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                            lineHeight: 1.5,
                          }}
                        >
                          {r.rejectionReason}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 2,
                      pt: 1.5,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setPreviewReceipt(r)}
                      aria-label="View receipt"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {r.status === "PENDING" && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          disabled={actioningId === r.id}
                          onClick={() =>
                            setConfirmDialog({
                              id: r.id,
                              action: "approve",
                            })
                          }
                          aria-label="Approve receipt"
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          disabled={actioningId === r.id}
                          onClick={() =>
                            setConfirmDialog({
                              id: r.id,
                              action: "reject",
                            })
                          }
                          aria-label="Reject receipt"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
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

      <Dialog open={Boolean(confirmDialog)} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog?.action === "approve"
            ? "Approve this receipt?"
            : "Reject this receipt?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog?.action === "approve"
              ? "This will approve the receipt and automatically issue a voucher to the user. This cannot be undone."
              : "This will reject the receipt. No voucher will be issued. This cannot be undone."}
          </Typography>

          {confirmDialog?.action === "reject" && (
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              label="Reason for rejection"
              placeholder="e.g. Receipt image is blurry, amount doesn't match order"
              value={rejectionReason}
              onChange={(e) =>
                setRejectionReason(
                  e.target.value.slice(0, REJECTION_REASON_MAX_LENGTH),
                )
              }
              helperText={`${rejectionReason.length}/${REJECTION_REASON_MAX_LENGTH} characters`}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            variant="contained"
            color={confirmDialog?.action === "approve" ? "success" : "error"}
            onClick={handleConfirmAction}
            disabled={
              confirmDialog?.action === "reject" && !rejectionReason.trim()
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <ReceiptPreview
        open={Boolean(previewReceipt)}
        onClose={() => setPreviewReceipt(null)}
        fileUrl={previewReceipt?.fileUrl}
        orderId={previewReceipt?.orderId}
      />
    </PageLayout>
  );
};

export default AdminReceipts;
