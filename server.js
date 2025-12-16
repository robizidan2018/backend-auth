// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // TAMBAHKAN
const app = express();

// Controllers & Middleware
const authController = require("./controllers/authController");
const authMiddleware = require("./middlewares/authMiddleware");

// Routes
const userRoutes = require("./routes/userRoutes");

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173", // URL frontend Vite
  credentials: true // <<< PENTING: Izinkan cookies
}));
app.use(cookieParser()); // <<< PENTING: Parse cookies

// ========== AUTH ==========

// Register
app.post("/register", authController.register);

// Login
app.post("/login", authController.login);

// Logout - TAMBAHKAN
app.post("/logout", authController.logout);

// Route Protected
app.get("/me", authMiddleware, (req, res) => {
  res.json({ 
    message: "Data user", 
    user: req.user,
    role: req.user.role 
  });
});

// Users CRUD
app.use("/users", userRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);