const express = require("express");
const { nanoid } = require("nanoid");
const WasteManagement = require("../models/waste-management");

const router = express.Router();
const COLLECTION_KEY = "waste-management-main";

function toPlain(doc) {
  if (!doc) {
    return null;
  }
  const { _id, __v, ...rest } = doc;
  return rest;
}

function computeWeeklySummary(entries) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const recentEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return !Number.isNaN(entryDate.getTime()) && entryDate >= sevenDaysAgo;
  });

  const totalKg = recentEntries.reduce((sum, entry) => sum + entry.amountKg, 0);
  const recycledKg = recentEntries
    .filter((entry) => entry.stream === "recyclables")
    .reduce((sum, entry) => sum + entry.amountKg, 0);
  const organicsKg = recentEntries
    .filter((entry) => entry.stream === "organics")
    .reduce((sum, entry) => sum + entry.amountKg, 0);

  const diversionRate = totalKg === 0 ? 0 : Math.round(((recycledKg + organicsKg) / totalKg) * 100);

  return {
    totalKg,
    diversionRate,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const doc = await WasteManagement.findOne({ key: COLLECTION_KEY }).lean();

    if (!doc) {
      return res.status(404).json({ message: "Waste management data not found." });
    }

    return res.json(toPlain(doc));
  } catch (error) {
    return next(error);
  }
});

router.post("/logs", async (req, res, next) => {
  try {
    const { stream, amountKg, date } = req.body || {};

    if (!stream || typeof stream !== "string") {
      return res.status(400).json({ message: "Stream is required." });
    }

    const normalizedStream = stream.trim().toLowerCase();

    if (!["recyclables", "organics", "landfill"].includes(normalizedStream)) {
      return res.status(400).json({ message: "Stream must be recyclables, organics, or landfill." });
    }

    const parsedAmount = Number(amountKg);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number." });
    }

    const entryDate = date ? new Date(date) : new Date();
    if (Number.isNaN(entryDate.getTime())) {
      return res.status(400).json({ message: "Invalid date provided." });
    }

    const isoDate = entryDate.toISOString().slice(0, 10);
    const entry = {
      id: nanoid(),
      stream: normalizedStream,
      amountKg: Math.round(parsedAmount * 10) / 10,
      date: isoDate,
    };

    const doc = await WasteManagement.findOne({ key: COLLECTION_KEY });
    if (!doc) {
      return res.status(404).json({ message: "Waste management data not found." });
    }

    const updatedEntries = [...doc.disposalLogs.entries, entry];
    const weeklySummary = computeWeeklySummary(updatedEntries);
    const changePercent = doc.disposalLogs.weeklySummary.changePercent ?? 0;

    doc.disposalLogs.entries = updatedEntries.slice(-150);
    doc.disposalLogs.weeklySummary = {
      totalKg: weeklySummary.totalKg,
      diversionRate: weeklySummary.diversionRate,
      changePercent,
    };

    await doc.save();

    return res.status(201).json({ entry, weeklySummary: doc.disposalLogs.weeklySummary });
  } catch (error) {
    return next(error);
  }
});

router.patch("/goals/:goalId", async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { currentValue } = req.body || {};

    const parsedValue = Number(currentValue);
    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      return res.status(400).json({ message: "Current value must be a non-negative number." });
    }

    const doc = await WasteManagement.findOne({ key: COLLECTION_KEY });
    if (!doc) {
      return res.status(404).json({ message: "Waste management data not found." });
    }

    const targetGoal = doc.goals.find((goal) => goal.id === goalId);
    if (!targetGoal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    targetGoal.currentValue = Math.round(parsedValue * 10) / 10;
    await doc.save();

    return res.json({ goal: targetGoal });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
