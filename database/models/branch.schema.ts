import mongoose from "mongoose";
import "./item.schema";

const ItemWithStockSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    stock_count: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

const BranchSchema = new mongoose.Schema(
  {
    name: String,
    address: {
      type: String,
      required: true,
    },
    device: {
      type: String,
      reqiured: true,
    },
    spm: {
      type: String,
      required: true,
    },
    items: [ItemWithStockSchema],
  },
  { timestamps: true }
);

BranchSchema.pre("save", async function (next) {
  if (this.isNew) {
    if ([null, "", undefined].includes(this.name!)) {
      try {
        const length = await BranchModel.countDocuments();
        this.name = `Branch ${length + 1}`;
      } catch (error) {
        console.error("Error retrieving last document:", error);
      }
    }
  }
  next();
});

const BranchModel =
  mongoose.models.Branch || mongoose.model("Branch", BranchSchema);

export { ItemWithStockSchema };
export default BranchModel;
