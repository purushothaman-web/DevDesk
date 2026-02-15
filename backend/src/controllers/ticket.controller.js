import { prisma } from '../db/client.js';
import { createTicketSchema } from '../validators/ticket.schema.js';
import { updateStatusSchema } from '../validators/status.schema.js';
import { assignTicketSchema } from '../validators/assign.schema.js';

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
    const tickets = await prisma.ticket.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
}

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
