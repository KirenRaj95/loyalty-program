const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const User = require("../models/User");
const normalizePhone = require("../utils/normalizePhone");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  address: user.address,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Name and password are required" });
    }
    if (!email && !phone) {
      return res
        .status(400)
        .json({ error: "Either email or phone is required" });
    }

    const normalizedPhone = phone ? normalizePhone(phone) : null;

    const user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      password,
    });
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email or phone already in use" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res
        .status(400)
        .json({ error: "Email or phone, and password are required" });
    }

    let user;
    if (email) {
      user = await User.findOne({ where: { email } });
    } else {
      const normalizedPhone = normalizePhone(phone);
      user = await User.findOne({ where: { phone: normalizedPhone } });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, phone, address } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone ? normalizePhone(phone) : null;
    if (address !== undefined) user.address = address;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email or phone already in use" });
    }
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatar: user.avatar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
};

const logoutUser = (req, res) => {
  res.json({
    message: "Logout successful. Please discard your token client-side.",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  logoutUser,
};
