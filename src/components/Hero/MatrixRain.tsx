import { useEffect, useRef } from 'react';

/**
 * Lightweight "digital rain" backdrop drawn on a 2D canvas. Used only behind the
 * hero. Pauses when the tab is hidden and respects prefers-reduced-motion.
 */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const glyphs = 'アイウエオカキクケコ0123456789ﾊﾐﾋｰｳ<>/{}=*+ABCDEF'.split('');
    const fontSize = 16;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener('resize', resize);

    let rafId = 0;
    let lastTime = 0;
    const frameInterval = 1000 / 18; // throttle to ~18fps — plenty for rain

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw);
      if (time - lastTime < frameInterval) return;
      lastTime = time;

      // Translucent black fade leaves trailing streaks.
      ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Occasional orange "head" glyph for accent; rest are dim green.
        ctx.fillStyle = Math.random() > 0.985 ? 'rgba(255, 140, 26, 0.9)' : 'rgba(0, 255, 65, 0.45)';
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    if (!reduceMotion) rafId = requestAnimationFrame(draw);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-25"
      aria-hidden="true"
    />
  );
}
