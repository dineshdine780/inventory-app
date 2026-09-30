const express = require("express");

const {
  createSale,
  getSalesByCustomer,
} = require("../controllers/saleController");

const router = express.Router();

router.post("/", createSale);

router.get("/customer/:customerId", getSalesByCustomer);

module.exports = router;