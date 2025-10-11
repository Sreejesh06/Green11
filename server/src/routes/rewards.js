const express = require("express");
const crypto = require("crypto");

const PageContent = require("../models/page-content");
const RewardRedemption = require("../models/reward-redemption");
const { ensureRazorpay } = require("../lib/razorpay");

const router = express.Router();

async function loadRewardsDocument() {
  const doc = await PageContent.findOne({ key: "page-rewards" }).lean();

  if (!doc) {
    throw Object.assign(new Error("Rewards catalog not found."), { statusCode: 404 });
  }

  return doc.data || {};
}

router.get("/", async (_req, res, next) => {
  try {
    const data = await loadRewardsDocument();
    return res.json(data);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return next(error);
  }
});

router.post("/redeem", async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { rewardId } = req.body || {};

    if (typeof rewardId !== "number") {
      return res.status(400).json({ message: "rewardId must be provided as a number." });
    }

    const data = await loadRewardsDocument();
    const rewards = data.rewards || [];
    const reward = rewards.find((item) => item.id === rewardId);

    if (!reward) {
      return res.status(404).json({ message: "Selected reward is no longer available." });
    }

    if (reward.stock !== undefined && reward.stock <= 0) {
      return res.status(409).json({ message: "This reward is out of stock." });
    }

    const amountInPaise = Math.max(reward.cost, 1) * 100;

    const razorpay = ensureRazorpay();
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `reward_${reward.id}_${Date.now()}`,
      notes: {
        rewardId: String(reward.id),
        rewardName: reward.name,
        userId,
      },
    });

    await RewardRedemption.create({
      user: userId,
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.cost,
      currency: order.currency,
      amount: order.amount,
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      order,
      reward: {
        id: reward.id,
        name: reward.name,
        cost: reward.cost,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const razorpay = ensureRazorpay();

    const { orderId, paymentId, signature } = req.body || {};

    if (typeof orderId !== "string" || typeof paymentId !== "string" || typeof signature !== "string") {
      return res.status(400).json({ message: "orderId, paymentId, and signature are required." });
    }

    const redemption = await RewardRedemption.findOne({ razorpayOrderId: orderId, user: userId });

    if (!redemption) {
      return res.status(404).json({ message: "Redemption record not found." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      redemption.status = "failed";
      redemption.razorpayPaymentId = paymentId;
      redemption.razorpaySignature = signature;
      await redemption.save();
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    redemption.status = "paid";
    redemption.razorpayPaymentId = paymentId;
    redemption.razorpaySignature = signature;
    await redemption.save();

    return res.json({ message: "Payment verified successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
