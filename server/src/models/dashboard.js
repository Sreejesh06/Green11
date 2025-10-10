const { Schema, model } = require("mongoose");

const challengeSchema = new Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, required: true },
    points: { type: Number, required: true },
    deadline: { type: String, required: true },
    icon: { type: String, required: true },
    difficulty: { type: String, required: true },
    progress: { type: Number, required: true }
  },
  { _id: false }
);

const activitySchema = new Schema(
  {
    id: { type: Number, required: true },
    user: { type: String, required: true },
    action: { type: String, required: true },
    time: { type: String, required: true },
    points: { type: Number, required: true },
    avatar: { type: String, required: true }
  },
  { _id: false }
);

const highlightSchema = new Schema(
  {
    id: { type: Number, required: true },
    label: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  { _id: false }
);

const dashboardSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    welcome: {
      userName: { type: String, required: true },
      message: { type: String, required: true }
    },
    stats: {
      totalGreenPoints: {
        value: { type: Number, required: true },
        changePercent: { type: Number, required: true }
      },
      teamRank: {
        value: { type: Number, required: true },
        delta: { type: Number, required: true }
      },
      challenges: {
        completed: { type: Number, required: true },
        total: { type: Number, required: true },
        status: { type: String, required: true }
      },
      teamMembers: {
        active: { type: Number, required: true },
        total: { type: Number, required: true },
        status: { type: String, required: true }
      }
    },
    activeChallenges: { type: [challengeSchema], default: [] },
    recentActivities: { type: [activitySchema], default: [] },
    weeklyHighlights: { type: [highlightSchema], default: [] }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = model("Dashboard", dashboardSchema);
