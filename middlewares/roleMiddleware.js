// middlewares/roleMiddleware.js

/**
 * Middleware untuk membatasi akses hanya untuk pengguna dengan role 'admin'.
 * Asumsi: req.user sudah ada (sudah melewati authMiddleware),
 * dan berisi payload token (termasuk role).
 */
exports.adminOnly = (req, res, next) => {
  // Cek apakah user sudah terautentikasi dan memiliki role 'admin'
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjut ke controller jika role adalah admin
  } else {
    // Jika tidak, tolak akses
    res.status(403).json({ 
      message: "Akses ditolak. Endpoint ini khusus untuk Admin!" 
    });
  }
};