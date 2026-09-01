const { Receipt, Voucher } = require("../models");

// GET /api/admin/dashboard (admin only)
const getAdminDashboard = async (req, res) => {
  try {
    const [pendingCount, approvedCount, rejectedCount, voucherCount] =
      await Promise.all([
        Receipt.count({ where: { status: "PENDING" } }),
        Receipt.count({ where: { status: "APPROVED" } }),
        Receipt.count({ where: { status: "REJECTED" } }),
        Voucher.count(),
      ]);

    res.json({
      pendingReceipts: pendingCount,
      approvedReceipts: approvedCount,
      rejectedReceipts: rejectedCount,
      vouchersIssued: voucherCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

module.exports = { getAdminDashboard };
