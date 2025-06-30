import mongoose from "mongoose";
import "./item.schema";

const FeeThresholdSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["bills", "wallet"],
    },
    subType: String,
    link_id: {
      type: String,
      required: true,
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    charge: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const FeeThresholdModel =
  mongoose.models.FeeThreshold ||
  mongoose.model("FeeThreshold", FeeThresholdSchema);

export default FeeThresholdModel;
