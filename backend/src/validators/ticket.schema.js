import { z } from 'zod';

export const createTicketSchema = z.object({
    title: z.string().min(3, 'Title is required'),
    description: z.string().min(5, 'Description is required'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    tags: z.array(z.string().min(1).max(30)).max(5).optional().default([]),
    category: z.string().max(50).optional(),
});

export const updateTicketSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
    tags: z.array(z.string().min(1).max(30)).max(5).optional(),
    category: z.string().max(50).optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided to update',
});