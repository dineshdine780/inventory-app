const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const Notification = require("../models/Notification");

const createPurchaseOrder = async (req, res) => {
  try {
    const {
      supplier,
      products,
      expectedDelivery,
      status,
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

    if (!expectedDelivery) {
      return res.status(400).json({
        success: false,
        message: "Expected delivery date is required",
      });
    }

    const poProducts = [];

    for (const item of products) {
      // IMPORTANT:
      // Product must belong to the logged-in user
      const product = await Product.findOne({
        _id: item.product,
        user: req.user._id,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Product quantity must be greater than 0",
        });
      }

      if (item.unitCost < 0) {
        return res.status(400).json({
          success: false,
          message: "Unit cost cannot be negative",
        });
      }

      const estimatedCost = item.quantity * item.unitCost;

      poProducts.push({
        product: item.product,
        quantity: item.quantity,
        unitCost: item.unitCost,
        estimatedCost,
      });
    }

    const totalEstimatedCost = poProducts.reduce(
      (total, item) => total + item.estimatedCost,
      0
    );

    // Generate PO number
    const poNumber = `PO-${Date.now()}`;

    const purchaseOrder = await PurchaseOrder.create({
      user: req.user._id,

      poNumber,
      supplier: supplier.trim(),
      products: poProducts,
      totalEstimatedCost,
      expectedDelivery,
      status: status || "Draft",
    });
    

if (
  purchaseOrder.status === "Draft" ||
  purchaseOrder.status === "Pending"
) {
  await Notification.create({
    user: req.user._id,
    type: "purchase",
    title: "Purchase Order Pending",
    message: `Purchase Order ${purchaseOrder.poNumber} is waiting for approval.`,
    referenceId: purchaseOrder._id,
    referenceType: "PurchaseOrder",
    isRead: false,
  });
}



    return res.status(201).json({
      success: true,
      message: "Purchase order created successfully",
      purchaseOrder,
    });
  } catch (error) {
    console.error("Create purchase order error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase order",
    });
  }
};

module.exports = {
  createPurchaseOrder,
};