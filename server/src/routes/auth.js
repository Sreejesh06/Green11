const express = require("express");
const User = require("../models/user");
const {
  authMiddleware,
  buildUserPayload,
  comparePassword,
  hashPassword,
  signToken,
} = require("../lib/auth");

const router = express.Router();

function splitName(name) {
  if (!name) {
    return { firstName: "", lastName: "" };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const [first, ...rest] = trimmed.split(/\s+/);
  return { firstName: first, lastName: rest.join(" ") };
}

async function generateUniqueUsername(base) {
  const sanitizedBase = (base || "user")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "");

  const seed = sanitizedBase || "user";

  async function findAvailable(candidate, attempt) {
    const exists = await User.exists({ username: candidate });
    if (!exists) {
      return candidate;
    }

    const nextAttempt = attempt + 1;

    if (nextAttempt > 1000) {
      return `${seed}${Date.now()}`;
    }

    const nextCandidate = `${seed}${nextAttempt}`;
    return findAvailable(nextCandidate, nextAttempt);
  }

  return findAvailable(seed, 0);
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const passwordHash = await hashPassword(password);
    const normalizedEmail = email.toLowerCase();
    const { firstName, lastName } = splitName(name);
    const username = await generateUniqueUsername(normalizedEmail.split("@")[0]);

    const user = await User.create({
      name: name.trim(),
      firstName,
      lastName,
      email: normalizedEmail,
      username,
      passwordHash,
    });
    const token = signToken(user);

    return res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    const safeUser = buildUserPayload(user);

    return res.json({ token, user: safeUser });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
