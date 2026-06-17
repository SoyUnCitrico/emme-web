import { useEffect, useRef } from 'react';

/**
 * Interferencia de "TV vieja" intensa: nieve de color (ruido RGB), desplazamiento
 * cromático (capas roja/cian que tiemblan), banda de tracking que salta y
 * scanlines marcadas. Se monta solo mientras dura la detonación (el padre lo
 * desmonta cuando los objetos desaparecen), así el rAF solo corre en ese lapso.
 * No bloquea clicks y respeta prefers-reduced-motion (un fotograma estático).
 */
export default function GlitchOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Buffer de ruido pequeño que el CSS estira (nieve a pantalla completa barata).
    const W = 160;
    const H = 90;
    canvas.width = W;
    canvas.height = H;
    const image = ctx.createImageData(W, H);

    const paint = () => {
      const d = image.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = Math.random() * 255; // R
        d[i + 1] = Math.random() * 255; // G
        d[i + 2] = Math.random() * 255; // B
        d[i + 3] = 130; // nieve de color
      }
      ctx.putImageData(image, 0, 0);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(); // un solo fotograma, sin animar
      return;
    }

    let rafId = 0;
    let last = 0;
    const interval = 1000 / 30;
    const draw = (t: number) => {
      rafId = requestAnimationFrame(draw);
      if (t - last < interval) return;
      last = t;
      paint();
    };
    rafId = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafId);
      else rafId = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="true">
      {/* Nieve de color (ruido RGB) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-50 mix-blend-screen"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* Desplazamiento cromático — canal rojo (tiembla a la izquierda) */}
      <div
        className="glitch-jitter-a absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(255,0,40,0.5) 0px, rgba(255,0,40,0) 2px, rgba(255,0,40,0) 4px)',
        }}
      />
      {/* Desplazamiento cromático — canal cian (tiembla a la derecha) */}
      <div
        className="glitch-jitter-b absolute inset-0 opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,220,255,0.5) 0px, rgba(0,220,255,0) 2px, rgba(0,220,255,0) 4px)',
        }}
      />
      {/* Banda de tracking que salta verticalmente */}
      <div
        className="glitch-tear absolute left-0 right-0 h-16 mix-blend-screen"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* Scanlines marcadas + flicker */}
      <div
        className="animate-flicker absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.45) 3px)',
        }}
      />
    </div>
  );
}
