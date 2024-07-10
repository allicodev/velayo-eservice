import mongoose from "mongoose";

const ItemCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ItemCategory ||
  mongoose.model("ItemCategory", ItemCategorySchema);
