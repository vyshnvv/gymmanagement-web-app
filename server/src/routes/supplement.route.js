import express from "express";
import {
  getSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from "../controllers/supplement.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route to get all supplements (for the store view)
router.get("/", getSupplements);

// Admin-only routes for managing supplements
router.post("/", protectRoute, createSupplement);
router.put("/:id", protectRoute, updateSupplement);
router.delete("/:id", protectRoute, deleteSupplement);

export default router;
