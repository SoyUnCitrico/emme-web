import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';

// Reproductor visual. NO posee el <audio>: controla la instancia compartida del
// AudioProvider, así que queda sincronizado con el botón del header y el hero.
const AudioWavePlayer = (): JSX.Element => {
  const { isPlaying, currentTime, duration, volume, toggle, seek, setVolume } = useAudio();

  const formatTime = (time: number): string => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return '0:00';
  };

  const skipForward = (): void => seek(Math.min(currentTime + 10, duration));
  const skipBackward = (): void => seek(Math.max(currentTime - 10, 0));

  return (
    <div className="w-full px-6 py-2 bg-matrix-panel border border-matrix-line rounded-lg shadow-glow-green mb-6 max-w-2xl mx-auto">
      {/* Título y artista */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-matrix-green uppercase tracking-wide">Lagunas</h2>
        <p className="text-matrix-dim">Corridos Versionados</p>
      </div>

      {/* Barra de progreso */}
      <div className="w-full flex items-center gap-2 mb-6">
        <span className="text-matrix-dim text-sm w-12">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="w-full h-2 bg-matrix-line rounded-lg appearance-none cursor-pointer accent-neon-orange"
          min={0}
          max={duration || 0}
          step={1}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          aria-label="Progreso"
        />
        <span className="text-matrix-dim text-sm w-12">{formatTime(duration)}</span>
      </div>

      {/* Controles */}
      <div className="flex flex-col justify-center items-center gap-4 mb-2">
        <div className="flex gap-5">
          <button
            onClick={skipBackward}
            className="p-2 rounded-full border border-matrix-line text-matrix-green hover:text-neon-orange hover:border-neon-orange transition-all"
            aria-label="Retroceder 10 segundos"
            title="Atrasar"
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={toggle}
            className="p-4 rounded-full bg-neon-orange text-matrix-black hover:shadow-glow-orange transition-all"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            title="Pausa / Reproducir"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={skipForward}
            className="p-2 rounded-full border border-matrix-line text-matrix-green hover:text-neon-orange hover:border-neon-orange transition-all"
            aria-label="Avanzar 10 segundos"
            title="Avanzar"
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Control de volumen */}
        <div className="flex gap-4 items-center pt-8">
          <Volume2 size={20} className="text-matrix-dim" />
          <input
            type="range"
            className="w-24 h-2 bg-matrix-line rounded-lg appearance-none cursor-pointer accent-neon-orange"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            aria-label="Control de volumen"
          />
        </div>
      </div>
    </div>
  );
};

export default AudioWavePlayer;
