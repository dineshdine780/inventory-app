const express = require("express");

const router = express.Router();

const {
  understandProductCommand,
} = require("../services/geminiService");

router.post("/understand", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    console.log("AI INPUT:", text);

    const result = await understandProductCommand(text);

    console.log("AI OUTPUT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      success: false,
      message: "AI processing failed",
      error: error.message,
    });
  }
});

module.exports = router;