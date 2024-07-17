import mongoose from "mongoose";
import ItemCategory from "@/database/models/item_category.schema";

// todo: fix isParent
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
    unit: {
      type: String,
      enum: ["pc(s)", "bot(s)", "kit(s)"],
    },
    itemCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ItemCategory,
    },
    itemCode: Number,
    description: String,
    remarks: String,
    //* inventory
    cost: Number,
    price: Number,
    quantity: Number,
  },
  {
    timestamps: true,
  }
);

ItemSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastDocument = await ItemnModel.findOne(
        {},
        {},
        { sort: { itemCode: -1 } }
      );
      this.itemCode = this.isParent ? null : (lastDocument?.itemCode || 0) + 1;
      next();
    } catch (error) {
      next(error as any);
    }
  } else {
    next();
  }
});

let ItemnModel = mongoose.models.Item || mongoose.model("Item", ItemSchema);

export default ItemnModel;
