import { useState, useEffect } from 'react';
import { Menu, X, Play, Pause, Volume2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navItems, useSiteNav, type NavItem } from '@/hooks/useSiteNav';
import { useAudio } from '@/hooks/useAudio';
const logoSrc = 'https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/images/emmeLogo.png';
const logotipoSrc = 'https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/images/logotipoSombra.png';
const Header = (): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { go, isActive, href } = useSiteNav();
  const { isPlaying, toggle, volume, setVolume } = useAudio();
  
  // Detectar scroll para cambiar la apariencia del header
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleNavClick = (item: NavItem): void => {
    setMobileMenuOpen(false);
    go(item);
  };

  const goHome = (e: React.MouseEvent): void => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-matrix-black/90 backdrop-blur border-b border-matrix-line shadow-glow-green' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="flex items-center space-x-2 text-matrix-green hover:text-neon-orange transition-colors"
              onClick={goHome}
            >
              <img src={logoSrc} alt="Logo" className="h-8 w-8" />
              {/* <span className="font-bold text-xl tracking-widest">EmmE</span> */}
              <img src={logotipoSrc} alt="Logotipo" className="h-6 w-auto opacity-50 pl-2" />
            </a>
          </div>

          {/* Controles de audio (misma instancia que el reproductor) */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggle}
              className="text-matrix-green hover:text-neon-orange transition-colors"
              aria-label={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
              title={isPlaying ? 'Pausar audio' : 'Reproducir audio'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <Volume2 size={16} className="hidden sm:block text-matrix-dim" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="hidden sm:block w-16 md:w-20 accent-neon-orange cursor-pointer"
              aria-label="Volumen"
            />
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={href(item)}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive(item)
                    ? 'text-neon-orange border-b-2 border-neon-orange'
                    : 'text-matrix-text hover:text-matrix-green'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Botón de Menú Móvil */}
          <div className="md:hidden flex items-center">
            <button
              className="text-matrix-text hover:text-matrix-green focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              title="Arbir / Cerrar menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-matrix-panel border-t border-matrix-line">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={href(item)}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium uppercase tracking-wide ${
                  isActive(item)
                    ? 'bg-matrix-line text-neon-orange'
                    : 'text-matrix-text hover:bg-matrix-line hover:text-matrix-green'
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
