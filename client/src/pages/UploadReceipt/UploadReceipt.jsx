import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Paper,
  InputLabel,
  InputAdornment,
  Avatar,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { submitReceipt } from "../../utils/api_receipt";
import PageLayout from "../../components/PageLayout/PageLayout";
import { useSnackbar } from "notistack";

const ORDER_ID_MAX_DIGITS = 15;

const UploadReceipt = () => {
  const [orderIdDigits, setOrderIdDigits] = useState(""); // just the digits after "ORD-"
  const [purchaseDate, setPurchaseDate] = useState("");
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
  const minDate = thirtyDaysAgoDate.toISOString().split("T")[0];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
    }
  };

  // To prevent endless string.
  const handleOrderIdChange = (e) => {
    const digitsOnly = e.target.value
      .replace(/\D/g, "")
      .slice(0, ORDER_ID_MAX_DIGITS);
    setOrderIdDigits(digitsOnly);
  };

  const handleAmountChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");

    if (digitsOnly === "") {
      setAmount("");
      return;
    }

    const trimmedDigits = digitsOnly.slice(0, 10);
    const cents = parseInt(trimmedDigits, 10);
    setAmount((cents / 100).toFixed(2));
  };

  const resetForm = () => {
    setOrderIdDigits("");
    setPurchaseDate("");
    setAmount("");
    setFile(null);
    setFileName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      const errorMessage = "Please attach a receipt file.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      return;
    }

    if (file.size >= 10 * 1024 * 1024) {
      const errorMessage = "Please upload a receipt file smaller than 10 MB.";

      setError(errorMessage);
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      return;
    }

    if (!orderIdDigits) {
      const errorMessage = "Please enter the Order ID number.";
      setError(errorMessage);
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const orderId = `ORD-${orderIdDigits}`;

      await submitReceipt({
        orderId,
        purchaseDate,
        amount,
        file,
      });

      const successMessage =
        "Receipt submitted successfully! It is now pending review.";

      setSuccess(successMessage);

      enqueueSnackbar(successMessage, {
        variant: "success",
      });

      resetForm();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to submit receipt";

      setError(errorMessage);

      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="h4" mb={1} textAlign="center">
          Upload Receipt
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          mb={5}
          textAlign="center"
          maxWidth={420}
        >
          Submit your purchase receipt for review. Once approved, a voucher will
          be issued to your account automatically.
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 480,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mb: 3,
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <ReceiptLongIcon />
            </Avatar>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}{" "}
              <Button
                size="small"
                onClick={() => navigate("/receipts")}
                sx={{ ml: 1 }}
              >
                View My Receipts
              </Button>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Order ID"
              type="text"
              value={orderIdDigits}
              onChange={handleOrderIdChange}
              required
              fullWidth
              placeholder="12345"
              helperText={`${orderIdDigits.length}/${ORDER_ID_MAX_DIGITS} digits`}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">ORD-</InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: "numeric",
                },
              }}
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              fullWidth
              helperText="Must be within the last 30 days"
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { max: today, min: minDate },
              }}
            />
            <TextField
              label="Purchase Amount"
              type="text"
              value={amount}
              onChange={handleAmountChange}
              required
              fullWidth
              placeholder="0.00"
              helperText="Input the receipt amount)"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">RM</InputAdornment>
                  ),
                },
                htmlInput: {
                  inputMode: "numeric",
                },
              }}
            />

            <Box mt={3} mb={1}>
              <InputLabel shrink sx={{ mb: 0.5 }}>
                Receipt File
              </InputLabel>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  textTransform: "none",
                  overflow: "hidden",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName || "Choose File (JPEG, PNG, or PDF)"}
                </Typography>

                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                />
              </Button>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.75,
                }}
              >
                Accepted formats: JPEG, PNG, or PDF. Maximum file size: 10 MB.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Receipt"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default UploadReceipt;
