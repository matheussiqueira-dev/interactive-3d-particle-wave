export class UIController {
    constructor() {
        this.trackingPill = document.getElementById('trackingPill');
        this.trackingStatus = document.getElementById('trackingStatus');
        this.fpsValue = document.getElementById('fpsValue');
        this.particleCountLabel = document.getElementById('particleCountLabel');

        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.loadingTitle = document.getElementById('loadingTitle');
        this.loadingMessage = document.getElementById('loadingMessage');

        this.gestureCard = document.getElementById('gestureCard');
        this.gestureLabel = document.getElementById('gestureLabel');
        this.toast = document.getElementById('toast');

        this.qualitySelect = document.getElementById('qualitySelect');
        this.waveSelect = document.getElementById('waveSelect');
        this.sensitivityRange = document.getElementById('sensitivityRange');
        this.interactionValue = document.getElementById('interactionValue');
        this.reducedMotionToggle = document.getElementById('reducedMotionToggle');

        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.snapshotBtn = document.getElementById('snapshotBtn');
        this.cameraBtn = document.getElementById('cameraBtn');

        this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
        this.videoShell = document.getElementById('videoShell');
        this.cameraNotice = document.getElementById('cameraNotice');

        this.toastTimer = null;
    }

    bindControls(handlers) {
        this.qualitySelect.addEventListener('change', (event) => {
            handlers.onQualityChange?.(event.target.value);
        });

        this.waveSelect.addEventListener('change', (event) => {
            handlers.onWaveChange?.(event.target.value);
        });

        this.sensitivityRange.addEventListener('input', (event) => {
            const value = Number(event.target.value);
            this.setInteractionValue(value);
            handlers.onSensitivityChange?.(value);
        });

        this.reducedMotionToggle.addEventListener('change', (event) => {
            handlers.onReducedMotionChange?.(Boolean(event.target.checked));
        });

        this.pauseBtn.addEventListener('click', () => handlers.onPause?.());
        this.resetBtn.addEventListener('click', () => handlers.onReset?.());
        this.snapshotBtn.addEventListener('click', () => handlers.onSnapshot?.());
        this.cameraBtn.addEventListener('click', () => handlers.onCameraToggle?.());
        this.togglePreviewBtn.addEventListener('click', () => handlers.onPreviewToggle?.());
    }

    setControlValues(settings) {
        this.qualitySelect.value = settings.quality;
        this.waveSelect.value = settings.wave;
        this.sensitivityRange.value = String(settings.sensitivity);
        this.reducedMotionToggle.checked = Boolean(settings.reducedMotion);
        this.setInteractionValue(settings.sensitivity);
    }

    setInteractionValue(value) {
        this.interactionValue.textContent = `${value.toFixed(1)}x`;
    }

    setTrackingStatus(text, state = 'neutral') {
        this.trackingStatus.textContent = text;
        this.trackingPill.dataset.state = state;
    }

    setFps(value) {
        if (!Number.isFinite(value)) {
            this.fpsValue.textContent = '--';
            return;
        }

        this.fpsValue.textContent = `${Math.round(value)}`;
    }

    setParticleCount(count) {
        this.particleCountLabel.textContent = `${count.toLocaleString('pt-BR')}`;
    }

    setLoading(visible, title, message) {
        if (typeof title === 'string') {
            this.loadingTitle.textContent = title;
        }

        if (typeof message === 'string') {
            this.loadingMessage.textContent = message;
        }

        this.loadingOverlay.classList.toggle('hidden', !visible);
    }

    setGesture(label, color) {
        this.gestureLabel.textContent = label;

        if (color) {
            this.gestureLabel.style.color = color;
            this.gestureCard.style.borderColor = `${color}88`;
            this.gestureCard.style.boxShadow = `0 0 24px ${color}44`;
        }
    }

    setPaused(paused) {
        this.pauseBtn.textContent = paused ? 'Retomar' : 'Pausar';
    }

    setCameraActive(active) {
        this.cameraBtn.textContent = active ? 'Desativar camera' : 'Ativar camera';
        this.cameraNotice.textContent = active
            ? 'Camera ativa e detectando gestos.'
            : 'Camera inativa. Use o mouse para interagir.';
        this.cameraNotice.classList.toggle('active', active);
    }

    setPreviewVisible(visible) {
        this.videoShell.classList.toggle('is-hidden', !visible);
        this.togglePreviewBtn.textContent = visible ? 'Ocultar preview' : 'Mostrar preview';
    }

    showToast(message) {
        if (!message) {
            return;
        }

        this.toast.textContent = message;
        this.toast.classList.add('show');

        if (this.toastTimer) {
            clearTimeout(this.toastTimer);
        }

        this.toastTimer = window.setTimeout(() => {
            this.toast.classList.remove('show');
        }, 2400);
    }
}
