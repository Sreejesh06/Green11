const { Schema, model } = require("mongoose");

const rewardRedemptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rewardId: { type: Number, required: true },
    rewardName: { type: String, required: true },
    cost: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    amount: { type: Number, required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("RewardRedemption", rewardRedemptionSchema);
