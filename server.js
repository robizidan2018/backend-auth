require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authController = require("./controllers/authController");
const authMiddleware = require("./middlewares/authMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());
app.use(cookieParser());

// 🔥 FIX CORS (AMAN LOCAL + VERCEL)
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

// ===== AUTH =====
app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/logout", authController.logout);

app.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Data user",
    user: req.user,
    role: req.user.role
  });
});

// ===== USERS =====
app.use("/users", userRoutes);

// ===== HEALTH CHECK (OPSIONAL TAPI SANGAT DISARANKAN) =====
app.get("/", (req, res) => {
  res.send("Backend Auth API is running 🚀");
});

// ===== START SERVER (INI KUNCI) =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
