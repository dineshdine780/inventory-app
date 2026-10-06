const express = require("express");

const {
  createReminder,
  getCustomerReminders,
  updateReminderStatus,
  updateReminder,
  deleteReminder,
  getAllReminders,
} = require("../controllers/reminderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAllReminders);

router.post("/", protect, createReminder);

router.get(
  "/customer/:customerId",
  protect,
  getCustomerReminders
);

router.patch(
  "/:reminderId/status",
  protect,
  updateReminderStatus
);

router.put(
  "/:reminderId",
  protect,
  updateReminder
);

router.delete(
  "/:reminderId",
  protect,
  deleteReminder
);

module.exports = router;