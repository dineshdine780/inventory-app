const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const svgCaptcha = require("svg-captcha");

const User = require("../models/User");
const Purchase = require("../models/Purchase");



const captchaStore = new Map();



const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Register user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};


// Generate CAPTCHA


const generateCaptcha = (req, res) => {
  try {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: "#f7f8fc",
    });

    const captchaId =
      Math.random().toString(36).substring(2) +
      Date.now().toString(36);

    captchaStore.set(captchaId, {
      text: captcha.text.toLowerCase(),
      expiresAt:
        Date.now() + 5 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      captchaId,
      captchaImage: captcha.data,
    });
  } catch (error) {
    console.error(
      "Generate CAPTCHA error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate CAPTCHA",
    });
  }
};  


// Login User


const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
      captchaId,
      captchaText,
    } = req.body;

   
    // Validate CAPTCHA
   

    if (!captchaId || !captchaText) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA is required",
      });
    }

    const storedCaptcha =
      captchaStore.get(captchaId);

    if (!storedCaptcha) {
      return res.status(400).json({
        success: false,
        message:
          "CAPTCHA expired or invalid",
      });
    }

    if (
      Date.now() >
      storedCaptcha.expiresAt
    ) {
      captchaStore.delete(captchaId);

      return res.status(400).json({
        success: false,
        message: "CAPTCHA expired",
      });
    }

    if (
      captchaText.trim().toLowerCase() !==
      storedCaptcha.text
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid CAPTCHA",
      });
    }

    // CAPTCHA can only be used once
    captchaStore.delete(captchaId);

    
    // Validate Email

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate Password


    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // --------------------------------
    // Find User
    // --------------------------------

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    // Check Active Account
  

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }
    
    // Check Password

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

  
    // Generate JWT


    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
   
    // Login Success

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "Login user error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};


// Export


module.exports = {
  registerUser,
  loginUser,
  generateCaptcha,
};


