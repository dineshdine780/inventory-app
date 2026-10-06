const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// ==========================================
// CREATE PAYMENT
// ==========================================

const createPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      customer,
      sale,
      amount,
      paymentMethod,
      paymentDate,
      notes,
    } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !customer ||
      amount === undefined ||
      amount === null ||
      amount === "" ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer, amount and payment method are required",
      });
    }

    if (!mongoose.isValidObjectId(customer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const paymentAmount = Number(amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    // ----------------------------------------
    // FIND CUSTOMER FOR CURRENT USER
    // ----------------------------------------

    const customerData = await Customer.findOne({
      _id: customer,
      user: req.user._id,
    }).session(session);

    if (!customerData) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const outstanding = Number(customerData.outstanding || 0);

    // Payment cannot exceed total outstanding
    if (paymentAmount > outstanding) {
      return res.status(400).json({
        success: false,
        message: `Payment amount cannot exceed outstanding balance of ₹${outstanding}`,
      });
    }

    let saleData = null;

    // ----------------------------------------
    // VALIDATE SALE
    // ----------------------------------------

    if (sale) {
      if (!mongoose.isValidObjectId(sale)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sale ID",
        });
      }

      saleData = await Sale.findOne({
        _id: sale,
        customer,
        user: req.user._id,
      }).session(session);

      if (!saleData) {
        return res.status(404).json({
          success: false,
          message: "Sale not found for this customer",
        });
      }

      const saleTotal = Number(saleData.totalAmount || 0);
      const salePaid = Number(saleData.paidAmount || 0);
      const saleDue = Math.max(
        saleTotal - salePaid,
        0
      );

      // Prevent overpaying this sale
      if (paymentAmount > saleDue) {
        return res.status(400).json({
          success: false,
          message: `Payment amount cannot exceed this sale's remaining balance of ₹${saleDue}`,
        });
      }

      // Update sale payment
      saleData.paidAmount =
        salePaid + paymentAmount;

      if (saleData.paidAmount >= saleTotal) {
        saleData.paidAmount = saleTotal;
        saleData.paymentStatus = "Paid";
      } else if (saleData.paidAmount > 0) {
        saleData.paymentStatus = "Partial";
      } else {
        saleData.paymentStatus = "Due";
      }

      await saleData.save({ session });
    }

    // ----------------------------------------
    // CREATE PAYMENT
    // ----------------------------------------

    const createdPayments = await Payment.create(
      [
        {
          user: req.user._id,
          customer,
          sale: sale || null,
          amount: paymentAmount,
          paymentMethod,
          paymentDate: paymentDate || new Date(),
          notes: notes || "",
        },
      ],
      { session }
    );

    // ----------------------------------------
    // UPDATE CUSTOMER OUTSTANDING
    // ----------------------------------------

    customerData.outstanding = Math.max(
      outstanding - paymentAmount,
      0
    );

    await customerData.save({ session });

    // ----------------------------------------
    // COMMIT TRANSACTION
    // ----------------------------------------

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: createdPayments[0],
      outstanding: customerData.outstanding,
      sale: saleData
        ? {
            _id: saleData._id,
            totalAmount: saleData.totalAmount,
            paidAmount: saleData.paidAmount,
            paymentStatus: saleData.paymentStatus,
          }
        : null,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("CREATE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record payment",
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET PAYMENTS BY CUSTOMER
// ==========================================

const getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Make sure customer belongs to current user
    const customer = await Customer.findOne({
      _id: customerId,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Only current user's payments
    const payments = await Payment.find({
      user: req.user._id,
      customer: customerId,
    })
      .populate(
        "sale",
        "totalAmount paidAmount paymentStatus"
      )
      .sort({ paymentDate: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("GET PAYMENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};


module.exports = {
  createPayment,
  getPaymentsByCustomer,
};