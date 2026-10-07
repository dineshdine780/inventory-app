const Notification = require("../models/Notification");

const syncLowStockNotification = async (product, session = null) => {
  try {
    const isLowStock =
      product.currentStock <= product.reorderLevel;

    // Find existing unread low-stock notification
    const existingNotification = await Notification.findOne({
      user: product.user,
      type: "low-stock",
      referenceId: product._id,
      referenceType: "Product",
      isRead: false,
    });

    // Product is low stock
    if (isLowStock) {
      // Avoid duplicate notification
      if (existingNotification) {
        return existingNotification;
      }

      const notification = await Notification.create({
        user: product.user,
        type: "low-stock",
        title: "Low Stock Alert",
        message: `${product.productName} is running low on stock. Only ${product.currentStock} items remaining.`,
        referenceId: product._id,
        referenceType: "Product",
        isRead: false,
      });

      return notification;
    }

    // Product is no longer low stock
    if (existingNotification) {
      await Notification.deleteOne({
        _id: existingNotification._id,
      });
    }

    return null;
  } catch (error) {
    console.error(
      "SYNC LOW STOCK NOTIFICATION ERROR:",
      error
    );

    return null;
  }
};

module.exports = {
  syncLowStockNotification,
};