// src/components/About.tsx
import { motion } from 'framer-motion';

const About = () => {

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="section-title">Sobre Mí</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Imagen y decoraciones */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 p-1">
            {/* Reemplaza la URL con tu imagen real */}
            <img 
              src="/images/emme.jpg" 
              alt="Desarrollador" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          
          {/* Elementos decorativos */}
          <motion.div 
            className="absolute -bottom-6 -right-6 w-24 h-24 bg-purple-100 rounded-full z-[-1]"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0] 
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
          <motion.div 
            className="absolute -top-6 -left-6 w-16 h-16 bg-indigo-100 rounded-full z-[-1]"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0] 
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
        </motion.div>

        {/* Texto de presentación */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h3 className="text-2xl md:text-3xl font-bold text-purple-900 mb-4">
            ¡Hola! Soy <span className="text-indigo-600">Emmanuel Arenas</span>
          </h3>
          
          <p className="text-gray-700 mb-4">
             Frontend Developer con más de 4 años de experiencia en la creación de interfaces web escalables y optimizadas para rendimiento y accesibilidad. Experto en React, Next.js y TypeScript, con un enfoque en diseño responsivo, optimización de rendimiento y experiencia de usuario (UX/UI). Sólidos conocimientos en JavaScript, manipulación de SVGs, Canvas y animaciones interactivas. Apasionado por la eficiencia del código y la usabilidad en aplicaciones web.
          </p>
          
          <p className="text-gray-700 mb-6">
            Mi pasión por la música y la tecnología me ha llevado a explorar la intersección entre 
            estos mundos, creando visualizaciones y experiencias que fusionan lo auditivo con lo visual.
            Cuando no estoy programando, me encuentro tocando la guitarra o experimentando con nuevas
            herramientas de modelado 3D.
          </p>
          
          <div className="flex flex-wrap gap-4 my-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">+5 años</h4>
                <p className="text-sm text-gray-500">Experiencia</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium">+30 proyectos</h4>
                <p className="text-sm text-gray-500">Completados</p>
              </div>
            </div>
          </div>
            <a href='/cv_Fullstack.pdf'>
            <motion.button 
                className="btn-primary mt-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}            
            >
                Descargar CV
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>            
            </motion.button>
            </a>
        </motion.div>
        
      </div>
    </div>
  );
}

export default About;