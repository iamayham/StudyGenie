const express = require("express");
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

if (!process.env.MONGO_URI || !process.env.JWT_SECRET || !process.env.OPENAI_API_KEY) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no Origin header) and known frontend origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "StudyGenie API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);

// Public chat proxy endpoint for frontend (no API key in client).
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
