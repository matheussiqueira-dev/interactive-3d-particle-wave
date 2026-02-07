const { z } = require('zod');

const submitTelemetrySchema = z.object({
    sessionId: z.string().trim().min(3).max(120),
    fpsAvg: z.number().min(0).max(500),
    fpsMin: z.number().min(0).max(500),
    fpsMax: z.number().min(0).max(500),
    particleCount: z.number().int().min(1000).max(200000),
    quality: z.enum(['auto', 'high', 'balanced', 'performance']),
    wave: z.enum(['cosmos', 'ripple', 'storm']),
    cameraActive: z.boolean(),
    reducedMotion: z.boolean(),
    latencyMs: z.number().min(0).max(10000).optional(),
    userAgent: z.string().max(240).optional(),
});

const summaryQuerySchema = z.object({
    windowMinutes: z.coerce.number().int().positive().max(10080).optional().default(60),
});

module.exports = {
    submitTelemetrySchema,
    summaryQuerySchema,
};
