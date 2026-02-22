import zod from 'zod';

export const registerSchema = zod.object({
    name: zod.string().min(1, 'Name is required'),
    email: zod.string().email('Invalid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    organizationName: zod.string().min(1, 'Organization name is required'),
})

export const createUserSchema = zod.object({
  name: zod.string().min(1, 'Name is required'),
  email: zod.string().email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters long'),
  role: zod.enum(['USER', 'AGENT', 'ADMIN']),
})

export const loginSchema = zod.object({
    email: zod.string().email('Invalid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
})
