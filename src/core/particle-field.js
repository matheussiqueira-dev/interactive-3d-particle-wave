import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const GRID_EXTENT = 260;

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;

    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(24, 24, 2, 24, 24, 24);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.5, 'rgba(170, 230, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 48, 48);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export class ParticleField {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.texture = createParticleTexture();
        this.geometry = new THREE.BufferGeometry();
        this.material = new THREE.PointsMaterial({
            size: 1,
            map: this.texture,
            vertexColors: true,
            transparent: true,
            opacity: 0.92,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        this.scene.add(this.points);

        this.pointCount = 0;
        this.positions = null;
        this.colors = null;
        this.baseX = null;
        this.baseZ = null;
        this.baseRadius = null;
        this.noise = null;

        const initialCount = options.particleCount || 28000;
        this.setParticleCount(initialCount);
    }

    setParticleCount(count) {
        if (this.pointCount === count && this.positions) {
            return;
        }

        if (this.geometry.getAttribute('position')) {
            this.geometry.deleteAttribute('position');
        }

        if (this.geometry.getAttribute('color')) {
            this.geometry.deleteAttribute('color');
        }

        this.pointCount = count;

        this.positions = new Float32Array(count * 3);
        this.colors = new Float32Array(count * 3);
        this.baseX = new Float32Array(count);
        this.baseZ = new Float32Array(count);
        this.baseRadius = new Float32Array(count);
        this.noise = new Float32Array(count);

        const half = GRID_EXTENT * 0.5;

        for (let index = 0; index < count; index += 1) {
            const i3 = index * 3;
            const x = (Math.random() * GRID_EXTENT) - half;
            const z = (Math.random() * GRID_EXTENT) - half;
            const radial = Math.sqrt((x * x) + (z * z));
            const random = Math.random();

            this.baseX[index] = x;
            this.baseZ[index] = z;
            this.baseRadius[index] = radial;
            this.noise[index] = random;

            this.positions[i3] = x;
            this.positions[i3 + 1] = 0;
            this.positions[i3 + 2] = z;

            this.colors[i3] = 0.28;
            this.colors[i3 + 1] = 0.62;
            this.colors[i3 + 2] = 0.96;
        }

        const positionAttribute = new THREE.BufferAttribute(this.positions, 3);
        const colorAttribute = new THREE.BufferAttribute(this.colors, 3);

        positionAttribute.setUsage(THREE.DynamicDrawUsage);
        colorAttribute.setUsage(THREE.DynamicDrawUsage);

        this.geometry.setAttribute('position', positionAttribute);
        this.geometry.setAttribute('color', colorAttribute);
        this.geometry.computeBoundingSphere();
    }

    computeWave(x, z, radial, time, waveId, noiseFactor, reducedMotion) {
        const movementScale = reducedMotion ? 0.55 : 1;
        const t = time * movementScale;

        if (waveId === 'ripple') {
            const radialWave = Math.sin((radial * 0.16) - (t * 2.2)) * 2.7;
            const lateralWave = Math.cos(((x - z) * 0.035) + t) * 0.95;
            return radialWave + lateralWave;
        }

        if (waveId === 'storm') {
            const swirl = Math.sin((x * 0.085) + (t * 2.8)) * Math.cos((z * 0.09) + (t * 2.2)) * 1.9;
            const pulse = Math.sin((radial * 0.21) - (t * 4.1) + (noiseFactor * 10)) * 1.4;
            return swirl + pulse;
        }

        const base = Math.sin((x * 0.047) + t) * Math.cos((z * 0.043) + t) * 2.2;
        const ring = Math.sin((radial * 0.1) - (t * 1.9)) * 1.55;
        return base + ring;
    }

    update(context) {
        if (!this.positions || !context) {
            return;
        }

        const {
            time,
            mode,
            waveProfile,
            interaction,
            reducedMotion,
        } = context;

        const pointSize = reducedMotion ? mode.pointSize * 0.9 : mode.pointSize;
        this.material.size = pointSize;

        const radius = mode.influenceRadius * interaction.sensitivity;
        const radiusSquared = radius * radius;
        const sinkStrength = mode.sinkStrength * interaction.sensitivity;

        const cursorX = interaction.cursorX;
        const cursorZ = interaction.cursorZ;

        for (let index = 0; index < this.pointCount; index += 1) {
            const i3 = index * 3;
            const x = this.baseX[index];
            const z = this.baseZ[index];
            const radial = this.baseRadius[index];
            const noiseFactor = this.noise[index];

            let y = this.computeWave(x, z, radial, time, waveProfile.id, noiseFactor, reducedMotion) * waveProfile.intensity;

            if (interaction.active) {
                const dx = x - cursorX;
                const dz = z - cursorZ;
                const distanceSquared = (dx * dx) + (dz * dz);

                if (distanceSquared < radiusSquared) {
                    const force = 1 - (distanceSquared / radiusSquared);
                    if (mode.id === 'FIST') {
                        y += (noiseFactor - 0.5) * mode.burstStrength * force;
                    } else {
                        y -= sinkStrength * force;
                    }
                }
            }

            this.positions[i3 + 1] = y;

            const heightFactor = clamp((y + 8) / 16, 0, 1);
            const tone = 0.58 + (heightFactor * 0.42);
            this.colors[i3] = clamp((mode.color.r * tone) + (heightFactor * 0.08), 0, 1);
            this.colors[i3 + 1] = clamp((mode.color.g * tone) + (heightFactor * 0.1), 0, 1);
            this.colors[i3 + 2] = clamp((mode.color.b * tone) + (heightFactor * 0.12), 0, 1);
        }

        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.color.needsUpdate = true;
    }

    dispose() {
        this.scene.remove(this.points);
        this.geometry.dispose();
        this.material.dispose();
        this.texture.dispose();
    }
}
