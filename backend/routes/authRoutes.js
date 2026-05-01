const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPasswordWithOtp,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password-otp", resetPasswordWithOtp);

module.exports = router;
