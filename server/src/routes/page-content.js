const express = require("express");
const PageContent = require("../models/page-content");

const router = express.Router();

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

router.get("/index", createHandler("page-index"));
router.get("/leaderboard", createHandler("page-leaderboard"));
router.get("/profile", createHandler("page-profile"));
router.get("/notfound", createHandler("page-notfound"));
router.get("/rewards", createHandler("page-rewards"));
router.get("/settings", createHandler("page-settings"));

module.exports = router;
