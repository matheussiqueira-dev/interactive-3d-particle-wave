const express = require('express');

function createSystemRouter(store) {
    const router = express.Router();

    router.get('/health', (req, res) => {
        return res.status(200).json({
            data: {
                status: 'ok',
                uptimeSeconds: Number(process.uptime().toFixed(2)),
                timestamp: new Date().toISOString(),
            },
        });
    });

    router.get('/ready', async (req, res) => {
        try {
            await store.read();
            return res.status(200).json({
                data: {
                    ready: true,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error) {
            return res.status(503).json({
                error: {
                    code: 'STORE_UNAVAILABLE',
                    message: 'Armazenamento indisponivel',
                    details: error?.message,
                },
            });
        }
    });

    return router;
}

module.exports = {
    createSystemRouter,
};
