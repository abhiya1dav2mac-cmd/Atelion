import { useState, useCallback, useEffect } from 'react';
import { authService } from '../service/authService';

export function useAuth() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signin' | 'signup'
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const openAuth = useCallback((initialMode = 'signup') => {
    setMode(initialMode);
    setError(null);
    setIsOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'signup' ? 'signin' : 'signup'));
    setError(null);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.signIn(credentials);
      setUser(res);
      closeAuth();
      return res;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.signUp(data);
      setUser(res);
      closeAuth();
      return res;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.signInWithGoogle();
      setUser(res);
      closeAuth();
      return res;
    } catch (err) {
      setError(err.message || 'Google login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLaunch = async () => {
    setIsLoading(true);
    try {
      const res = await authService.quickLaunch();
      setUser(res);
      closeAuth();
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.signOut();
    setUser(null);
  };

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeAuth]);

  return {
    isOpen,
    mode,
    setMode,
    openAuth,
    closeAuth,
    toggleMode,
    user,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    quickLaunch,
    logout,
  };
}

