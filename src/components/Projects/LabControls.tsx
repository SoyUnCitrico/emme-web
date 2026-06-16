import ProjectButton from './ProjectButton';
import Knob from './Knob';
import { Project } from './projectsData';

export interface KnobDef {
  label: string;
  value: number;
  /** Definido solo cuando la perilla es interactiva (pantalla fijada). */
  onChange?: (value: number) => void;
}

interface Props {
  items: Project[];
  /** Índice del proyecto activo, o null. */
  currentIndex: number | null;
  /** Índice fijado con click, o null. */
  pinnedIndex: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  knobs: KnobDef[];
}

/**
 * Panel de instrumental (lado izquierdo): rejilla de botones de proyecto +
 * perillas (decorativas en preview, interactivas cuando la pantalla está fijada).
 */
export default function LabControls({
  items,
  currentIndex,
  pinnedIndex,
  onHover,
  onSelect,
  knobs,
}: Props) {
  const powered = currentIndex !== null;

  return (
    <div className="panel flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between border-b border-matrix-line pb-2">
        <span className="text-xs uppercase tracking-[0.3em] text-matrix-dim">Signal Bank</span>
        <span
          className={`h-2 w-2 rounded-full ${
            powered ? 'bg-matrix-green shadow-glow-green' : 'bg-matrix-line'
          }`}
        />
      </div>

      {/* Botones de proyecto */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
        {items.map((project, i) => (
          <ProjectButton
            key={project.url}
            project={project}
            current={currentIndex === i}
            pinned={pinnedIndex === i}
            dimmed={powered}
            onHoverStart={() => onHover(i)}
            onHoverEnd={() => onHover(null)}
            onSelect={() => onSelect(i)}
          />
        ))}
      </div>

      {/* Perillas */}
      <div className="mt-1 flex items-end justify-around border-t border-matrix-line pt-4">
        {knobs.map((knob) => (
          <Knob key={knob.label} label={knob.label} value={knob.value} onChange={knob.onChange} lit={powered} />
        ))}
      </div>
      <p className="text-center text-[10px] text-matrix-dim/70">
        {pinnedIndex !== null ? 'arrastra las perillas ↕' : 'fija un proyecto para ajustar'}
      </p>
    </div>
  );
}
