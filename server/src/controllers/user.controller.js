import User from "../models/user.model.js";
import Booking from "../models/booking.model.js";
import Plan from "../models/plan.model.js";
import Staff from "../models/staff.model.js"; 
import bcrypt from "bcryptjs";


export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsers controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const subscribeToPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user._id;

    if (!["Basic", "Premium", "VIP"].includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.subscriptionHistory) {
      user.subscriptionHistory = [];
    }


    const activeSubIndex = user.subscriptionHistory.findIndex(
      (sub) => sub.status === "active"
    );

    if (activeSubIndex > -1) {
      user.subscriptionHistory[activeSubIndex].status = "upgraded";
      user.subscriptionHistory[activeSubIndex].endDate = new Date();
    }

    const newSubscription = {
      plan,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
      status: "active",
    };

    user.subscriptionHistory.push(newSubscription);

    user.markModified("subscriptionHistory");
    await user.save();

    res.status(200).json({
      message: "Subscription updated successfully!",
      subscription: newSubscription,
    });
  } catch (error) {
    console.log("Error in subscribeToPlan controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.subscriptionHistory) {
      user.subscriptionHistory = [];
    }

    const activeSub = user.subscriptionHistory.find(
      (sub) => sub.status === "active"
    );

    if (!activeSub) {
      return res
        .status(400)
        .json({ message: "No active subscription to cancel." });
    }

    activeSub.status = "cancelled";
    activeSub.endDate = new Date(); 

    user.markModified("subscriptionHistory");
    await user.save();

    res.status(200).json({
      message: "Subscription cancelled successfully!",
      subscription: activeSub,
    });
  } catch (error) {
    console.log("Error in cancelSubscription controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const adminCancelSubscription = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.subscriptionHistory) {
      user.subscriptionHistory = [];
    }

    const activeSub = user.subscriptionHistory.find(
      (sub) => sub.status === "active"
    );

    if (!activeSub) {
      return res
        .status(400)
        .json({ message: "User does not have an active subscription." });
    }

    activeSub.status = "cancelled";
    activeSub.endDate = new Date();


    const cancelledBooking = await Booking.findOneAndUpdate(
      { userId: userId, status: "active" },
      { $set: { status: "cancelled" } },
      { new: true } 
    );

    if (cancelledBooking) {
      console.log(
        `Admin action: Cancelled booking ${cancelledBooking._id} for user ${userId}.`
      );
    } else {
      console.log(
        `Admin action: No active booking found for user ${userId} to cancel.`
      );
    }

    user.markModified("subscriptionHistory");
    await user.save();

    res.status(200).json({
      message:
        "Subscription and any active bookings have been cancelled successfully!",
      subscription: activeSub,
    });
  } catch (error) {
    console.log("Error in adminCancelSubscription controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMonthlyReportData = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required." });
    }


    const users = await User.find({ role: "user" });
    const plans = await Plan.find({});
    const bookings = await Booking.find({});
    const staff = await Staff.find({}); 


    const planPriceMap = new Map(plans.map((p) => [p.name, p.price]));
    const userMap = new Map(
      users.map((u) => [
        u._id.toString(),
        { fullName: u.fullName, email: u.email },
      ])
    );
    const staffMap = new Map(staff.map((s) => [s.fullName, s.role]));


    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const reportData = []; 


    users.forEach((user) => {
      if (user.subscriptionHistory && user.subscriptionHistory.length > 0) {
        const monthlyHistory = user.subscriptionHistory.filter((sub) => {
          const eventDate = new Date(sub.startDate);
          const cancellationDate = sub.endDate ? new Date(sub.endDate) : null;
          const isNewOrUpgrade =
            eventDate >= startOfMonth && eventDate <= endOfMonth;
          const isCancellation =
            sub.status === "cancelled" &&
            cancellationDate &&
            cancellationDate >= startOfMonth &&
            cancellationDate <= endOfMonth;
          return isNewOrUpgrade || isCancellation;
        });

        monthlyHistory.forEach((sub, index) => {
          let eventType = "N/A";
          let eventDate = sub.startDate;
          let fee = 0;
          let details = sub.plan;

          if (
            sub.status === "cancelled" &&
            new Date(sub.endDate) >= startOfMonth
          ) {
            eventType = "Cancelled";
            eventDate = sub.endDate;
            fee = 0;
          } else if (sub.status === "active") {
            const previousSubscriptions = user.subscriptionHistory.slice(
              0,
              index
            );
            const wasUpgradedFrom = previousSubscriptions.find(
              (p) =>
                p.status === "upgraded" &&
                new Date(p.endDate).getTime() ===
                  new Date(sub.startDate).getTime()
            );

            if (wasUpgradedFrom) {
              eventType = "Upgraded";
              details = `${wasUpgradedFrom.plan} -> ${sub.plan}`;
            } else {
              eventType = "Subscribed";
            }
            fee = planPriceMap.get(sub.plan) || 0;
          }

          if (eventType !== "N/A") {
            reportData.push({
              fullName: user.fullName,
              email: user.email,
              details: details,
              eventType: eventType,
              date: new Date(eventDate).toLocaleDateString("en-CA"),
              fee: fee.toFixed(2),
            });
          }
        });
      }
    });


    const monthlyBookings = bookings.filter((booking) => {

      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
    });

    monthlyBookings.forEach((booking) => {
      const userInfo = userMap.get(booking.userId.toString());
      if (userInfo) {

        const designation = staffMap.get(booking.trainerName) || "Session";

        const formattedDesignation =
          designation.charAt(0).toUpperCase() + designation.slice(1);

        reportData.push({
          fullName: userInfo.fullName,
          email: userInfo.email,
          details: `${formattedDesignation} | ${booking.trainerName}`,
          eventType: "Booked Session",

          date: new Date(booking.createdAt).toLocaleDateString("en-CA"),
          fee: (50.0).toFixed(2), 
        });
      }
    });


    reportData.sort((a, b) => new Date(a.date) - new Date(b.date));


    const finalReportData = reportData.map((item) => [
      item.fullName,
      item.email,
      item.details, 
      item.eventType, 
      item.date,
      item.fee,
    ]);

    res.status(200).json(finalReportData);
  } catch (error) {
    console.error("CRITICAL ERROR in getMonthlyReportData controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id;

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUserProfile controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Error in changePassword controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;
    const authenticatedUser = req.user;


    if (
      authenticatedUser.role !== "admin" &&
      authenticatedUser._id.toString() !== userIdToDelete
    ) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not authorized." });
    }

    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    await Booking.deleteMany({ userId: userIdToDelete });
    await User.findByIdAndDelete(userIdToDelete);

    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getAdminContact = async (req, res) => {
  try {

    const adminUser = await User.findOne({ role: "admin" }).select(
      "email phoneNumber"
    );

    if (!adminUser) {
      return res.status(404).json({
        message: "Admin contact information not found.",
        email: "Not available",
        phoneNumber: "Not available",
      });
    }

    res.status(200).json({
      email: adminUser.email || "Not available",
      phoneNumber: adminUser.phoneNumber || "Not available",
    });
  } catch (error) {
    console.error("Error in getAdminContact controller:", error);
    res.status(500).json({
      message: "Internal Server Error",
      email: "Not available",
      phoneNumber: "Not available",
    });
  }
};
