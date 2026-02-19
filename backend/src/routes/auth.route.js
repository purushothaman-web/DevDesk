import express from 'express';
import { registerController, loginController, profileController } from '../controllers/auth.controller.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { loginRateLimit, registerRateLimit } from '../middleware/ratelimit.middleware.js';

const router = express.Router();

router.post('/register', registerRateLimit, registerController);
router.post('/login', loginRateLimit, loginController);
router.get('/me', authMiddleware, profileController);
router.get('/admin/test', authMiddleware, roleMiddleware("ADMIN"), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

export default router;
