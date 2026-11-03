import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Riffs from './pages/Riffs';
import Goals from './pages/Goals';
import Layout from './Layout';

/** Each key becomes a route: "/Dashboard", "/Sessions", ... */
export const pagesConfig = {
  mainPage: 'Dashboard',
  Pages: {
    Dashboard,
    Sessions,
    Riffs,
    Goals,
  },
  Layout,
};
