import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getPlans, updatePlan } from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/", getPlans);
router.put("/:id", protectRoute, updatePlan);

export default router;
