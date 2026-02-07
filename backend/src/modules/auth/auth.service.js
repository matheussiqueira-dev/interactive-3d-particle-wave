const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { env } = require('../../config/env');
const { AppError } = require('../../common/errors/app-error');
const { signAccessToken } = require('./token-service');
const { validatePasswordStrength } = require('./password-policy');

function sanitizeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async register(input, requester) {
        const passwordCheck = validatePasswordStrength(input.password);
        if (!passwordCheck.isValid) {
            throw new AppError('Senha nao atende aos requisitos de seguranca', {
                statusCode: 400,
                code: 'AUTH_WEAK_PASSWORD',
                details: passwordCheck.issues,
            });
        }

        const existing = await this.authRepository.findByEmail(input.email);
        if (existing) {
            throw new AppError('Ja existe usuario com este email', {
                statusCode: 409,
                code: 'AUTH_EMAIL_ALREADY_EXISTS',
            });
        }

        const usersCount = await this.authRepository.countUsers();
        const isFirstUser = usersCount === 0;

        if (!isFirstUser && !env.allowPublicRegistration && requester?.role !== 'admin') {
            throw new AppError('Registro publico esta desabilitado', {
                statusCode: 403,
                code: 'AUTH_REGISTRATION_DISABLED',
            });
        }

        const targetRole = isFirstUser
            ? 'admin'
            : requester?.role === 'admin' && input.role
                ? input.role
                : 'editor';

        if (!isFirstUser && input.role === 'admin' && requester?.role !== 'admin') {
            throw new AppError('Apenas administradores podem criar outro administrador', {
                statusCode: 403,
                code: 'AUTH_ROLE_FORBIDDEN',
            });
        }

        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(input.password, 12);

        const user = {
            id: uuidv4(),
            name: input.name,
            email: input.email,
            passwordHash,
            role: targetRole,
            createdAt: now,
            updatedAt: now,
        };

        await this.authRepository.createUser(user);

        return sanitizeUser(user);
    }

    async login(input) {
        const user = await this.authRepository.findByEmail(input.email);

        if (!user) {
            throw new AppError('Credenciais invalidas', {
                statusCode: 401,
                code: 'AUTH_INVALID_CREDENTIALS',
            });
        }

        const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

        if (!passwordMatches) {
            throw new AppError('Credenciais invalidas', {
                statusCode: 401,
                code: 'AUTH_INVALID_CREDENTIALS',
            });
        }

        const token = signAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            accessToken: token,
            tokenType: 'Bearer',
            expiresIn: env.jwtExpiresIn,
            user: sanitizeUser(user),
        };
    }

    async me(userId) {
        const user = await this.authRepository.findById(userId);

        if (!user) {
            throw new AppError('Usuario autenticado nao encontrado', {
                statusCode: 401,
                code: 'AUTH_USER_NOT_FOUND',
            });
        }

        return sanitizeUser(user);
    }
}

module.exports = {
    AuthService,
};
