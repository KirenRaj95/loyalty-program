const nodemailer = require("nodemailer");

// Ethereal test accounts are created on the fly — we cache it so we don't
// spin up a new fake inbox on every single email sent during a server run.
let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const testAccount = await nodemailer.createTestAccount();

  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return cachedTransporter;
};

const sendReceiptStatusEmail = async ({
  to,
  name,
  orderId,
  status,
  reason,
}) => {
  // Users can register with phone only — no email on file means nothing to send
  if (!to) {
    console.log(`Skipped email: user "${name}" has no email on file.`);
    return null;
  }

  try {
    const transporter = await getTransporter();

    const isApproved = status === "APPROVED";
    const subject = isApproved
      ? `Your receipt ${orderId} has been approved!`
      : `Your receipt ${orderId} was rejected`;

    const html = isApproved
      ? `
        <p>Hi ${name},</p>
        <p>Good news — your receipt for order <strong>${orderId}</strong> has been approved.</p>
        <p>A voucher has been issued to your account. You can view it on your Vouchers page.</p>
      `
      : `
        <p>Hi ${name},</p>
        <p>Your receipt for order <strong>${orderId}</strong> was not approved.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>You're welcome to submit a corrected receipt if you believe this was an error.</p>
      `;

    const info = await transporter.sendMail({
      from: '"Loyalty Program" <noreply@loyaltyprogram.test>',
      to,
      subject,
      html,
    });

    // Ethereal doesn't deliver to a real inbox — this URL is how you view the sent email
    console.log(`Email sent. Preview: ${nodemailer.getTestMessageUrl(info)}`);
    return info;
  } catch (err) {
    // Email failure should never break the actual approve/reject business logic
    console.error("Failed to send email:", err.message);
    return null;
  }
};

module.exports = { sendReceiptStatusEmail };
