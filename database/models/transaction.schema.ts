import mongoose from "mongoose";

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
      enum: ["bills", "wallet"],
      required: true,
    },
    sub_type: String,
    transactionDetails: String,
    reference: String,
    history: [TransactionHistorySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
