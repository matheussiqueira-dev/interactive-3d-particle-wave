const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.PORT = '4010';
process.env.CORS_ORIGIN = 'http://localhost:5500';
process.env.JWT_SECRET = 'test-secret-with-32-characters-minimum';
process.env.JWT_EXPIRES_IN = '1h';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX = '1000';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.ALLOW_PUBLIC_REGISTRATION = 'true';

const { JsonStore } = require('../src/storage/json-store');
const { createApp } = require('../src/app');

const { AuthRepository } = require('../src/modules/auth/auth.repository');
const { AuthService } = require('../src/modules/auth/auth.service');
const { AuthController } = require('../src/modules/auth/auth.controller');

const { PresetsRepository } = require('../src/modules/presets/presets.repository');
const { PresetsService } = require('../src/modules/presets/presets.service');
const { PresetsController } = require('../src/modules/presets/presets.controller');

const { TelemetryRepository } = require('../src/modules/telemetry/telemetry.repository');
const { TelemetryService } = require('../src/modules/telemetry/telemetry.service');
const { TelemetryController } = require('../src/modules/telemetry/telemetry.controller');

async function createTestApp() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'particle-wave-backend-'));
    const tempFile = path.join(tempDir, 'db.json');

    const store = new JsonStore(tempFile);
    await store.ensureInitialized();

    const authRepository = new AuthRepository(store);
    const authController = new AuthController(new AuthService(authRepository));

    const presetsRepository = new PresetsRepository(store);
    const presetsController = new PresetsController(new PresetsService(presetsRepository));

    const telemetryRepository = new TelemetryRepository(store);
    const telemetryController = new TelemetryController(new TelemetryService(telemetryRepository));

    const app = createApp({
        store,
        authController,
        presetsController,
        telemetryController,
    });

    return {
        app,
        tempDir,
    };
}

test('health endpoint should return ok', async () => {
    const ctx = await createTestApp();

    const response = await request(ctx.app)
        .get('/api/v1/system/health')
        .expect(200);

    assert.equal(response.body.data.status, 'ok');

    await fs.rm(ctx.tempDir, { recursive: true, force: true });
});

test('auth, presets and telemetry workflow should succeed', async () => {
    const ctx = await createTestApp();

    const registerResponse = await request(ctx.app)
        .post('/api/v1/auth/register')
        .send({
            name: 'Matheus Admin',
            email: 'admin@example.com',
            password: 'SecurePass123!',
        })
        .expect(201);

    assert.equal(registerResponse.body.data.role, 'admin');

    const loginResponse = await request(ctx.app)
        .post('/api/v1/auth/login')
        .send({
            email: 'admin@example.com',
            password: 'SecurePass123!',
        })
        .expect(200);

    const token = loginResponse.body.data.accessToken;
    assert.ok(token);

    const presetResponse = await request(ctx.app)
        .post('/api/v1/presets')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Teste Impacto',
            description: 'Preset criado durante teste de integracao',
            quality: 'high',
            wave: 'storm',
            sensitivity: 1.2,
            reducedMotion: false,
            isPublic: false,
        })
        .expect(201);

    assert.equal(presetResponse.body.data.name, 'Teste Impacto');

    await request(ctx.app)
        .get('/api/v1/presets?scope=mine')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    await request(ctx.app)
        .post('/api/v1/telemetry/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            sessionId: 'session-test-1',
            fpsAvg: 58,
            fpsMin: 40,
            fpsMax: 74,
            particleCount: 28000,
            quality: 'auto',
            wave: 'ripple',
            cameraActive: true,
            reducedMotion: false,
            latencyMs: 30,
        })
        .expect(202);

    await request(ctx.app)
        .get('/api/v1/telemetry/summary?windowMinutes=60')
        .expect(401);

    const summaryResponse = await request(ctx.app)
        .get('/api/v1/telemetry/summary?windowMinutes=60')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    assert.ok(summaryResponse.body.data.totalEvents >= 1);

    await fs.rm(ctx.tempDir, { recursive: true, force: true });
});
