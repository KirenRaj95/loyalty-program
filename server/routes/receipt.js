const express = require("express");
const router = express.Router();

const {
  submitReceipt,
  getMyReceipts,
  getReceiptById,
} = require("../controllers/receipt");
const { authMiddleware } = require("../middleware/auth");
const receiptUpload = require("../middleware/receiptUpload");

router.post(
  "/",
  authMiddleware,
  receiptUpload.single("receipt"),
  submitReceipt,
);
router.get("/", authMiddleware, getMyReceipts);
router.get("/:id", authMiddleware, getReceiptById);

module.exports = router;
