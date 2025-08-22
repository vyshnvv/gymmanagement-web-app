import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllStaff,
  getActiveStaff, 
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staff.controller.js";

const router = express.Router();

// Public route for fetching active staff (for booking purposes)
router.get("/active", protectRoute, getActiveStaff);

// Admin-only routes
router.get("/", protectRoute, getAllStaff);
router.post("/", protectRoute, createStaff);
router.put("/:id", protectRoute, updateStaff);
router.delete("/:id", protectRoute, deleteStaff);

export default router;
