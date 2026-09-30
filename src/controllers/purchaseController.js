const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");

const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      supplier,
      products,
      totalAmount,
      receivedDate,
      invoiceReference,
    } = req.body;

    if (!supplier || !supplier.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product is required",
      });
    }

    if (totalAmount === undefined || totalAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid total amount is required",
      });
    }

    if (!receivedDate) {
      return res.status(400).json({
        success: false,
        message: "Received date is required",
      });
    }

    session.startTransaction();

    // Check products and increase stock
    for (const item of products) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (item.quantity <= 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Product quantity must be greater than 0",
        });
      }

      if (item.unitCost < 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Unit cost cannot be negative",
        });
      }

      // Increase stock
      product.currentStock += item.quantity;

      // Keep latest purchase price
      product.purchasePrice = item.unitCost;

      await product.save({ session });
    }

    // Create purchase record
    const purchase = new Purchase({
      supplier: supplier.trim(),
      products,
      totalAmount,
      receivedDate,
      invoiceReference: invoiceReference?.trim() || "",
    });

    await purchase.save({ session });

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      purchase,
      stockUpdated: true,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create purchase error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  createPurchase,
};