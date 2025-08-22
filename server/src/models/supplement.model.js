import mongoose from "mongoose";

const supplementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "whey-protein",
        "casein-protein",
        "creatine",
        "pre-workout",
        "multivitamins",
        "fish-oil",
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    flavor: {
      type: String,
      default: "N/A",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Supplement = mongoose.model("Supplement", supplementSchema);

export default Supplement;
