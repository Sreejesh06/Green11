const { Schema, model } = require("mongoose");

const proofSchema = new Schema(
  {
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    data: { type: Buffer },
  },
  { _id: false }
);

const challengeSubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    challengeId: { type: Number, required: true },
    challengeTitle: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    proof: proofSchema,
  },
  {
    timestamps: true,
  }
);

challengeSubmissionSchema.index({ user: 1, challengeId: 1, createdAt: -1 });

challengeSubmissionSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const payload = { ...ret };
    if (payload.proof) {
      delete payload.proof.data;
    }
    return payload;
  },
});

module.exports = model("ChallengeSubmission", challengeSubmissionSchema);
