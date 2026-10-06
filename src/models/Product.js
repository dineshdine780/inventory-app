const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    openingStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currentStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reorderLevel: {
      type: Number,
      min: 0,
      default: 5,
    },

    reservedStock: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;