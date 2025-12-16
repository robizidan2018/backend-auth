// controllers/authController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'user') RETURNING id, name, email, role",
      [name, email, hashed]
    );

    const user = result.rows[0];
    
    // Buat token untuk auto-login setelah register
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie untuk token
    res.cookie("auth_token", token, {
      httpOnly: true, // Tidak bisa diakses JavaScript
      secure: process.env.NODE_ENV === "production", // HTTPS di production
      sameSite: "lax", // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 1 hari (dalam milidetik)
      path: "/" // Available untuk semua route
    });

    // Cookie biasa untuk role (bisa diakses frontend)
    res.cookie("user_role", user.role, {
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({ 
      message: "Register berhasil", 
      user: user,
      role: user.role 
    });

  } catch (err) {
    const msg = err.code === "23505" ? "Email sudah terdaftar" : err.message;
    res.status(500).json({ message: "Error saat register", error: msg });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email belum terdaftar" });
    }

    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Set HTTP-only cookie untuk token
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    // Cookie biasa untuk role
    res.cookie("user_role", user.role, {
      maxAge: 24 * 60 * 60 * 1000,
      path: "/"
    });

    res.json({ 
      message: "Login berhasil", 
      role: user.role,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// TAMBAHKAN fungsi logout
exports.logout = (req, res) => {
  try {
    // Hapus cookies
    res.clearCookie("auth_token");
    res.clearCookie("user_role");
    
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};