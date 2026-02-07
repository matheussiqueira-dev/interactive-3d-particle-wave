const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const { logger } = require('./common/logger');
const { requestContext } = require('./common/middleware/request-context');
const { notFound } = require('./common/middleware/not-found');
const { errorHandler } = require('./common/middleware/error-handler');
const { payloadGuard } = require('./common/middleware/payload-guard');
const { createContainer } = require('./container');

const { createAuthRouter } = require('./modules/auth/auth.routes');
const { createPresetsRouter } = require('./modules/presets/presets.routes');
const { createTelemetryRouter } = require('./modules/telemetry/telemetry.routes');
const { createSystemRouter } = require('./modules/system/system.routes');
const openapiDocument = require('./docs/openapi.json');

function createCorsOptions() {
    return {
        origin(origin, callback) {
            if (!origin) {
                callback(null, true);
                return;
            }

            if (env.corsOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error('Origem nao permitida por CORS'));
        },
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
        credentials: false,
        maxAge: 86400,
    };
}

function createApp(dependencies = createContainer()) {
    const app = express();

    app.set('trust proxy', 1);

    app.use(requestContext);
    app.use(pinoHttp({ logger }));

    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));

    app.use(cors(createCorsOptions()));

    app.use(express.json({ limit: '1mb', strict: true }));
    app.use(payloadGuard);

    const apiLimiter = rateLimit({
        windowMs: env.rateLimitWindowMs,
        limit: env.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Limite de requisicoes excedido. Tente novamente mais tarde.',
            },
        },
    });

    app.use('/api', apiLimiter);

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

    app.use('/api/v1/system', createSystemRouter());
    app.use('/api/v1/auth', createAuthRouter(dependencies.authController));
    app.use('/api/v1/presets', createPresetsRouter(dependencies.presetsController));
    app.use('/api/v1/telemetry', createTelemetryRouter(dependencies.telemetryController));

    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = {
    createApp,
};
