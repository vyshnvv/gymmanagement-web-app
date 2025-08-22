import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  subscribeToPlan,
  cancelSubscription,
  getUsers,
  adminCancelSubscription,
  getMonthlyReportData,
  updateUserProfile,
  changePassword,
  deleteUser,
  getAdminContact, 
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsers);

// --- NEW: Admin Contact Route (accessible to all authenticated users) ---
router.get("/admin-contact", protectRoute, getAdminContact);

// --- Subscription Management ---
router.post("/subscribe", protectRoute, subscribeToPlan);
router.post("/cancel-subscription", protectRoute, cancelSubscription);

// --- Profile Management ---
router.put("/profile", protectRoute, updateUserProfile);
router.post("/change-password", protectRoute, changePassword);

// --- Admin-Specific Routes ---
router.post(
  "/admin/cancel-subscription/:userId",
  protectRoute,
  adminCancelSubscription
);
router.get("/reports/monthly", protectRoute, getMonthlyReportData);

// --- Account Deletion ---
// Note: This route is placed last to avoid conflicts with other routes like /profile
router.delete("/:id", protectRoute, deleteUser);

export default router;
