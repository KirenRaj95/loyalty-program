const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config");

class Voucher extends Model {}

Voucher.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiptId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isRedeemed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    redeemedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Voucher",
    tableName: "vouchers",
    timestamps: true,
    updatedAt: false,
  },
);

module.exports = Voucher;
