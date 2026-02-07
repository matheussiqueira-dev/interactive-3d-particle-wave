const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../../common/errors/app-error');

function sanitizePreset(preset) {
    return {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        quality: preset.quality,
        wave: preset.wave,
        sensitivity: preset.sensitivity,
        reducedMotion: preset.reducedMotion,
        ownerId: preset.ownerId,
        isPublic: preset.isPublic,
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt,
    };
}

function canAccessPreset(preset, user) {
    if (preset.isPublic) {
        return true;
    }

    if (!user) {
        return false;
    }

    return user.role === 'admin' || preset.ownerId === user.userId;
}

class PresetsService {
    constructor(presetsRepository) {
        this.presetsRepository = presetsRepository;
    }

    async listPresets(query, user) {
        const allPresets = await this.presetsRepository.listAll();
        const search = query.search?.toLowerCase();

        const filteredByScope = allPresets.filter((preset) => {
            if (query.scope === 'all') {
                if (!user) {
                    return preset.isPublic;
                }

                return user.role === 'admin' || preset.isPublic || preset.ownerId === user.userId;
            }

            if (query.scope === 'mine') {
                if (!user) {
                    return false;
                }

                if (user.role === 'admin') {
                    return true;
                }

                return preset.ownerId === user.userId;
            }

            return preset.isPublic;
        });

        const searched = search
            ? filteredByScope.filter((preset) => {
                const stack = `${preset.name} ${preset.description}`.toLowerCase();
                return stack.includes(search);
            })
            : filteredByScope;

        const ordered = searched
            .slice()
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        const startIndex = query.cursor
            ? Math.max(ordered.findIndex((preset) => preset.id === query.cursor) + 1, 0)
            : 0;

        const page = ordered.slice(startIndex, startIndex + query.limit);
        const nextCursor = page.length === query.limit ? page[page.length - 1].id : null;

        return {
            items: page.map(sanitizePreset),
            nextCursor,
            count: page.length,
            totalMatched: ordered.length,
        };
    }

    async getPreset(presetId, user) {
        const preset = await this.presetsRepository.findById(presetId);

        if (!preset) {
            throw new AppError('Preset nao encontrado', {
                statusCode: 404,
                code: 'PRESET_NOT_FOUND',
            });
        }

        if (!canAccessPreset(preset, user)) {
            throw new AppError('Sem permissao para acessar este preset', {
                statusCode: 403,
                code: 'PRESET_FORBIDDEN',
            });
        }

        return sanitizePreset(preset);
    }

    async createPreset(input, user) {
        const now = new Date().toISOString();

        const preset = {
            id: uuidv4(),
            name: input.name,
            description: input.description || '',
            quality: input.quality,
            wave: input.wave,
            sensitivity: input.sensitivity,
            reducedMotion: input.reducedMotion,
            ownerId: user.userId,
            isPublic: input.isPublic,
            createdAt: now,
            updatedAt: now,
        };

        await this.presetsRepository.create(preset);
        return sanitizePreset(preset);
    }

    async updatePreset(presetId, updates, user) {
        const current = await this.presetsRepository.findById(presetId);

        if (!current) {
            throw new AppError('Preset nao encontrado', {
                statusCode: 404,
                code: 'PRESET_NOT_FOUND',
            });
        }

        const isOwner = current.ownerId === user.userId;
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw new AppError('Sem permissao para editar este preset', {
                statusCode: 403,
                code: 'PRESET_FORBIDDEN',
            });
        }

        if (!isAdmin && Object.prototype.hasOwnProperty.call(updates, 'isPublic') && updates.isPublic !== current.isPublic) {
            throw new AppError('Apenas administrador pode alterar visibilidade publica', {
                statusCode: 403,
                code: 'PRESET_VISIBILITY_FORBIDDEN',
            });
        }

        const now = new Date().toISOString();

        const updated = await this.presetsRepository.update(presetId, (existing) => ({
            ...existing,
            ...updates,
            updatedAt: now,
        }));

        return sanitizePreset(updated);
    }

    async deletePreset(presetId, user) {
        const current = await this.presetsRepository.findById(presetId);

        if (!current) {
            throw new AppError('Preset nao encontrado', {
                statusCode: 404,
                code: 'PRESET_NOT_FOUND',
            });
        }

        const isOwner = current.ownerId === user.userId;
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw new AppError('Sem permissao para remover este preset', {
                statusCode: 403,
                code: 'PRESET_FORBIDDEN',
            });
        }

        await this.presetsRepository.remove(presetId);

        return {
            deletedId: presetId,
        };
    }
}

module.exports = {
    PresetsService,
};
