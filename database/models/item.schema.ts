import mongoose from "mongoose";

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
    itemCode: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      enum: ["pc(s)", "bot(s)", "kit(s)"],
    },
    description: String,
    remarks: String,
    //* inventory
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
      this.itemCode = (lastDocument?.itemCode || 0) + 1;
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
