const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

  const { data, error } = await resend.emails.send({
    from: "Life RPG <onboarding@resend.dev>",
    to: [email],
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

  if (error) {
    console.error("Resend email error:", error);
    throw new Error(error.message || "Failed to send OTP email");
  }

  console.log("OTP email sent successfully:", data?.id);

  return data;
};

module.exports = {
  sendOTPEmail,
};