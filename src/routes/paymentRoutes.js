const express = require("express");

const {
  createPayment,
  getPaymentsByCustomer,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/", createPayment);

router.get("/customer/:customerId", getPaymentsByCustomer);

module.exports = router;