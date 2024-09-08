import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    // for eload
    disabled_eload: [{ type: String }],
    fee: Number,
    threshold: Number,
    additionalFee: Number,
    queue: [Object],
  },
  { timestamps: false }
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
