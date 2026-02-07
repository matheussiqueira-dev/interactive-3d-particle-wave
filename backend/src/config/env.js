const path = require('node:path');
const dotenv = require('dotenv');
const { z } = require('zod');

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    CORS_ORIGIN: z.string().default('http://localhost:5500'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter ao menos 16 caracteres'),
    JWT_EXPIRES_IN: z.string().default('1h'),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
    ALLOW_PUBLIC_REGISTRATION: z.string().default('true'),
    DATA_FILE: z.string().default('./data/db.json'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Falha ao validar variaveis de ambiente: ${issues}`);
}

const raw = parsed.data;

const corsOrigins = raw.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const env = {
    nodeEnv: raw.NODE_ENV,
    isProd: raw.NODE_ENV === 'production',
    isTest: raw.NODE_ENV === 'test',
    port: raw.PORT,
    corsOrigins,
    jwtSecret: raw.JWT_SECRET,
    jwtExpiresIn: raw.JWT_EXPIRES_IN,
    rateLimitWindowMs: raw.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: raw.RATE_LIMIT_MAX,
    authRateLimitMax: raw.AUTH_RATE_LIMIT_MAX,
    allowPublicRegistration: raw.ALLOW_PUBLIC_REGISTRATION.toLowerCase() === 'true',
    dataFile: path.resolve(process.cwd(), raw.DATA_FILE),
};

module.exports = {
    env,
};
