require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authController = require("./controllers/authController");
const authMiddleware = require("./middlewares/authMiddleware");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.post("/register", authController.register);
app.post("/login", authController.login);
app.post("/logout", authController.logout);

app.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user
  });
});

app.use("/users", userRoutes);

// 🔥 INI KUNCI
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
