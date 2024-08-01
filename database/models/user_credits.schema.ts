import mongoose from "mongoose";

const UserCreditSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    middlename: String,
    lastname: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    maxCredit: {
      type: Number,
      required: true,
    },
    creditTerm: {
      type: Number,
      enum: [7, 15, 30],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserCredit ||
  mongoose.model("UserCredit", UserCreditSchema);
