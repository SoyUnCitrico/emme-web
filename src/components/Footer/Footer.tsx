import { Github, Instagram, Linkedin, Mail, BrainCircuit } from 'lucide-react';
import { navItems, useSiteNav } from '@/hooks/useSiteNav';

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();
  const { go, href } = useSiteNav();

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
  
  return (
    <footer className="bg-matrix-black text-matrix-text border-t border-matrix-line">
      {/* Contenido principal del footer */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Logo y descripción */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
            <BrainCircuit size={28} className="text-neon-orange" />

              <span className="font-bold text-xl text-matrix-green tracking-widest">EmmE</span>
            </div>
            <p className="text-sm text-matrix-dim">
              Portafolio de proyectos propios a lo largo de la web.
            </p>
          </div>

          {/* Columna 2: Enlaces */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold text-matrix-green mb-4 uppercase tracking-wide">Enlaces rápidos</h3>
            <ul className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <a
                    href={href(item)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item);
                    }}
                    className="text-sm text-matrix-dim hover:text-neon-orange transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Redes sociales */}
          <div className="mt-8 md:mt-0">
            <h3 className="text-lg font-semibold text-matrix-green mb-4 uppercase tracking-wide">Sígueme</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-matrix-dim hover:text-neon-orange transition-colors"
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
        <div className="border-t border-matrix-line mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-matrix-dim">
              &copy; {currentYear} @soyuncitrico. Todos los derechos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-xs text-matrix-dim/70">
                Diseñado con <span className="text-neon-orange">❤</span> por Emme
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}   