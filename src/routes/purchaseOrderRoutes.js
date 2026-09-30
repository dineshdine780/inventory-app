const express = require("express");

const {
  createPurchaseOrder,
} = require("../controllers/purchaseOrderController");

const router = express.Router();

router.post("/", createPurchaseOrder);

module.exports = router;