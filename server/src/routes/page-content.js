const express = require("express");
const PageContent = require("../models/page-content");
const User = require("../models/user");

const protectedRouter = express.Router();
const publicRouter = express.Router();

function createHandler(key) {
  return async (_req, res, next) => {
    try {
      const doc = await PageContent.findOne({ key }).lean();

      if (!doc) {
        return res.status(404).json({ message: "Page content not found." });
      }

      return res.json(doc.data);
    } catch (error) {
      return next(error);o
    }
  };
}

publicRouter.get("/index", createHandler("page-index"));

protectedRouter.get("/leaderboard", createHandler("page-leaderboard"));
protectedRouter.get("/profile", async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const [profileDoc, user] = await Promise.all([
      PageContent.findOne({ key: "page-profile" }).lean(),
      User.findById(userId).lean(),
    ]);

    if (!profileDoc) {
      return res.status(404).json({ message: "Page content not found." });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const profileData = { ...(profileDoc.data || {}) };
    const userPayload = { ...(profileData.user || {}) };

    const nameFromParts = [user.firstName, user.lastName].filter(Boolean).join(" ");
    const fullName = user.name || nameFromParts || user.email;

    const initialsSource = nameFromParts || user.name || user.email || "?";
    const initials = initialsSource
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0]?.toUpperCase() ?? "")
      .join("") || "UU";

    const joinedDate = (() => {
      if (userPayload.joined) {
        return userPayload.joined;
      }

      if (!user.createdAt) {
        return "Joined";
      }

      const formatter = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      });

      return formatter.format(user.createdAt);
    })();

    profileData.user = {
      ...userPayload,
      name: fullName,
      initials,
      joined: joinedDate,
      email: user.email,
      username: user.username || userPayload.username,
    };

    return res.json(profileData);
  } catch (error) {
    return next(error);
  }
});
protectedRouter.get("/notfound", createHandler("page-notfound"));
protectedRouter.get("/settings", createHandler("page-settings"));

module.exports = {
  protectedRouter,
  publicRouter,
};
