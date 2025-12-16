// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const { adminOnly } = require("../middlewares/roleMiddleware");

// =================================================================
// TAMBAHKAN ROUTE BARU UNTUK STATISTIK DASHBOARD
// GET /users/stats: Hanya perlu login
router.get("/stats", authMiddleware, userController.getDashboardStats);
// =================================================================

// GET /users: Bisa diakses admin DAN user biasa
router.get("/", authMiddleware, userController.getUsers);

// POST, PUT, DELETE: Hanya untuk ADMIN
router.post("/", authMiddleware, adminOnly, userController.createUser);
router.put("/:id", authMiddleware, adminOnly, userController.updateUser);
router.delete("/:id", authMiddleware, adminOnly, userController.deleteUser);

module.exports = router;