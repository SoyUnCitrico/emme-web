import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Define los tipos para las habilidades
interface Skill {
  name: string;
  level: number; // De 0 a 100
  icon: string;
  color: string;
}

// Agrupación de habilidades por categoría
interface SkillCategory {
  title: string;
  skills: Skill[];
}

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Datos de ejemplo - reemplaza con tus propias habilidades
  const skillCategories: SkillCategory[] = [
    {
      title: "Frontend",
      skills: [
        { name: "React", level: 95, icon: "💻", color: "bg-blue-500" },
        { name: "TypeScript", level: 85, icon: "🔷", color: "bg-green-500" },
        { name: "JavaScript", level: 95, icon: "🎨", color: "bg-gray-500" },
        { name: "HTML/CSS", level: 95, icon: "🎨", color: "bg-yellow-300" },
        { name: "Three.js", level: 80, icon: "🔮", color: "bg-purple-600" },
        { name: "p5.js", level: 95, icon: "🔮", color: "bg-pink-400" },        
      ]
    },
    {
      title: "Backend",
      skills: [
        { name: "Node.js", level: 80, icon: "🟢", color: "bg-green-600" },
        { name: "Express", level: 75, icon: "🚀", color: "bg-blue-700" },
        { name: "FastAPI", level: 75, icon: "🚀", color: "bg-yellow-300" },
        { name: "MongoDB", level: 70, icon: "🍃", color: "bg-green-500" },
        { name: "Express", level: 75, icon: "🚀", color: "bg-gray-700" },
        { name: "SQL", level: 65, icon: "📊", color: "bg-blue-400" },
      ]
    },
    {
      title: "Herramientas",
      skills: [
        { name: "Git", level: 85, icon: "🔄", color: "bg-orange-600" },        
        { name: "Vite", level: 80, icon: "⚡", color: "bg-purple-500" },
        { name: "Postman", level: 70, icon: "📦", color: "bg-red-300" },
        { name: "VSCode", level: 70, icon: "📦", color: "bg-blue-800" },
        { name: "Figma", level: 80, icon: "⚡", color: "bg-pink-500" },
        { name: "Touchdesigner", level: 80, icon: "⚡", color: "bg-green-500" },
        { name: "Blender", level: 75, icon: "🎮", color: "bg-orange-400" },
      ]
    }
  ];

  // Variantes para animaciones
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const categoryVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="section-title mb-12">Mis Habilidades</h2>
      
      <motion.div 
        ref={ref}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {skillCategories.map((category, index) => (
          <motion.div
            key={index}
            className="card"
            variants={categoryVariants}
          >
            <h3 className="text-xl font-bold text-purple-900 mb-4">{category.title}</h3>
            <div className="space-y-4">
              {category.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="skill-item">
                  <div className="flex justify-between items-center mb-1">
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">{skill.icon}</span>
                      {skill.name}
                    </span>
                    <span className="text-sm text-gray-600">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <motion.div 
                      className={`h-2.5 rounded-full ${skill.color}`}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.2 + skillIndex * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sección de tecnologías adicionales */}
      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3 className="text-xl font-bold text-purple-900 mb-6">Otras Tecnologías</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            "JavaScript", "SASS", "Tailwind CSS", "Redux", "GraphQL", 
            "Jest", "Firebase", "AWS", "Docker", "Figma"
          ].map((tech, index) => (
            <motion.span 
              key={index}
              className="px-4 py-2 bg-gray-100 rounded-full text-gray-800 hover:bg-purple-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.7 + index * 0.05, duration: 0.3 }}
            >
              {tech}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Skills;