// ─────────────────────────────────────────────────────────────────────────────
// Configuración de la escena 3D del hero. Edita `sceneConfig` para ajustar tamaño,
// posición y distribución de los objetos. El resto (SpaceScene, Model, placeholders,
// explosión) deriva de aquí, así que no hace falta tocar nada más.
//
// URL en S3:  {S3_BASE}/{name}/{name}.glb
// ─────────────────────────────────────────────────────────────────────────────

import { makeValueNoise2D, fbm } from './terrainNoise';

export const S3_BASE = 'https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/3dFiles';

// Modelos optimizados (GLB + Draco) ya subidos a S3 y activados. Ponlo en `false`
// para correr la escena solo con placeholders generativos (cámara y explosión siguen).
export const LOAD_MODELS = true;

type Vec3 = [number, number, number];

export interface Transform {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}

/** Parámetros de la lluvia de instancias (objetos que caen del cielo). */
export interface RainParams {
  count: number; // máximo de instancias cayendo a la vez
  radius: number; // dispersión horizontal del aguacero
  scaleMin: number;
  scaleMax: number;
  lift: number; // ajuste fino sobre el suelo al aterrizar
}

export interface SceneObject {
  name: string;
  kind: 'single' | 'instanced';
  transform?: Transform; // para kind 'single'
  instances?: Transform[]; // para kind 'instanced'
  /** Si existe, las instancias caen del cielo como lluvia (mazorca). */
  rain?: RainParams;
}

// ═══════════════════════════════════════════════════════════════════════════
//  PARÁMETROS AJUSTABLES DE LA ESCENA
// ═══════════════════════════════════════════════════════════════════════════
export const sceneConfig = {
  // Tamaño base al que se normaliza CADA modelo (los `scale` multiplican esto).
  baseSize: 1.6,

  // ── Objetos ÚNICOS — apilados: el objeto 2 va SOBRE el objeto 1 ──────────────
  unique: {
    position: [-1.6, -0.6, 0] as Vec3, // posición de la pila de objetos únicos
    obj1: {
      name: 'guitarrista',
      scale: 2.0, // tamaño relativo
      offset: [1, 0, 0] as Vec3, // posición relativa a `position` (la altura se ignora: se asienta en el suelo)
      rotation: [0, 0, 0] as Vec3,
      lift: 0, // ajuste fino sobre el suelo
    },
    obj2: {
      name: 'mascara',
      scale: 0.8,
      // offset.y POSITIVO => el objeto 2 queda por ENCIMA del objeto 1.
      // Este valor es la separación vertical entre ambos.
      offset: [1, 1.1, 0] as Vec3,
      rotation: [0, 0, 0] as Vec3,
    },
  },

  // ── Objetos INSTANCIADOS — esparcidos en un anillo y asentados sobre la malla ─
  // Cada instancia toma un `scale` random en [scaleMin, scaleMax]. La altura ya no
  // es aleatoria: se calcula sobre la malla del suelo (terrainHeightAt) + `lift`.
  // La "milpa" queda plantada; la "mazorca" usa estos mismos parámetros como
  // aguacero (cae del cielo, máximo `count` a la vez).
  instanced: {
    mazorca: {
      count: 16,
      radius: 5, // dispersión horizontal (anillo)
      scaleMin: 0.2,
      scaleMax: 0.5,
      lift: 0,
    },
    milpa: {
      count: 12,
      radius: 5.0,
      scaleMin: 1,
      scaleMax: 1.7,
      lift: 0,
    },
  },
};

// ── Suelo generativo (heightmap wireframe) ───────────────────────────────────
// Plano subdividido cuya altura se desplaza con ruido de valor (semilla nueva por
// recarga). `size` ≈ ±18 para llenar el encuadre de la cámara; `yOffset` lo deja
// bajo los objetos flotantes. Menos segmentos en móvil para bajar consumo.
// Tiempos de la disolución wireframe de los objetos instanciados al explotar
// (fácil de ajustar): `holdMs` se mantienen como malla, `fadeMs` dura el fade a 0.
export const dissolveConfig = { holdMs: 450, fadeMs: 700 };

export const terrainConfig = {
  size: 36, // ancho/profundidad del plano (centrado en el origen)
  segDesktop: 96, // subdivisiones por lado en escritorio
  segMobile: 48, // subdivisiones por lado en móvil
  amplitude: 2.6, // altura máxima del relieve
  noiseScale: 0.16, // frecuencia del ruido (mayor = colinas más pequeñas)
  octaves: 3, // octavas de fBm
  yOffset: -1.8, // altura base del suelo
};

export type InstancedParams = (typeof sceneConfig.instanced)['mazorca'];

// ── Campo de altura compartido ───────────────────────────────────────────────
// Una semilla por carga ⇒ relieve distinto en cada recarga. La malla (Terrain) y
// la colocación de objetos muestrean ESTE mismo ruido, así los objetos se asientan
// exactamente sobre la malla visible (la malla actúa como suelo).
export const terrainSeed = Math.floor(Math.random() * 1e9);
export const terrainNoise = makeValueNoise2D(terrainSeed);

/** Altura del suelo (coordenadas de mundo) en el punto (x, z). */
export function terrainHeightAt(x: number, z: number): number {
  const { noiseScale, amplitude, octaves, yOffset } = terrainConfig;
  return yOffset + fbm(terrainNoise, x * noiseScale, z * noiseScale, octaves) * amplitude;
}

// Media altura aprox. de un modelo normalizado (se centra en el origen y su mayor
// dimensión = baseSize), para "plantar" la base sobre el suelo.
const HALF_MODEL = sceneConfig.baseSize / 2;

/** Altura para asentar un modelo normalizado sobre el suelo: terreno + media altura·escala. */
export function groundedY(x: number, z: number, scale: number, lift = 0): number {
  return terrainHeightAt(x, z) + HALF_MODEL * scale + lift;
}

// ═══════════════════════════════════════════════════════════════════════════

const addVec = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const randRange = (min: number, max: number) => min + Math.random() * (max - min);

// Genera las instancias esparcidas en un anillo y asentadas sobre la malla del
// suelo (la altura sale de terrainHeightAt, no es aleatoria).
function buildInstances(cfg: InstancedParams): Transform[] {
  return Array.from({ length: cfg.count }, (_, i) => {
    const angle = (i / cfg.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const radius = cfg.radius * randRange(0.85, 1.15);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const scale = randRange(cfg.scaleMin, cfg.scaleMax);
    return {
      position: [x, groundedY(x, z, scale, cfg.lift), z] as Vec3,
      rotation: [0, Math.random() * Math.PI * 2, 0] as Vec3,
      scale,
    };
  });
}

const { unique, instanced } = sceneConfig;

// obj1 (guitarrista) se asienta sobre el suelo; obj2 (máscara) conserva su
// separación vertical original respecto a obj1 para seguir apilado encima de él.
const obj1Base = addVec(unique.position, unique.obj1.offset);
const obj2Base = addVec(unique.position, unique.obj2.offset);
const obj1Y = groundedY(obj1Base[0], obj1Base[2], unique.obj1.scale, unique.obj1.lift);
const stackGap = unique.obj2.offset[1] - unique.obj1.offset[1];
const obj1Pos: Vec3 = [obj1Base[0], obj1Y, obj1Base[2]];
const obj2Pos: Vec3 = [obj2Base[0], obj1Y + stackGap, obj2Base[2]];

// El orden (0..3) define el color del placeholder: rojo, naranja, azul, verde.
export const sceneObjects: SceneObject[] = [
  {
    name: unique.obj1.name,
    kind: 'single',
    transform: {
      position: obj1Pos,
      rotation: unique.obj1.rotation,
      scale: unique.obj1.scale,
    },
  },
  {
    name: unique.obj2.name,
    kind: 'single',
    transform: {
      position: obj2Pos,
      rotation: unique.obj2.rotation,
      scale: unique.obj2.scale,
    },
  },
  // mazorca: cae del cielo como lluvia (mismos parámetros como aguacero).
  {
    name: 'mazorca',
    kind: 'instanced',
    instances: buildInstances(instanced.mazorca),
    rain: instanced.mazorca,
  },
  { name: 'milpa', kind: 'instanced', instances: buildInstances(instanced.milpa) },
];
