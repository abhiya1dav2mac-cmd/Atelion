import React, { useState, useEffect } from 'react';
import LandingPage from '../feature/Landing/pages/LandingPage';
import WorkspacePage from '../feature/Workspace/pages/WorkspacePage';
import { useAuth } from '../feature/Auth/hook/useAuth';

/**
 * Application Router
 * - Not logged in: Displays 4K tactile landing page with authentication modal.
 * - Logged in: Automatically launches Notion-style Workspace.
 * - Seamlessly allows toggling between Landing Page and Workspace anytime!
 */
export function Router() {
  const { user, logout } = useAuth();
  const [view, setView] = useState(() => {
    if (window.location.hash === '#landing') return 'landing';
    return user ? 'workspace' : 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#landing') {
        setView('landing');
      } else if (user) {
        setView('workspace');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // When user logs in/out, update view accordingly
  useEffect(() => {
    if (user && window.location.hash !== '#landing') {
      setView('workspace');
    } else if (!user) {
      setView('landing');
      window.location.hash = '';
    }
  }, [user]);

  const handleGoToLanding = () => {
    window.location.hash = '#landing';
    setView('landing');
  };

  const handleGoToWorkspace = () => {
    window.location.hash = '';
    setView('workspace');
  };

  if (user && view === 'workspace') {
    return (
      <WorkspacePage
        user={user}
        onLogout={logout}
        onGoToLanding={handleGoToLanding}
      />
    );
  }

  return (
    <LandingPage
      user={user}
      onLogout={logout}
      onGoToWorkspace={handleGoToWorkspace}
    />
  );
}

export default Router;
