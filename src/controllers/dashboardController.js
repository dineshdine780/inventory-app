const Sale = require("../models/Sale");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const getDashboardSummary = async (req, res) => {
  try {
    // Start of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // End of today
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Today's sales
    const todaySales = await Sale.aggregate([
      {
        $match: {
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

    // Pending customer payments
    const pendingPayments = await Customer.aggregate([
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

    // Low stock products
    const lowStockCount =
      await Product.countDocuments({
        $expr: {
          $lte: [
            "$currentStock",
            "$reorderLevel",
          ],
        },
      });

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
      message:
        "Failed to fetch dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};