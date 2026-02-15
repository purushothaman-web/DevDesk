import express from 'express';
import { registerController, loginController, profileController } from '../controllers/auth.controller.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.get('/me', authMiddleware, profileController);
router.get('/admin/test', authMiddleware, roleMiddleware("ADMIN"), (req, res) => {
    res.json({ message: 'Admin access granted' });
});

export default router;
