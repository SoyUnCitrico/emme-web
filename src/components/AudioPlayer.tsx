import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
// Definición de tipos
// interface AudioEvent extends Event {
//   target: HTMLAudioElement;
// }

// interface HTMLAudioElementWithDuration extends HTMLAudioElement {
//   duration: number;
// }

const AudioWavePlayer = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  // const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);


  // Generar datos aleatorios para la forma de onda (simulación)
  useEffect(() => {
    const generateWaveformData = (): void => {
      const data: number[] = [];
      for (let i = 0; i < 40; i++) {
        // Generar valores aleatorios entre 0.2 y 1 para las barras
        data.push(0.2 + Math.random() * 0.8);
      }
      // setWaveformData(data);
    };
    
    generateWaveformData();
  }, []);

  // Cargar la duración del audio cuando el componente se monte
  useEffect(() => {
    if (audioRef.current) {
      const seconds = Math.floor(audioRef.current.duration);
      setDuration(isNaN(seconds) ? 0 : seconds);
    }
    
    const handleLoadedMetadata = (): void => {
      if (audioRef.current) {
        const seconds = Math.floor(audioRef.current.duration);
        setDuration(seconds);
      }
    };
    
    const audioElement = audioRef.current;
    
    audioElement?.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      audioElement?.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioRef]);

  // Actualizar el progreso de la reproducción
  const updateProgress = (): void => {
    if (audioRef.current) {
      const currentSeconds = audioRef.current.currentTime;
      setCurrentTime(currentSeconds);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };



  // Controlar reproducción
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play()
        .catch((error: Error) => {
          console.error("Error al reproducir audio:", error);
          setIsPlaying(false);
        });
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioRef.current?.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Formatear tiempo en mm:ss
  const formatTime = (time: number): string => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return '0:00';
  };

  // Manejar cambios en la barra de progreso
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Manejar cambios en el volumen
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Manejar play/pause
  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  // Avanzar 10 segundos
  const skipForward = (): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  // Retroceder 10 segundos
  const skipBackward = (): void => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  // Identificar qué barras están activas según el progreso actual
  // const getActiveBarCount = (): number => {
  //   return Math.floor((currentTime / duration) * waveformData.length) || 0;
  // };
  
  // const activeBarCount = getActiveBarCount();

  // Manejar el fin de la reproducción
  const handleAudioEnded = (): void => {
    setIsPlaying(false);
  };

  
  return (
    <div className="w-full px-6 py-2 bg-gray-800 rounded-lg shadow-lg mb-6" >
      {/* Audio Element (hidden) */}
      <audio 
        ref={audioRef} 
        src="/sounds/lagunas.mp3" // Reemplazar con URL de audio real
        preload="metadata"
        onEnded={handleAudioEnded}
      />
      
      {/* Título y artista */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white">Lagunas</h2>
        <p className="text-gray-400">Corridos Versionados</p>
      </div>
      
      
      {/* Barra de progreso */}
      <div className="w-full flex items-center gap-2 mb-6">
        <span className="text-gray-400 text-sm w-12">{formatTime(currentTime)}</span>
        <input 
          type="range" 
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          min="0"
          max={duration || 0}
          step="1"
          value={currentTime}
          onChange={handleProgressChange}
        />
        <span className="text-gray-400 text-sm w-12">{formatTime(duration)}</span>
      </div>
      
      {/* Controles */}
      <div className="flex flex-col justify-center items-center gap-4 mb-2">
        <div className="flex gap-5">
          <button 
            onClick={skipBackward}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
            aria-label="Retroceder 10 segundos"
          >
            <SkipBack size={24} />
          </button>
          
          <button 
            onClick={togglePlayPause}
            className="p-4 rounded-full bg-purple-600 hover:bg-purple-500 text-white transition-all"
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={skipForward}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
            aria-label="Avanzar 10 segundos"
          >
            <SkipForward size={24} />
          </button>
        </div>
          {/* Control de volumen */}
        <div className="flex gap-4 justify-content-center pt-8 ">
          <Volume2 size={20} className="text-gray-400" />
          <input 
            type="range" 
            className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Control de volumen"
          />
        </div>
      </div>
      
    </div>

    
  );
}

export default AudioWavePlayer;