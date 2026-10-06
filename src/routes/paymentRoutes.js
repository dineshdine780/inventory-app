const express = require("express");

const {
  createPayment,
  getPaymentsByCustomer,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPayment);

router.get(
  "/customer/:customerId",
  protect,
  getPaymentsByCustomer
);

module.exports = router;