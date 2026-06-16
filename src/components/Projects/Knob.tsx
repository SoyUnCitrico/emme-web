import { useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  label: string;
  /** Posición de la perilla, 0..1. */
  value: number;
  /** Si se define, la perilla es interactiva (arrastrar vertical). */
  onChange?: (value: number) => void;
  /** Resalta el knob cuando el equipo está encendido. */
  lit?: boolean;
}

const MIN_ANGLE = -135;
const ANGLE_RANGE = 270;
/** Píxeles de arrastre vertical para recorrer todo el rango. */
const DRAG_RANGE = 160;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Perilla rotatoria de instrumental. Decorativa por defecto; si recibe
 * `onChange` se vuelve interactiva: arrastrar hacia arriba sube el valor.
 */
export default function Knob({ label, value, onChange, lit = false }: Props) {
  const drag = useRef<{ startY: number; startValue: number } | null>(null);
  const interactive = !!onChange;
  const angle = MIN_ANGLE + value * ANGLE_RANGE;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onChange) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startValue: value };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!onChange || !drag.current) return;
    const delta = (drag.current.startY - e.clientY) / DRAG_RANGE;
    onChange(clamp01(drag.current.startValue + delta));
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    drag.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        role={interactive ? 'slider' : undefined}
        aria-label={interactive ? label : undefined}
        aria-valuenow={interactive ? Math.round(value * 100) : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`relative h-12 w-12 rounded-full border shadow-inner transition-colors ${
          interactive
            ? 'cursor-ns-resize border-neon-orange/60 touch-none'
            : 'border-matrix-line'
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #14301c, #0a140d 70%)',
        }}
      >
        {/* Indicador giratorio */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        >
          <span
            className={`absolute left-1/2 top-1 h-3 w-0.5 -translate-x-1/2 rounded ${
              lit || interactive ? 'bg-neon-amber shadow-glow-orange' : 'bg-matrix-dim'
            }`}
          />
        </motion.div>
        {/* Tornillo central */}
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-matrix-line" />
      </div>
      <span
        className={`text-[9px] uppercase tracking-wider ${
          interactive ? 'text-neon-amber' : 'text-matrix-dim'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
