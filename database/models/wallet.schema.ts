import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },
    feeValue: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
