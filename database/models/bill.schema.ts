import mongoose from "mongoose";

export const FormFieldSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["input", "number", "textarea", "checkbox", "select"],
    },
    name: {
      type: String,
      required: true,
    },
    slug_name: {
      type: String,
      required: true,
    },
    inputOption: {
      minLength: {
        type: Number,
        required: function (this: any) {
          return this.type === "input";
        },
      },
      maxLength: {
        type: Number,
        required: function (this: any) {
          return this.type === "input";
        },
      },
    },
    inputNumberOption: {
      mainAmount: {
        type: Boolean,
        default: false,
      },
      isMoney: {
        type: Boolean,
        default: false,
      },
      min: {
        type: Number,
        required: function (this: any) {
          return this.type === "number";
        },
      },
      max: {
        type: Number,
        required: function (this: any) {
          return this.type === "number";
        },
      },
    },
    textareaOption: {
      minRow: {
        type: Number,
        required: function (this: any) {
          return this.type === "textarea";
        },
      },
      maxRow: {
        type: Number,
        required: function (this: any) {
          return this.type === "textarea";
        },
      },
    },
    selectOption: {
      items: {
        type: [Object],
        required: function (this: any) {
          return this.type === "select";
        },
      },
    },
  },
  { timestamps: false, _id: false }
);

const BillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
      default: 0,
    },
    threshold: {
      type: Number,
      required: true,
      default: 0,
    },
    additionalFee: {
      type: Number,
      required: true,
      default: 0,
    },
    formField: [FormFieldSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Bill || mongoose.model("Bill", BillSchema);
