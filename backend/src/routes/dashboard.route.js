import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { getDashboardStatsController } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", authMiddleware, roleMiddleware(["ADMIN", "AGENT"]), getDashboardStatsController);

export default router;
