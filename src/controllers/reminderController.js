const Reminder = require("../models/Reminder");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");
const Notification = require("../models/Notification");

// Create Reminder
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

    // Customer must belong to logged-in user
    const existingCustomer = await Customer.findOne({
      _id: customer,
      user: req.user._id,
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // If linked transaction is provided,
    // make sure the sale also belongs to current user
    if (linkedTransaction) {
      const existingSale = await Sale.findOne({
        _id: linkedTransaction,
        user: req.user._id,
        customer: customer,
      });

      if (!existingSale) {
        return res.status(404).json({
          success: false,
          message: "Linked transaction not found",
        });
      }
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      customer,
      reminderDate,
      purpose: purpose.trim(),
      linkedTransaction: linkedTransaction || null,
    });

    // ----------------------------------------
// REMINDER NOTIFICATION
// ----------------------------------------

await Notification.create({
  user: req.user._id,
  type: "reminder",
  title: "Reminder Scheduled",
  message: `${existingCustomer.name}: ${purpose.trim()} on ${new Date(
    reminderDate
  ).toLocaleDateString()}.`,
  referenceId: reminder._id,
  referenceType: "Reminder",
  isRead: false,
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

// Get reminders for one customer
const getCustomerReminders = async (req, res) => {
  try {
    const { customerId } = req.params;

    // First verify customer belongs to current user
    const customer = await Customer.findOne({
      _id: customerId,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const reminders = await Reminder.find({
      user: req.user._id,
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

// Get all reminders for current user
const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id,
    })
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

// Update reminder status
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

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: reminderId,
        user: req.user._id,
      },
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

// Update reminder
const updateReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    const {
      reminderDate,
      purpose,
      linkedTransaction,
    } = req.body;

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
      if (
        typeof purpose !== "string" ||
        !purpose.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Reminder purpose is required",
        });
      }

      updates.purpose = purpose.trim();
    }

    if (linkedTransaction !== undefined) {
      if (linkedTransaction) {
        const existingSale = await Sale.findOne({
          _id: linkedTransaction,
          user: req.user._id,
        });

        if (!existingSale) {
          return res.status(404).json({
            success: false,
            message: "Linked transaction not found",
          });
        }
      }

      updates.linkedTransaction =
        linkedTransaction || null;
    }

    const reminder = await Reminder.findOneAndUpdate(
      {
        _id: reminderId,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
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

// Delete reminder
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.reminderId,
      user: req.user._id,
    });

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