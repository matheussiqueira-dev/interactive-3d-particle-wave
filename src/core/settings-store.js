const STORAGE_KEY = 'interactive-3d-particle-wave.settings.v1';

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function sanitizeSettings(partialSettings, defaults, validQualityKeys, validWaveKeys) {
    const safe = { ...defaults };

    if (validQualityKeys.has(partialSettings?.quality)) {
        safe.quality = partialSettings.quality;
    }

    if (validWaveKeys.has(partialSettings?.wave)) {
        safe.wave = partialSettings.wave;
    }

    if (typeof partialSettings?.sensitivity === 'number' && Number.isFinite(partialSettings.sensitivity)) {
        safe.sensitivity = clamp(partialSettings.sensitivity, 0.6, 1.6);
    }

    if (typeof partialSettings?.reducedMotion === 'boolean') {
        safe.reducedMotion = partialSettings.reducedMotion;
    }

    return safe;
}

export function loadStoredSettings(defaults, validQualityKeys, validWaveKeys) {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { ...defaults };
        }

        const parsed = JSON.parse(raw);
        return sanitizeSettings(parsed, defaults, validQualityKeys, validWaveKeys);
    } catch (error) {
        console.warn('Falha ao carregar configuracoes locais.', error);
        return { ...defaults };
    }
}

export function saveStoredSettings(settings) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn('Falha ao salvar configuracoes locais.', error);
    }
}
