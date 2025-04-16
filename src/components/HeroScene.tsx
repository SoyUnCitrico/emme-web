
import { Suspense, lazy, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';

// Lazy loading del componente 3D con caché
const GuitarModel = lazy(() => import('./GuitarModel'));

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(false);
  const [headExploded, setHeadExploded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div 
      className="w-full h-screen bg-gradient-to-b from-indigo-900 to-purple-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <Canvas shadows className="!absolute inset-0">
        <PerspectiveCamera makeDefault position={[0, 3.5, 5]} fov={isMobile ? 75 : 50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.5} />

        {/* Environment and Controls */}
        <Environment preset="city" />
        <OrbitControls 
          enableZoom 
          enablePan 
          enableRotate 
          autoRotate={!headExploded}
          autoRotateSpeed={0}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />

        <Suspense fallback={null}>
          <GuitarModel 
            exploded={headExploded}
          />
          <ContactShadows 
            opacity={0.6} 
            scale={10} 
            blur={2.5} 
            far={4} 
            resolution={256} 
            color="#000000" 
          />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center text-white p-4">
        {/* ... rest of the UI components ... */}
        {/* <div cla}ssName="grid grid-cols-3 justify-center">  */}
        {/* <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center text-white p-4"> */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-4"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Hola, soy EmmE
        </motion.h1>
        <motion.p 
          className="text-xl md:text-2xl max-w-lg"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Desarrollador creativo apasionado por la música y la tecnología
        </motion.p>
        
        <motion.button
          className={`${headExploded ? 'mt-8 px-6 py-2 bg-red-600 text-purple-900 rounded-full text-lg font-medium hover:bg-opacity-90 transition-all' : 'mt-8 px-6 py-2 bg-blue-700 text-white rounded-full text-lg font-medium hover:bg-opacity-90 transition-all'}`}
          onClick={() => setHeadExploded(!headExploded)}
          // ... motion props ...
        >
          {headExploded ? 'RESET' : '💥'}
        </motion.button>
      </div>
    </motion.div>
  );
}