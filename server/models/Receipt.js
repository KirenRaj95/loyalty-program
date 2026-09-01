const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config");

class Receipt extends Model {}

Receipt.init(
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
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
      defaultValue: "PENDING",
      allowNull: false,
    },
    rejectionReason: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: { len: [0, 100] },
    },
  },
  {
    sequelize,
    modelName: "Receipt",
    tableName: "receipts",
    timestamps: true,
  },
);

module.exports = Receipt;
