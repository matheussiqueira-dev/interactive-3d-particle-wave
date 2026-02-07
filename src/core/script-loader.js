const scriptPromises = new Map();

export function loadScriptOnce(src) {
    if (!src) {
        return Promise.reject(new Error('URL de script invalida.'));
    }

    if (scriptPromises.has(src)) {
        return scriptPromises.get(src);
    }

    const existingScript = document.querySelector(`script[data-src="${src}"]`);
    if (existingScript) {
        const resolved = Promise.resolve();
        scriptPromises.set(src, resolved);
        return resolved;
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.src = src;

        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Falha ao carregar script: ${src}`));

        document.head.appendChild(script);
    });

    scriptPromises.set(src, promise);
    return promise;
}

export async function ensureMediaPipeDependencies() {
    if (window.Hands && window.Camera) {
        return;
    }

    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
    await loadScriptOnce('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');

    if (!window.Hands || !window.Camera) {
        throw new Error('Dependencias MediaPipe indisponiveis apos carregamento.');
    }
}
