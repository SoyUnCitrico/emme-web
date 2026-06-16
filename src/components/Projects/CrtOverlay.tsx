import { useReducedMotion } from 'framer-motion';

/**
 * Filtro de video CRT que se superpone al contenido de la pantalla:
 * scanlines, viñeta y una línea de barrido en movimiento. Sin coste de JS
 * (solo CSS); el barrido se detiene si el usuario pide menos movimiento.
 */
export default function CrtOverlay() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Scanlines finas */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
        }}
      />
      {/* Aberración / brillo del fósforo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(0,255,65,0.06), transparent 60%)',
        }}
      />
      {/* Viñeta y curvatura simulada */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            'inset 0 0 60px rgba(0,0,0,0.85), inset 0 0 18px rgba(0,0,0,0.6)',
        }}
      />
      {/* Línea de barrido vertical en movimiento */}
      {!reduce && (
        <div
          className="absolute left-0 right-0 h-12 animate-vhs-roll opacity-30"
          style={{
            background:
              'linear-gradient(180deg, transparent, rgba(127,255,168,0.25), transparent)',
          }}
        />
      )}
    </div>
  );
}
