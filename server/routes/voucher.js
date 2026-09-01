const express = require("express");
const router = express.Router();

const {
  getMyVouchers,
  getVoucherById,
  redeemVoucher,
} = require("../controllers/voucher");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getMyVouchers);
router.get("/:id", authMiddleware, getVoucherById);
router.patch("/:id/redeem", authMiddleware, redeemVoucher);

module.exports = router;
