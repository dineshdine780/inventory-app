const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    supplier: {
      type: String,
      required: true,
      trim: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        unitCost: {
          type: Number,
          required: true,
          min: 0,
        },

        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedDate: {
      type: Date,
      required: true,
    },

    invoiceReference: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;