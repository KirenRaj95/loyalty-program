const crypto = require("crypto");

// Generates something like "VC-7F3A9B2C"
const generateVoucherCode = () => {
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `VC-${randomPart}`;
};

module.exports = generateVoucherCode;
