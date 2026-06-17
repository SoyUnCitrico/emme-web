import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshBasicMaterial } from 'three';
import { dissolveConfig } from './sceneObjects';

// ─── Disolución wireframe ────────────────────────────────────────────────────
// Devuelve un material de "malla de nodos" verde neón cuya opacidad se anima al
// activarse: se mantiene a 1 durante `holdMs` y luego baja a 0 en `fadeMs`. La
// animación es pura mutación del uniform en useFrame (sin re-render de React).
// Debe usarse dentro del árbol de <Canvas> (usa useFrame).
export function useWireDissolve(active: boolean): MeshBasicMaterial {
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0x00ff41,
        wireframe: true,
        transparent: true,
        toneMapped: false,
        depthWrite: false,
      }),
    []
  );

  useEffect(() => () => material.dispose(), [material]);

  const start = useRef<number | null>(null);

  // Reinicia el reloj y la opacidad cada vez que cambia el estado activo.
  useEffect(() => {
    start.current = null;
    material.opacity = 1;
  }, [active, material]);

  useFrame((state) => {
    if (!active) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const ms = (state.clock.elapsedTime - start.current) * 1000;
    const t = ms - dissolveConfig.holdMs;
    material.opacity = t <= 0 ? 1 : Math.max(0, 1 - t / dissolveConfig.fadeMs);
  });

  return material;
}
