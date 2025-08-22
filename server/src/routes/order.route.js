import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createSupplementOrder } from "../controllers/order.controller.js";

const router = express.Router();

// A protected route for users to place a supplement order
router.post("/supplements", protectRoute, createSupplementOrder);

export default router;
