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



const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find()
      .populate("customer", "name phone")
      .populate("linkedTransaction", "totalAmount paymentStatus")
      .sort({ reminderDate: 1 });

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error("Get all reminders error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reminders",
    });
  }
};


const updateReminderStatus = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { completed } = req.body;

    if (typeof completed !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Completed must be true or false",
      });
    }

    const reminder = await Reminder.findByIdAndUpdate(
      reminderId,
      { completed },
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reminder status updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("Update reminder status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reminder status",
    });
  }
};


const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const { reminderDate, purpose, linkedTransaction } = req.body;

    const updates = {};

    if (reminderDate !== undefined) {
      if (Number.isNaN(new Date(reminderDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder date",
        });
      }
      updates.reminderDate = reminderDate;
    }

    if (purpose !== undefined) {
      if (typeof purpose !== "string" || !purpose.trim()) {
        return res.status(400).json({
          success: false,
          message: "Reminder purpose is required",
        });
      }
      updates.purpose = purpose.trim();
    }

    if (linkedTransaction !== undefined) {
      updates.linkedTransaction = linkedTransaction || null;
    }

    const reminder = await Reminder.findByIdAndUpdate(
      reminderId,
      updates,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder,
    });
  } catch (error) {
    console.error("Update reminder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update reminder",
    });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndDelete(
      req.params.reminderId
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reminder deleted successfully",
    });
  } catch (error) {
    console.error("Delete reminder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete reminder",
    });
  }
};


module.exports = {
  createReminder,
  getCustomerReminders,
  updateReminderStatus,
  updateReminder,
  deleteReminder,
  getAllReminders,
};