import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { getDashboardStatsController, getWorkloadController } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", authMiddleware, roleMiddleware(["ADMIN", "AGENT", "SUPER_ADMIN"]), getDashboardStatsController);
router.get("/workload", authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), getWorkloadController);

export default router;
