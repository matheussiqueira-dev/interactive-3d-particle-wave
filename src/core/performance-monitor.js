export class PerformanceMonitor {
    constructor(sampleWindow = 30) {
        this.sampleWindow = sampleWindow;
        this.samples = [];
        this.lastFps = 0;
    }

    update(deltaTime) {
        if (deltaTime <= 0) {
            return this.lastFps;
        }

        const fps = 1 / deltaTime;
        this.samples.push(fps);

        if (this.samples.length > this.sampleWindow) {
            this.samples.shift();
        }

        const total = this.samples.reduce((sum, value) => sum + value, 0);
        this.lastFps = total / this.samples.length;
        return this.lastFps;
    }
}
