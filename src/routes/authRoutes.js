const express = require("express");

const {
  registerUser,
  loginUser,
  generateCaptcha, 
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);

router.get("/captcha", generateCaptcha);

router.post("/login", loginUser);

module.exports = router;