const { Schema, model } = require("mongoose");

const pageContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

module.exports = model("PageContent", pageContentSchema);
