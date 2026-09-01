const { Receipt } = require("../models");
const { Op } = require("sequelize");
const { getPagination, buildPaginationMeta } = require("../utils/paginate");

const submitReceipt = async (req, res) => {
  try {
    const { orderId, purchaseDate, amount } = req.body;

    if (!orderId || !purchaseDate || !amount) {
      return res
        .status(400)
        .json({ error: "Order ID, purchase date, and amount are required" });
    }

    const ORDER_ID_DIGITS_REGEX = /^\d{1,15}$/;

    const orderIdCandidate = orderId.trim().replace(/^ORD-/i, "");

    if (!ORDER_ID_DIGITS_REGEX.test(orderIdCandidate)) {
      return res.status(400).json({
        error: "Order ID must be 1 to 15 digits (e.g. ORD-12345)",
      });
    }

    const normalizedOrderId = `ORD-${orderIdCandidate}`;

    if (!req.file) {
      return res.status(400).json({ error: "Receipt file is required" });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const purchaseDateObj = new Date(purchaseDate);

    if (purchaseDateObj > today) {
      return res
        .status(400)
        .json({ error: "Purchase date cannot be in the future" });
    }
    if (purchaseDateObj < thirtyDaysAgo) {
      return res
        .status(400)
        .json({ error: "Purchase date must be within the last 30 days" });
    }

    const existing = await Receipt.findOne({
      where: {
        orderId: normalizedOrderId,
        status: { [Op.in]: ["PENDING", "APPROVED"] },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "A receipt with this Order ID has already been submitted",
      });
    }

    const receipt = await Receipt.create({
      userId: req.user.id,
      orderId: normalizedOrderId,
      purchaseDate,
      amount: numericAmount,
      fileUrl: `/uploads/${req.file.filename}`,
      status: "PENDING",
    });

    res.status(201).json({
      message: "Receipt submitted successfully",
      receipt,
    });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to submit receipt" });
  }
};

const getMyReceipts = async (req, res) => {
  try {
    const { status, sortBy, sortOrder } = req.query;
    const { page, limit, offset } = getPagination(req.query);

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const allowedSortFields = ["createdAt", "amount", "purchaseDate"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";

    const { count, rows } = await Receipt.findAndCountAll({
      where,
      order: [[sortField, sortDirection]],
      limit,
      offset,
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

const getReceiptById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid receipt ID" });
    }

    const receipt = await Receipt.findByPk(id);

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    if (receipt.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this receipt" });
    }

    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch receipt" });
  }
};

module.exports = { submitReceipt, getMyReceipts, getReceiptById };
