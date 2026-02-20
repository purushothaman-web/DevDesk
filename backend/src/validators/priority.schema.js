import { z } from 'zod';

export const updatePrioritySchema = z.object({
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});
