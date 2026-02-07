const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_DB = {
    users: [],
    presets: [],
    telemetry: [],
};

class JsonStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.writeLock = Promise.resolve();
    }

    async ensureInitialized() {
        const directory = path.dirname(this.filePath);
        await fs.mkdir(directory, { recursive: true });

        try {
            await fs.access(this.filePath);
        } catch {
            await fs.writeFile(this.filePath, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
        }
    }

    async read() {
        await this.ensureInitialized();
        const content = await fs.readFile(this.filePath, 'utf-8');

        if (!content.trim()) {
            return structuredClone(DEFAULT_DB);
        }

        const parsed = JSON.parse(content);

        return {
            users: Array.isArray(parsed.users) ? parsed.users : [],
            presets: Array.isArray(parsed.presets) ? parsed.presets : [],
            telemetry: Array.isArray(parsed.telemetry) ? parsed.telemetry : [],
        };
    }

    async write(nextState) {
        await this.ensureInitialized();
        const payload = JSON.stringify(nextState, null, 2);
        await fs.writeFile(this.filePath, payload, 'utf-8');
    }

    async withTransaction(mutator) {
        const run = async () => {
            const current = await this.read();
            const snapshot = structuredClone(current);
            const next = await mutator(snapshot);
            await this.write(next || snapshot);
            return next || snapshot;
        };

        this.writeLock = this.writeLock.then(run, run);
        return this.writeLock;
    }
}

module.exports = {
    JsonStore,
};
