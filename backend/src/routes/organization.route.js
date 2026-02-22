import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { getOrganizationsController, deleteOrganizationController } from "../controllers/organization.controller.js";

const router = express.Router();

// Only SUPER_ADMIN can access organization management routes
router.get("/", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), getOrganizationsController);
router.delete("/:id", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), deleteOrganizationController);

export default router;
