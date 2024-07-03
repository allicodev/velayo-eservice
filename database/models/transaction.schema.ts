import mongoose from "mongoose";
import "@/database/models/user.schema";
import "@/database/models/branch.schema";
import "@/database/models/bill.schema";
import "@/database/models/wallet.schema";

const TransactionHistorySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["request", "completed", "failed", "pending"],
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
    billerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    encoderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    queue: {
      type: Number,
      default: 1,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: Number,
    tellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    // for only ewallet cashout
    traceId: String,

    // for online cash payment
    isOnlinePayment: {
      type: Boolean,
      default: false,
    },
    portal: String,
    receiverName: String,
    recieverNum: String,
    cash: Number,
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
        {
          branchId: this.branchId,
        },
        { queue: 1, createdAt: 1 },
        { sort: { createdAt: -1 } }
      );

      const lastQueueNumber = lastDocument ? lastDocument.queue || 0 : 0;

      const today = new Date();
      const createdAtDate = new Date(lastDocument.createdAt);

      if (today.getDate() !== createdAtDate.getDate()) {
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
