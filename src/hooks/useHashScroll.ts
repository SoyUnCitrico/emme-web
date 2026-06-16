import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Smoothly scrolls to the element matching the current location hash
 * (e.g. navigating to `/#projects` or `/about#skills`). Lets the nav link to a
 * section on another page and land in the right place after the route mounts.
 */
export function useHashScroll() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    // Defer until the target section has rendered.
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timer);
  }, [hash]);
}
