import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, InstancedMesh, Object3D, Color } from 'three';

// Old-TV palette (matches the placeholder objects: red, orange, blue, green).
const PALETTE = [
  new Color('#ff3b3b'),
  new Color('#ff8c1a'),
  new Color('#3b7bff'),
  new Color('#37ff5e'),
];
const PER_ORIGIN = 60;

/**
 * One InstancedMesh of debris bursting outward from every object position
 * (single draw call regardless of how many origins/objects exploded).
 */
export default function ExplosionParticles({ origins }: { origins: Vector3[] }) {
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const count = Math.max(origins.length, 1) * PER_ORIGIN;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new Vector3(),
        vel: new Vector3(),
        scale: 0,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      })),
    [count]
  );

  // Seed each particle at one of the origins with an outward velocity.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || origins.length === 0) return;
    particles.forEach((p, i) => {
      const origin = origins[i % origins.length];
      p.pos.copy(origin);
      const dir = new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      p.vel.copy(dir).multiplyScalar(0.06 + Math.random() * 0.12);
      p.scale = 0.5 + Math.random() * 1.2;
      mesh.setColorAt(i, p.color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [origins, particles]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.vel.y -= 0.0008; // gravity
      p.pos.add(p.vel);
      p.scale *= 0.97; // shrink
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(Math.max(p.scale, 0.0001));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.08, 0]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
