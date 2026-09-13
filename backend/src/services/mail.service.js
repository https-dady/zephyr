const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
  timeoutInSeconds: 30,
  maxRetries: 1,
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

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Life RPG",
        email: process.env.EMAIL_USER,
      },

      to: [
        {
          email,
          name,
        },
      ],

      subject,

      htmlContent: `
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

      textContent: `
${title}

Hi ${name},

${message}

Your OTP: ${otp}

This OTP is valid for 10 minutes.

If you did not request this, you can safely ignore this email.

— Life RPG
      `,
    });

    console.log(
      "OTP email sent successfully:",
      result?.messageId
    );

    return result;
  } catch (error) {
    console.error("Brevo email error:", {
      statusCode: error?.statusCode,
      message: error?.message,
      body: error?.body,
    });

    throw new Error(
      error?.message || "Failed to send OTP email"
    );
  }
};

module.exports = {
  sendOTPEmail,
};