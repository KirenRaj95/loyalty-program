require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const { sequelize } = require("./models");

const userRoutes = require("./routes/user");
const receiptRoutes = require("./routes/receipt");
const adminReceiptRoutes = require("./routes/adminReceipt");
const voucherRoutes = require("./routes/voucher");
const dashboardRoutes = require("./routes/dashboard");
const adminDashboardRoutes = require("./routes/adminDashboard");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/vouchers", voucherRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin/dashboard", adminDashboardRoutes);

app.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send(
      "Server is running. Sequelize successfully connected to PostgreSQL.",
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Database connection failed");
  }
});

app.use("/api/users", userRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/admin", adminReceiptRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  console.log("Database synced");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
