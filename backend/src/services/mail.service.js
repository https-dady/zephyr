const dns = require("node:dns");
const nodemailer = require("nodemailer");

// Render production environment may prefer IPv6 DNS results,
// but the current SMTP connection needs to use IPv4.
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  dnsTimeout: 30000,
});

const sendOTPEmail = async ({
  email,
  name,
  otp,
  purpose,
}) => {
  const isVerification = purpose === "verification";

  const subject = isVerification
    ? "Verify your Life RPG account"
    : "Life RPG password reset OTP";

  const title = isVerification
    ? "Verify your account"
    : "Reset your password";

  const message = isVerification
    ? "Use the OTP below to verify your Life RPG account."
    : "Use the OTP below to reset your Life RPG password.";

  await transporter.sendMail({
    from: `"Life RPG" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
        <h2>${title}</h2>

        <p>Hi ${name},</p>

        <p>${message}</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          padding: 20px;
          background: #f5f5f5;
          text-align: center;
          margin: 24px 0;
        ">
          ${otp}
        </div>

        <p>This OTP is valid for 10 minutes.</p>

        <p>If you did not request this, you can safely ignore this email.</p>

        <p>— Life RPG</p>
      </div>
    `,
  });
};

module.exports = {
  sendOTPEmail,
};