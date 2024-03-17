import mongoose from "mongoose";
import { FormFieldSchema } from "./bill.schema";

const WalletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cashinType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },
    cashinFeeValue: {
      type: Number,
      required: true,
    },
    cashoutType: {
      type: String,
      enum: ["percent", "fixed"],
      required: true,
    },
    cashoutFeeValue: {
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
