import mongoose from "mongoose";

const PortalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    assignTo: {
      type: [String],
      required: true,
    },
  },
  { timestamps: false }
);

export default mongoose.models.Portal || mongoose.model("Portal", PortalSchema);
