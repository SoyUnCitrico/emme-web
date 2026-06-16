import { motion, useReducedMotion } from 'framer-motion';
import { Project } from './projectsData';

interface Props {
  project: Project;
  /** Este botón es el proyecto activo en pantalla. */
  current: boolean;
  /** Este botón está fijado con click. */
  pinned: boolean;
  /** Hay algún proyecto activo (apaga el brillo del resto). */
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}

/**
 * Botón de laboratorio. Brilla en naranja (latido suave) invitando a
 * pulsarlo mientras la pantalla está apagada; al activarse cualquier
 * proyecto, el brillo se apaga. El activo muestra un anillo verde "engaged".
 */
export default function ProjectButton({
  project,
  current,
  pinned,
  dimmed,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: Props) {
  const reduce = useReducedMotion();
  // Brilla solo cuando nada está activo (pantalla apagada).
  const glowing = !dimmed;

  return (
    <motion.button
      type="button"
      title={project.label}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      onClick={onSelect}
      whileTap={{ scale: 0.94 }}
      animate={
        glowing && !reduce
          ? { boxShadow: ['0 0 6px rgba(255,140,26,0.5)', '0 0 16px rgba(255,140,26,0.85)', '0 0 6px rgba(255,140,26,0.5)'] }
          : { boxShadow: '0 0 0px rgba(255,140,26,0)' }
      }
      transition={{ duration: 2.4, repeat: glowing && !reduce ? Infinity : 0, ease: 'easeInOut' }}
      className={[
        'relative flex h-11 items-center justify-center rounded-md border px-2 text-xs uppercase tracking-wide transition-colors',
        current
          ? 'border-matrix-green text-matrix-green shadow-glow-green'
          : glowing
          ? 'border-neon-orange bg-neon-orange/10 text-neon-amber'
          : 'border-matrix-line text-matrix-dim hover:border-matrix-green hover:text-matrix-green',
      ].join(' ')}
    >
      {/* LED de estado */}
      <span
        className={`absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${
          current ? 'bg-matrix-green shadow-glow-green' : glowing ? 'bg-neon-orange' : 'bg-matrix-line'
        }`}
      />
      {/* Marca de fijado */}
      {pinned && (
        <span className="absolute right-1.5 top-1 text-[8px] text-matrix-green">◉</span>
      )}
      <span className="truncate">{project.label}</span>
    </motion.button>
  );
}
