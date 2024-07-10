import mongoose from "mongoose";
import "@/database/models/portal.schema";
import "@/database/models/user.schema";
import t from "@/database/models/transaction.schema";
import b from "@/database/models/branch.schema";

const RequestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["balance_request", "queue"],
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
      enum: ["pending", "completed", "rejected"],
      default: "pending",
    },
    encoderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // queue
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: t,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: b,
    },
    billingType: {
      type: String,
      enum: ["bills", "wallet", "eload", "shopee", "miscellaneous"],
    },
    queue: Number,
  },
  { timestamps: true }
);

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
