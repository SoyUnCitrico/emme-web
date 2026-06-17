// Ruido de valor 2D con semilla, generado por código (sin dependencias ni assets,
// en línea con la filosofía procedural de Placeholder.tsx). Se usa para desplazar
// la altura del suelo del Hero; una semilla distinta por recarga = terreno distinto.

/** PRNG determinista y barato a partir de una semilla entera. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fade = (t: number) => t * t * (3 - 2 * t); // smoothstep
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export type Noise2D = (x: number, y: number) => number;

/**
 * Ruido de valor 2D en [-1, 1]. Genera una rejilla de valores pseudoaleatorios
 * (tamaño `grid`) y los interpola suavemente; envuelve en los bordes para no tener
 * costuras.
 */
export function makeValueNoise2D(seed: number, grid = 256): Noise2D {
  const rand = mulberry32(seed);
  const values = new Float32Array(grid * grid);
  for (let i = 0; i < values.length; i++) values[i] = rand() * 2 - 1;
  const at = (xi: number, yi: number) =>
    values[(((yi % grid) + grid) % grid) * grid + (((xi % grid) + grid) % grid)];

  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = fade(x - x0);
    const ty = fade(y - y0);
    const top = lerp(at(x0, y0), at(x0 + 1, y0), tx);
    const bottom = lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx);
    return lerp(top, bottom, ty);
  };
}

/** Suma de octavas (fractal Brownian motion) para colinas más naturales. */
export function fbm(noise: Noise2D, x: number, y: number, octaves = 3): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += amp * noise(x * freq, y * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return sum / norm;
}
