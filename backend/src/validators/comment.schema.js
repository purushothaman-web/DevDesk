import { z } from 'zod';

export const commentSchema = z.object({
  message: z.string().min(2, "Comment must be at least 2 characters")
});