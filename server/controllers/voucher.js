const { Voucher, Receipt } = require("../models");
const { getPagination, buildPaginationMeta } = require("../utils/paginate");

const isExpired = (voucher) => new Date(voucher.expiryDate) < new Date();

const getMyVouchers = async (req, res) => {
  try {
    const { status, sortBy, sortOrder } = req.query;
    const { page, limit, offset } = getPagination(req.query);

    const where = { userId: req.user.id };
    if (status === "REDEEMED") {
      where.isRedeemed = true;
    } else if (status === "ACTIVE") {
      where.isRedeemed = false;
      where.expiryDate = { [require("sequelize").Op.gte]: new Date() };
    } else if (status === "EXPIRED") {
      where.isRedeemed = false;
      where.expiryDate = { [require("sequelize").Op.lt]: new Date() };
    }

    const allowedSortFields = ["createdAt", "expiryDate"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC";

    const { count, rows } = await Voucher.findAndCountAll({
      where,
      include: [
        {
          model: Receipt,
          attributes: ["id", "orderId", "purchaseDate", "amount"],
        },
      ],
      order: [[sortField, sortDirection]],
      limit,
      offset,
    });

    const vouchers = rows.map((v) => ({
      ...v.toJSON(),
      isExpired: isExpired(v),
    }));

    res.json({
      vouchers,
      pagination: buildPaginationMeta(count, page, limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch vouchers" });
  }
};

const getVoucherById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const voucher = await Voucher.findByPk(id, {
      include: [
        {
          model: Receipt,
          attributes: ["id", "orderId", "purchaseDate", "amount"],
        },
      ],
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    if (voucher.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this voucher" });
    }

    res.json({ ...voucher.toJSON(), isExpired: isExpired(voucher) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch voucher" });
  }
};

const redeemVoucher = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid voucher ID" });
    }

    const voucher = await Voucher.findByPk(id);

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    if (voucher.userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this voucher" });
    }

    if (voucher.isRedeemed) {
      return res
        .status(409)
        .json({ error: "Voucher has already been redeemed" });
    }

    if (isExpired(voucher)) {
      return res
        .status(409)
        .json({ error: "Voucher has expired and cannot be redeemed" });
    }

    voucher.isRedeemed = true;
    voucher.redeemedAt = new Date();
    await voucher.save();

    res.json({
      message: "Voucher redeemed successfully",
      voucher,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to redeem voucher" });
  }
};

module.exports = { getMyVouchers, getVoucherById, redeemVoucher };
