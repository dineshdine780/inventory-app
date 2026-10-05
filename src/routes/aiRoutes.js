const express = require("express");

const router = express.Router();

const {
  understandProductCommand,
  understandSaleCommand,
  understandPurchaseCommand,
} = require("../services/geminiService");

/*
==================================================
ADD PRODUCT
POST /api/ai/understand
==================================================
*/

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

    const result = await understandProductCommand(text);

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

/*
==================================================
ADD SALE
POST /api/ai/understand-sale
==================================================
*/

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

    const result = await understandSaleCommand(text);

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

/*
==================================================
ADD PURCHASE
POST /api/ai/understand-purchase
==================================================
*/

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

    const result = await understandPurchaseCommand(text);

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

module.exports = router;