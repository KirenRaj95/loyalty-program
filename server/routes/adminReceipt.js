const express = require("express");
const router = express.Router();

const {
  getAllReceipts,
  getReceiptDetails,
  approveReceipt,
  rejectReceipt,
} = require("../controllers/adminReceipt");
const { authMiddleware, isAdmin } = require("../middleware/auth");

router.use(authMiddleware, isAdmin);

router.get("/receipts", getAllReceipts);
router.get("/receipts/:id", getReceiptDetails);
router.patch("/receipts/:id/approve", approveReceipt);
router.patch("/receipts/:id/reject", rejectReceipt);

module.exports = router;
