const express = require("express");

const {
  createReminder,
  getCustomerReminders,
} = require("../controllers/reminderController");

const router = express.Router();

router.post("/", createReminder);

router.get(
  "/customer/:customerId",
  getCustomerReminders
);

module.exports = router;