const QUALITY_PARAM = 'q';
const WAVE_PARAM = 'w';
const SENSITIVITY_PARAM = 's';
const REDUCED_MOTION_PARAM = 'rm';
const HIGH_CONTRAST_PARAM = 'hc';

function parseBoolean(value) {
    if (value === '1' || value === 'true') {
        return true;
    }

    if (value === '0' || value === 'false') {
        return false;
    }

    return undefined;
}

export function readSettingsFromURL() {
    const params = new URLSearchParams(window.location.search);

    const quality = params.get(QUALITY_PARAM);
    const wave = params.get(WAVE_PARAM);
    const sensitivityRaw = params.get(SENSITIVITY_PARAM);
    const reducedMotionRaw = params.get(REDUCED_MOTION_PARAM);
    const highContrastRaw = params.get(HIGH_CONTRAST_PARAM);

    const settings = {};

    if (quality) {
        settings.quality = quality;
    }

    if (wave) {
        settings.wave = wave;
    }

    if (sensitivityRaw) {
        const sensitivity = Number(sensitivityRaw);
        if (Number.isFinite(sensitivity)) {
            settings.sensitivity = sensitivity;
        }
    }

    const reducedMotion = parseBoolean(reducedMotionRaw);
    if (typeof reducedMotion === 'boolean') {
        settings.reducedMotion = reducedMotion;
    }

    const highContrast = parseBoolean(highContrastRaw);
    if (typeof highContrast === 'boolean') {
        settings.highContrast = highContrast;
    }

    return settings;
}

export function writeSettingsToURL(settings, defaults) {
    const params = new URLSearchParams(window.location.search);

    if (settings.quality && settings.quality !== defaults.quality) {
        params.set(QUALITY_PARAM, settings.quality);
    } else {
        params.delete(QUALITY_PARAM);
    }

    if (settings.wave && settings.wave !== defaults.wave) {
        params.set(WAVE_PARAM, settings.wave);
    } else {
        params.delete(WAVE_PARAM);
    }

    if (typeof settings.sensitivity === 'number' && settings.sensitivity !== defaults.sensitivity) {
        params.set(SENSITIVITY_PARAM, settings.sensitivity.toFixed(1));
    } else {
        params.delete(SENSITIVITY_PARAM);
    }

    if (typeof settings.reducedMotion === 'boolean' && settings.reducedMotion !== defaults.reducedMotion) {
        params.set(REDUCED_MOTION_PARAM, settings.reducedMotion ? '1' : '0');
    } else {
        params.delete(REDUCED_MOTION_PARAM);
    }

    if (typeof settings.highContrast === 'boolean' && settings.highContrast !== defaults.highContrast) {
        params.set(HIGH_CONTRAST_PARAM, settings.highContrast ? '1' : '0');
    } else {
        params.delete(HIGH_CONTRAST_PARAM);
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;

    window.history.replaceState({}, '', nextUrl);
}
