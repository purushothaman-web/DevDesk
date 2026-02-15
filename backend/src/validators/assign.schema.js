import { z } from 'zod';

export const assignTicketSchema = z.object({
    assignedToId: z.string().min(1, 'AssignedToId is required').uuid('AssignedToId must be a valid UUID'),
})