const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');

export const QUALITY_PRESETS = {
    auto: {
        label: 'Auto',
        particleCount: null,
        pixelRatioCap: 1.8,
    },
    high: {
        label: 'Alta',
        particleCount: 42000,
        pixelRatioCap: 2,
    },
    balanced: {
        label: 'Balanceada',
        particleCount: 28000,
        pixelRatioCap: 1.6,
    },
    performance: {
        label: 'Performance',
        particleCount: 16000,
        pixelRatioCap: 1.3,
    },
};

export const QUALITY_ORDER = ['performance', 'balanced', 'high'];

export const WAVE_PROFILES = {
    cosmos: {
        id: 'cosmos',
        label: 'Cosmos',
        intensity: 1,
    },
    ripple: {
        id: 'ripple',
        label: 'Ripple',
        intensity: 1.15,
    },
    storm: {
        id: 'storm',
        label: 'Storm',
        intensity: 1.35,
    },
};

export const GESTURE_MODES = {
    NONE: {
        id: 'NONE',
        label: 'Idle',
        uiLabel: 'Sem gesto detectado',
        timeSpeed: 0.9,
        rotationSpeed: 0.001,
        pointSize: 1,
        influenceRadius: 32,
        sinkStrength: 9,
        burstStrength: 8,
        freeze: false,
        color: { r: 0.35, g: 0.62, b: 0.95 },
    },
    POINTER: {
        id: 'POINTER',
        label: 'Controle Livre',
        uiLabel: 'Controle livre',
        timeSpeed: 1.1,
        rotationSpeed: 0.002,
        pointSize: 1,
        influenceRadius: 36,
        sinkStrength: 14,
        burstStrength: 10,
        freeze: false,
        color: { r: 0.28, g: 0.82, b: 0.98 },
    },
    FIST: {
        id: 'FIST',
        label: 'Impacto',
        uiLabel: 'Modo impacto',
        timeSpeed: 2.8,
        rotationSpeed: 0.016,
        pointSize: 1.15,
        influenceRadius: 42,
        sinkStrength: 16,
        burstStrength: 22,
        freeze: false,
        color: { r: 1, g: 0.42, b: 0.22 },
    },
    VICTORY: {
        id: 'VICTORY',
        label: 'Macro',
        uiLabel: 'Zoom macro',
        timeSpeed: 0.52,
        rotationSpeed: 0.0006,
        pointSize: 2.2,
        influenceRadius: 45,
        sinkStrength: 8,
        burstStrength: 8,
        freeze: false,
        color: { r: 0.35, g: 1, b: 0.64 },
    },
    HANG_LOOSE: {
        id: 'HANG_LOOSE',
        label: 'Freeze',
        uiLabel: 'Congelado',
        timeSpeed: 0,
        rotationSpeed: 0,
        pointSize: 1.25,
        influenceRadius: 24,
        sinkStrength: 4,
        burstStrength: 0,
        freeze: true,
        color: { r: 0.9, g: 0.95, b: 1 },
    },
    OPEN: {
        id: 'OPEN',
        label: 'Zen',
        uiLabel: 'Modo zen',
        timeSpeed: 0.25,
        rotationSpeed: 0.00045,
        pointSize: 0.9,
        influenceRadius: 34,
        sinkStrength: 9,
        burstStrength: 5,
        freeze: false,
        color: { r: 0.32, g: 0.92, b: 1 },
    },
};

const reducedMotionByDefault = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export const DEFAULT_SETTINGS = {
    quality: 'auto',
    wave: 'cosmos',
    sensitivity: 1,
    reducedMotion: reducedMotionByDefault,
    highContrast: false,
};

export function resolveAutoQualityKey() {
    const threads = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4;

    if (isMobileDevice || threads <= 4 || deviceMemory <= 4) {
        return 'performance';
    }

    if (threads >= 10 && deviceMemory >= 8) {
        return 'high';
    }

    return 'balanced';
}

export function resolveQualityPreset(qualityKey, autoQualityOverride = null) {
    if (qualityKey !== 'auto') {
        return { key: qualityKey, ...QUALITY_PRESETS[qualityKey] };
    }

    const resolvedKey = QUALITY_PRESETS[autoQualityOverride]
        ? autoQualityOverride
        : resolveAutoQualityKey();
    return {
        key: resolvedKey,
        ...QUALITY_PRESETS[resolvedKey],
        label: `Auto (${QUALITY_PRESETS[resolvedKey].label})`,
    };
}
