import React, { useState, useEffect } from 'react';
import LandingPage from '../feature/Landing/pages/LandingPage';
import WorkspacePage from '../feature/Workspace/pages/WorkspacePage';
import { useAuth } from '../feature/Auth/hook/useAuth';

/**
 * Application Router
 * Automatically opens the Notion-style Workspace as soon as the user logs in!
 */
export function Router() {
  const { user, logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If logged in, immediately open the Notion-Style Workspace!
  if (user) {
    return <WorkspacePage user={user} onLogout={logout} />;
  }

  // Otherwise, render tactile landing page with authentication modal
  return <LandingPage />;
}

export default Router;
