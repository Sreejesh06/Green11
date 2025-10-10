const express = require("express");
const PageContent = require("../models/page-content");

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
      return next(error);
    }
  };
}

publicRouter.get("/index", createHandler("page-index"));

protectedRouter.get("/leaderboard", createHandler("page-leaderboard"));
protectedRouter.get("/profile", createHandler("page-profile"));
protectedRouter.get("/notfound", createHandler("page-notfound"));
protectedRouter.get("/rewards", createHandler("page-rewards"));
protectedRouter.get("/settings", createHandler("page-settings"));

module.exports = {
  protectedRouter,
  publicRouter,
};
