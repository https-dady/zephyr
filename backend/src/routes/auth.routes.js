const express = require("express");

const {
  signup,
  verifyEmail,
  resendVerificationOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
  getMe,
} = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-email", verifyEmail);

router.post(
  "/resend-verification-otp",
  resendVerificationOTP
);

router.post("/login", login);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOTP
);

router.post(
  "/reset-password",
  resetPassword
);

router.post("/logout", logout);

router.get("/me", protect, getMe);

module.exports = router;