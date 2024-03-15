import mongoose from "mongoose";

const GcashSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cash-in", "cash-out"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const TransactionHistorySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true, _id: false }
);

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    sub_type: String,
    gcash: GcashSchema,
    bill: String,
    history: [TransactionHistorySchema],
    reference: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
