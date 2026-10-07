const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

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

    // -----------------------------
    // BASIC VALIDATION
    // -----------------------------

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

    // -----------------------------
    // START TRANSACTION
    // -----------------------------

    session.startTransaction();

    // -----------------------------
    // CHECK PRODUCTS
    // -----------------------------

    for (const item of products) {
      const product = await Product.findOne({
        _id: item.product,
        user: req.user._id,
      }).session(session);

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

      // -----------------------------
      // INCREASE STOCK
      // -----------------------------

      product.currentStock += Number(item.quantity);

      // Update latest purchase price
      product.purchasePrice = Number(item.unitCost);

      await product.save({ session });
    }

    // -----------------------------
    // CREATE PURCHASE
    // -----------------------------

    const purchase = new Purchase({
      user: req.user._id,
      supplier: supplier.trim(),
      products,
      totalAmount: Number(totalAmount),
      receivedDate,
      invoiceReference: invoiceReference?.trim() || "",
    });

    await purchase.save({ session });

// -----------------------------
// PURCHASE RECEIVED NOTIFICATION
// -----------------------------

await Notification.create(
  [
    {
      user: req.user._id,
      type: "purchase",
      title: "Purchase Received",
      message: `Purchase from ${supplier.trim()} has been recorded successfully. Total amount: ₹${Number(
        totalAmount
      )}.`,
      referenceId: purchase._id,
      referenceType: "Purchase",
      isRead: false,
    },
  ],
  { session }
);

// -----------------------------
// COMMIT
// -----------------------------

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