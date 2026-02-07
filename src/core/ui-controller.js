export class UIController {
    constructor() {
        this.trackingPill = document.getElementById('trackingPill');
        this.trackingStatus = document.getElementById('trackingStatus');
        this.fpsValue = document.getElementById('fpsValue');
        this.particleCountLabel = document.getElementById('particleCountLabel');
        this.qualityModeLabel = document.getElementById('qualityModeLabel');
        this.inputSourceLabel = document.getElementById('inputSourceLabel');

        this.signalSourceLabel = document.getElementById('signalSourceLabel');
        this.signalWaveLabel = document.getElementById('signalWaveLabel');
        this.signalSensitivityLabel = document.getElementById('signalSensitivityLabel');
        this.recommendationLabel = document.getElementById('recommendationLabel');

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
        this.copyConfigBtn = document.getElementById('copyConfigBtn');
        this.cameraBtn = document.getElementById('cameraBtn');

        this.presetCalmBtn = document.getElementById('presetCalmBtn');
        this.presetExplorerBtn = document.getElementById('presetExplorerBtn');
        this.presetImpactBtn = document.getElementById('presetImpactBtn');

        this.heroCameraBtn = document.getElementById('heroCameraBtn');
        this.heroPresetBtn = document.getElementById('heroPresetBtn');

        this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
        this.videoShell = document.getElementById('videoShell');
        this.cameraNotice = document.getElementById('cameraNotice');

        this.journeyStepCamera = document.getElementById('journeyStepCamera');
        this.journeyStepGesture = document.getElementById('journeyStepGesture');
        this.journeyStepTune = document.getElementById('journeyStepTune');

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
        this.copyConfigBtn.addEventListener('click', () => handlers.onCopyConfig?.());
        this.cameraBtn.addEventListener('click', () => handlers.onCameraToggle?.());
        this.togglePreviewBtn.addEventListener('click', () => handlers.onPreviewToggle?.());

        this.presetCalmBtn.addEventListener('click', () => handlers.onPresetSelect?.('calm'));
        this.presetExplorerBtn.addEventListener('click', () => handlers.onPresetSelect?.('explorer'));
        this.presetImpactBtn.addEventListener('click', () => handlers.onPresetSelect?.('impact'));

        this.heroCameraBtn.addEventListener('click', () => handlers.onCameraToggle?.());
        this.heroPresetBtn.addEventListener('click', () => handlers.onRecommendedPreset?.());
    }

    setControlValues(settings) {
        this.qualitySelect.value = settings.quality;
        this.waveSelect.value = settings.wave;
        this.sensitivityRange.value = String(settings.sensitivity);
        this.reducedMotionToggle.checked = Boolean(settings.reducedMotion);
        this.setInteractionValue(settings.sensitivity);
        this.setSignalWave(settings.wave);
    }

    setInteractionValue(value) {
        const formatted = `${value.toFixed(1)}x`;
        this.interactionValue.textContent = formatted;
        this.setSignalSensitivity(formatted);
    }

    setSignalSensitivity(label) {
        this.signalSensitivityLabel.textContent = label;
    }

    setSignalWave(label) {
        this.signalWaveLabel.textContent = label;
    }

    setRecommendation(label) {
        this.recommendationLabel.textContent = label;
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

    setQualityModeLabel(label) {
        this.qualityModeLabel.textContent = label;
    }

    setInputSource(sourceLabel) {
        this.inputSourceLabel.textContent = sourceLabel;
        this.signalSourceLabel.textContent = sourceLabel;
    }

    setLoading(visible, title, message) {
        if (typeof title === 'string') {
            this.loadingTitle.textContent = title;
        }

        if (typeof message === 'string') {
            this.loadingMessage.textContent = message;
        }

        this.loadingOverlay.classList.toggle('hidden', !visible);
        this.loadingOverlay.setAttribute('aria-busy', visible ? 'true' : 'false');
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
        this.pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    }

    setCameraActive(active) {
        this.cameraBtn.textContent = active ? 'Desativar camera' : 'Ativar camera';
        this.cameraBtn.setAttribute('aria-pressed', active ? 'true' : 'false');

        this.heroCameraBtn.textContent = active ? 'Desativar Sensor de Gestos' : 'Ativar Sensor de Gestos';
        this.heroCameraBtn.setAttribute('aria-pressed', active ? 'true' : 'false');

        this.cameraNotice.textContent = active
            ? 'Camera ativa e detectando gestos.'
            : 'Camera inativa. Use o mouse para interagir.';
        this.cameraNotice.classList.toggle('active', active);
    }

    setPreviewVisible(visible) {
        this.videoShell.classList.toggle('is-hidden', !visible);
        this.togglePreviewBtn.textContent = visible ? 'Ocultar preview' : 'Mostrar preview';
        this.togglePreviewBtn.setAttribute('aria-pressed', visible ? 'true' : 'false');
    }

    setActivePreset(presetKey) {
        const mapping = {
            calm: this.presetCalmBtn,
            explorer: this.presetExplorerBtn,
            impact: this.presetImpactBtn,
        };

        Object.entries(mapping).forEach(([key, button]) => {
            const active = key === presetKey;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    setJourneyState(state) {
        this.journeyStepCamera.classList.toggle('is-done', Boolean(state.cameraReady));
        this.journeyStepGesture.classList.toggle('is-done', Boolean(state.gestureReady));
        this.journeyStepTune.classList.toggle('is-done', Boolean(state.tuned));
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
