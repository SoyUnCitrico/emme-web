import { useRef } from 'react';
import HeroScene from '../components/HeroScene';
import AudioWavePlayer from '@/components/AudioPlayer';
import About from '../components/About';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import { motion, useInView } from 'framer-motion';


export default function Home() {
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);
  const contactRef = useRef(null);
  const projectsRef = useRef(null);

  const isAboutInView = useInView(aboutRef, { once: true });
  const isSkillsInView = useInView(skillsRef, { once: true });
  const isProjectsInView = useInView(skillsRef, { once: true });
  const isContactInView = useInView(contactRef, { once: true });

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };
  
  return (
    <div className="w-full">
      {/* Hero Section with 3D Model */}
      <section className="relative w-full h-screen">
        <HeroScene />
        <button 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          onClick={() => {
            if(aboutRef.current !== null) {       
              // @ts-ignore       
              aboutRef.current.scrollIntoView( { behavior: 'smooth' } )
            }
         }}
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
              className="text-white"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </motion.div>
        </button>
      </section>
      {/* About Section */}
      <motion.section 
        id='about'
        ref={aboutRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isAboutInView ? "visible" : "hidden"}
        className="py-20 px-4 md:px-20 bg-gray-100"
      >
        <About />
      </motion.section>
      <motion.section 
        id='projects'
        ref={projectsRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isProjectsInView ? "visible" : "hidden"}
        className="py-20 px-4 md:px-20 bg-gray-100"
      >
        <h2 className="section-title mb-12">
          Proyectos
        </h2>
        <div  className='flex justify-evenly w-xl m-4 pl-6 pr-6'>          
          <a href='https://synth-web-tau.vercel.app/'>
            <motion.button 
                className="btn-primary mt-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}            
            >
                Synth React
            </motion.button>
          </a>
          <a href='https://app-genda-front.vercel.app/'>
            <motion.button 
                className="btn-primary mt-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}            
            >
                Synth React
            </motion.button>
          </a>
          <a href='https://fakestore-app-iota.vercel.app/'>
            <motion.button 
                className="btn-primary mt-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}            
            >
                FakeStore
            </motion.button>
          </a>
          <a href='https://emme-beta.vercel.app/'>
            <motion.button 
                className="btn-primary mt-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}            
            >
                Portafolio 2023
            </motion.button>
          </a>
        </div>
      </motion.section>
      {/* Skills Section */}
      <motion.section
        id='skills'
        ref={skillsRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isSkillsInView ? "visible" : "hidden"}
        className="py-20 px-4 md:px-20 bg-white"
      >
        <Skills />
      </motion.section>

      {/* Contact Section */}
      <motion.section 
        id='contact'
        ref={contactRef}
        variants={sectionVariants}
        initial="hidden"
        animate={isContactInView ? "visible" : "hidden"}
        className="py-20 px-4 md:px-20 bg-gray-100"
      >
        <Contact />
      </motion.section>

      
      <section id='media' className='bg-gray-100 md:p-8 sm:p-4'>
        <AudioWavePlayer />
      </section> 
    </div>
  );
}