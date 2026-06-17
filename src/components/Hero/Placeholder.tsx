import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Color,
  DoubleSide,
  type Mesh,
  type ShaderMaterial,
} from 'three';
import type { Transform } from './sceneObjects';

// ─── Generative parametric placeholders ──────────────────────────────────────
// Built entirely in code from math formulas (no assets) so the scene always shows
// something while the S3 models load, if they fail, or while LOAD_MODELS is off.
// Look: RGB "old-TV" palette rendered through a CRT/VHS shader (scanlines, static
// noise, channel split, flicker and tracking-glitch jumps) — also code-generated.

/** Triangulate a parametric surface fn(u,v)∈[0,1]² → position (with uv). */
function parametricGeometry(
  fn: (u: number, v: number, target: Vector3) => void,
  segU: number,
  segV: number
): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const p = new Vector3();

  for (let i = 0; i <= segU; i++) {
    for (let j = 0; j <= segV; j++) {
      const u = i / segU;
      const v = j / segV;
      fn(u, v, p);
      positions.push(p.x, p.y, p.z);
      uvs.push(u, v);
    }
  }
  const cols = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Gielis superformula radius.
function superformula(m: number, n1: number, n2: number, n3: number, phi: number): number {
  const t1 = Math.pow(Math.abs(Math.cos((m * phi) / 4)), n2);
  const t2 = Math.pow(Math.abs(Math.sin((m * phi) / 4)), n3);
  return Math.pow(t1 + t2, -1 / n1);
}

// 4 distinct formulas, one per object slot.
const FORMULAS: Array<(u: number, v: number, t: Vector3) => void> = [
  // 0 — Supershape (spherical product of two superformulas): spiky star.
  (u, v, t) => {
    const theta = (u - 0.5) * Math.PI;
    const phi = (v * 2 - 1) * Math.PI;
    const r1 = superformula(7, 0.2, 1.7, 1.7, theta);
    const r2 = superformula(7, 0.2, 1.7, 1.7, phi);
    t.set(
      r2 * Math.cos(phi) * r1 * Math.cos(theta),
      r1 * Math.sin(theta),
      r2 * Math.sin(phi) * r1 * Math.cos(theta)
    ).multiplyScalar(0.9);
  },
  // 1 — Spherical harmonic flower: r = Σ sin/cos^k terms.
  (u, v, t) => {
    const theta = u * Math.PI;
    const phi = v * 2 * Math.PI;
    const r =
      Math.pow(Math.sin(2 * phi), 3) +
      Math.pow(Math.cos(4 * phi), 2) +
      Math.pow(Math.sin(3 * theta), 4) +
      Math.pow(Math.cos(2 * theta), 3);
    t.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.cos(theta),
      r * Math.sin(theta) * Math.sin(phi)
    ).multiplyScalar(0.5);
  },
  // 2 — Twisted torus: tube whose section spins 3× per loop.
  (u, v, t) => {
    const a = u * 2 * Math.PI;
    const b = v * 2 * Math.PI;
    const R = 1.0;
    const r = 0.38;
    const tw = b + 3 * a;
    t.set(
      (R + r * Math.cos(tw)) * Math.cos(a),
      r * Math.sin(tw) + 0.3 * Math.sin(3 * a),
      (R + r * Math.cos(tw)) * Math.sin(a)
    );
  },
  // 3 — Rippled sphere: radius modulated by sin/cos waves.
  (u, v, t) => {
    const theta = u * Math.PI;
    const phi = v * 2 * Math.PI;
    const r = 1 + 0.25 * Math.sin(6 * phi) * Math.sin(6 * theta) + 0.15 * Math.cos(10 * theta);
    t.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.cos(theta),
      r * Math.sin(theta) * Math.sin(phi)
    );
  },
];

export function buildGeometry(variant: number): BufferGeometry {
  return parametricGeometry(FORMULAS[variant % FORMULAS.length], 64, 48);
}

// Old-TV palette. Order matches sceneObjects: the two unique slots (0,1) are
// red + orange, the two instanced slots (2,3) are blue + green.
const PALETTE = ['#ff3b3b', '#ff8c1a', '#3b7bff', '#37ff5e'];
export const tintFor = (variant: number) => PALETTE[variant % PALETTE.length];

// CRT / VHS shader — scanlines, static, channel split, flicker, tracking jumps.
const VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vUv = uv;
    vec3 pos = position;
    // VHS tracking jump: occasional horizontal rows shift sideways.
    float jump = step(0.98, hash(vec2(floor(position.y * 6.0), floor(uTime * 9.0))));
    pos.x += jump * 0.12 * sin(uTime * 40.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.0);
    float base = 0.38 + 0.8 * fres;

    // CRT scanlines
    float scan = 0.7 + 0.3 * sin(vUv.y * 240.0 + uTime * 5.0);

    // static noise
    float n = hash(vUv * vec2(720.0, 540.0) + fract(uTime) * 50.0);

    // horizontal glitch bands → RGB channel split
    float band = step(0.95, hash(vec2(floor(vUv.y * 36.0), floor(uTime * 8.0))));
    float shift = band * 0.25;

    vec3 col = uColor * vec3(base * (1.0 + shift), base, base * (1.0 - shift * 0.6));
    col *= scan;                                  // scanlines
    col += (n - 0.5) * 0.16;                       // grain
    col *= 0.92 + 0.08 * sin(uTime * 55.0);        // flicker
    col += uColor * fres * 0.5;                    // rim glow
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** One spinning CRT-shaded mesh sharing a generated geometry. */
function TvMesh({
  geometry,
  color,
  transform,
  spin = 1,
}: {
  geometry: BufferGeometry;
  color: string;
  transform: Transform;
  spin?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new Color(color) } }),
    [color]
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3 * spin;
      meshRef.current.rotation.x += delta * 0.12 * spin;
    }
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={transform.position}
      scale={transform.scale ?? 1}
    >
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        side={DoubleSide}
      />
    </mesh>
  );
}

/** Single generative placeholder for a `single` object slot. */
export function Placeholder({ variant, transform }: { variant: number; transform: Transform }) {
  const geometry = useMemo(() => buildGeometry(variant), [variant]);
  return <TvMesh geometry={geometry} color={tintFor(variant)} transform={transform} />;
}

/** Generative placeholders for an `instanced` object slot (one per transform). */
export function PlaceholderInstanced({
  variant,
  instances,
}: {
  variant: number;
  instances: Transform[];
}) {
  const geometry = useMemo(() => buildGeometry(variant), [variant]);
  const color = tintFor(variant);
  return (
    <group>
      {instances.map((t, i) => (
        <TvMesh key={i} geometry={geometry} color={color} transform={t} spin={0.6 + (i % 3) * 0.3} />
      ))}
    </group>
  );
}
