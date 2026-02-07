const pino = require('pino');
const { env } = require('../config/env');

const logger = pino({
    level: env.isTest ? 'silent' : (env.isProd ? 'info' : 'debug'),
    base: undefined,
    timestamp: pino.stdTimeFunctions.isoTime,
});

module.exports = {
    logger,
};
