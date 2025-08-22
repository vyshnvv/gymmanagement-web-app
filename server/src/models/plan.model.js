import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["Basic", "Premium", "VIP"], // Ensures only these plan names can exist
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String], // An array of strings
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
