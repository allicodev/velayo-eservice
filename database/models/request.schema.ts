import mongoose from "mongoose";
import "@/database/models/portal.schema";
import "@/database/models/user.schema";

const RequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["balance_request"],
      required: true,
    },

    // balance_request
    amount: Number,
    portalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portal",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    encoderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
