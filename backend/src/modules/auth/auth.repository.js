class AuthRepository {
    constructor(store) {
        this.store = store;
    }

    async countUsers() {
        const db = await this.store.read();
        return db.users.length;
    }

    async findByEmail(email) {
        const db = await this.store.read();
        return db.users.find((user) => user.email === email) || null;
    }

    async findById(id) {
        const db = await this.store.read();
        return db.users.find((user) => user.id === id) || null;
    }

    async createUser(user) {
        await this.store.withTransaction((db) => {
            db.users.push(user);
            return db;
        });

        return user;
    }
}

module.exports = {
    AuthRepository,
};
