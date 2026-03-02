import express from 'express';
import {
  createTicketController,
  getTicketsController,
  getAllTicketsController,
  updateStatusController,
  assignController,
  addCommentController,
  getTicketByIdController,
  deleteTicketController,
  updatePriorityController,
  updateDueDateController,
  getActivityLogController,
  updateTicketController,
  deleteAttachmentController,
} from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Create & list
router.post('/', authMiddleware, upload.array('attachments', 5), createTicketController);
router.get('/my', authMiddleware, getTicketsController);
router.get('/', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), getAllTicketsController);

// Single ticket mutations
router.patch('/:id/status', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), updateStatusController);
router.patch('/:id/priority', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), updatePriorityController);
router.patch('/:id/assign', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), assignController);
router.patch('/:id/due-date', authMiddleware, roleMiddleware(['ADMIN', 'SUPER_ADMIN']), updateDueDateController);
router.patch('/:id/edit', authMiddleware, updateTicketController);

// Comments & attachments
router.post('/:id/comments', authMiddleware, addCommentController);
router.delete('/:id/attachments/:attachmentId', authMiddleware, deleteAttachmentController);

// Activity log
router.get('/:id/activity', authMiddleware, roleMiddleware(['ADMIN', 'AGENT', 'SUPER_ADMIN']), getActivityLogController);

// Get & delete ticket
router.get('/:id', authMiddleware, getTicketByIdController);
router.delete('/:id', authMiddleware, deleteTicketController);

export default router;
