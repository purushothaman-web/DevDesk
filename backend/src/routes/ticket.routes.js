import express from 'express';
import { createTicketController, getTicketsController, getAllTicketsController, updateStatusController, assignController } from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createTicketController);
router.get('/my', authMiddleware, getTicketsController);
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'AGENT']), getAllTicketsController);
router.patch('/:id/status', authMiddleware, roleMiddleware(['ADMIN', 'AGENT']), updateStatusController);
router.patch('/:id/assign', authMiddleware, roleMiddleware(['ADMIN']), assignController)
export default router;