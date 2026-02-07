const { z } = require('zod');

const roleSchema = z.enum(['admin', 'editor']);

const registerSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(128),
    role: roleSchema.optional(),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(160),
    password: z.string().min(8).max(128),
});

module.exports = {
    roleSchema,
    registerSchema,
    loginSchema,
};
