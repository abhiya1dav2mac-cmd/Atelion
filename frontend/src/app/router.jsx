import React, { useState, useEffect } from 'react';
import LandingPage from '../feature/Landing/pages/LandingPage';

/**
 * Application Router
 * Handles routing between features (Landing page, Auth, etc.)
 */
export function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Default route is LandingPage
  switch (currentPath) {
    case '/':
    default:
      return <LandingPage />;
  }
}

export default Router;

