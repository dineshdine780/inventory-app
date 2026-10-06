const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomerById);
router.put("/:id", protect, updateCustomer);

module.exports = router;