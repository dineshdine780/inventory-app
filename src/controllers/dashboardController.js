const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const getDashboardSummary = async (req, res) => {
  try {
    // --------------------------------
    // CURRENT USER
    // --------------------------------

    const userId = new mongoose.Types.ObjectId(
      req.user._id
    );

    // --------------------------------
    // TODAY IN INDIA (IST)
    // --------------------------------

    const now = new Date();

    const todayIST = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const startOfDay = new Date(
      `${todayIST}T00:00:00+05:30`
    );

    const endOfDay = new Date(
      `${todayIST}T23:59:59.999+05:30`
    );

    // --------------------------------
    // TODAY'S SALES
    // --------------------------------

    const todaySales = await Sale.aggregate([
      {
        $match: {
          user: userId,
          createdAt: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const todaysSales =
      todaySales.length > 0
        ? todaySales[0].total
        : 0;

    // --------------------------------
    // PENDING PAYMENTS
    // --------------------------------

    const pendingPayments = await Customer.aggregate([
      {
        $match: {
          user: userId,
          outstanding: {
            $gt: 0,
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$outstanding",
          },
        },
      },
    ]);

    const pendingPaymentAmount =
      pendingPayments.length > 0
        ? pendingPayments[0].total
        : 0;

    // --------------------------------
    // LOW STOCK PRODUCTS
    // --------------------------------

    const lowStockCount = await Product.countDocuments({
      user: userId,
      $expr: {
        $lte: [
          "$currentStock",
          "$reorderLevel",
        ],
      },
    });

    // --------------------------------
    // RESPONSE
    // --------------------------------

    return res.status(200).json({
      success: true,
      summary: {
        todaysSales,
        pendingPayments: pendingPaymentAmount,
        lowStockCount,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};