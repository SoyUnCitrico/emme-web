import { useEffect, useRef, useState } from 'react';
import LabControls, { KnobDef } from './LabControls';
import OscilloscopeScreen from './OscilloscopeScreen';
import {
  DEFAULT_EFFECTS,
  KnobValues,
  ScopeParams,
  effectsFromKnobs,
  knobsFromEffects,
  knobsFromScope,
  projects,
  scopeFromKnobs,
} from './projectsData';

const FALLBACK_SCOPE: ScopeParams = { freqX: 3, freqY: 2, phase: 0, tint: 'green' };
/** Retardo al salir del hover: evita apagar la señal al pasar entre botones vecinos. */
const HOVER_RELEASE_MS = 90;

/**
 * Sección Proyectos como estación de osciloscopio de laboratorio.
 *
 * Interacción:
 * - hover  → previsualiza la señal del proyecto (cambia al vuelo).
 * - click en botón → fija ese proyecto (la pantalla se queda encendida).
 * - click en la pantalla → abre el enlace.
 * - sin hover y sin proyecto fijado → la pantalla se apaga.
 *
 * Perillas (solo con un proyecto fijado):
 * - sin asset → modulan la señal (FreqX / FreqY / Phase).
 * - con asset → controlan Glitch / Offset cromático / Brillo del CRT.
 */
export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [knobs, setKnobs] = useState<KnobValues>({ a: 0.5, b: 0.5, c: 0.5 });
  const releaseTimer = useRef<number | undefined>(undefined);

  const currentIndex = hovered ?? pinned;
  const active = currentIndex !== null ? projects[currentIndex] : null;
  // Las perillas editan solo cuando se está mostrando el proyecto fijado.
  const editable = pinned !== null && currentIndex === pinned;

  // Reinicia las perillas a los valores por defecto del proyecto fijado.
  useEffect(() => {
    if (pinned === null) return;
    const p = projects[pinned];
    setKnobs(p.asset ? knobsFromEffects(DEFAULT_EFFECTS) : knobsFromScope(p.scope));
  }, [pinned]);

  useEffect(() => () => window.clearTimeout(releaseTimer.current), []);

  const handleHover = (index: number | null) => {
    window.clearTimeout(releaseTimer.current);
    if (index !== null) {
      setHovered(index);
    } else {
      releaseTimer.current = window.setTimeout(() => setHovered(null), HOVER_RELEASE_MS);
    }
  };

  const handleSelect = (index: number) =>
    setPinned((prev) => (prev === index ? null : index));

  // Señal y efectos efectivos según modo.
  const effScope =
    active && editable && !active.asset
      ? scopeFromKnobs(active.scope, knobs)
      : active?.scope ?? FALLBACK_SCOPE;

  const effEffects =
    active?.asset && editable ? effectsFromKnobs(knobs) : DEFAULT_EFFECTS;

  // Definición de perillas: interactivas al editar, decorativas en otro caso.
  const setKnob = (key: keyof KnobValues) => (v: number) =>
    setKnobs((prev) => ({ ...prev, [key]: v }));

  let knobDefs: KnobDef[];
  if (editable && active) {
    knobDefs = active.asset
      ? [
          { label: 'Glitch', value: knobs.a, onChange: setKnob('a') },
          { label: 'Offset', value: knobs.b, onChange: setKnob('b') },
          { label: 'Bright', value: knobs.c, onChange: setKnob('c') },
        ]
      : [
          { label: 'FreqX', value: knobs.a, onChange: setKnob('a') },
          { label: 'FreqY', value: knobs.b, onChange: setKnob('b') },
          { label: 'Phase', value: knobs.c, onChange: setKnob('c') },
        ];
  } else {
    const display = active
      ? active.asset
        ? knobsFromEffects(DEFAULT_EFFECTS)
        : knobsFromScope(active.scope)
      : { a: 0.3, b: 0.5, c: 0.4 };
    knobDefs = [
      { label: 'Gain', value: display.a },
      { label: 'Focus', value: display.b },
      { label: 'Phase', value: display.c },
    ];
  }

  return (
    <div className="mx-auto max-w-6xl">
      <h2 className="section-title mb-10">Proyectos</h2>

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        {/* Controles — debajo en móvil, a la izquierda en escritorio */}
        <div className="order-2 lg:order-1">
          <LabControls
            items={projects}
            currentIndex={currentIndex}
            pinnedIndex={pinned}
            onHover={handleHover}
            onSelect={handleSelect}
            knobs={knobDefs}
          />
        </div>

        {/* Pantalla CRT — arriba en móvil, a la derecha en escritorio */}
        <div className="order-1 rounded-2xl border border-matrix-line bg-matrix-panel p-3 shadow-glow-green lg:order-2 lg:p-4">
          <OscilloscopeScreen project={active} scope={effScope} effects={effEffects} />
        </div>
      </div>
    </div>
  );
}
