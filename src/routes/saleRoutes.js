const express = require("express");

const {
  createSale,
  getSalesByCustomer,
} = require("../controllers/saleController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSale);

router.get("/customer/:customerId", protect, getSalesByCustomer);

module.exports = router;