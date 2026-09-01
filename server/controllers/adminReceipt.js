const { Receipt, Voucher, User } = require("../models");
const { Op } = require("sequelize");
const generateVoucherCode = require("../utils/generateVoucherCode");
const { getPagination, buildPaginationMeta } = require("../utils/paginate");
const { sendReceiptStatusEmail } = require("../utils/mailer");

const getAllReceipts = async (req, res) => {
  try {
    const {
      status,
      userId,
      search,
      sortBy,
      sortOrder,
      amountMin,
      amountMax,
      dateFrom,
      dateTo,
    } = req.query;
    const { page, limit, offset } = getPagination(req.query);

    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (search) {
      where[Op.or] = [
        { orderId: { [Op.iLike]: `%${search}%` } },
        { "$User.name$": { [Op.iLike]: `%${search}%` } },
        { "$User.email$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (amountMin || amountMax) {
      where.amount = {};
      if (amountMin) where.amount[Op.gte] = parseFloat(amountMin);
      if (amountMax) where.amount[Op.lte] = parseFloat(amountMax);
    }

    if (dateFrom || dateTo) {
      where.purchaseDate = {};
      if (dateFrom) where.purchaseDate[Op.gte] = dateFrom;
      if (dateTo) where.purchaseDate[Op.lte] = dateTo;
    }

    const sortMap = {
      createdAt: ["createdAt"],
      amount: ["amount"],
      purchaseDate: ["purchaseDate"],
      orderId: ["orderId"],
      userName: [{ model: User }, "name"],
    };
    const sortField = sortMap[sortBy] || sortMap.createdAt;
    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";

    const { count, rows } = await Receipt.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [[...sortField, sortDirection]],
      limit,
      offset,
      subQuery: false,
    });

    res.json({
      receipts: rows,
      pagination: buildPaginationMeta(count, page, limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
};

const getReceiptDetails = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid receipt ID" });
    }

    const receipt = await Receipt.findByPk(id);
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
};

const approveReceipt = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid receipt ID" });
    }

    const receipt = await Receipt.findByPk(id, { include: [{ model: User }] });
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (receipt.status !== "PENDING") {
      return res.status(409).json({
        error: `Receipt has already been ${receipt.status.toLowerCase()}`,
      });
    }

    receipt.status = "APPROVED";
    await receipt.save();

    const voucher = await Voucher.create({
      userId: receipt.userId,
      receiptId: receipt.id,
      code: generateVoucherCode(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // Fire-and-forget: to prevent email sending delay or break the response
    sendReceiptStatusEmail({
      to: receipt.User?.email,
      name: receipt.User?.name,
      orderId: receipt.orderId,
      status: "APPROVED",
    });

    res.json({
      message: "Receipt approved and voucher issued",
      receipt,
      voucher,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ error: "A voucher already exists for this receipt" });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to approve receipt" });
  }
};

const rejectReceipt = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid receipt ID" });
    }

    const { reason } = req.body;

    const receipt = await Receipt.findByPk(id, { include: [{ model: User }] });
    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (receipt.status !== "PENDING") {
      return res.status(409).json({
        error: `Receipt has already been ${receipt.status.toLowerCase()}`,
      });
    }

    receipt.status = "REJECTED";
    receipt.rejectionReason = reason || null;
    await receipt.save();

    sendReceiptStatusEmail({
      to: receipt.User?.email,
      name: receipt.User?.name,
      orderId: receipt.orderId,
      status: "REJECTED",
      reason: receipt.rejectionReason,
    });

    res.json({
      message: "Receipt rejected",
      receipt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject receipt" });
  }
};

module.exports = {
  getAllReceipts,
  getReceiptDetails,
  approveReceipt,
  rejectReceipt,
};
