const express = require('express');
const { asyncHandler } = require('../../common/async-handler');
const { authenticate, authorize, optionalAuthenticate } = require('../../common/middleware/auth');
const { validate } = require('../../common/middleware/validate');
const {
    createPresetSchema,
    listPresetQuerySchema,
    presetIdParamSchema,
    updatePresetSchema,
} = require('./presets.schema');

function createPresetsRouter(controller) {
    const router = express.Router();

    router.get('/', optionalAuthenticate, validate(listPresetQuerySchema, 'query'), asyncHandler(controller.list));
    router.get('/:presetId', optionalAuthenticate, validate(presetIdParamSchema, 'params'), asyncHandler(controller.getById));

    router.post('/', authenticate, authorize('editor', 'admin'), validate(createPresetSchema), asyncHandler(controller.create));
    router.post('/:presetId/clone', authenticate, authorize('editor', 'admin'), validate(presetIdParamSchema, 'params'), asyncHandler(controller.clone));
    router.patch('/:presetId', authenticate, authorize('editor', 'admin'), validate(presetIdParamSchema, 'params'), validate(updatePresetSchema), asyncHandler(controller.update));
    router.delete('/:presetId', authenticate, authorize('editor', 'admin'), validate(presetIdParamSchema, 'params'), asyncHandler(controller.remove));

    return router;
}

module.exports = {
    createPresetsRouter,
};
