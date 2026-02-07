const { ZodError } = require('zod');
const { AppError } = require('../errors/app-error');
const { logger } = require('../logger');

function errorHandler(err, req, res, next) {
    const requestId = req.requestId;

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Dados de entrada invalidos',
                details: err.issues,
                requestId,
            },
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                code: err.code,
                message: err.message,
                details: err.details,
                requestId,
            },
        });
    }

    logger.error({ err, requestId }, 'Erro interno nao tratado');

    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Erro interno do servidor',
            requestId,
        },
    });
}

module.exports = {
    errorHandler,
};
