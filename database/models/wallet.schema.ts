import mongoose from "mongoose";
import { FormFieldSchema } from "./bill.schema";

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
    cashInFormField: [FormFieldSchema],
    cashOutFormField: [FormFieldSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);
