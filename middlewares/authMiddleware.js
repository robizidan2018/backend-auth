// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Ambil token dari cookies (bukan dari header)
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Jika token expired/invalid, hapus cookies
    res.clearCookie("auth_token");
    res.clearCookie("user_role");
    res.status(403).json({ message: "Token invalid atau expired" });
  }
};