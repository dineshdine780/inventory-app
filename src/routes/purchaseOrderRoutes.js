const express = require("express");

const {
  createPurchaseOrder,
} = require("../controllers/purchaseOrderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPurchaseOrder);

module.exports = router;