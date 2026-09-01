import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { API_BASE_URL } from "../../utils/config";

const ReceiptPreview = ({ open, onClose, fileUrl, orderId }) => {
  if (!fileUrl) return null;

  const fullUrl = `${API_BASE_URL}${fileUrl}`;
  const isPdf = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
        Receipt {orderId ? `— ${orderId}` : ""}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        {isPdf ? (
          <iframe
            src={fullUrl}
            title="Receipt PDF"
            width="100%"
            height="600px"
            style={{ border: "none" }}
          />
        ) : (
          <Box
            component="img"
            src={fullUrl}
            alt="Receipt"
            sx={{
              display: "block",
              margin: "0 auto",
              maxWidth: "100%",
              maxHeight: "70vh",
              objectFit: "contain",
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptPreview;
