import express from 'express';
import { createTicketController, getTicketsController, getAllTicketsController, updateStatusController, assignController, addCommentController, getTicketByIdController } from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('attachments', 5), createTicketController);
router.get('/my', authMiddleware, getTicketsController);
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'AGENT']), getAllTicketsController);
router.patch('/:id/status', authMiddleware, roleMiddleware(['ADMIN', 'AGENT']), updateStatusController);
router.patch('/:id/assign', authMiddleware, roleMiddleware(['ADMIN']), assignController);
router.post('/:id/comments', authMiddleware, addCommentController);
router.get('/:id', authMiddleware, getTicketByIdController);

export default router;