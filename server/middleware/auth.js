const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getBearerToken(req) {
  const headerValue = req.headers.authorization;

  if (!headerValue || !headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.replace("Bearer ", "").trim();
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token || getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId || payload.sub || payload.id).select("_id name email createdAt updatedAt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session is no longer valid",
      });
    }

    req.user = user;
    req.userId = user._id;
    return next();
  } catch (error) {
    const errorMessage =
      error && error.name === "TokenExpiredError"
        ? "Your session has expired. Please log in again."
        : "Invalid or expired token";

    return res.status(401).json({
      success: false,
      message: errorMessage,
    });
  }
}

module.exports = {
  requireAuth,
};
