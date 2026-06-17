import { Suspense, lazy, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import MatrixRain from './MatrixRain';
import CursorParticles from './CursorParticles';
import VhsOverlay from './VhsOverlay';
import GlitchOverlay from './GlitchOverlay';
import { dissolveConfig } from './sceneObjects';
import { useAudio } from '@/hooks/useAudio';

// Code-split the heavy 3D scene so the hero shell paints immediately.
const SpaceScene = lazy(() => import('./SpaceScene'));

function SceneLoader() {
  return (
    <Html center>
      <div className="font-mono text-matrix-green text-glow-green whitespace-nowrap text-sm animate-flicker">
        &gt; cargando modelo<span className="animate-pulse">_</span>
      </div>
    </Html>
  );
}

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const { start } = useAudio();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Interferencia de TV mientras los objetos se disuelven; se quita cuando
  // desaparecen (mismo tiempo que la disolución en SpaceScene).
  useEffect(() => {
    if (!exploded) {
      setGlitching(false);
      return;
    }
    setGlitching(true);
    const id = window.setTimeout(
      () => setGlitching(false),
      dissolveConfig.holdMs + dissolveConfig.fadeMs
    );
    return () => window.clearTimeout(id);
  }, [exploded]);

  return (
    <motion.div
      className="relative w-full h-screen overflow-hidden cursor-pointer bg-gradient-to-b from-matrix-black via-[#04130a] to-matrix-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      onClick={() => {
        start(); // primer click: arranca la canción (idempotente); luego se controla desde el header
        setExploded((v) => !v);
      }}
      title="Click para detonar / reiniciar y reproducir audio"
    >
      {/* Digital-rain backdrop (hero only) */}
      <MatrixRain />

      {/* Transparent canvas sits above the rain */}
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="!absolute inset-0"
      >
        {/* Camera is driven by WanderingCamera; this just sets the initial frame. */}
        <PerspectiveCamera makeDefault position={[7, 2, 7]} fov={isMobile ? 75 : 55} />

        {/* Self-contained lighting (no external HDR — avoids a network hang that
            could suspend the whole page). */}
        <ambientLight intensity={0.8} />
        <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#04130a" />
        <spotLight position={[8, 10, 8]} angle={0.4} penumbra={1} intensity={1.6} color="#ffffff" />
        <pointLight position={[-6, 2, -4]} intensity={1.2} color="#ff8c1a" />
        <pointLight position={[6, -2, 4]} intensity={0.9} color="#3b7bff" />

        <Suspense fallback={<SceneLoader />}>
          <SpaceScene exploded={exploded} />
        </Suspense>
      </Canvas>

      {/* Foreground copy */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-matrix-text p-4">
        <motion.p
          className="font-mono text-neon-orange text-glow-orange text-sm md:text-base mb-3 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          &gt; emme@dev:~$ ./init.sh
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 text-matrix-green text-glow-green"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Explota tus ideas
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl max-w-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Soy un desarrollador creativo apasionado por la música y la tecnología.
        </motion.p>
        <motion.p
          className="text-lg max-w-lg mt-2 text-matrix-dim"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Yo te ayudo
        </motion.p>

        <motion.p
          className="mt-8 text-sm uppercase tracking-widest text-neon-orange text-glow-orange animate-flicker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          {exploded ? '// click para reiniciar' : '// click para detonar'}
        </motion.p>
      </div>

      {/* Cursor particle trail (hover) */}
      <CursorParticles />

      {/* Old-TV / VHS overlay (static, scanlines, rolling band) */}
      <VhsOverlay />

      {/* Interferencia intensa al detonar; se desmonta al desaparecer los objetos */}
      {glitching && <GlitchOverlay />}
    </motion.div>
  );
}
