const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");

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
      const product = await Product.findById(item.product);

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
      poNumber,
      supplier: supplier.trim(),
      products: poProducts,
      totalEstimatedCost,
      expectedDelivery,
      status: status || "Draft",
    });

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