const { Schema, model } = require("mongoose");

const toggleSchema = new Schema(
  {
    id: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSettingsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    profile: {
      username: { type: String, trim: true, lowercase: true },
    },
    emailPreferences: { type: [toggleSchema], default: [] },
    pushNotifications: { type: [toggleSchema], default: [] },
    privacyToggles: { type: [toggleSchema], default: [] },
    appearance: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: "en" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("UserSettings", userSettingsSchema);
