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

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://vite-project-h7tr.vercel.app"
  ],
  credentials: true
}));


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

// ===== START SERVER =====
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
