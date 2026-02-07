const { createApp } = require('./app');
const { createContainer } = require('./container');
const { env } = require('./config/env');
const { logger } = require('./common/logger');

async function bootstrap() {
    const container = createContainer();
    await container.store.ensureInitialized();

    const app = createApp(container);

    const server = app.listen(env.port, () => {
        logger.info({ port: env.port, environment: env.nodeEnv }, 'Backend API iniciado');
    });

    const shutdown = (signal) => {
        logger.info({ signal }, 'Encerrando servidor');
        server.close(() => process.exit(0));
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
    logger.error({ err: error }, 'Falha critica no bootstrap da API');
    process.exit(1);
});
