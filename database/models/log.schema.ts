import mongoose from "mongoose";
import "@/database/models/user.schema";
import "@/database/models/branch.schema";
import "@/database/models/portal.schema";
import "@/database/models/transaction.schema";
import "@/database/models/user_credits.schema";
import { ItemWithStockSchema } from "@/database/models/branch.schema";

const LogTime = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["time-in", "time-out"],
      required: true,
    },
    time: {
      type: Date,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
  },
  { timestamps: false, _id: false }
);

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
        "disbursement",
        "error",
        "ca",
      ],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },

    // for attendance
    // @ implementing flexi-time attendance

    flexiTime: [LogTime],
    // timeIn: Date,
    // timeOut: Date,
    // timeInPhoto: String,
    // timeOutPhoto: String,

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

    userCreditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCredit",
    },

    // cashbox
    subType: String,

    interest: Number,
    dueDate: Date,
    history: Array,

    remarks: String,
    attributes: String, // @@ this is different from remarks, attributes is a stringified object where you can add additonal data for the Log data
  },
  { timestamps: true }
);

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
