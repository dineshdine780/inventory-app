const Reminder = require("../models/Reminder");
const Customer = require("../models/Customer");

const createReminder = async (req, res) => {
  try {
    const {
      customer,
      reminderDate,
      purpose,
      linkedTransaction,
    } = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!reminderDate) {
      return res.status(400).json({
        success: false,
        message: "Reminder date is required",
      });
    }

    if (!purpose || !purpose.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reminder purpose is required",
      });
    }

    const existingCustomer = await Customer.findById(customer);

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const reminder = await Reminder.create({
      customer,
      reminderDate,
      purpose: purpose.trim(),
      linkedTransaction: linkedTransaction || null,
    });

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder,
    });
  } catch (error) {
    console.error("Create reminder error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create reminder",
    });
  }
};

const getCustomerReminders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const reminders = await Reminder.find({
      customer: customerId,
    })
      .populate("linkedTransaction", "totalAmount paymentStatus")
      .sort({ reminderDate: 1 });

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error("Get customer reminders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
    });
  }
};

module.exports = {
  createReminder,
  getCustomerReminders,
};