import mongoose from "mongoose";

const TransactionHistorySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "failed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true, _id: false }
);

const TransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bills", "wallet", "eload", "shopee", "miscellaneous"],
      required: true,
    },
    sub_type: String,
    transactionDetails: String,
    reference: String,
    history: [TransactionHistorySchema],
    queue: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    tellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

// TODO: fix queue not working
TransactionSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastDocument = await TransactionModel.findOne(
        {},
        { queue: 1 },
        { sort: { createdAt: -1 } }
      );

      const lastQueueNumber = lastDocument ? lastDocument.queue || 0 : 0;

      const today = new Date();
      const createdAtDate = new Date(this.createdAt);
      if (today.toDateString() !== createdAtDate.toDateString()) {
        this.queue = 1;
      } else {
        this.queue = lastQueueNumber + 1;
      }
    } catch (error) {
      console.error("Error retrieving last document:", error);
      this.queue = 1;
    }
  }
  next();
});

let TransactionModel =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);

export default TransactionModel;
