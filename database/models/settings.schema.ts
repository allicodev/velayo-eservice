import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    disabled_eload: [{ type: String }],
  },
  { timestamps: false }
);

export default mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);
