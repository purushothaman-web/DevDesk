import zod from 'zod';

export const registerSchema = zod.object({
    name: zod.string().min(1, 'Name is required'),
    email: zod.string().email('Invalid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
})

export const loginSchema = zod.object({
    email: zod.string().email('Invalid email address'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
})
