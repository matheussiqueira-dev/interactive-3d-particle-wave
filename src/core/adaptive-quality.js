import { QUALITY_ORDER } from '../config.js';

export class AdaptiveQualityManager {
    constructor(options = {}) {
        this.lowFpsThreshold = options.lowFpsThreshold || 27;
        this.highFpsThreshold = options.highFpsThreshold || 56;
        this.lowFpsFramesRequired = options.lowFpsFramesRequired || 220;
        this.highFpsFramesRequired = options.highFpsFramesRequired || 520;

        this.lowCounter = 0;
        this.highCounter = 0;
    }

    reset() {
        this.lowCounter = 0;
        this.highCounter = 0;
    }

    getLowerQuality(currentKey) {
        const index = QUALITY_ORDER.indexOf(currentKey);
        if (index <= 0) {
            return currentKey;
        }

        return QUALITY_ORDER[index - 1];
    }

    getHigherQuality(currentKey) {
        const index = QUALITY_ORDER.indexOf(currentKey);
        if (index < 0 || index >= QUALITY_ORDER.length - 1) {
            return currentKey;
        }

        return QUALITY_ORDER[index + 1];
    }

    update(currentFps, currentQualityKey) {
        if (!Number.isFinite(currentFps)) {
            return null;
        }

        if (currentFps < this.lowFpsThreshold) {
            this.lowCounter += 1;
            this.highCounter = Math.max(this.highCounter - 1, 0);
        } else if (currentFps > this.highFpsThreshold) {
            this.highCounter += 1;
            this.lowCounter = Math.max(this.lowCounter - 1, 0);
        } else {
            this.lowCounter = Math.max(this.lowCounter - 1, 0);
            this.highCounter = Math.max(this.highCounter - 1, 0);
        }

        if (this.lowCounter >= this.lowFpsFramesRequired) {
            this.reset();
            const next = this.getLowerQuality(currentQualityKey);
            return next !== currentQualityKey ? next : null;
        }

        if (this.highCounter >= this.highFpsFramesRequired) {
            this.reset();
            const next = this.getHigherQuality(currentQualityKey);
            return next !== currentQualityKey ? next : null;
        }

        return null;
    }
}
