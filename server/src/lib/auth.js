const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const TOKEN_EXPIRY = "7d";

function ensureJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return process.env.JWT_SECRET;
}

function buildUserPayload(userDoc) {
  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
  };
}

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(userDoc) {
  const secret = ensureJwtSecret();
  const payload = {
    sub: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
  };

  return jwt.sign(payload, secret, { expiresIn: TOKEN_EXPIRY });
}

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decoded = jwt.verify(token, ensureJwtSecret());
    const user = await User.findById(decoded.sub).lean();

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = buildUserPayload(user);
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    return next(error);
  }
}

module.exports = {
  authMiddleware,
  buildUserPayload,
  comparePassword,
  hashPassword,
  signToken,
};
