const express = require("express");

const {
  createReminder,
  getCustomerReminders,
  updateReminderStatus,
  updateReminder,
  deleteReminder,
  getAllReminders,
} = require("../controllers/reminderController");

const router = express.Router();

router.get("/", getAllReminders)

router.post("/", createReminder);

router.get("/customer/:customerId", getCustomerReminders);

router.patch("/:reminderId/status", updateReminderStatus);

router.put("/:reminderId", updateReminder);

router.delete("/:reminderId", deleteReminder);

module.exports = router;