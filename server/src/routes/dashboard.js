const express = require("express");
const Dashboard = require("../models/dashboard");
const ChallengeSubmission = require("../models/challenge-submission");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const doc = await Dashboard.findOne({ key: "dashboard-main" }).lean();

    if (!doc) {
      return res.status(404).json({ message: "Dashboard data not found." });
    }

    const { _id, key, ...payload } = doc;
    const userName = (req.user && (req.user.firstName || req.user.name)) || payload?.welcome?.userName || "Eco Champion";

    const welcome = {
      userName,
      message: payload?.welcome?.message || "You're making great progress — keep the momentum going!",
    };

    return res.json({ ...payload, welcome });
  } catch (error) {
    return next(error);
  }
});

router.post("/challenges/:challengeId/submissions", async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const challengeIdParam = Number.parseInt(req.params.challengeId, 10);
    if (Number.isNaN(challengeIdParam)) {
      return res.status(400).json({ message: "Challenge id must be a number." });
    }

    const { description, proof } = req.body || {};

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ message: "Description is required." });
    }

    const dashboard = await Dashboard.findOne({ key: "dashboard-main" }).lean();

    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard data not found." });
    }

    const challenge = (dashboard.activeChallenges || []).find((item) => item.id === challengeIdParam);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    let storedProof;

    if (proof) {
      const { data, originalName, mimeType, size } = proof;

      if (typeof data !== "string" || !data.trim()) {
        return res.status(400).json({ message: "Proof data must be provided as a base64 string." });
      }

      if (typeof size !== "number" || size <= 0) {
        return res.status(400).json({ message: "Proof size must be a positive number." });
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (size > MAX_SIZE) {
        return res.status(413).json({ message: "Proof file is too large (limit 5MB)." });
      }

      const normalizedData = data.includes(",") ? data.split(",").pop() : data;

      storedProof = {
        originalName: typeof originalName === "string" ? originalName : undefined,
        mimeType: typeof mimeType === "string" ? mimeType : undefined,
        size,
        data: Buffer.from(normalizedData, "base64"),
      };
    }

    const submission = await ChallengeSubmission.create({
      user: userId,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      points: challenge.points,
      description: description.trim(),
      proof: storedProof,
    });

    return res.status(201).json({
      submission: {
        id: submission._id.toString(),
        challengeId: submission.challengeId,
        challengeTitle: submission.challengeTitle,
        points: submission.points,
        description: submission.description,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
