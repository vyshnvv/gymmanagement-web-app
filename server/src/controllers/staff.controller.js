import Staff from "../models/staff.model.js";
import Booking from "../models/booking.model.js"; 
import mongoose from "mongoose";


const checkAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({ message: "Forbidden: Admin access required." });
    return false;
  }
  return true;
};


export const getAllStaff = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const staff = await Staff.find({}).sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error in getAllStaff controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getActiveStaff = async (req, res) => {
  try {

    const staff = await Staff.find({ status: "active" }).select(
      "fullName role designation specialty availabilitySlots"
    );
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error in getActiveStaff controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createStaff = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const { fullName, email, role, specialty } = req.body;
    if (!fullName || !email || !role || !specialty) {
      return res.status(400).json({
        message: "Full name, email, role, and specialty are required.",
      });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res
        .status(409)
        .json({ message: "A staff member with this email already exists." });
    }

    const newStaff = new Staff(req.body);
    await newStaff.save();
    res.status(201).json(newStaff);
  } catch (error) {
    console.error("Error in createStaff controller:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateStaff = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid staff ID." });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found." });
    }
    res.status(200).json(updatedStaff);
  } catch (error) {
    console.error("Error in updateStaff controller:", error);
    if (error.code === 11000) {

      return res.status(409).json({
        message: "Another staff member already exists with this email.",
      });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteStaff = async (req, res) => {
  if (!checkAdmin(req, res)) return;

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid staff ID." });
    }


    const staffToDelete = await Staff.findById(id);
    if (!staffToDelete) {
      return res.status(404).json({ message: "Staff member not found." });
    }


    const bookingDeleteResult = await Booking.deleteMany({
      trainerName: staffToDelete.fullName,
    });


    const deletedStaff = await Staff.findByIdAndDelete(id);

    console.log(`Deleted staff member: ${staffToDelete.fullName}`);
    console.log(
      `Deleted ${bookingDeleteResult.deletedCount} associated bookings`
    );

    res.status(200).json({
      message: "Staff member deleted successfully.",
      deletedBookings: bookingDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteStaff controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
