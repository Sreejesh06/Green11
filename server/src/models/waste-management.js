const { Schema, model } = require("mongoose");

const overviewSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    active: { type: Number },
    inactive: { type: Number },
    changePercent: { type: Number },
    caption: { type: String }
  },
  { _id: false }
);

const quickActionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String }
  },
  { _id: false }
);

const sortingItemSchema = new Schema(
  {
    item: { type: String, required: true },
    instructions: { type: String, required: true }
  },
  { _id: false }
);

const sortingCategorySchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    items: { type: [sortingItemSchema], default: [] }
  },
  { _id: false }
);

const disposalEntrySchema = new Schema(
  {
    id: { type: String, required: true },
    stream: { type: String, required: true },
    amountKg: { type: Number, required: true },
    date: { type: String, required: true }
  },
  { _id: false }
);

const recognitionSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    changePercent: { type: Number }
  },
  { _id: false }
);

const goalSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: String, required: true },
    timeframe: { type: String, required: true },
    currentValue: { type: Number, required: true },
    targetValue: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  { _id: false }
);

const wasteManagementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    hero: {
      greeting: { type: String, required: true },
      userName: { type: String },
      message: { type: String, required: true }
    },
    overview: { type: [overviewSchema], default: [] },
    quickActions: { type: [quickActionSchema], default: [] },
    sortingGuide: { type: [sortingCategorySchema], default: [] },
    disposalLogs: {
      entries: { type: [disposalEntrySchema], default: [] },
      weeklySummary: {
        totalKg: { type: Number, required: true },
        diversionRate: { type: Number, required: true },
        changePercent: { type: Number, required: true }
      }
    },
    reductionSeries: {
      type: [
        new Schema(
          {
            day: { type: String, required: true },
            recycledKg: { type: Number, required: true },
            organicsKg: { type: Number, required: true },
            landfillKg: { type: Number, required: true }
          },
          { _id: false }
        )
      ],
      default: []
    },
    streamBreakdown: {
      type: [
        new Schema(
          {
            name: { type: String, required: true },
            percentage: { type: Number, required: true }
          },
          { _id: false }
        )
      ],
      default: []
    },
    recognitionBoard: { type: [recognitionSchema], default: [] },
    goals: { type: [goalSchema], default: [] }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = model("WasteManagement", wasteManagementSchema);
