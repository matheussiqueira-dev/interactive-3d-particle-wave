const { z } = require('zod');

const qualitySchema = z.enum(['auto', 'high', 'balanced', 'performance']);
const waveSchema = z.enum(['cosmos', 'ripple', 'storm']);

const basePresetSchema = z.object({
    name: z.string().trim().min(2).max(80),
    description: z.string().trim().max(240).optional().default(''),
    quality: qualitySchema,
    wave: waveSchema,
    sensitivity: z.number().min(0.6).max(1.6),
    reducedMotion: z.boolean(),
    isPublic: z.boolean().default(false),
});

const createPresetSchema = basePresetSchema;

const updatePresetSchema = basePresetSchema.partial().refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
});

const listPresetQuerySchema = z.object({
    scope: z.enum(['public', 'mine', 'all']).optional().default('public'),
    search: z.string().trim().max(80).optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(30),
    cursor: z.string().optional(),
});

const presetIdParamSchema = z.object({
    presetId: z.string().trim().min(3).max(120),
});

module.exports = {
    createPresetSchema,
    updatePresetSchema,
    listPresetQuerySchema,
    presetIdParamSchema,
};
