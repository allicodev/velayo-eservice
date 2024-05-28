import mongoose from "mongoose";
import "@/database/models/user.schema";
import "@/database/models/branch.schema";
import "@/database/models/transaction.schema";

const LogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["attendance", "stock", "credit", "debit"],
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

    // for encoder
    amount: Number,
    balanceType: {
      // for credit
      type: String,
      enum: ["bills", "wallet", "eload"],
    },
    transactionId: {
      // for debit, if encoder approve the teller transact request
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
    }, // * only for credit
    // {
    //   status: "requested", // completed
    //   date:  Date(),
    // }
  },
  { timestamps: true }
);

// const UserLogSchema = new mongoose.Schema({}, { timestamps: false });
// const ItemLogSchema = new mongoose.Schema({}, { timestamps: false });

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
