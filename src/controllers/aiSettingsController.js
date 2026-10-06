const User = require("../models/User");
const { encrypt } = require("../utils/encryption");

// Save Gemini API Key
const saveGeminiApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({
        success: false,
        message: "Gemini API key is required",
      });
    }

    const cleanApiKey = apiKey.trim();

    const encryptedKey = encrypt(cleanApiKey);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.geminiApiKeyEncrypted = encryptedKey;
    user.geminiApiKeyLast4 = cleanApiKey.slice(-4);
    user.geminiApiEnabled = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Gemini API key saved successfully",
      connected: true,
      last4: user.geminiApiKeyLast4,
    });
  } catch (error) {
    console.error("SAVE GEMINI KEY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save Gemini API key",
    });
  }
};

// Get Gemini API Key Status
const getGeminiApiKeyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "geminiApiKeyLast4 geminiApiEnabled"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      connected: user.geminiApiEnabled,
      last4: user.geminiApiKeyLast4 || null,
    });
  } catch (error) {
    console.error("GET GEMINI KEY STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get Gemini API key status",
    });
  }
};

// Remove Gemini API Key
const removeGeminiApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.geminiApiKeyEncrypted = null;
    user.geminiApiKeyLast4 = null;
    user.geminiApiEnabled = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Gemini API key removed successfully",
      connected: false,
    });
  } catch (error) {
    console.error("REMOVE GEMINI KEY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove Gemini API key",
    });
  }
};

module.exports = {
  saveGeminiApiKey,
  getGeminiApiKeyStatus,
  removeGeminiApiKey,
};