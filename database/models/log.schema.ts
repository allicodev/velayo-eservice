import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
  },
  { timestamps: true }
);

const UserLogSchema = new mongoose.Schema({}, { timestamps: false });
const ItemLogSchema = new mongoose.Schema({}, { timestamps: false });

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
