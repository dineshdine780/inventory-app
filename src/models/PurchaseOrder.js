const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

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

        estimatedCost: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalEstimatedCost: {
      type: Number,
      required: true,
      min: 0,
    },

    expectedDelivery: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Sent", "Received", "Cancelled"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

const PurchaseOrder = mongoose.model(
  "PurchaseOrder",
  purchaseOrderSchema
);

module.exports = PurchaseOrder;