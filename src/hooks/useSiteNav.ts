import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export interface NavItem {
  id: string;
  label: string;
  to?: string; // route navigation (e.g. /about or /about#skills)
  section?: string; // in-page section on Home
}

// Single source of truth for site navigation, shared by Header and Footer.
export const navItems: NavItem[] = [
  { id: 'projects', label: 'Proyectos', section: 'projects' },
  { id: 'contact', label: 'Contacto', section: 'contact' },
  { id: 'media', label: 'Media', section: 'media' },
  { id: 'about', label: 'Acerca de', to: '/about' },
];

export function useSiteNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Client-side navigate: route items jump to their route; section items scroll
  // on Home (navigating Home first when on another page — useHashScroll finishes).
  const go = useCallback(
    (item: NavItem) => {
      if (item.to) {
        navigate(item.to);
        return;
      }
      if (item.section) {
        if (location.pathname === '/') {
          document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate(`/#${item.section}`);
        }
      }
    },
    [navigate, location.pathname]
  );

  const isActive = useCallback(
    (item: NavItem) => !!item.to && location.pathname === item.to.split('#')[0],
    [location.pathname]
  );

  const href = (item: NavItem) => item.to ?? `#${item.section}`;

  return { go, isActive, href };
}
