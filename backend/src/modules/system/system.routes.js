const express = require('express');

function createSystemRouter() {
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

    router.get('/ready', (req, res) => {
        return res.status(200).json({
            data: {
                ready: true,
                timestamp: new Date().toISOString(),
            },
        });
    });

    return router;
}

module.exports = {
    createSystemRouter,
};
