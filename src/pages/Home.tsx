import { useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroScene from '../components/Hero';
import AudioWavePlayer from '@/components/AudioPlayer';
import Contact from '../components/Contact';
import { motion, useInView } from 'framer-motion';
import { useHashScroll } from '@/hooks/useHashScroll';

const projects = [
  { url: 'https://creamcake-web.vercel.app/', label: 'CreamCake' },
  { url: 'https://synth-web-tau.vercel.app/', label: 'Synth React' },
  { url: 'https://micel10.vercel.app/', label: 'MICEL_10' },
  { url: 'https://fakestore-app-iota.vercel.app/', label: 'FakeStore' },
  { url: 'https://app-genda-front.vercel.app/', label: 'App Genda' },
  { url: 'https://ccdtecno.github.io//', label: 'CCDTecno' },
];

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
            <h2 className="section-title mb-12">Proyectos</h2>
            <div className="flex flex-col lg:flex-row items-center lg:justify-evenly gap-4 flex-wrap">
              {projects.map((project) => (
                <a key={project.url} href={project.url} target="_blank" rel="noopener noreferrer">
                  <motion.button
                    className="btn-primary mt-4 flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={project.label}
                  >
                    {project.label}
                  </motion.button>
                </a>
              ))}
            </div>
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
