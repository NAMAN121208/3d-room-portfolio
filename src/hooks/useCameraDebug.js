import { useEffect, useRef } from 'react';

export function useCameraDebug(canvas, stopId, progress, reducedMotion) {
  const output = useRef(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    // A plain diagnostic node avoids a second React root inside the R3F renderer.
    const element = document.createElement('output');
    element.dataset.cameraDebug = '';
    Object.assign(element.style, {
      position: 'absolute', bottom: '20px', right: '20px', padding: '8px 12px',
      borderRadius: '8px', background: '#0a0d14dd', color: '#e2e8f0',
      font: '12px monospace', pointerEvents: 'none', zIndex: '20',
    });
    canvas.parentElement.appendChild(element);
    output.current = element;
    return () => { element.remove(); output.current = null; };
  }, [canvas]);
  useEffect(() => {
    if (output.current) output.current.textContent = `${stopId} · ${(progress * 100).toFixed(1)}%${reducedMotion ? ' · reduced motion' : ''}`;
  }, [canvas, stopId, progress, reducedMotion]);
}
