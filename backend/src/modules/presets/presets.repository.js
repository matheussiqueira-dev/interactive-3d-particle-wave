class PresetsRepository {
    constructor(store) {
        this.store = store;
    }

    async listAll() {
        const db = await this.store.read();
        return db.presets;
    }

    async findById(presetId) {
        const db = await this.store.read();
        return db.presets.find((preset) => preset.id === presetId) || null;
    }

    async create(preset) {
        await this.store.withTransaction((db) => {
            db.presets.push(preset);
            return db;
        });

        return preset;
    }

    async update(presetId, updater) {
        let updatedPreset = null;

        await this.store.withTransaction((db) => {
            const index = db.presets.findIndex((preset) => preset.id === presetId);
            if (index < 0) {
                return db;
            }

            const current = db.presets[index];
            updatedPreset = updater(current);
            db.presets[index] = updatedPreset;
            return db;
        });

        return updatedPreset;
    }

    async remove(presetId) {
        let removed = null;

        await this.store.withTransaction((db) => {
            const index = db.presets.findIndex((preset) => preset.id === presetId);
            if (index < 0) {
                return db;
            }

            removed = db.presets[index];
            db.presets.splice(index, 1);
            return db;
        });

        return removed;
    }
}

module.exports = {
    PresetsRepository,
};
