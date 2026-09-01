import { useState, useEffect } from "react";
import {
  Typography,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  Box,
  Card,
  CardContent,
  Stack,
  Tooltip,
  TextField,
  MenuItem,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/StyledTable/StyledTable";
import { getMyReceipts } from "../../utils/api_receipt";
import PageLayout from "../../components/PageLayout/PageLayout";
import StatusBadge from "../../components/StatusBadge/StatusBadge";
import ReceiptPreview from "../../components/ReceiptPreview/ReceiptPreview";
import { formatDate } from "../../utils/formatDate";

const formatAmount = (amount) => `RM ${parseFloat(amount).toFixed(2)}`;

const ReasonCell = ({ status, reason }) => {
  if (status !== "REJECTED") {
    return (
      <Typography variant="body2" color="text.disabled" align="center">
        &ndash;
      </Typography>
    );
  }
  return (
    <Tooltip title={reason || ""}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          maxWidth: 220,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {reason}
      </Typography>
    </Tooltip>
  );
};

const ReceiptHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10, sortBy, sortOrder };
        if (statusFilter) params.status = statusFilter;

        const result = await getMyReceipts(params);
        setReceipts(result.receipts);
        setPagination(result.pagination);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load receipts");
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, [page, statusFilter, sortBy, sortOrder]);

  const hasAnyFilterApplied = Boolean(statusFilter);

  return (
    <PageLayout>
      <Typography variant="h4" mb={1.5}>
        My Receipts
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Track the status of your submitted receipts.
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
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
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
          sx={{ minWidth: 170 }}
        >
          <MenuItem value="createdAt">Submission Date</MenuItem>
          <MenuItem value="purchaseDate">Purchase Date</MenuItem>
          <MenuItem value="amount">Amount</MenuItem>
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
          <MenuItem value="desc">Newest / Highest</MenuItem>
          <MenuItem value="asc">Oldest / Lowest</MenuItem>
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <CircularProgress />
      ) : receipts.length === 0 ? (
        <Alert severity="info">
          {hasAnyFilterApplied
            ? "No receipts match this filter."
            : "You haven't submitted any receipts yet."}
        </Alert>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{
              display: { xs: "none", lg: "block" },
              width: "100%",
            }}
          >
            <Table
              sx={{
                width: "100%",
                tableLayout: "fixed",
              }}
            >
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center" sx={{ width: 60 }}>
                    No.
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "14%" }}>
                    Order ID
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "14%" }}>
                    Purchase Date
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "12%" }}>
                    Amount
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "14%" }}>
                    Status
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "20%" }}>
                    Reason
                  </StyledTableCell>

                  <StyledTableCell sx={{ width: "14%" }}>
                    Submitted On
                  </StyledTableCell>

                  <StyledTableCell
                    align="center"
                    sx={{
                      width: 80,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Actions
                  </StyledTableCell>
                </StyledTableRow>
              </TableHead>

              <TableBody>
                {receipts.map((r, index) => (
                  <StyledTableRow key={r.id}>
                    {/* No. */}
                    <StyledTableCell align="center">
                      {(page - 1) * 10 + index + 1}
                    </StyledTableCell>

                    {/* Order ID */}
                    <StyledTableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {r.orderId}
                      </Typography>
                    </StyledTableCell>

                    {/* Purchase Date */}
                    <StyledTableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(r.purchaseDate)}
                    </StyledTableCell>

                    {/* Amount */}
                    <StyledTableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Typography variant="body2" fontWeight={700}>
                        {formatAmount(r.amount)}
                      </Typography>
                    </StyledTableCell>

                    {/* Status */}
                    <StyledTableCell>
                      <StatusBadge
                        status={r.status}
                        reason={r.rejectionReason}
                      />
                    </StyledTableCell>

                    {/* Reason */}
                    <StyledTableCell
                      sx={{
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      <ReasonCell
                        status={r.status}
                        reason={r.rejectionReason}
                      />
                    </StyledTableCell>

                    {/* Submitted On */}
                    <StyledTableCell
                      sx={{
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(r.createdAt)}
                    </StyledTableCell>

                    {/* Actions */}
                    <StyledTableCell
                      align="center"
                      sx={{
                        width: 80,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Tooltip title="Preview receipt">
                        <IconButton
                          size="small"
                          onClick={() => setPreviewReceipt(r)}
                          aria-label={`Preview receipt ${r.orderId}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
                    p: 2,
                    "&:last-child": {
                      pb: 2,
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
                        sx={{
                          flexShrink: 0,
                        }}
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

                    {/* Submitted On */}
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
                        Submitted On:
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          textAlign: "right",
                        }}
                      >
                        {formatDate(r.createdAt)}
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
                      mt: 2,
                      pt: 1.5,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setPreviewReceipt(r)}
                      aria-label={`Preview receipt ${r.orderId}`}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
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

      <ReceiptPreview
        open={Boolean(previewReceipt)}
        onClose={() => setPreviewReceipt(null)}
        fileUrl={previewReceipt?.fileUrl}
        orderId={previewReceipt?.orderId}
      />
    </PageLayout>
  );
};

export default ReceiptHistory;
