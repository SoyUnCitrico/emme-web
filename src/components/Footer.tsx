import { Github, Instagram, Linkedin, Mail, BrainCircuit } from 'lucide-react';

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();
  
  // Enlaces a redes sociales
  const socialLinks = [
    { 
      id: 'github', 
      icon: <Github size={20} />, 
      url: 'https://github.com/soyuncitrico',
      label: 'GitHub'
    },
    { 
      id: 'Instagram', 
      icon: <Instagram size={20} />, 
      url: 'https://instagram.com/soy.emm3',
      label: 'Instagram'
    },
    { 
      id: 'linkedin', 
      icon: <Linkedin size={20} />, 
      url: 'https://linkedin.com/in/emme-arto',
      label: 'LinkedIn'
    },
    { 
      id: 'mail', 
      icon: <Mail size={20} />, 
      url: 'mailto:emme.arto@gmail.com',
      label: 'Email'
    }
  ];
  
  // Enlaces a secciones del sitio web
  const siteLinks = [
    { id: 'skills', label: 'Habilidades', url: '#skills' },
    { id: 'about', label: 'Acerca de', url: '#about' },
    { id: 'projects', label: 'Proyectos', url: '#projects' },
    { id: 'media', label: 'Media', url: '#media' },
    { id: 'contact', label: 'Contacto', url: '#contact' },
  ];
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Contenido principal del footer */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Logo y descripción */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
            <BrainCircuit size={28} className="text-purple-500" />
              
              <span className="font-bold text-xl text-white">EmmE</span>
            </div>
            <p className="text-sm text-gray-400">
              Portafolio de proyectos propios a lo largo de la web.
            </p>
          </div>
          
          {/* Columna 2: Enlaces */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold text-white mb-4">Enlaces rápidos</h3>
            <ul className="grid grid-cols-2 gap-2">
              {siteLinks.map((link) => (
                <li key={link.id}>
                  <a 
                    href={link.url} 
                    className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Columna 3: Redes sociales */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold text-white mb-4">Sígueme</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            {/* Suscripción newsletter */}
            {/* <div className="mt-6">
              <h4 className="text-sm font-medium text-white mb-2">Suscríbete a nuestro boletín</h4>
              <form className="flex mt-2">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-grow px-3 py-2 bg-gray-800 text-white text-sm rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-r-md text-sm font-medium transition-colors"
                >
                  Suscribirse
                </button>
              </form>
            </div> */}
          </div>
        </div>
        
        {/* Línea divisoria */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} @soyuncitrico. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-gray-500">
                Diseñado con <span className="text-red-500">❤</span> por Emme
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}   