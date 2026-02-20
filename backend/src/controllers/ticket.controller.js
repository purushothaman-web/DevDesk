import { prisma } from '../db/client.js';
import { createTicketSchema } from '../validators/ticket.schema.js';
import { updateStatusSchema } from '../validators/status.schema.js';
import { assignTicketSchema } from '../validators/assign.schema.js';
import { commentSchema } from '../validators/comment.schema.js';
import { updatePrioritySchema } from '../validators/priority.schema.js';
import { ApiResponse } from "../utils/response.js";
import { sendAssignmentMail, sendAgentAssignmentMail, sendStatusChangeEmail } from '../services/mail.service.js';

// Helper — fire-and-forget activity log write
const logActivity = (ticketId, userId, action, detail) => {
  prisma.activityLog.create({ data: { ticketId, userId, action, detail } }).catch(() => {});
};

export const createTicketController = async (req, res, next) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);
    const { title, description, priority } = validatedData;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority,
        userId: req.user.id,
      },
    });

    if (req.files && req.files.length > 0) {
      const attachments = await Promise.all(
        req.files.map(file =>
          prisma.attachment.create({
            data: {
              fileName: file.originalname,
              filePath: file.path,
              mimeType: file.mimetype,
              ticketId: ticket.id,
            },
          })
        )
      );
    }

    return ApiResponse.success(res, 201, "Ticket created successfully", ticket);
  } catch (error) {
    return next(error);
  }
};


export const getTicketsController = async (req, res, next) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    })
    return ApiResponse.success(res, 200, "Tickets fetched successfully", tickets);
  } catch (error) {
    return next(error);
  }
}

export const getAllTicketsController = async (req, res, next) => {
  try {
    let { status, priority, assignedToId, search, page, limit } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const where = { isDeleted: false };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.ticket.count({ where });

    return ApiResponse.success(res, 200, "All tickets fetched successfully", {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};


export const updateStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const ticket = await prisma.ticket.update({
      where: { id, isDeleted: false },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    logActivity(id, req.user.id, 'STATUS_CHANGED', `Status changed to ${status.replace('_', ' ')}`);

    // Fire-and-forget email notification
    sendStatusChangeEmail(ticket.user.email, ticket.user.name, ticket.title, status);

    return ApiResponse.success(res, 200, "Ticket status updated successfully", ticket);

  } catch (error) {
    return next(error);
  }
};


export const assignController = async (req, res, next) => {
  try {
    const { id } = req.params;
    // agentId can be null (to unassign)
    const { assignedToId: agentId } = req.body;

    const ticket = await prisma.ticket.findFirst({ where: { id, isDeleted: false } });
    if (!ticket) return ApiResponse.error(res, 404, "Ticket not found");

    let agentName = null;
    if (agentId) {
      const agent = await prisma.user.findUnique({ where: { id: agentId } });
      if (!agent) return ApiResponse.error(res, 404, "Agent not found");
      if (agent.role !== "AGENT") return ApiResponse.error(res, 400, "User is not an agent");
      agentName = agent.name;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id, isDeleted: false },
      data: { assignedToId: agentId ?? null },
      include: {
        user: { select: { email: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (agentId) {
      logActivity(id, req.user.id, 'ASSIGNED', `Assigned to ${agentName}`);
      (async () => {
        await sendAssignmentMail(updatedTicket.user.email, updatedTicket.user.name, updatedTicket.title, agentName);
        await new Promise(r => setTimeout(r, 1000));
        await sendAgentAssignmentMail(agentName, agentName, updatedTicket.title, updatedTicket.id, updatedTicket.priority);
      })();
    } else {
      logActivity(id, req.user.id, 'UNASSIGNED', 'Assignment cleared');
    }

    return ApiResponse.success(res, 200, agentId ? "Ticket assigned successfully" : "Ticket unassigned", updatedTicket);
  } catch (error) {
    return next(error);
  }
};

export const addCommentController = async (req, res, next ) => {
  try {
    const { id: ticketId } = req.params;
    const { message } = commentSchema.parse(req.body);

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, isDeleted: false }
    });

    if (!ticket) {
      return ApiResponse.error(res, 404, "Ticket not found");
    }

    // If USER, only allow commenting on own ticket
    if (
      req.user.role === "USER" &&
      ticket.userId !== req.user.id
    ) {
      return ApiResponse.error(res, 403, "Forbidden");
    }

    const comment = await prisma.comment.create({
      data: { message, ticketId, userId: req.user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
    });

    logActivity(ticketId, req.user.id, 'COMMENTED', `Comment added`);

    return ApiResponse.success(res, 201, "Comment added successfully", comment);

  } catch (error) {
    return next(error);
  }
};

export const getTicketByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        comments: {
          include: {
            user: {
        select: { id: true, name: true, role: true }
      }
    },
    orderBy: { createdAt: "asc" }
  }
}
    });

    if (!ticket) {
      return ApiResponse.error(res, 404, "Ticket not found");
    }

    return ApiResponse.success(res, 200, "Ticket fetched successfully", ticket);

  } catch (error) {
    return next(error);
  }
};


export const deleteTicketController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, isDeleted: false }
    });

    if (!ticket) {
      return ApiResponse.error(res, 404, "Ticket not found");
    }

    if (req.user.role !== "ADMIN" && ticket.userId !== req.user.id) {
      return ApiResponse.error(res, 403, "Forbidden");
    }

    const deletedTicket = await prisma.ticket.update({
      where: { id },
      data: { isDeleted: true }
    });

    return ApiResponse.success(res, 200, "Ticket deleted successfully", deletedTicket);

  } catch (error) {
    return next(error);
  }
}

export const updatePriorityController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = updatePrioritySchema.parse(req.body);

    const ticket = await prisma.ticket.findFirst({ where: { id, isDeleted: false } });
    if (!ticket) return ApiResponse.error(res, 404, "Ticket not found");

    const updated = await prisma.ticket.update({
      where: { id },
      data: { priority },
    });

    logActivity(id, req.user.id, 'PRIORITY_CHANGED', `Priority changed to ${priority}`);

    return ApiResponse.success(res, 200, "Priority updated successfully", updated);
  } catch (error) {
    return next(error);
  }
};

export const updateDueDateController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

    const ticket = await prisma.ticket.findFirst({ where: { id, isDeleted: false } });
    if (!ticket) return ApiResponse.error(res, 404, "Ticket not found");

    const parsedDate = dueDate ? new Date(dueDate) : null;
    if (dueDate && isNaN(parsedDate)) {
      return ApiResponse.error(res, 400, "Invalid date format");
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { dueDate: parsedDate },
    });

    logActivity(id, req.user.id, 'DUE_DATE_SET', dueDate ? `Due date set to ${parsedDate.toDateString()}` : 'Due date cleared');

    return ApiResponse.success(res, 200, "Due date updated successfully", updated);
  } catch (error) {
    return next(error);
  }
};

export const getActivityLogController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findFirst({ where: { id, isDeleted: false } });
    if (!ticket) return ApiResponse.error(res, 404, "Ticket not found");

    const logs = await prisma.activityLog.findMany({
      where: { ticketId: id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return ApiResponse.success(res, 200, "Activity log fetched successfully", logs);
  } catch (error) {
    return next(error);
  }
};
