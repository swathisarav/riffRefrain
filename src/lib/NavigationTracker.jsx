import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the top and updates the tab title whenever the route changes. */
export default function NavigationTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const page = pathname.replace(/^\//, '');
    document.title = page ? `${page} · RiffRefrain` : 'RiffRefrain';
  }, [pathname]);

  return null;
}
