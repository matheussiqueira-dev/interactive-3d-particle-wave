const { AppError } = require('../errors/app-error');
const { verifyAccessToken } = require('../../modules/auth/token-service');

function authenticate(req, res, next) {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
        throw new AppError('Token de autenticacao ausente', {
            statusCode: 401,
            code: 'AUTH_REQUIRED',
        });
    }

    const token = authorization.replace('Bearer ', '').trim();

    if (!token) {
        throw new AppError('Token de autenticacao invalido', {
            statusCode: 401,
            code: 'AUTH_INVALID_TOKEN',
        });
    }

    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
}

function optionalAuthenticate(req, res, next) {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
        return next();
    }

    const token = authorization.replace('Bearer ', '').trim();
    if (!token) {
        return next();
    }

    try {
        req.auth = verifyAccessToken(token);
    } catch {
        req.auth = undefined;
    }

    return next();
}

function authorize(...roles) {
    return (req, res, next) => {
        const userRole = req.auth?.role;

        if (!userRole || !roles.includes(userRole)) {
            throw new AppError('Permissao insuficiente para esta operacao', {
                statusCode: 403,
                code: 'AUTH_FORBIDDEN',
            });
        }

        next();
    };
}

module.exports = {
    authenticate,
    optionalAuthenticate,
    authorize,
};
