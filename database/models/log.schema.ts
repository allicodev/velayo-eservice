import mongoose from "mongoose";
import "@/database/models/user.schema";
import "@/database/models/branch.schema";

const LogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["attendance", "stock"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: String,
    // for attendance
    timeIn: Date,
    timeOut: Date,
    timeInPhoto: String,
    timeOutPhoto: String,
    // for item stock-in | stock-out
  },
  { timestamps: true }
);

// const UserLogSchema = new mongoose.Schema({}, { timestamps: false });
// const ItemLogSchema = new mongoose.Schema({}, { timestamps: false });

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
