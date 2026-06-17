import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  type BufferGeometry,
  type Material,
} from 'three';
import { groundedY, type RainParams } from './sceneObjects';
import { useInstanceData } from './Model';
import { buildGeometry, tintFor } from './Placeholder';
import { useWireDissolve } from './useDissolve';

// ─── Lluvia de instancias ────────────────────────────────────────────────────
// `count` objetos cayendo del cielo a la vez (un solo InstancedMesh = una draw
// call). Al tocar el suelo (groundedY en su x,z) reaparecen arriba: nunca hay más
// de `count` "lloviendo" simultáneamente. La animación vive solo en las matrices
// de instancia (useFrame), no se reconstruye geometría. Respeta
// prefers-reduced-motion dejándolas posadas en el suelo, sin animar.

const SKY = 9; // altura desde donde aparecen
const FALL_MIN = 2.4; // velocidad de caída (u/seg)
const FALL_MAX = 4.2;

interface Drop {
  x: number;
  z: number;
  y: number;
  vy: number;
  scale: number;
  rotY: number;
  spin: number;
  ground: number;
}

function RainField({
  geometry,
  material,
  params,
  dissolving,
}: {
  geometry: BufferGeometry;
  material: Material;
  params: RainParams;
  dissolving?: boolean;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const reduce = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  // Al disolver: malla verde que se desvanece (la caída se congela más abajo).
  const wireMat = useWireDissolve(!!dissolving);
  const { count, radius, scaleMin, scaleMax, lift } = params;

  // (Re)inicializa una gota: posición dispersa en el anillo, escala/giro random y
  // su altura de aterrizaje. `atSky` la coloca arriba para caer; si no, posada.
  const respawn = (d: Drop, atSky: boolean) => {
    const angle = Math.random() * Math.PI * 2;
    const r = radius * (0.55 + Math.random() * 0.6);
    d.x = Math.cos(angle) * r;
    d.z = Math.sin(angle) * r;
    d.scale = scaleMin + Math.random() * (scaleMax - scaleMin);
    d.rotY = Math.random() * Math.PI * 2;
    d.spin = (Math.random() - 0.5) * 1.6;
    d.vy = FALL_MIN + Math.random() * (FALL_MAX - FALL_MIN);
    d.ground = groundedY(d.x, d.z, d.scale, lift);
    d.y = atSky ? SKY + Math.random() * SKY : d.ground;
  };

  const drops = useMemo(() => {
    const arr: Drop[] = Array.from({ length: count }, () => ({
      x: 0,
      z: 0,
      y: 0,
      vy: 0,
      scale: 1,
      rotY: 0,
      spin: 0,
      ground: 0,
    }));
    arr.forEach((d) => respawn(d, !reduce)); // reduce → posadas; si no, escalonadas en el cielo
    return arr;
    // respawn es estable para los parámetros dados; depende de count/reduce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, reduce]);

  const writeMatrices = () => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, d.rotY, 0);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  // Pinta el primer fotograma (importante en reduced-motion, donde no hay loop).
  useEffect(writeMatrices, [drops, dummy]);

  useFrame((_, delta) => {
    if (reduce || dissolving) return; // congelado en su posición actual al disolver
    const mesh = meshRef.current;
    if (!mesh) return;
    const dt = Math.min(delta, 0.05); // clamp tras re-foco de pestaña
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.vy * dt;
      d.rotY += d.spin * dt;
      if (d.y <= d.ground) respawn(d, true); // tocó suelo → vuelve al cielo
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, d.rotY, 0);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <primitive object={dissolving ? wireMat : material} attach="material" />
    </instancedMesh>
  );
}

/** Lluvia con el modelo real (GLB normalizado e instanciado). */
export function RainInstancedModel({
  name,
  params,
  dissolving,
}: {
  name: string;
  params: RainParams;
  dissolving?: boolean;
}) {
  const data = useInstanceData(name);
  if (!data) return null;
  return (
    <RainField
      geometry={data.geometry}
      material={data.material}
      params={params}
      dissolving={dissolving}
    />
  );
}

/** Lluvia de respaldo (modelo generativo) si el GLB falla o LOAD_MODELS está off. */
export function RainPlaceholder({
  variant,
  params,
  dissolving,
}: {
  variant: number;
  params: RainParams;
  dissolving?: boolean;
}) {
  const geometry = useMemo(() => buildGeometry(variant), [variant]);
  const material = useMemo(
    () => new MeshBasicMaterial({ color: new Color(tintFor(variant)), toneMapped: false }),
    [variant]
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );
  return (
    <RainField geometry={geometry} material={material} params={params} dissolving={dissolving} />
  );
}
