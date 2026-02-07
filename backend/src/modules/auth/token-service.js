const jwt = require('jsonwebtoken');
const { env } = require('../../config/env');
const { AppError } = require('../../common/errors/app-error');

function signAccessToken(payload) {
    return jwt.sign(payload, env.jwtSecret, {
        expiresIn: env.jwtExpiresIn,
        issuer: 'interactive-3d-particle-wave-api',
        audience: 'interactive-3d-particle-wave-clients',
        subject: payload.userId,
    });
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, env.jwtSecret, {
            issuer: 'interactive-3d-particle-wave-api',
            audience: 'interactive-3d-particle-wave-clients',
        });
    } catch {
        throw new AppError('Token de autenticacao invalido ou expirado', {
            statusCode: 401,
            code: 'AUTH_INVALID_TOKEN',
        });
    }
}

module.exports = {
    signAccessToken,
    verifyAccessToken,
};
