const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

const createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      customer,
      products,
      totalAmount,
      paidAmount,
      paymentStatus,
      dueDate,
    } = req.body;

    // Basic validation
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
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

    if (paidAmount === undefined || paidAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid paid amount is required",
      });
    }

    if (paidAmount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Paid amount cannot be greater than total amount",
      });
    }

    // Start transaction
    session.startTransaction();

    // Check customer
    const existingCustomer = await Customer.findById(customer).session(
      session
    );

    if (!existingCustomer) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check every product and stock
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

      if (product.currentStock < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.productName}. Available stock: ${product.currentStock}`,
        });
      }

      // Decrease stock
      product.currentStock -= item.quantity;

      await product.save({ session });
    }

    // Calculate new outstanding amount
    const outstandingAmount = Math.max(
      totalAmount - paidAmount,
      0
    );

    // Update customer outstanding
    existingCustomer.outstanding += outstandingAmount;

    await existingCustomer.save({ session });

    // Create sale
    const sale = new Sale({
      customer,
      products,
      totalAmount,
      paidAmount,
      paymentStatus: paymentStatus || "Due",
      dueDate: dueDate || null,
    });

    await sale.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale,
      stockUpdated: true,
      customerOutstandingAdded: outstandingAmount,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error("Create sale error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


const getSalesByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const sales = await Sale.find({
      customer: customerId,
    })
      .populate("customer", "name phone")
      .populate("products.product", "productName category sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    console.error("Get customer sales error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer sales",
    });
  }
};


module.exports = {
  createSale,
  getSalesByCustomer,
};