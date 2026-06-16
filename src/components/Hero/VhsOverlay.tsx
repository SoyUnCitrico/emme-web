import { useEffect, useRef } from 'react';

/**
 * Full-hero "old TV" overlay: animated static (tiny canvas stretched + pixelated),
 * CRT scanlines, and a rolling tracking band. Sits above everything, never blocks
 * clicks, pauses when hidden and respects prefers-reduced-motion.
 */
export default function VhsOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Render a tiny noise buffer and let CSS stretch it (cheap full-screen static).
    const W = 160;
    const H = 90;
    canvas.width = W;
    canvas.height = H;
    const image = ctx.createImageData(W, H);

    let rafId = 0;
    let last = 0;
    const interval = 1000 / 24;

    const draw = (t: number) => {
      rafId = requestAnimationFrame(draw);
      if (t - last < interval) return;
      last = t;
      const d = image.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255;
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 28; // low alpha grain
      }
      ctx.putImageData(image, 0, 0);
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
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden="true">
      {/* animated static */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-25 mix-blend-screen"
        style={{ imageRendering: 'pixelated' }}
      />
      {/* CRT scanlines (darken) */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.3) 3px)',
        }}
      />
      {/* rolling tracking band (brighten) */}
      <div
        className="absolute left-0 right-0 top-0 h-28 animate-vhs-roll mix-blend-screen"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* subtle CRT vignette */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: 'inset 0 0 110px 8px rgba(0,0,0,0.4)' }}
      />
    </div>
  );
}
