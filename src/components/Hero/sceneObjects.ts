// ─────────────────────────────────────────────────────────────────────────────
// Configuración de la escena 3D del hero. Edita `sceneConfig` para ajustar tamaño,
// posición y distribución de los objetos. El resto (SpaceScene, Model, placeholders,
// explosión) deriva de aquí, así que no hace falta tocar nada más.
//
// URL en S3:  {S3_BASE}/{name}/{name}.glb
// ─────────────────────────────────────────────────────────────────────────────

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

export interface SceneObject {
  name: string;
  kind: 'single' | 'instanced';
  transform?: Transform; // para kind 'single'
  instances?: Transform[]; // para kind 'instanced'
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
      offset: [1, 0, 0] as Vec3, // posición relativa a `position`
      rotation: [0, 0, 0] as Vec3,
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

  // ── Objetos INSTANCIADOS — esparcidos; tamaño y altura aleatorios por límites ─
  // Cada instancia toma un `scale` random en [scaleMin, scaleMax] y una altura
  // random en [heightMin, heightMax] + heightOffset. La diferencia de alturas
  // entre instancias del mismo objeto = (heightMax - heightMin).
  instanced: {
    mazorca: {
      count: 8,
      radius: 5, // dispersión horizontal (anillo)
      scaleMin: 0.2,
      scaleMax: 0.5,
      heightMin: -0.5,
      heightMax: 0.5,
      heightOffset: 0.4,
    },
    milpa: {
      count: 8,
      radius: 5.0,
      scaleMin: 1,
      scaleMax: 1.7,
      heightMin: 0.2,
      heightMax: 0.6,
      heightOffset: 0,
    },
  },
};

export type InstancedParams = (typeof sceneConfig.instanced)['mazorca'];

// ═══════════════════════════════════════════════════════════════════════════

const addVec = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const randRange = (min: number, max: number) => min + Math.random() * (max - min);

// Genera las instancias esparcidas en un anillo, con escala y altura aleatorias
// dentro de los límites configurados.
function buildInstances(cfg: InstancedParams): Transform[] {
  return Array.from({ length: cfg.count }, (_, i) => {
    const angle = (i / cfg.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const radius = cfg.radius * randRange(0.85, 1.15);
    const y = randRange(cfg.heightMin, cfg.heightMax) + cfg.heightOffset;
    return {
      position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius] as Vec3,
      rotation: [0, Math.random() * Math.PI * 2, 0] as Vec3,
      scale: randRange(cfg.scaleMin, cfg.scaleMax),
    };
  });
}

const { unique, instanced } = sceneConfig;

// El orden (0..3) define el color del placeholder: rojo, naranja, azul, verde.
export const sceneObjects: SceneObject[] = [
  {
    name: unique.obj1.name,
    kind: 'single',
    transform: {
      position: addVec(unique.position, unique.obj1.offset),
      rotation: unique.obj1.rotation,
      scale: unique.obj1.scale,
    },
  },
  {
    name: unique.obj2.name,
    kind: 'single',
    transform: {
      position: addVec(unique.position, unique.obj2.offset),
      rotation: unique.obj2.rotation,
      scale: unique.obj2.scale,
    },
  },
  { name: 'mazorca', kind: 'instanced', instances: buildInstances(instanced.mazorca) },
  { name: 'milpa', kind: 'instanced', instances: buildInstances(instanced.milpa) },
];
