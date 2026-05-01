const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../services/emailService");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = createToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Keep response generic for security, even if account does not exist.
    const genericResponse = {
      message: `If an account exists for ${normalizedEmail}, an OTP code has been sent.`,
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.passwordResetOtpHash = otpHash;
    user.passwordResetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendOtpEmail({ to: normalizedEmail, otp });
    } catch (emailError) {
      // Do not block the API response on provider errors; keep response generic for safety.
      console.error("Failed to send OTP email:", emailError.message);
    }
    return res.status(200).json(genericResponse);
  } catch (error) {
    return next(error);
  }
};

const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.passwordResetOtpExpiresAt.getTime() < Date.now()) {
      user.passwordResetOtpHash = null;
      user.passwordResetOtpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
    if (otpHash !== user.passwordResetOtpHash) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtpHash = null;
    user.passwordResetOtpExpiresAt = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPasswordWithOtp,
};
