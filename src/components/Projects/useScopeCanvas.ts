import { useEffect, useRef } from 'react';
import { ScopeParams, TINT_RGB } from './projectsData';

/**
 * Dibuja una figura de Lissajous (osciloscopio) en un <canvas>.
 *
 * El loop rAF SOLO corre mientras `active` es true, para no gastar cómputo
 * con la pantalla apagada. Depende de valores primitivos (no del objeto
 * `scope`) para que ajustar las perillas reinicie la señal sin recrear el
 * efecto en cada render. Respeta `prefers-reduced-motion` pintando un
 * fotograma estático en lugar de animar.
 */
export function useScopeCanvas(active: boolean, scope: ScopeParams) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { freqX, freqY, phase, tint } = scope;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rgb = TINT_RGB[tint];

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    // Arranque limpio para que el cambio de proyecto se vea de inmediato.
    ctx.fillStyle = 'rgb(5, 8, 5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawFrame = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      // Estela del fósforo: oscurecemos en lugar de limpiar del todo.
      ctx.fillStyle = 'rgba(5, 8, 5, 0.28)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const rx = w * 0.36;
      const ry = h * 0.34;
      const steps = 260;

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = (i / steps) * Math.PI * 2;
        const x = cx + rx * Math.sin(freqX * u + phase + t);
        const y = cy + ry * Math.sin(freqY * u);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2 * dpr;
      ctx.shadowColor = `rgba(${rgb}, 0.9)`;
      ctx.shadowBlur = 10 * dpr;
      ctx.strokeStyle = `rgba(${rgb}, 0.95)`;
      ctx.stroke();
    };

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t = 0;

    if (reduceMotion) {
      drawFrame(0);
    } else {
      const loop = () => {
        t += 0.012;
        drawFrame(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [active, freqX, freqY, phase, tint]);

  return canvasRef;
}
