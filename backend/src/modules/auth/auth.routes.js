const express = require('express');
const rateLimit = require('express-rate-limit');
const { validate } = require('../../common/middleware/validate');
const { asyncHandler } = require('../../common/async-handler');
const { authenticate, optionalAuthenticate } = require('../../common/middleware/auth');
const { env } = require('../../config/env');
const { loginSchema, registerSchema } = require('./auth.schema');

function createAuthRouter(controller) {
    const router = express.Router();

    const authLimiter = rateLimit({
        windowMs: env.rateLimitWindowMs,
        limit: env.authRateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Muitas tentativas em pouco tempo. Tente novamente em instantes.',
            },
        },
    });

    router.post('/register', authLimiter, optionalAuthenticate, validate(registerSchema), asyncHandler(controller.register));
    router.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));
    router.get('/me', authenticate, asyncHandler(controller.me));

    return router;
}

module.exports = {
    createAuthRouter,
};
