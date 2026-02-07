const { v4: uuidv4 } = require('uuid');

class TelemetryService {
    constructor(telemetryRepository) {
        this.telemetryRepository = telemetryRepository;
    }

    async submitTelemetry(input, user) {
        const event = {
            id: uuidv4(),
            sessionId: input.sessionId,
            userId: user?.userId || null,
            fpsAvg: input.fpsAvg,
            fpsMin: input.fpsMin,
            fpsMax: input.fpsMax,
            particleCount: input.particleCount,
            quality: input.quality,
            wave: input.wave,
            cameraActive: input.cameraActive,
            reducedMotion: input.reducedMotion,
            latencyMs: input.latencyMs || null,
            userAgent: input.userAgent || null,
            recordedAt: new Date().toISOString(),
        };

        await this.telemetryRepository.append(event);

        return {
            id: event.id,
            recordedAt: event.recordedAt,
        };
    }

    async getSummary(windowMinutes) {
        const all = await this.telemetryRepository.listAll();
        const threshold = Date.now() - (windowMinutes * 60 * 1000);

        const filtered = all.filter((event) => new Date(event.recordedAt).getTime() >= threshold);

        const count = filtered.length;

        if (count === 0) {
            return {
                windowMinutes,
                totalEvents: 0,
                averageFps: 0,
                averageLatencyMs: 0,
                qualityDistribution: {},
                waveDistribution: {},
            };
        }

        const qualityDistribution = {};
        const waveDistribution = {};

        let fpsAccumulator = 0;
        let latencyAccumulator = 0;
        let latencyCount = 0;

        for (const event of filtered) {
            fpsAccumulator += event.fpsAvg;

            if (typeof event.latencyMs === 'number') {
                latencyAccumulator += event.latencyMs;
                latencyCount += 1;
            }

            qualityDistribution[event.quality] = (qualityDistribution[event.quality] || 0) + 1;
            waveDistribution[event.wave] = (waveDistribution[event.wave] || 0) + 1;
        }

        return {
            windowMinutes,
            totalEvents: count,
            averageFps: Number((fpsAccumulator / count).toFixed(2)),
            averageLatencyMs: latencyCount > 0 ? Number((latencyAccumulator / latencyCount).toFixed(2)) : 0,
            qualityDistribution,
            waveDistribution,
        };
    }
}

module.exports = {
    TelemetryService,
};
