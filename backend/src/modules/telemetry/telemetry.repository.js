class TelemetryRepository {
    constructor(store) {
        this.store = store;
        this.maxRecords = 10000;
    }

    async append(event) {
        await this.store.withTransaction((db) => {
            db.telemetry.push(event);

            if (db.telemetry.length > this.maxRecords) {
                db.telemetry = db.telemetry.slice(db.telemetry.length - this.maxRecords);
            }

            return db;
        });

        return event;
    }

    async listAll() {
        const db = await this.store.read();
        return db.telemetry;
    }
}

module.exports = {
    TelemetryRepository,
};
