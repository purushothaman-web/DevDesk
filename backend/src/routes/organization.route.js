import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { getOrganizationsController, deleteOrganizationController, getOrganizationSlaController, updateOrganizationSlaController } from "../controllers/organization.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateOrganizationSlaSchema } from "../validators/organization.schema.js";

const router = express.Router();

// Only SUPER_ADMIN can access organization management routes
router.get("/", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), getOrganizationsController);
router.delete("/:id", authMiddleware, roleMiddleware(["SUPER_ADMIN"]), deleteOrganizationController);
router.get("/sla", authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), getOrganizationSlaController);
router.patch("/sla", authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), validate(updateOrganizationSlaSchema), updateOrganizationSlaController);

export default router;
