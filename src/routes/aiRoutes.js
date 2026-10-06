const express = require("express");

const router = express.Router();

const {
  understandProductCommand,
  understandSaleCommand,
  understandPurchaseCommand,
  understandCustomerCommand,
} = require("../services/geminiService");

// ===============================
// PRODUCT AI
// ===============================
router.post("/understand", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("AI PRODUCT INPUT:", text);

    const result = await understandProductCommand(
      req.user._id,
      text
    );

    console.log("AI PRODUCT OUTPUT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini product error:", error);

    return res.status(500).json({
      success: false,
      message: "AI product processing failed",
      error: error.message,
    });
  }
});

// ===============================
// SALE AI
// ===============================
router.post("/understand-sale", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("AI SALE INPUT:", text);

    const result = await understandSaleCommand(
      req.user._id,
      text
    );

    console.log("AI SALE OUTPUT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini sale error:", error);

    return res.status(500).json({
      success: false,
      message: "AI sale processing failed",
      error: error.message,
    });
  }
});

// ===============================
// PURCHASE AI
// ===============================
router.post("/understand-purchase", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("AI PURCHASE INPUT:", text);

    const result = await understandPurchaseCommand(
      req.user._id,
      text
    );

    console.log("AI PURCHASE OUTPUT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini purchase error:", error);

    return res.status(500).json({
      success: false,
      message: "AI purchase processing failed",
      error: error.message,
    });
  }
});


router.post("/understand-customer", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("AI CUSTOMER INPUT:", text);

    const result = await understandCustomerCommand(
      req.user._id,
      text
    );

    console.log("AI CUSTOMER OUTPUT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini customer error:", error);

    return res.status(500).json({
      success: false,
      message: "AI customer processing failed",
      error: error.message,
    });
  }
});

module.exports = router;