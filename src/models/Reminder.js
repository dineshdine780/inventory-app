const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    reminderDate: {
      type: Date,
      required: true,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
    },

    linkedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },

    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Reminder = mongoose.model("Reminder", reminderSchema);

module.exports = Reminder;