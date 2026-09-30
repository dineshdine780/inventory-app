const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
} = require("../controllers/customerController");

const router = express.Router();

router.post("/", createCustomer);

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

module.exports = router;