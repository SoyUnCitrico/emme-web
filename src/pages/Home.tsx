import { lazy, Suspense, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroScene from '../components/Hero';
import AudioWavePlayer from '@/components/AudioPlayer';
import Contact from '../components/Contact';
import { motion, useInView } from 'framer-motion';
import { useHashScroll } from '@/hooks/useHashScroll';

// Sección pesada (canvas + animaciones): se separa en su propio chunk.
const Projects = lazy(() => import('@/components/Projects'));

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function Home() {
  const contactRef = useRef(null);
  const projectsRef = useRef(null);
  const isProjectsInView = useInView(projectsRef, { once: true });
  const isContactInView = useInView(contactRef, { once: true });
  useHashScroll();

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-matrix-black text-matrix-text">
        <main className="flex-grow">
          <section className="relative w-full h-screen">
            <HeroScene />
            <button
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-matrix-green"
              title="Ver proyectos"
              onClick={() =>
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1.5 }}
                className="animate-bounce"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </motion.div>
            </button>
          </section>
        </main>

        <div className="w-full">
          {/* Projects */}
          <motion.section
            id="projects"
            ref={projectsRef}
            variants={sectionVariants}
            initial="hidden"
            animate={isProjectsInView ? 'visible' : 'hidden'}
            className="py-20 px-4 md:px-20 bg-matrix-panel/40"
          >
            <Suspense
              fallback={
                <p className="text-center text-matrix-dim animate-flicker">cargando señal…</p>
              }
            >
              <Projects />
            </Suspense>
          </motion.section>

          {/* Contact */}
          <motion.section
            id="contact"
            ref={contactRef}
            variants={sectionVariants}
            initial="hidden"
            animate={isContactInView ? 'visible' : 'hidden'}
            className="py-20 px-4 md:px-20 bg-matrix-black"
          >
            <Contact />
          </motion.section>

          {/* Media */}
          <section id="media" className="bg-matrix-panel/40 md:p-8 sm:p-4">
            <AudioWavePlayer />
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
}
