const { AppError } = require('../errors/app-error');

const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor']);

function hasForbiddenKey(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }

    if (Array.isArray(value)) {
        return value.some((item) => hasForbiddenKey(item));
    }

    for (const key of Object.keys(value)) {
        if (forbiddenKeys.has(key)) {
            return true;
        }

        if (hasForbiddenKey(value[key])) {
            return true;
        }
    }

    return false;
}

function payloadGuard(req, res, next) {
    if (hasForbiddenKey(req.body) || hasForbiddenKey(req.query) || hasForbiddenKey(req.params)) {
        throw new AppError('Payload contem chaves proibidas', {
            statusCode: 400,
            code: 'VALIDATION_FORBIDDEN_KEYS',
        });
    }

    next();
}

module.exports = {
    payloadGuard,
};
