const express = require('express');
const { asyncHandler } = require('../../common/async-handler');
const { authenticate, authorize, optionalAuthenticate } = require('../../common/middleware/auth');
const { validate } = require('../../common/middleware/validate');
const { submitTelemetrySchema, summaryQuerySchema } = require('./telemetry.schema');

function createTelemetryRouter(controller) {
    const router = express.Router();

    router.post('/events', optionalAuthenticate, validate(submitTelemetrySchema), asyncHandler(controller.submit));
    router.get('/summary', authenticate, authorize('admin'), validate(summaryQuerySchema, 'query'), asyncHandler(controller.summary));

    return router;
}

module.exports = {
    createTelemetryRouter,
};
