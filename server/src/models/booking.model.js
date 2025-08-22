import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,

    },
    userName: { type: String, required: true },
    trainerName: { type: String, required: true },
    slot: { type: String, required: true },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active", 
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
