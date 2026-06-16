import { Component, useMemo, type ReactNode } from 'react';
import { useGLTF, Instances, Instance } from '@react-three/drei';
import {
  Box3,
  Vector3,
  type Group,
  type Mesh,
  type Object3D,
  type BufferGeometry,
  type Material,
} from 'three';
import { S3_BASE, sceneObjects, type Transform } from './sceneObjects';

// Models are normalized so their largest dimension ~= this many world units,
// regardless of the source OBJ's arbitrary scale.
const TARGET_SIZE = 1.6;

const urlFor = (name: string) => `${S3_BASE}/${name}/${name}.glb`;

// ─── FORMAT BOUNDARY ─────────────────────────────────────────────────────────
// All asset-format specifics live here. We load Draco-compressed GLBs from S3 via
// drei's useGLTF (auto-decodes Draco from a CDN). Swapping formats again only
// touches this hook — SpaceScene, instancing and the explosion are untouched.
function useModelScene(name: string): Group {
  const { scene } = useGLTF(urlFor(name));
  return scene;
}
// ─────────────────────────────────────────────────────────────────────────────

function firstMesh(root: Object3D): Mesh | null {
  let found: Mesh | null = null;
  root.traverse((child) => {
    if (!found && (child as Mesh).isMesh) found = child as Mesh;
  });
  return found;
}

/** A single, unique instance — full (possibly multi-mesh) model, centered + sized. */
export function Model({ name, transform }: { name: string; transform: Transform }) {
  const scene = useModelScene(name);
  const { object, fit, offset } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const f = TARGET_SIZE / maxDim;
    return { object: clone, fit: f, offset: center.multiplyScalar(f) };
  }, [scene]);

  return (
    <group
      position={transform.position}
      rotation={transform.rotation ?? [0, 0, 0]}
      scale={transform.scale ?? 1}
    >
      {/* inner group normalizes size and recenters the model on the origin */}
      <group scale={fit} position={[-offset.x, -offset.y, -offset.z]}>
        <primitive object={object} />
      </group>
    </group>
  );
}

/** Many copies of one object via a single InstancedMesh (one draw call). */
export function InstancedModel({ name, instances }: { name: string; instances: Transform[] }) {
  const scene = useModelScene(name);

  const data = useMemo(() => {
    const mesh = firstMesh(scene);
    if (!mesh) return null;
    // Clone the geometry so we can bake the node transform, center and normalize
    // it once — then every instance shares it (one upload, one draw call).
    const geometry = mesh.geometry.clone();
    mesh.updateWorldMatrix(true, false);
    geometry.applyMatrix4(mesh.matrixWorld);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    geometry.translate(-center.x, -center.y, -center.z);
    geometry.scale(TARGET_SIZE / maxDim, TARGET_SIZE / maxDim, TARGET_SIZE / maxDim);
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    return { geometry: geometry as BufferGeometry, material: material as Material };
  }, [scene]);

  if (!data) return null;

  return (
    <Instances geometry={data.geometry} material={data.material} limit={instances.length}>
      {instances.map((t, i) => (
        <Instance
          key={i}
          position={t.position}
          rotation={t.rotation ?? [0, 0, 0]}
          scale={t.scale ?? 1}
        />
      ))}
    </Instances>
  );
}

/**
 * Isolates a model load: if the GLB fails (404, CORS, missing name), it renders
 * `fallback` (a generative placeholder) instead of crashing the scene.
 */
export class ModelBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[3D] modelo no cargó, usando placeholder generativo:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback ?? null : this.props.children;
  }
}

// Warm the cache so models start downloading as soon as the scene mounts.
sceneObjects.forEach((o) => useGLTF.preload(urlFor(o.name)));
