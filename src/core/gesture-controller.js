import { ensureMediaPipeDependencies } from './script-loader.js';

function clamp01(value) {
    return Math.min(Math.max(value, 0), 1);
}

export class GestureController {
    constructor(options) {
        this.videoElement = options.videoElement;
        this.onState = options.onState;
        this.onStatus = options.onStatus;
        this.onError = options.onError;

        this.hands = null;
        this.camera = null;
        this.isActive = false;
        this.history = [];
        this.lastStableGesture = 'NONE';
    }

    async start() {
        if (this.isActive) {
            return true;
        }

        try {
            await ensureMediaPipeDependencies();
        } catch (error) {
            const message = 'Dependencias de visao computacional indisponiveis.';
            this.onStatus?.(message, 'error');
            this.onError?.(error);
            return false;
        }

        try {
            this.onStatus?.('Solicitando acesso a camera...', 'warning');

            this.hands = new window.Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.55,
            });

            this.hands.onResults((results) => this.handleResults(results));

            this.camera = new window.Camera(this.videoElement, {
                onFrame: async () => {
                    if (!this.isActive || !this.hands) {
                        return;
                    }

                    await this.hands.send({ image: this.videoElement });
                },
                width: 640,
                height: 480,
            });

            this.isActive = true;
            await this.camera.start();
            this.onStatus?.('Camera ativa e rastreamento online.', 'active');
            return true;
        } catch (error) {
            this.isActive = false;
            this.onStatus?.('Nao foi possivel acessar a camera.', 'error');
            this.onError?.(error);
            return false;
        }
    }

    async stop() {
        if (!this.isActive) {
            return;
        }

        this.isActive = false;
        this.history = [];
        this.lastStableGesture = 'NONE';

        try {
            if (this.camera?.stop) {
                await this.camera.stop();
            }

            const stream = this.videoElement?.srcObject;
            if (stream?.getTracks) {
                for (const track of stream.getTracks()) {
                    track.stop();
                }
            }

            if (this.videoElement) {
                this.videoElement.srcObject = null;
            }
        } catch (error) {
            this.onError?.(error);
        }

        this.onState?.({
            detected: false,
            gesture: 'NONE',
            pointer: { x: 0.5, y: 0.5 },
            confidence: 0,
        });

        this.onStatus?.('Camera desativada. Controle por mouse habilitado.', 'warning');
    }

    async toggle() {
        if (this.isActive) {
            await this.stop();
            return false;
        }

        return this.start();
    }

    detectGesture(landmarks) {
        const isFingerUp = (tipIndex, baseIndex) => landmarks[tipIndex].y < landmarks[baseIndex].y;

        const indexUp = isFingerUp(8, 6);
        const middleUp = isFingerUp(12, 10);
        const ringUp = isFingerUp(16, 14);
        const pinkyUp = isFingerUp(20, 18);

        if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
            return 'FIST';
        }

        if (indexUp && middleUp && ringUp && pinkyUp) {
            return 'OPEN';
        }

        if (indexUp && middleUp && !ringUp && !pinkyUp) {
            return 'VICTORY';
        }

        if (indexUp && !middleUp && !ringUp && pinkyUp) {
            return 'HANG_LOOSE';
        }

        return 'POINTER';
    }

    resolveStableGesture(rawGesture) {
        this.history.push(rawGesture);

        if (this.history.length > 8) {
            this.history.shift();
        }

        const counter = new Map();
        for (const gesture of this.history) {
            counter.set(gesture, (counter.get(gesture) || 0) + 1);
        }

        let winner = rawGesture;
        let winnerCount = 0;

        for (const [gesture, count] of counter.entries()) {
            if (count > winnerCount) {
                winner = gesture;
                winnerCount = count;
            }
        }

        const threshold = Math.ceil(this.history.length * 0.55);
        if (winnerCount >= threshold) {
            this.lastStableGesture = winner;
        }

        return this.lastStableGesture;
    }

    handleResults(results) {
        if (!this.isActive) {
            return;
        }

        const handLandmarks = results.multiHandLandmarks;

        if (!handLandmarks || handLandmarks.length === 0) {
            this.history = [];
            this.lastStableGesture = 'NONE';
            this.onState?.({
                detected: false,
                gesture: 'NONE',
                pointer: { x: 0.5, y: 0.5 },
                confidence: 0,
            });
            return;
        }

        const landmarks = handLandmarks[0];
        const pointer = {
            x: clamp01(1 - landmarks[8].x),
            y: clamp01(landmarks[8].y),
        };

        const rawGesture = this.detectGesture(landmarks);
        const stableGesture = this.resolveStableGesture(rawGesture);

        const confidence = results.multiHandedness?.[0]?.score || 0.5;

        this.onState?.({
            detected: true,
            gesture: stableGesture,
            pointer,
            confidence,
        });
    }
}
