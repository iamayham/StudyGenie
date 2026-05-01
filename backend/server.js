const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const { chatWithContent } = require("./services/openaiService");
const errorHandler = require("./middleware/errorHandler");

const app = express();
connectDB();

app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json());

// ================= API ROUTES =================
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "StudyGenie API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.post("/api/chat", async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const answer = await chatWithContent("", message.trim());
    return res.status(200).json({ answer });
  } catch (error) {
    return next(error);
  }
});

app.use(errorHandler);

// ================= FRONTEND =================
// Serve static files from frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Fallback for React/Vite (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
