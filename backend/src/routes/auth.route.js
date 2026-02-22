import express from 'express';
import { registerController, loginController, profileController, getAgentsController, getUsersController, updateUserRoleController, updateProfileController, forgotPasswordController, resetPasswordController } from '../controllers/auth.controller.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { loginRateLimit, registerRateLimit } from '../middleware/ratelimit.middleware.js';

import { updateProfileSchema } from '../validators/profile.schema.js';
import { validate } from '../middleware/validate.middleware.js';

const router = express.Router();

router.post('/register', registerRateLimit, registerController);
router.post('/login', loginRateLimit, loginController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

router.get('/me', authMiddleware, profileController);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), updateProfileController);
router.get('/agents', authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), getAgentsController);
router.get('/users', authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), getUsersController);
router.patch('/users/:id/role', authMiddleware, roleMiddleware(["ADMIN", "SUPER_ADMIN"]), updateUserRoleController);

export default router;
