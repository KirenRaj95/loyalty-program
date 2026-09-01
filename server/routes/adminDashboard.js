const express = require("express");
const router = express.Router();

const { getAdminDashboard } = require("../controllers/adminDashboard");
const { authMiddleware, isAdmin } = require("../middleware/auth");

router.get("/", authMiddleware, isAdmin, getAdminDashboard);

module.exports = router;
