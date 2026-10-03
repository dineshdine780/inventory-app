const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const audioDirectory = path.join(process.cwd(), "uploads", "voice");

fs.mkdirSync(audioDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDirectory);
  },

  filename: (req, file, cb) => {
    const extension = [".webm", ".wav", ".mp3", ".m4a", ".ogg"]
      .includes(path.extname(file.originalname).toLowerCase())
      ? path.extname(file.originalname).toLowerCase()
      : ".webm";

    cb(null, `voice-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/webm",
      "audio/wav",
      "audio/x-wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/aac",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Unsupported audio format"));
  },
});

router.post("/upload", (req, res) => {
  upload.single("audio")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required",
      });
    }

    console.log("VOICE UPLOAD SUCCESS:", {
  filename: req.file.filename,
  size: req.file.size,
  mimetype: req.file.mimetype,
  userId: req.user?.id || req.user?._id,
});

    return res.status(201).json({
      success: true,
      message: "Voice audio uploaded successfully",
      audio: {
        filename: req.file.filename,
        size: req.file.size,
        path: `uploads/voice/${req.file.filename}`,
      },
    });
  });
});

module.exports = router;