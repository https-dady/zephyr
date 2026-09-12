const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const PendingSignup = require("../models/pendingSignup.model");
const { sendOTPEmail } = require("../services/mail.service");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const generateOTP = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

const getSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  level: user.level,
  xp: user.xp,
  currency: user.currency,
  attributes: user.attributes,
  streak: user.streak,
  isEmailVerified: user.isEmailVerified,
});


// ==========================================
// POST /api/auth/signup
// ==========================================

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check only ACTUAL registered users
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const otp = generateOTP();

    // Check whether an incomplete signup already exists
    let pendingSignup = await PendingSignup.findOne({
      email: normalizedEmail,
    });

    if (pendingSignup) {
      // Refresh existing pending signup
      pendingSignup.name = name.trim();
      pendingSignup.password = hashedPassword;
      pendingSignup.otp = otp;
      pendingSignup.otpExpires = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await pendingSignup.save();
    } else {
      // Create new pending signup
      pendingSignup = await PendingSignup.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        otp,
        otpExpires: new Date(
          Date.now() + 10 * 60 * 1000
        ),
      });
    }

    await sendOTPEmail({
      email: pendingSignup.email,
      name: pendingSignup.name,
      otp,
      purpose: "verification",
    });

    return res.status(201).json({
      success: true,
      data: {
        message:
          "Verification OTP sent to your email.",
        email: pendingSignup.email,
      },
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/verify-email
// ==========================================

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const pendingSignup =
      await PendingSignup.findOne({
        email: normalizedEmail,
      });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message:
          "No pending signup found for this email",
      });
    }

    if (
      !pendingSignup.otpExpires ||
      pendingSignup.otpExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (pendingSignup.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Safety check before creating actual user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await PendingSignup.deleteOne({
        _id: pendingSignup._id,
      });

      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // NOW create the actual registered user
    const user = await User.create({
      name: pendingSignup.name,
      email: pendingSignup.email,
      password: pendingSignup.password,
      isEmailVerified: true,
    });

    // Delete temporary signup record
    await PendingSignup.deleteOne({
      _id: pendingSignup._id,
    });

    return res.status(200).json({
      success: true,
      data: {
        message:
          "Email verified and account created successfully",
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/resend-verification-otp
// ==========================================

const resendVerificationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const pendingSignup =
      await PendingSignup.findOne({
        email: normalizedEmail,
      });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message:
          "No pending signup found for this email",
      });
    }

    const otp = generateOTP();

    pendingSignup.otp = otp;
    pendingSignup.otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pendingSignup.save();

    await sendOTPEmail({
      email: pendingSignup.email,
      name: pendingSignup.name,
      otp,
      purpose: "verification",
    });

    return res.status(200).json({
      success: true,
      data: {
        message:
          "Verification OTP sent successfully",
      },
    });
  } catch (error) {
    console.error(
      "Resend verification OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/login
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: getSafeUser(user),
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/forgot-password
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.passwordResetOTP = otp;
    user.passwordResetOTPExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp,
      purpose: "reset",
    });

    return res.status(200).json({
      success: true,
      data: {
        message:
          "Password reset OTP sent successfully",
      },
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/verify-reset-otp
// ==========================================

const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.passwordResetOTP ||
      !user.passwordResetOTPExpires ||
      user.passwordResetOTPExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: "OTP verified successfully",
      },
    });
  } catch (error) {
    console.error(
      "Verify reset OTP error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/reset-password
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const {
      email,
      otp,
      newPassword,
    } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.passwordResetOTP ||
      !user.passwordResetOTPExpires ||
      user.passwordResetOTPExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if (user.passwordResetOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    );

    user.passwordResetOTP = null;
    user.passwordResetOTPExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// ==========================================
// POST /api/auth/logout
// ==========================================

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
  });
};


// ==========================================
// GET /api/auth/me
// ==========================================

const getMe = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(
      "Get me error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


module.exports = {
  signup,
  verifyEmail,
  resendVerificationOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  logout,
  getMe,
};