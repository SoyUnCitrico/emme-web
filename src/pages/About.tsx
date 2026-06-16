import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/About';
import Skills from '../components/Skills';
import { useHashScroll } from '@/hooks/useHashScroll';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function About() {
  useHashScroll();

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen bg-matrix-black text-matrix-text">
        {/* pt-24 clears the fixed header */}
        <main className="flex-grow pt-24">
          <div className="px-4 md:px-20 pt-6">
            <p className="font-mono text-neon-orange text-glow-orange text-sm tracking-widest">
              &gt; emme@dev:~$ cat about.me
            </p>
          </div>

          {/* About */}
          <motion.section
            id="about"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="py-16 px-4 md:px-20 bg-matrix-black"
          >
            <AboutSection />
          </motion.section>

          {/* Skills */}
          <motion.section
            id="skills"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="py-20 px-4 md:px-20 bg-matrix-panel/40"
          >
            <Skills />
          </motion.section>
        </main>
        <Footer />
      </div>
    </>
  );
}
