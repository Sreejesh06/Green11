const express = require("express");
const Dashboard = require("../models/dashboard");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const doc = await Dashboard.findOne({ key: "dashboard-main" }).lean();

    if (!doc) {
      return res.status(404).json({ message: "Dashboard data not found." });
    }

    const { _id, key, ...payload } = doc;
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
