const express = require("express");
const router = express.Router();

const { getUserDashboard } = require("../controllers/dashboard");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, getUserDashboard);

module.exports = router;
