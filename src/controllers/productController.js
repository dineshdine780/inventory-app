const Product = require("../models/Product");

// ==================================================
// Create Product
// ==================================================
const createProduct = async (req, res) => {

  console.log("REQ.USER:", req.user);
console.log("REQ.USER._ID:", req.user?._id);
console.log("REQ.USER.USERID:", req.user?.userId);
  try {
    const {
      productName,
      category,
      sku,
      sellingPrice,
      purchasePrice,
      openingStock,
      reorderLevel,
    } = req.body;

    // Required fields
    if (
      !productName ||
      !category ||
      !sku ||
      sellingPrice === undefined ||
      purchasePrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product name, category, SKU, selling price and purchase price are required",
      });
    }

    // Validate numbers
    if (
      Number(sellingPrice) < 0 ||
      Number(purchasePrice) < 0 ||
      Number(openingStock || 0) < 0 ||
      Number(reorderLevel || 0) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price, stock and reorder level cannot be negative",
      });
    }

    // Check duplicate SKU for THIS USER only
    const existingProduct = await Product.findOne({
      user: req.user._id,
      sku: sku.toUpperCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this SKU already exists",
      });
    }

    const product = await Product.create({
      user: req.user._id,

      productName,
      category,
      sku,
      sellingPrice: Number(sellingPrice),
      purchasePrice: Number(purchasePrice),
      openingStock: Number(openingStock || 0),
      currentStock: Number(openingStock || 0),
      reorderLevel: Number(reorderLevel || 5),
      reservedStock: 0,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};


// ==================================================
// Get all Products - CURRENT USER ONLY
// ==================================================
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};


// ==================================================
// Get single Product - CURRENT USER ONLY
// ==================================================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};


// ==================================================
// Update Product - CURRENT USER ONLY
// ==================================================
const updateProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      sku,
      sellingPrice,
      purchasePrice,
      reorderLevel,
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check duplicate SKU for THIS USER only
    if (sku && sku.toUpperCase() !== product.sku) {
      const existingProduct = await Product.findOne({
        user: req.user._id,
        sku: sku.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "A product with this SKU already exists",
        });
      }
    }

    // Validate numbers
    if (
      (sellingPrice !== undefined &&
        Number(sellingPrice) < 0) ||
      (purchasePrice !== undefined &&
        Number(purchasePrice) < 0) ||
      (reorderLevel !== undefined &&
        Number(reorderLevel) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Price and reorder level cannot be negative",
      });
    }

    product.productName =
      productName ?? product.productName;

    product.category =
      category ?? product.category;

    product.sku =
      sku ? sku.toUpperCase() : product.sku;

    if (sellingPrice !== undefined) {
      product.sellingPrice =
        Number(sellingPrice);
    }

    if (purchasePrice !== undefined) {
      product.purchasePrice =
        Number(purchasePrice);
    }

    if (reorderLevel !== undefined) {
      product.reorderLevel =
        Number(reorderLevel);
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};


// ==================================================
// Delete Product - CURRENT USER ONLY
// ==================================================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await Product.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};