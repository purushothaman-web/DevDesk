import express from 'express';
import { createTicketController, getTicketsController, getAllTicketsController, updateStatusController, assignController, addCommentController, getTicketByIdController, deleteTicketController, updatePriorityController, updateDueDateController, getActivityLogController } from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, upload.array('attachments', 5), createTicketController);
router.get('/my', authMiddleware, getTicketsController);
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), getAllTicketsController);
router.patch('/:id/status', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), updateStatusController);
router.patch('/:id/priority', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), updatePriorityController);
router.patch('/:id/assign', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), assignController);
router.patch('/:id/due-date', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), updateDueDateController);
router.post('/:id/comments', authMiddleware, addCommentController);
router.get('/:id/activity', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), getActivityLogController);
router.get('/:id', authMiddleware, getTicketByIdController);
router.delete('/:id', authMiddleware, deleteTicketController);

export default router;
