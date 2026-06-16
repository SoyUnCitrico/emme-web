import { CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CrtEffects, Project, ScopeParams, TINT_RGB } from './projectsData';
import { useScopeCanvas } from './useScopeCanvas';
import CrtOverlay from './CrtOverlay';

interface Props {
  /** Proyecto activo, o null si la pantalla está apagada. */
  project: Project | null;
  /** Señal efectiva a dibujar (con ajustes de perilla si aplica). */
  scope: ScopeParams;
  /** Efectos CRT efectivos (solo afectan al modo asset). */
  effects: CrtEffects;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Pantalla CRT (lado derecho). El lienzo de la señal vive en una capa
 * PERSISTENTE (fuera del AnimatePresence) para que el cambio rápido entre
 * proyectos no pierda el arranque de la animación. Al hacer click se abre el
 * enlace del proyecto. Estilo de menú de terminal antiguo bajo filtro CRT.
 */
export default function OscilloscopeScreen({ project, scope, effects }: Props) {
  const reduce = useReducedMotion();
  const powered = project !== null;
  const hasAsset = !!project?.asset;
  // El canvas solo se anima cuando hay un proyecto sin asset.
  const canvasRef = useScopeCanvas(powered && !hasAsset, scope);
  const rgb = project ? TINT_RGB[project.scope.tint] : TINT_RGB.green;

  // Filtros del medio (modo asset): brillo + separación cromática.
  const offsetPx = effects.offset * 6;
  const assetFilter = `brightness(${0.5 + effects.brightness}) drop-shadow(${offsetPx}px 0 rgba(255,0,80,0.5)) drop-shadow(${-offsetPx}px 0 rgba(0,200,255,0.5))`;
  const glitchStyle = { '--glitch': effects.glitch } as CSSProperties;
  const glitchOn = !reduce && effects.glitch > 0.02;

  const open = () => {
    if (project) window.open(project.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role={powered ? 'link' : undefined}
      aria-label={project ? `Abrir ${project.label}` : undefined}
      onClick={open}
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-matrix-black ring-1 ring-matrix-line ${
        powered ? 'cursor-pointer' : ''
      }`}
    >
      {/* Graticule / cuadrícula del osciloscopio */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,179,65,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(0,179,65,0.18) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Capa de señal (canvas PERSISTENTE) — visible solo sin asset */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-[1] h-full w-full transition-opacity duration-200 ${
          powered && !hasAsset ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Capa de asset (img/video) con efectos controlados por perillas */}
      {hasAsset && project?.asset && (
        <div
          className={`absolute inset-0 z-[1] ${glitchOn ? 'crt-glitch' : ''}`}
          style={glitchStyle}
        >
          {project.asset.type === 'video' ? (
            <video
              src={project.asset.src}
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
              style={{ filter: assetFilter }}
            />
          ) : (
            <img
              src={project.asset.src}
              alt={project.label}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: assetFilter }}
            />
          )}
        </div>
      )}

      {/* Destello de encendido (enter) y colapso al apagar (exit) del tubo */}
      <AnimatePresence>
        {!reduce && powered && (
          <motion.div
            key="flash"
            className="absolute inset-0 z-30 bg-matrix-text"
            initial={{ scaleY: 0.012, opacity: 0.95 }}
            animate={{ scaleY: 1, opacity: 0 }}
            exit={{ scaleY: 0.012, opacity: 0.6 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ originY: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Chrome de terminal (crossfade por proyecto, canvas no se remonta) */}
      <AnimatePresence>
        {project && (
          <motion.div
            key={project.url}
            className="absolute inset-0 z-10 flex flex-col justify-between p-4 font-mono text-matrix-text md:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.22, duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            {/* Cabecera */}
            <div className="bg-gradient-to-b from-matrix-black/80 to-transparent pb-3">
              <div className="flex items-center justify-between text-xs text-matrix-dim md:text-sm">
                <span>EMME-OS v2.5</span>
                <span className="animate-flicker">● REC</span>
              </div>
              <div className="mt-1 text-sm md:text-base">
                <span className="text-matrix-green">&gt; LOAD</span>{' '}
                <span style={{ color: `rgb(${rgb})`, textShadow: `0 0 10px rgba(${rgb},0.7)` }}>
                  {project.label}
                </span>
              </div>
            </div>

            {/* Pie de foto + acción */}
            <div className="bg-gradient-to-t from-matrix-black/85 to-transparent pt-6">
              <p className="text-xs leading-snug text-matrix-text/90 md:text-sm">
                <span className="text-matrix-dim">; </span>
                {project.caption}
              </p>
              <span className="mt-1 inline-block text-xs uppercase tracking-widest text-neon-orange text-glow-orange md:text-sm">
                RUN ./visitar ↗
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standby */}
      {!project && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <span className="text-xs uppercase tracking-[0.4em] text-matrix-dim/60 md:text-sm">
            standby
          </span>
        </div>
      )}

      <CrtOverlay />
    </div>
  );
}
