// Configuración de la sección Proyectos.
// Cada proyecto define su enlace, etiqueta, pie de foto (terminal) y los
// parámetros de la señal procedural (Lissajous) que dibuja la pantalla CRT.

export type ScopeTint = 'green' | 'amber';

export interface ScopeParams {
  /** Frecuencia del eje X de la figura de Lissajous. */
  freqX: number;
  /** Frecuencia del eje Y. */
  freqY: number;
  /** Desfase inicial en radianes. */
  phase: number;
  /** Tinte del trazo: verde base o ámbar de acento. */
  tint: ScopeTint;
}

/** Medio opcional que reemplaza la señal procedural en la pantalla. */
export interface ProjectAsset {
  type: 'image' | 'video';
  src: string;
}

export interface Project {
  url: string;
  label: string;
  /** Pie de foto estilo terminal que acompaña a la señal. */
  caption: string;
  scope: ScopeParams;
  /** Si existe, la pantalla muestra este medio en vez de la señal. */
  asset?: ProjectAsset;
}

/** Efectos CRT controlables por las perillas cuando hay un asset visible. */
export interface CrtEffects {
  /** 0..1 — cantidad de glitch. */
  glitch: number;
  /** 0..1 — offset cromático (separación RGB). */
  offset: number;
  /** 0..1 — brillo de la pantalla (0.5x a 1.5x). */
  brightness: number;
}

export const DEFAULT_EFFECTS: CrtEffects = { glitch: 0, offset: 0.25, brightness: 0.55 };

export const projects: Project[] = [
  {
    url: 'https://creamcake-web.vercel.app/',
    label: 'CreamCake',
    caption: 'Tienda dulce — e-commerce en React',
    scope: { freqX: 3, freqY: 2, phase: 0, tint: 'amber' },
  },
  {
    url: 'https://synth-web-tau.vercel.app/',
    label: 'Synth React',
    caption: 'Sintetizador web interactivo',
    scope: { freqX: 5, freqY: 4, phase: Math.PI / 4, tint: 'green' },
  },
  {
    url: 'https://micel10.vercel.app/',
    label: 'MICEL_10',
    caption: 'Portafolio experimental',
    scope: { freqX: 2, freqY: 3, phase: Math.PI / 2, tint: 'green' },
    // Placeholder para demostrar el modo "asset" (img/video). Reemplázalo
    // por una captura real del proyecto en public/projects/.
    asset: { type: 'image', src: '/images/PORTADA.png' },
  },
  {
    url: 'https://fakestore-app-iota.vercel.app/',
    label: 'FakeStore',
    caption: 'Demo de tienda con FakeStore API',
    scope: { freqX: 4, freqY: 5, phase: Math.PI / 3, tint: 'amber' },
  },
  {
    url: 'https://soyuncitrico.github.io/p5-postales/loop/index.html',
    label: 'P5 Postales',
    caption: 'Postales generativas en p5.js',
    scope: { freqX: 5, freqY: 3, phase: Math.PI / 6, tint: 'green' },
  },
  {
    url: 'https://ccdtecno.github.io//',
    label: 'CCDTecno',
    caption: 'Sitio institucional CCD Tecno',
    scope: { freqX: 3, freqY: 4, phase: Math.PI, tint: 'amber' },
  },
];

/** Componentes RGB de cada tinte (para canvas y glow). */
export const TINT_RGB: Record<ScopeTint, string> = {
  green: '0, 255, 65',
  amber: '255, 174, 66',
};

/** Las tres perillas, normalizadas a 0..1. */
export interface KnobValues {
  a: number;
  b: number;
  c: number;
}

// --- Mapeos perillas <-> parámetros (centralizados para no duplicar lógica) ---

/** Modo sin asset: las perillas modulan la señal (frecuencias enteras + fase). */
export function scopeFromKnobs(base: ScopeParams, k: KnobValues): ScopeParams {
  return {
    freqX: 1 + Math.round(k.a * 6),
    freqY: 1 + Math.round(k.b * 6),
    phase: k.c * Math.PI * 2,
    tint: base.tint,
  };
}

export function knobsFromScope(s: ScopeParams): KnobValues {
  return { a: (s.freqX - 1) / 6, b: (s.freqY - 1) / 6, c: s.phase / (Math.PI * 2) };
}

/** Modo con asset: las perillas controlan glitch / offset cromático / brillo. */
export function effectsFromKnobs(k: KnobValues): CrtEffects {
  return { glitch: k.a, offset: k.b, brightness: k.c };
}

export function knobsFromEffects(e: CrtEffects): KnobValues {
  return { a: e.glitch, b: e.offset, c: e.brightness };
}
