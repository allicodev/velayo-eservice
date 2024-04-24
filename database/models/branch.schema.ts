import mongoose from "mongoose";

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

export default BranchModel;
