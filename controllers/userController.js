// controllers/userController.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");

// --- GET ALL USERS ---
exports.getUsers = async (req, res) => {
  try {
    // Hanya tampilkan user dengan role 'user' untuk semua yang akses
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE role = 'user' ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error getting users:", err.message);
    res.status(500).json({ message: "Error getting users", error: err.message });
  }
};

// --- CREATE USER ---
exports.createUser = async (req, res) => {
  try {
    let { name, email, password } = req.body; 

    if (!name || !email) {
      return res.status(400).json({ message: "Name dan email wajib diisi" });
    }

    if (!password) password = "password123"; 

    const userRole = 'user';

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashed, userRole]
    );

    res.json({ message: "User berhasil dibuat", user: result.rows[0] });
  } catch (err) {
    const msg = err.code === "23505" ? "Email sudah terdaftar" : err.message;
    console.error("Error creating user:", err.message);
    res.status(500).json({ message: "Error creating user", error: msg });
  }
};

// --- UPDATE USER ---
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name dan email wajib diisi" });
    }

    const setClauses = [];
    const updateParams = [];
    let paramIndex = 1;

    setClauses.push(`name=$${paramIndex++}`);
    updateParams.push(name);

    setClauses.push(`email=$${paramIndex++}`);
    updateParams.push(email);

    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      setClauses.push(`password=$${paramIndex++}`);
      updateParams.push(hashed);
    }

    if (setClauses.length === 0) {
        return res.status(400).json({ message: "Tidak ada field yang diupdate" });
    }

    const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id=$${paramIndex} AND role = 'user' RETURNING id, name, email, role`;
    updateParams.push(id);
    
    const result = await pool.query(query, updateParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan atau bukan user biasa' });
    }
    
    res.json({ message: "User berhasil diupdate", user: result.rows[0] });

  } catch (err) {
    const msg = err.code === "23505" ? "Email sudah terdaftar" : err.message;
    console.error("Error updating user:", err.message); 
    res.status(500).json({ message: "Error updating user", error: msg });
  }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const check = await pool.query(
      "SELECT id FROM users WHERE id=$1 AND role = 'user'", 
      [id]
    );
    
    if (check.rows.length === 0) {
        return res.status(404).json({ 
          message: "User tidak ditemukan atau bukan user biasa" 
        });
    }

    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};

// =================================================================
// --- DASHBOARD STATS (FUNGSI BARU UNTUK REAL-TIME DATA) ---
// =================================================================
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Hitung Total User Biasa (role = 'user')
    const totalUserResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'user'"
    );
    const totalUsers = parseInt(totalUserResult.rows[0].count);

    // 2. Hitung Role Distribution (Admin vs User, dll.)
    const roleDistributionResult = await pool.query(
      "SELECT role, COUNT(*) AS count FROM users GROUP BY role"
    );

    // Format data Role Distribution untuk frontend (Pie Chart)
    const roleDistribution = roleDistributionResult.rows.map(row => ({
      name: row.role.charAt(0).toUpperCase() + row.role.slice(1), // Kapitalisasi Role
      value: parseInt(row.count)
    }));

    // Data dikirim ke Frontend
    res.json({
      totalUsers: totalUsers,
      roleDistribution: roleDistribution
    });

  } catch (err) {
    console.error("Error getting dashboard stats:", err.message);
    res.status(500).json({ message: "Error getting dashboard stats", error: err.message });
  }
};