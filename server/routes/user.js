const express = require("express");
const multer = require("multer");

const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  logoutUser,
} = require("../controllers/user");

const { authMiddleware } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.get("/profile", authMiddleware, getUserProfile);

router.put("/profile", authMiddleware, updateUserProfile);

router.post(
  "/profile/avatar",
  authMiddleware,
  (req, res, next) => {
    upload.single("avatar")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "Please upload an avatar image smaller than 5 MB.",
          });
        }

        return res.status(400).json({
          error: err.message,
        });
      }

      if (err) {
        return res.status(400).json({
          error: err.message,
        });
      }

      next();
    });
  },
  uploadAvatar,
);

module.exports = router;
