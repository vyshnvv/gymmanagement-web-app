import Booking from "../models/booking.model.js";

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({});
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings." });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId, userName, trainerName, slot } = req.body;


    if (!userId || !userName || !trainerName || !slot) {
      return res.status(400).json({
        message:
          "All fields (userId, userName, trainerName, slot) are required.",
      });
    }


    const existingSlot = await Booking.findOne({
      trainerName,
      slot,
      status: "active",
    });
    if (existingSlot) {
      return res.status(409).json({ message: "This slot is already booked." });
    }


    const existingUserBooking = await Booking.findOne({
      userId,
      status: "active",
    });
    if (existingUserBooking) {
      return res
        .status(409)
        .json({ message: "You can only have one active session at a time." });
    }


    const newBooking = new Booking({
      userId,
      userName,
      trainerName,
      slot,
      status: "active", 
    });

    const savedBooking = await newBooking.save();


    res.status(201).json(savedBooking);
  } catch (error) {
    console.error("Error creating booking:", error); 
    res.status(500).json({ message: "Failed to create booking." });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedBooking = await Booking.findOneAndUpdate(
      { userId, status: "active" },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Active booking not found." });
    }
    res.status(200).json({ message: "Booking cancelled successfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel booking." });
  }
};
