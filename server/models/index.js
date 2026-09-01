const sequelize = require("../config");
const User = require("./User");
const Receipt = require("./Receipt");
const Voucher = require("./Voucher");

User.hasMany(Receipt, { foreignKey: "userId", onDelete: "CASCADE" });
Receipt.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Voucher, { foreignKey: "userId", onDelete: "CASCADE" });
Voucher.belongsTo(User, { foreignKey: "userId" });

Receipt.hasOne(Voucher, { foreignKey: "receiptId" });
Voucher.belongsTo(Receipt, { foreignKey: "receiptId" });

module.exports = { sequelize, User, Receipt, Voucher };
