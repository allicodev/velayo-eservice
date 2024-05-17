import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    // for employee
    employeeId: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("findOneAndUpdate", function (next) {
  (this.getUpdate() as any).$set.role = (
    this.getUpdate() as any
  ).$set.role.toLocaleLowerCase();
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
