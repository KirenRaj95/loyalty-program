require("dotenv").config();
const sequelize = require("./config");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database for seeding...");

    const existingAdmin = await User.findOne({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log("Admin account already exists. Skipping seed.");
      process.exit(0);
    }

    const admin = await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Admin account created successfully:");
    console.log(`  Email: ${admin.email}`);
    console.log(`  Role: ${admin.role}`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

seedAdmin();
