import { z } from 'zod';

export const updateStatusSchema = z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
})