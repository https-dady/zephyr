const mongoose = require("mongoose");

const completionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    xpAwarded: {
      type: Number,
      required: true,
      min: 0,
    },

    currencyAwarded: {
      type: Number,
      required: true,
      min: 0,
    },

    attribute: {
      name: {
        type: String,
        default: null,
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CompletionLog",
  completionLogSchema
);