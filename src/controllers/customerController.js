const Customer = require("../models/Customer");

// ==================================================
// Create Customer
// ==================================================
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      whatsappPreference,
      address,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }

    // Check duplicate phone for THIS USER only
    const existingCustomer = await Customer.findOne({
      user: req.user._id,
      phone: phone.trim(),
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this phone number already exists",
      });
    }

    const customer = await Customer.create({
      user: req.user._id,

      name: name.trim(),
      phone: phone.trim(),
      whatsappPreference: Boolean(whatsappPreference),
      address: address?.trim() || "",
      notes: notes?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};


// ==================================================
// Get All Customers - CURRENT USER ONLY
// ==================================================
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};


// ==================================================
// Get Customer By ID - CURRENT USER ONLY
// ==================================================
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(
      "Get customer by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};


// ==================================================
// Update Customer - CURRENT USER ONLY
// ==================================================
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      phone,
      whatsappPreference,
      address,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer phone is required",
      });
    }

    const customer = await Customer.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Check duplicate phone for THIS USER only
    const existingCustomer =
      await Customer.findOne({
        user: req.user._id,
        phone: phone.trim(),
        _id: { $ne: id },
      });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "Customer with this phone number already exists",
      });
    }

    customer.name = name.trim();
    customer.phone = phone.trim();

    customer.whatsappPreference =
      Boolean(whatsappPreference);

    customer.address =
      address?.trim() || "";

    customer.notes =
      notes?.trim() || "";

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error(
      "Update customer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};


module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
};