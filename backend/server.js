const express = require("express");
const path = require("path");

const app = express();

// Middleware (optional if you already have it)
app.use(express.json());

// ================= API ROUTES =================
// Example:
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/ai", require("./routes/aiRoutes"));

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
