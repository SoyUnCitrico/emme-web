// ─────────────────────────────────────────────────────────────────────────────
// Scene configuration. This is the ONLY file you edit to plug in your real S3
// objects: set the folder/file base names and tweak positions/scale.
//
// URL pattern (matches your S3): {S3_BASE}/{name}/{name}.obj  (+ .mtl + .png)
// e.g. https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/3dFiles/objeto/objeto.obj
//
// REQUISITOS para que carguen:
//  1) CORS habilitado en el bucket (GET/HEAD desde tu dominio + localhost).
//  2) El .mtl referencia el .png por nombre de archivo (map_Kd objeto.png).
//  3) Ajusta `scale`/`rotation` cuando veas el modelo real (OBJ suele venir en
//     escala/orientación arbitraria; Blender exporta Z-up → quizá rotation X -90°).
// ─────────────────────────────────────────────────────────────────────────────

export const S3_BASE = 'https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/3dFiles';

// Modelos optimizados (GLB + Draco, ~0.1 MB c/u) ya subidos a S3 y activados.
// Si necesitas volver a la escena solo-placeholders (sin descargar nada), ponlo
// en `false`: la cámara y la explosión siguen funcionando igual.
export const LOAD_MODELS = true;

export interface Transform {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export interface SceneObject {
  /** Folder + file base name on S3 (…/{name}/{name}.obj). */
  name: string;
  /** `single` = un único mesh; `instanced` = múltiples copias (InstancedMesh). */
  kind: 'single' | 'instanced';
  /** Para kind 'single'. */
  transform?: Transform;
  /** Para kind 'instanced': una entrada por copia. */
  instances?: Transform[];
}

// Scatter helper: positions on a ring at a given height, with varied scale/spin.
function ring(count: number, radius: number, y: number, scale = 1): Transform[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return {
      position: [Math.cos(a) * radius, y + (i % 2 ? 0.6 : -0.4), Math.sin(a) * radius],
      rotation: [0, a, 0],
      scale: scale * (0.8 + Math.random() * 0.4),
    };
  });
}

export const sceneObjects: SceneObject[] = [
  // Dos objetos ÚNICOS
  { name: 'guitarrista', kind: 'single', transform: { position: [-1.6, 0.8, 0], scale: 1 } },
  { name: 'mascara', kind: 'single', transform: { position: [1.8, -0.4, -1.2], scale: 1 } },

  // Dos objetos con MÚLTIPLES INSTANCIAS (se descargan 1 sola vez)
  { name: 'mazorca', kind: 'instanced', instances: ring(6, 4.5, 0.5, 0.7) },
  { name: 'milpa', kind: 'instanced', instances: ring(8, 7, 2.2, 0.5) },
];
