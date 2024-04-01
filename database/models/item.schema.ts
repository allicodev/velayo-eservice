import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isParent: {
      type: Boolean,
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      default: null,
    },
    amount: Number,
    quantity: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
