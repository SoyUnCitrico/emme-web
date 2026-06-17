import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, Color, type ShaderMaterial } from 'three';
import { terrainConfig, terrainNoise } from './sceneObjects';
import { fbm } from './terrainNoise';

// ─── Suelo generativo ────────────────────────────────────────────────────────
// Un único plano subdividido cuya altura se desplaza con ruido de valor. La
// semilla cambia en cada recarga, así que el relieve es distinto cada vez (igual
// que buildInstances genera variación por carga). Geometría calculada UNA sola
// vez (useMemo); el frame loop solo mueve el uniform de tiempo → una draw call,
// cero trabajo de geometría por frame.

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uRadius;
  varying float vFade;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    // Ola sutil encima del relieve estático (solo en el shader, sin tocar buffers).
    pos.y += sin(pos.x * 0.35 + uTime) * cos(pos.z * 0.35 + uTime * 0.8) * uAmp;
    // Desvanecido radial para que el borde del plano no se corte en seco.
    vFade = 1.0 - clamp(length(position.xz) / uRadius, 0.0, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying float vFade;
  varying vec2 vUv;

  void main() {
    // Scanline tenue que recorre la malla.
    float scan = 0.85 + 0.15 * sin(vUv.y * 120.0 + uTime * 2.0);
    float alpha = smoothstep(0.0, 0.35, vFade) * 0.55 * scan;
    gl_FragColor = vec4(uColor * scan, alpha);
  }
`;

export default function Terrain() {
  const matRef = useRef<ShaderMaterial>(null);

  // Decisiones que solo dependen del entorno (una vez): segmentos y si reducir
  // movimiento. window solo existe en cliente; el Hero es client-only.
  const { segments, reduce } = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    return {
      segments: isMobile ? terrainConfig.segMobile : terrainConfig.segDesktop,
      reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    };
  }, []);

  // Geometría del heightmap: plano horizontal con la altura desplazada por fBm.
  // Usa el ruido COMPARTIDO (terrainNoise) para que coincida con la colocación de
  // objetos; la altura local no lleva yOffset (el grupo ya se desplaza con él).
  const geometry = useMemo(() => {
    const { size, amplitude, noiseScale, octaves } = terrainConfig;
    const geo = new PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2); // tumbar el plano en XZ
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = fbm(terrainNoise, x * noiseScale, z * noiseScale, octaves) * amplitude;
      pos.setY(i, h);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [segments]);

  // Liberar la geometría si se regenera o al desmontar.
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new Color('#00ff41') },
      uAmp: { value: reduce ? 0 : 0.18 },
      uRadius: { value: terrainConfig.size / 2 },
    }),
    [reduce]
  );

  useFrame((state) => {
    if (!reduce && matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh geometry={geometry} position={[0, terrainConfig.yOffset, 0]} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        wireframe
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
