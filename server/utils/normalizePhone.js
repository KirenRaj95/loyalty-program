// Cleans and standardizes a raw phone input into Malaysian +60 format.
// Handles: spaces/dashes, an accidentally-typed leading 0, or an accidentally-typed 60/+60 prefix.
const normalizePhone = (rawPhone) => {
  if (!rawPhone) return null;

  let digits = rawPhone.replace(/\D/g, ""); // strip everything except digits

  if (digits.startsWith("60")) {
    digits = digits.slice(2); // strip country code if user typed it themselves
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1); // strip local trunk prefix
  }

  return `+60${digits}`;
};

module.exports = normalizePhone;
