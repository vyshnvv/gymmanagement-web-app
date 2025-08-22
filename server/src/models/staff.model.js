import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    // --- Basic Information ---
    fullName: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address.",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      
    },

    // --- Role & Specialization ---
    role: {
      type: String,
      required: true,
      enum: ["trainer", "nutritionist"], 
    },
    designation: {
      type: String,
      required: [true, "Designation is required."],
      trim: true,
      enum: [
        "Personal Trainer",
        "Head Trainer",
        "Strength & Conditioning Coach",
        "Fitness Specialist",
        "Clinical Nutritionist",
        "Sports Nutritionist",
      ],
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required."],
      trim: true,
      maxLength: [100, "Specialty cannot be more than 100 characters."],
    },

    // --- Professional Details ---
    bio: {
      type: String,
      trim: true,
      maxLength: [500, "Bio cannot be more than 500 characters."],
    },
    profilePictureUrl: {
      type: String,
      default: "https://via.placeholder.com/150", 
    },
    certifications: {
      type: [String], 
      default: [],
    },
    experienceYears: {
      type: Number,
      min: [0, "Experience cannot be negative."],
      default: 0,
    },

    // --- Availability & Scheduling ---
    availabilitySlots: {
      type: [String], 
      default: [],
    },

    // --- Administrative ---
    status: {
      type: String,
      enum: ["active", "on-leave", "inactive"],
      default: "active",
    },
  },
  {

    timestamps: true,
  }
);

// Middleware to set default designation based on role
staffSchema.pre("save", function (next) {
  if (this.isNew && !this.designation) {
    if (this.role === "trainer") {
      this.designation = "Personal Trainer";
    } else if (this.role === "nutritionist") {
      this.designation = "Clinical Nutritionist";
    }
  }
  next();
});

// Middleware to delete associated bookings when a staff member is deleted
staffSchema.pre("findOneAndDelete", async function (next) {
  try {
    // Get the document that's about to be deleted
    const staffToDelete = await this.model.findOne(this.getQuery());

    if (staffToDelete) {
      // Import Booking model dynamically to avoid circular imports
      const Booking = mongoose.model("Booking");

      // Delete all bookings associated with this trainer/nutritionist
      const deleteResult = await Booking.deleteMany({
        trainerName: staffToDelete.fullName,
      });

      console.log(
        `Deleted ${deleteResult.deletedCount} bookings for staff member: ${staffToDelete.fullName}`
      );
    }

    next();
  } catch (error) {
    console.error("Error deleting associated bookings:", error);
    next(error);
  }
});

// Alternative middleware for deleteOne method
staffSchema.pre("deleteOne", async function (next) {
  try {
    const staffToDelete = await this.model.findOne(this.getQuery());

    if (staffToDelete) {
      const Booking = mongoose.model("Booking");

      const deleteResult = await Booking.deleteMany({
        trainerName: staffToDelete.fullName,
      });

      console.log(
        `Deleted ${deleteResult.deletedCount} bookings for staff member: ${staffToDelete.fullName}`
      );
    }

    next();
  } catch (error) {
    console.error("Error deleting associated bookings:", error);
    next(error);
  }
});

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
