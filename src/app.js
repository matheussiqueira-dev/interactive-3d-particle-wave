import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import {
    DEFAULT_SETTINGS,
    GESTURE_MODES,
    WAVE_PROFILES,
    resolveQualityPreset,
} from './config.js';
import { ParticleField } from './core/particle-field.js';
import { GestureController } from './core/gesture-controller.js';
import { PerformanceMonitor } from './core/performance-monitor.js';
import { UIController } from './core/ui-controller.js';

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

const settings = { ...DEFAULT_SETTINGS };
const ui = new UIController();
ui.setControlValues(settings);
ui.setPaused(false);
ui.setCameraActive(false);
ui.setPreviewVisible(true);

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

let qualityPreset = resolveQualityPreset(settings.quality);
const particleField = new ParticleField(scene, {
    particleCount: qualityPreset.particleCount,
});

const cursorRing = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 2.5, 42),
    new THREE.MeshBasicMaterial({ color: 0x55e8ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
);
cursorRing.rotation.x = -Math.PI * 0.5;
scene.add(cursorRing);

const cursorCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, 24),
    new THREE.MeshBasicMaterial({ color: 0x55e8ff, transparent: true, opacity: 0.34, side: THREE.DoubleSide })
);
cursorCore.rotation.x = -Math.PI * 0.5;
scene.add(cursorCore);

const performanceMonitor = new PerformanceMonitor();
const clock = new THREE.Clock();

let isPaused = false;
let cameraActive = false;
let previewVisible = true;
let virtualTime = 0;

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

const cursorTarget = new THREE.Vector3(0, 2.8, 14);
const cursorCurrent = new THREE.Vector3(0, 2.8, 14);

function resizeRenderer() {
    const width = canvasHost.clientWidth;
    const height = canvasHost.clientHeight;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function applyQuality(showFeedback = true) {
    qualityPreset = resolveQualityPreset(settings.quality);

    particleField.setParticleCount(qualityPreset.particleCount);
    ui.setParticleCount(qualityPreset.particleCount);

    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, qualityPreset.pixelRatioCap);
    renderer.setPixelRatio(nextPixelRatio);
    resizeRenderer();

    if (showFeedback) {
        ui.showToast(`Qualidade aplicada: ${qualityPreset.label}`);
    }
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

async function toggleCamera(gestureController) {
    const active = await gestureController.toggle();
    cameraActive = active;

    ui.setCameraActive(active);
    if (active) {
        ui.setTrackingStatus('Camera ativa e rastreamento online.', 'active');
        ui.setLoading(false);
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
    });

    canvasHost.addEventListener('pointerleave', () => {
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
            toggleCamera(gestureController);
            return;
        }

        if (event.code === 'KeyC') {
            togglePreview();
            return;
        }

        if (event.code === 'Digit1') {
            settings.quality = 'auto';
            ui.qualitySelect.value = 'auto';
            applyQuality();
            return;
        }

        if (event.code === 'Digit2') {
            settings.quality = 'high';
            ui.qualitySelect.value = 'high';
            applyQuality();
            return;
        }

        if (event.code === 'Digit3') {
            settings.quality = 'balanced';
            ui.qualitySelect.value = 'balanced';
            applyQuality();
            return;
        }

        if (event.code === 'Digit4') {
            settings.quality = 'performance';
            ui.qualitySelect.value = 'performance';
            applyQuality();
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
    ui.setFps(fps);
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
        applyQuality();
    },
    onWaveChange: (waveKey) => {
        settings.wave = waveKey;
        const label = WAVE_PROFILES[waveKey]?.label || waveKey;
        ui.showToast(`Perfil aplicado: ${label}`);
    },
    onSensitivityChange: (value) => {
        settings.sensitivity = value;
    },
    onReducedMotionChange: (checked) => {
        settings.reducedMotion = checked;
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
    onCameraToggle: () => {
        toggleCamera(gestureController);
    },
    onPreviewToggle: () => {
        togglePreview();
    },
});

setupPointerEvents();
setupKeyboardShortcuts(gestureController);
setupVisibilityHandling();

if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(canvasHost);
}

window.addEventListener('resize', resizeRenderer, { passive: true });

applyQuality(false);
resizeRenderer();
syncModeFromInput();

(async () => {
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

animate();
