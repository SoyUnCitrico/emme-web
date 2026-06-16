import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const AUDIO_SRC = '/sounds/lagunas.mp3';

interface AudioContextValue {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  hasStarted: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  start: () => void; // arranca una sola vez (primer click del hero)
  setVolume: (v: number) => void;
  seek: (t: number) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

/**
 * Provee una ÚNICA instancia de <audio> compartida por toda la app (Header,
 * AudioPlayer y el Hero controlan el mismo elemento). El estado refleja los
 * eventos del elemento, así cualquier control queda sincronizado.
 */
export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const play = useCallback(() => {
    audioRef.current?.play().catch((err) => {
      console.error('No se pudo reproducir el audio:', err);
    });
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) play();
    else pause();
  }, [play, pause]);

  // Arranca el audio solo en la primera llamada (resto = no-op).
  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setHasStarted(true);
    play();
  }, [play]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  }, []);

  // Mantener el volumen del elemento en sync con el estado.
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Reflejar los eventos del elemento en el estado de React.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('ended', onEnded);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <AudioCtx.Provider
      value={{
        isPlaying,
        volume,
        currentTime,
        duration,
        hasStarted,
        play,
        pause,
        toggle,
        start,
        setVolume,
        seek,
      }}
    >
      <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" />
      {children}
    </AudioCtx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook + provider conviven en este archivo de contexto
export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio debe usarse dentro de <AudioProvider>');
  return ctx;
}
