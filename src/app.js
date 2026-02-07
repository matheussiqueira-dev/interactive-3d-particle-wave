import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import {
    DEFAULT_SETTINGS,
    GESTURE_MODES,
    QUALITY_PRESETS,
    WAVE_PROFILES,
    resolveAutoQualityKey,
    resolveQualityPreset,
} from './config.js';
import { ParticleField } from './core/particle-field.js';
import { GestureController } from './core/gesture-controller.js';
import { PerformanceMonitor } from './core/performance-monitor.js';
import { UIController } from './core/ui-controller.js';
import { AdaptiveQualityManager } from './core/adaptive-quality.js';
import { loadStoredSettings, sanitizeSettings, saveStoredSettings } from './core/settings-store.js';
import { readSettingsFromURL, writeSettingsToURL } from './core/url-state.js';

const PRESET_CONFIGS = {
    calm: {
        label: 'Calmo',
        quality: 'auto',
        wave: 'cosmos',
        sensitivity: 0.8,
        reducedMotion: true,
    },
    explorer: {
        label: 'Explorar',
        quality: 'balanced',
        wave: 'ripple',
        sensitivity: 1,
        reducedMotion: false,
    },
    impact: {
        label: 'Impacto',
        quality: 'high',
        wave: 'storm',
        sensitivity: 1.3,
        reducedMotion: false,
    },
};

const PRESET_SEQUENCE = ['calm', 'explorer', 'impact'];

function cloneMode(mode) {
    return {
        ...mode,
        color: {
            r: mode.color.r,
            g: mode.color.g,
            b: mode.color.b,
        },
    };
}

function modeColorToCss(mode) {
    const r = Math.round(mode.color.r * 255);
    const g = Math.round(mode.color.g * 255);
    const b = Math.round(mode.color.b * 255);
    return `rgb(${r} ${g} ${b})`;
}

function pointerToWorld(pointer) {
    const nx = (pointer.x - 0.5) * 2;
    const ny = (pointer.y - 0.5) * 2;

    return {
        x: nx * 120,
        z: (-ny * 95) + 14,
    };
}

function buildSettings() {
    const qualityKeys = new Set(Object.keys(QUALITY_PRESETS));
    const waveKeys = new Set(Object.keys(WAVE_PROFILES));

    const stored = loadStoredSettings(DEFAULT_SETTINGS, qualityKeys, waveKeys);
    const fromUrl = readSettingsFromURL();

    return sanitizeSettings({ ...stored, ...fromUrl }, DEFAULT_SETTINGS, qualityKeys, waveKeys);
}

function sameNumber(a, b) {
    return Math.abs(a - b) < 0.0001;
}

function inferPresetKey(settings) {
    for (const [presetKey, preset] of Object.entries(PRESET_CONFIGS)) {
        const matches =
            settings.quality === preset.quality
            && settings.wave === preset.wave
            && sameNumber(settings.sensitivity, preset.sensitivity)
            && settings.reducedMotion === preset.reducedMotion;

        if (matches) {
            return presetKey;
        }
    }

    return 'custom';
}

const settings = buildSettings();
let activePresetKey = inferPresetKey(settings);

const ui = new UIController();
ui.setControlValues(settings);
ui.setPaused(false);
ui.setCameraActive(false);
ui.setPreviewVisible(true);
ui.setInputSource('Mouse');
ui.setActivePreset(activePresetKey);

const canvasHost = document.getElementById('canvasHost');
const videoElement = document.getElementById('inputVideo');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050d15, 0.0014);

const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 1200);
camera.position.set(0, 48, 118);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x000000, 0);

canvasHost.appendChild(renderer.domElement);

let autoQualityKey = resolveAutoQualityKey();
let qualityPreset = resolveQualityPreset(settings.quality, autoQualityKey);
const particleField = new ParticleField(scene, {
    particleCount: qualityPreset.particleCount,
});

const cursorRing = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2.5, 42),
    new THREE.MeshBasicMaterial({
        color: 0x55e8ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
    })
);
cursorRing.rotation.x = -Math.PI * 0.5;
scene.add(cursorRing);

const cursorCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, 24),
    new THREE.MeshBasicMaterial({
        color: 0x55e8ff,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
    })
);
cursorCore.rotation.x = -Math.PI * 0.5;
scene.add(cursorCore);

const performanceMonitor = new PerformanceMonitor();
const adaptiveQualityManager = new AdaptiveQualityManager();
const clock = new THREE.Clock();

let isPaused = false;
let cameraActive = false;
let previewVisible = true;
let virtualTime = 0;
let fpsUiTimer = 0;

let gestureState = {
    detected: false,
    gesture: 'NONE',
    pointer: { x: 0.5, y: 0.5 },
    confidence: 0,
};

let mouseState = {
    active: false,
    pointer: { x: 0.5, y: 0.5 },
};

let targetMode = cloneMode(GESTURE_MODES.NONE);
let currentMode = cloneMode(GESTURE_MODES.NONE);
let activeModeKey = 'NONE';

let lastDetectionState = false;
let lastInputSourceLabel = '';

const cursorTarget = new THREE.Vector3(0, 2.8, 14);
const cursorCurrent = new THREE.Vector3(0, 2.8, 14);

function persistUserSettings() {
    saveStoredSettings(settings);
    writeSettingsToURL(settings, DEFAULT_SETTINGS);
}

function syncPresetState() {
    activePresetKey = inferPresetKey(settings);
    ui.setActivePreset(activePresetKey);
}

function setInputSourceLabel(sourceLabel) {
    if (lastInputSourceLabel === sourceLabel) {
        return;
    }

    lastInputSourceLabel = sourceLabel;
    ui.setInputSource(sourceLabel);
}

function resizeRenderer() {
    const width = canvasHost.clientWidth;
    const height = canvasHost.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function applyQuality(showFeedback = true, reason = 'manual') {
    qualityPreset = resolveQualityPreset(settings.quality, autoQualityKey);

    particleField.setParticleCount(qualityPreset.particleCount);
    ui.setParticleCount(qualityPreset.particleCount);
    ui.setQualityModeLabel(qualityPreset.label);

    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, qualityPreset.pixelRatioCap);
    renderer.setPixelRatio(nextPixelRatio);
    resizeRenderer();

    if (!showFeedback) {
        return;
    }

    if (reason === 'adaptive') {
        ui.showToast(`Autoajuste de qualidade: ${qualityPreset.label}`);
        return;
    }

    ui.showToast(`Qualidade aplicada: ${qualityPreset.label}`);
}

function applyMode(modeKey) {
    const safeModeKey = GESTURE_MODES[modeKey] ? modeKey : 'NONE';
    if (activeModeKey === safeModeKey) {
        return;
    }

    activeModeKey = safeModeKey;
    targetMode = cloneMode(GESTURE_MODES[safeModeKey]);
    ui.setGesture(targetMode.uiLabel, modeColorToCss(targetMode));
}

function resolveInputMode() {
    if (cameraActive && gestureState.detected) {
        return gestureState.gesture;
    }

    if (mouseState.active) {
        return 'POINTER';
    }

    return 'NONE';
}

function syncModeFromInput() {
    applyMode(resolveInputMode());

    if (cameraActive && !gestureState.detected && !mouseState.active) {
        ui.setGesture('Camera ativa: aguardando mao', 'rgb(157 205 225)');
    }
}

function resetSceneView() {
    camera.position.set(0, 48, 118);
    camera.lookAt(0, 0, 0);

    particleField.points.rotation.set(0, 0, 0);
    virtualTime = 0;

    cursorTarget.set(0, 2.8, 14);
    cursorCurrent.copy(cursorTarget);
    cursorRing.position.copy(cursorCurrent);
    cursorCore.position.copy(cursorCurrent);

    ui.showToast('Camera e simulacao resetadas.');
}

function captureSnapshot() {
    if (!renderer.domElement.toBlob) {
        ui.showToast('Snapshot nao suportado neste navegador.');
        return;
    }

    renderer.domElement.toBlob((blob) => {
        if (!blob) {
            ui.showToast('Nao foi possivel gerar a imagem.');
            return;
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `particle-wave-${Date.now()}.png`;
        anchor.click();

        setTimeout(() => URL.revokeObjectURL(url), 1200);
        ui.showToast('Snapshot salvo com sucesso.');
    });
}

async function copyCurrentConfig() {
    persistUserSettings();
    const shareUrl = window.location.href;

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(shareUrl);
            ui.showToast('Link da configuracao copiado.');
            return;
        } catch (error) {
            console.warn('Falha ao copiar configuracao via clipboard API.', error);
        }
    }

    const tempInput = document.createElement('textarea');
    tempInput.value = shareUrl;
    tempInput.setAttribute('readonly', 'true');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (error) {
        copied = false;
    }

    tempInput.remove();

    ui.showToast(copied
        ? 'Link da configuracao copiado.'
        : 'Nao foi possivel copiar automaticamente.');
}

function applyPreset(presetKey) {
    const preset = PRESET_CONFIGS[presetKey];
    if (!preset) {
        return;
    }

    settings.quality = preset.quality;
    settings.wave = preset.wave;
    settings.sensitivity = preset.sensitivity;
    settings.reducedMotion = preset.reducedMotion;

    if (settings.quality === 'auto') {
        autoQualityKey = resolveAutoQualityKey();
    }

    ui.setControlValues(settings);
    applyQuality(false);
    syncPresetState();
    persistUserSettings();
    syncModeFromInput();

    ui.showToast(`Preset aplicado: ${preset.label}`);
}

function cyclePreset() {
    const currentIndex = PRESET_SEQUENCE.indexOf(activePresetKey);
    const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + 1) % PRESET_SEQUENCE.length;

    applyPreset(PRESET_SEQUENCE[nextIndex]);
}

async function toggleCamera(gestureController) {
    if (!cameraActive) {
        ui.setLoading(true, 'Ativando camera', 'Carregando dependencias e solicitando permissao...');
    }

    const active = await gestureController.toggle();
    cameraActive = active;

    ui.setCameraActive(active);
    ui.setLoading(false);

    if (active) {
        ui.setTrackingStatus('Camera ativa e rastreamento online.', 'active');
        ui.showToast('Camera ativada.');
    } else {
        ui.showToast('Camera desativada. Controle por mouse ativo.');
    }

    syncModeFromInput();
}

function togglePreview() {
    previewVisible = !previewVisible;
    ui.setPreviewVisible(previewVisible);
}

function smoothModeValues() {
    const factor = settings.reducedMotion ? 0.18 : 0.08;

    currentMode.timeSpeed += (targetMode.timeSpeed - currentMode.timeSpeed) * factor;
    currentMode.rotationSpeed += (targetMode.rotationSpeed - currentMode.rotationSpeed) * factor;
    currentMode.pointSize += (targetMode.pointSize - currentMode.pointSize) * factor;
    currentMode.influenceRadius += (targetMode.influenceRadius - currentMode.influenceRadius) * factor;
    currentMode.sinkStrength += (targetMode.sinkStrength - currentMode.sinkStrength) * factor;
    currentMode.burstStrength += (targetMode.burstStrength - currentMode.burstStrength) * factor;

    currentMode.color.r += (targetMode.color.r - currentMode.color.r) * factor;
    currentMode.color.g += (targetMode.color.g - currentMode.color.g) * factor;
    currentMode.color.b += (targetMode.color.b - currentMode.color.b) * factor;
}

function getActivePointer() {
    if (cameraActive && gestureState.detected) {
        return {
            active: true,
            pointer: gestureState.pointer,
            source: 'gesture',
        };
    }

    if (mouseState.active) {
        return {
            active: true,
            pointer: mouseState.pointer,
            source: 'mouse',
        };
    }

    return {
        active: false,
        pointer: { x: 0.5, y: 0.5 },
        source: 'none',
    };
}

function updateCursorFromPointer(pointerData) {
    if (!pointerData.active) {
        cursorRing.visible = false;
        cursorCore.visible = false;
        return;
    }

    const world = pointerToWorld(pointerData.pointer);
    cursorTarget.set(world.x, 2.8, world.z);

    const smoothing = settings.reducedMotion ? 0.24 : 0.13;
    cursorCurrent.lerp(cursorTarget, smoothing);

    cursorRing.visible = true;
    cursorCore.visible = true;
    cursorRing.position.copy(cursorCurrent);
    cursorCore.position.copy(cursorCurrent);
}

function setupPointerEvents() {
    canvasHost.addEventListener('pointermove', (event) => {
        const rect = canvasHost.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        mouseState.pointer.x = Math.min(Math.max(x, 0), 1);
        mouseState.pointer.y = Math.min(Math.max(y, 0), 1);
        mouseState.active = true;

        syncModeFromInput();
    }, { passive: true });

    canvasHost.addEventListener('pointerleave', () => {
        mouseState.active = false;
        syncModeFromInput();
    });

    canvasHost.addEventListener('pointercancel', () => {
        mouseState.active = false;
        syncModeFromInput();
    });
}

function setupKeyboardShortcuts(gestureController) {
    window.addEventListener('keydown', (event) => {
        if (event.repeat) {
            return;
        }

        if (event.code === 'Space') {
            event.preventDefault();
            isPaused = !isPaused;
            ui.setPaused(isPaused);
            ui.showToast(isPaused ? 'Simulacao pausada.' : 'Simulacao retomada.');
            return;
        }

        if (event.code === 'KeyG') {
            void toggleCamera(gestureController);
            return;
        }

        if (event.code === 'KeyC') {
            togglePreview();
            return;
        }

        if (event.code === 'KeyP') {
            cyclePreset();
            return;
        }

        if (event.code === 'Digit1') {
            settings.quality = 'auto';
            autoQualityKey = resolveAutoQualityKey();
            ui.qualitySelect.value = 'auto';
            applyQuality();
            syncPresetState();
            persistUserSettings();
            return;
        }

        if (event.code === 'Digit2') {
            settings.quality = 'high';
            ui.qualitySelect.value = 'high';
            applyQuality();
            syncPresetState();
            persistUserSettings();
            return;
        }

        if (event.code === 'Digit3') {
            settings.quality = 'balanced';
            ui.qualitySelect.value = 'balanced';
            applyQuality();
            syncPresetState();
            persistUserSettings();
            return;
        }

        if (event.code === 'Digit4') {
            settings.quality = 'performance';
            ui.qualitySelect.value = 'performance';
            applyQuality();
            syncPresetState();
            persistUserSettings();
        }
    });
}

function setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isPaused = true;
            ui.setPaused(true);
            ui.showToast('Simulacao pausada em segundo plano.');
        }
    });
}

function setupLifecycle(gestureController, resizeObserver) {
    window.addEventListener('beforeunload', () => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }

        void gestureController.stop();

        particleField.dispose();
        cursorRing.geometry.dispose();
        cursorRing.material.dispose();
        cursorCore.geometry.dispose();
        cursorCore.material.dispose();
        renderer.dispose();
    });
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = Math.min(clock.getDelta(), 0.05);

    if (!isPaused) {
        smoothModeValues();

        if (!targetMode.freeze) {
            virtualTime += deltaTime * Math.max(currentMode.timeSpeed, 0);
        }

        const pointerData = getActivePointer();
        updateCursorFromPointer(pointerData);

        if (pointerData.source === 'gesture') {
            setInputSourceLabel('Gesto');
        } else if (pointerData.source === 'mouse') {
            setInputSourceLabel('Mouse');
        } else if (cameraActive) {
            setInputSourceLabel('Camera standby');
        } else {
            setInputSourceLabel('Mouse');
        }

        const color = currentMode.color;
        cursorRing.material.color.setRGB(color.r, color.g, color.b);
        cursorCore.material.color.setRGB(color.r, color.g, color.b);

        particleField.points.rotation.y += currentMode.rotationSpeed + (cursorCurrent.x * 0.000014);
        particleField.points.rotation.x += (((-cursorCurrent.z) * 0.00002) - particleField.points.rotation.x) * 0.06;

        particleField.update({
            time: virtualTime,
            mode: currentMode,
            waveProfile: WAVE_PROFILES[settings.wave] || WAVE_PROFILES.cosmos,
            interaction: {
                active: pointerData.active,
                cursorX: cursorCurrent.x,
                cursorZ: cursorCurrent.z,
                sensitivity: settings.sensitivity,
            },
            reducedMotion: settings.reducedMotion,
        });
    }

    renderer.render(scene, camera);

    const fps = performanceMonitor.update(deltaTime);

    fpsUiTimer += deltaTime;
    if (fpsUiTimer >= 0.2) {
        ui.setFps(fps);
        fpsUiTimer = 0;
    }

    if (!isPaused && settings.quality === 'auto') {
        const suggestedKey = adaptiveQualityManager.update(fps, autoQualityKey);
        if (suggestedKey && suggestedKey !== autoQualityKey) {
            autoQualityKey = suggestedKey;
            applyQuality(true, 'adaptive');
        }
    } else {
        adaptiveQualityManager.reset();
    }
}

const gestureController = new GestureController({
    videoElement,
    onState: (nextState) => {
        gestureState = nextState;

        if (cameraActive) {
            if (nextState.detected && !lastDetectionState) {
                ui.setTrackingStatus('Mao detectada com rastreamento estavel.', 'active');
            }

            if (!nextState.detected && lastDetectionState) {
                ui.setTrackingStatus('Camera ativa. Aguardando mao.', 'warning');
            }

            lastDetectionState = nextState.detected;
        }

        syncModeFromInput();
    },
    onStatus: (text, state) => {
        ui.setTrackingStatus(text, state);
    },
    onError: (error) => {
        console.error(error);
        ui.showToast('Falha na camera. Controle por mouse ativado.');
    },
});

ui.bindControls({
    onQualityChange: (qualityKey) => {
        settings.quality = qualityKey;
        if (qualityKey === 'auto') {
            autoQualityKey = resolveAutoQualityKey();
        }
        applyQuality();
        syncPresetState();
        persistUserSettings();
    },
    onWaveChange: (waveKey) => {
        settings.wave = waveKey;
        syncPresetState();
        persistUserSettings();
        const label = WAVE_PROFILES[waveKey]?.label || waveKey;
        ui.showToast(`Perfil aplicado: ${label}`);
    },
    onSensitivityChange: (value) => {
        settings.sensitivity = value;
        syncPresetState();
        persistUserSettings();
    },
    onReducedMotionChange: (checked) => {
        settings.reducedMotion = checked;
        syncPresetState();
        persistUserSettings();
        ui.showToast(checked ? 'Modo reduzido ativado.' : 'Modo reduzido desativado.');
    },
    onPause: () => {
        isPaused = !isPaused;
        ui.setPaused(isPaused);
        ui.showToast(isPaused ? 'Simulacao pausada.' : 'Simulacao retomada.');
    },
    onReset: () => {
        resetSceneView();
    },
    onSnapshot: () => {
        captureSnapshot();
    },
    onCopyConfig: async () => {
        await copyCurrentConfig();
    },
    onCameraToggle: () => {
        void toggleCamera(gestureController);
    },
    onPreviewToggle: () => {
        togglePreview();
    },
    onPresetSelect: (presetKey) => {
        applyPreset(presetKey);
    },
});

setupPointerEvents();
setupKeyboardShortcuts(gestureController);
setupVisibilityHandling();

let resizeObserver = null;
if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(canvasHost);
}

window.addEventListener('resize', resizeRenderer, { passive: true });

persistUserSettings();
applyQuality(false);
resizeRenderer();
syncModeFromInput();

(async () => {
    ui.setLoading(true, 'Inicializando experiencia', 'Preparando renderizacao e solicitando acesso a camera...');

    const started = await gestureController.start();
    cameraActive = started;
    ui.setCameraActive(started);

    if (started) {
        ui.setTrackingStatus('Camera ativa e rastreamento online.', 'active');
        ui.setLoading(false);
    } else {
        ui.setTrackingStatus('Camera indisponivel. Use o mouse para interagir.', 'error');
        ui.setLoading(false);
        ui.showToast('Sem camera: controle via mouse habilitado.');
    }

    syncModeFromInput();
})();

setupLifecycle(gestureController, resizeObserver);
animate();
