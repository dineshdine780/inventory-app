const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  saveGeminiApiKey,
  getGeminiApiKeyStatus,
  removeGeminiApiKey,
} = require("../controllers/aiSettingsController");

const router = express.Router();

router.get("/gemini-key", protect, getGeminiApiKeyStatus);

router.put("/gemini-key", protect, saveGeminiApiKey);

router.delete("/gemini-key", protect, removeGeminiApiKey);

module.exports = router;