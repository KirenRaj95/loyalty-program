const { Receipt, Voucher, User } = require("../models");
const { Op } = require("sequelize");

const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [pendingCount, approvedCount, rejectedCount, availableVoucherCount] =
      await Promise.all([
        Receipt.count({ where: { userId: req.user.id, status: "PENDING" } }),
        Receipt.count({ where: { userId: req.user.id, status: "APPROVED" } }),
        Receipt.count({ where: { userId: req.user.id, status: "REJECTED" } }),
        Voucher.count({
          where: {
            userId: req.user.id,
            isRedeemed: false,
            expiryDate: { [Op.gte]: new Date() },
          },
        }),
      ]);

    res.json({
      welcomeMessage: `Welcome back, ${user.name}!`,
      pendingReceipts: pendingCount,
      approvedReceipts: approvedCount,
      rejectedReceipts: rejectedCount,
      availableVouchers: availableVoucherCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

module.exports = { getUserDashboard };
