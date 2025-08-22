
import express from "express";

import { protectRoute } from "../middleware/auth.middleware.js"; 
import { 
  getBookings, 
  createBooking, 
  cancelBooking 
} from "../controllers/booking.controller.js";

const router = express.Router();

// These routes are now correctly protected by the middleware
router.get("/", protectRoute, getBookings);
router.post("/create", protectRoute, createBooking);
router.delete("/cancel/:userId", protectRoute, cancelBooking);

export default router;