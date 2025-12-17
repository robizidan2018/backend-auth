const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ===== COOKIE OPTIONS (SATU SUMBER KEBENARAN) =====
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true di Railway
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/"
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'user') RETURNING id, name, email, role",
      [name, email, hashed]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Cookie TOKEN
    res.cookie("auth_token", token, cookieOptions);

    // Cookie ROLE (frontend boleh baca)
    res.cookie("user_role", user.role, {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: "/"
    });

    res.json({
      message: "Register berhasil",
      user,
      role: user.role
    });

  } catch (err) {
    const msg = err.code === "23505" ? "Email sudah terdaftar" : err.message;
    res.status(500).json({ message: "Error saat register", error: msg });
  }
};

// ================= LOGIN =================
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
    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, cookieOptions);

    res.cookie("user_role", user.role, {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
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

// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.clearCookie("auth_token", {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: "/"
  });

  res.clearCookie("user_role", {
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: "/"
  });

  res.json({ message: "Logout berhasil" });
};
