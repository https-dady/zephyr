const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: Number,
      default: 0,
      min: 0,
    },

    inventory: [
      {
        reward: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Reward",
          required: true,
        },

        purchasedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    attributes: {
      strength: {
        type: Number,
        default: 0,
        min: 0,
      },

      intellect: {
        type: Number,
        default: 0,
        min: 0,
      },

      discipline: {
        type: Number,
        default: 0,
        min: 0,
      },

      vitality: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },

      longest: {
        type: Number,
        default: 0,
        min: 0,
      },

      lastCompletedAt: {
        type: Date,
        default: null,
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    emailVerificationOTP: {
      type: String,
      default: null,
    },

    emailVerificationOTPExpires: {
      type: Date,
      default: null,
    },

    passwordResetOTP: {
      type: String,
      default: null,
    },

    passwordResetOTPExpires: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);