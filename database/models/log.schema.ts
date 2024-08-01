import mongoose from "mongoose";
import "@/database/models/user.schema";
import "@/database/models/branch.schema";
import "@/database/models/portal.schema";
import "@/database/models/transaction.schema";
import "@/database/models/user_credits.schema";
import { ItemWithStockSchema } from "@/database/models/branch.schema";

const LogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "attendance",
        "stock",
        "credit",
        "debit",
        "portal",
        "credit",
        "credit_payment",
      ],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branchId: String,

    // for attendance
    timeIn: Date,
    timeOut: Date,
    timeInPhoto: String,
    timeOutPhoto: String,

    // for item stock-in | stock-out
    stockType: {
      type: String,
      enum: ["stock-in", "stock-out", "misc"],
    },
    items: [ItemWithStockSchema],

    // portal
    portalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portal",
    },
    rebate: Number,

    // for encoder
    amount: Number,
    balanceType: {
      // for credit
      type: String,
      enum: ["bills", "wallet", "eload"],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
    },

    // * for credit
    // {
    //   status: "requested", // completed
    //   date:  Date(),
    // }
    userCreditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCredit",
    },
    interest: Number,
    dueDate: Date,
    history: Array,
  },
  { timestamps: true }
);

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
