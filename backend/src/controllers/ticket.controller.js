import { prisma } from '../db/client.js';
import { createTicketSchema } from '../validators/ticket.schema.js';
import { updateStatusSchema } from '../validators/status.schema.js';
import { assignTicketSchema } from '../validators/assign.schema.js';
import { commentSchema } from '../validators/comment.schema.js';

export const createTicketController = async (req, res) => {
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

    return res.status(201).json(ticket);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }

    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


export const getTicketsController = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

export const getAllTicketsController = async (req, res) => {
  try {
    let { status, priority, assignedToId, page, limit } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;
    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const where = {};

    const allowedStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      where.status = status;
    }

    const allowedPriorities = ["LOW", "MEDIUM", "HIGH"];
    if (priority) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({ error: "Invalid priority value" });
      }
      where.priority = priority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.ticket.count({ where });

    return res.status(200).json({
      data: tickets,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};


export const updateStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = updateStatusSchema.parse(req.body);

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status },
    });

    return res.json(ticket);

  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.status(500).json({ error: "Something went wrong" });
  }
};


export const assignController = async (req, res) => {
  try {
    const validatedData = assignTicketSchema.parse(req.body);
    const { assignedToId: agentId } = validatedData;
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const agent = await prisma.user.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (agent.role !== "AGENT") {
      return res.status(400).json({ message: "User is not an agent" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: agentId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      }
    });

    return res.json(updatedTicket);

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }

    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const addCommentController = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    const { message } = commentSchema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // If USER, only allow commenting on own ticket
    if (
      req.user.role === "USER" &&
      ticket.userId !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const comment = await prisma.comment.create({
      data: {
        message,
        ticketId,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      }
    });

    return res.status(201).json(comment);

  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ errors: error.errors });
    }

    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export const getTicketByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.json(ticket);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

