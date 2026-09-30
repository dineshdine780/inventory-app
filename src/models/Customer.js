const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    whatsappPreference: {
      type: Boolean,
      default: false,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    outstanding: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model(
  "Customer",
  customerSchema
);

module.exports = Customer;