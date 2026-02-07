const { JsonStore } = require('./storage/json-store');
const { env } = require('./config/env');

const { AuthRepository } = require('./modules/auth/auth.repository');
const { AuthService } = require('./modules/auth/auth.service');
const { AuthController } = require('./modules/auth/auth.controller');

const { PresetsRepository } = require('./modules/presets/presets.repository');
const { PresetsService } = require('./modules/presets/presets.service');
const { PresetsController } = require('./modules/presets/presets.controller');

const { TelemetryRepository } = require('./modules/telemetry/telemetry.repository');
const { TelemetryService } = require('./modules/telemetry/telemetry.service');
const { TelemetryController } = require('./modules/telemetry/telemetry.controller');

function createContainer() {
    const store = new JsonStore(env.dataFile);

    const authRepository = new AuthRepository(store);
    const authService = new AuthService(authRepository);
    const authController = new AuthController(authService);

    const presetsRepository = new PresetsRepository(store);
    const presetsService = new PresetsService(presetsRepository);
    const presetsController = new PresetsController(presetsService);

    const telemetryRepository = new TelemetryRepository(store);
    const telemetryService = new TelemetryService(telemetryRepository);
    const telemetryController = new TelemetryController(telemetryService);

    return {
        store,
        authController,
        presetsController,
        telemetryController,
    };
}

module.exports = {
    createContainer,
};
