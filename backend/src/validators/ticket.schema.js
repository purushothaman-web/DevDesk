import { z }from 'zod';

export const createTicketSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(5, 'Description is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], 'Priority must be LOW, MEDIUM, or HIGH').optional(),
})