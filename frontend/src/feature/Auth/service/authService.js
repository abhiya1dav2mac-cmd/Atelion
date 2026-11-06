/**
 * Authentication Service
 * Handles user sign in, sign up, Google OAuth, and session persistence.
 */

export const authService = {
  async signIn({ email, password }) {
    // Simulated API call latency
    await new Promise((res) => setTimeout(res, 400));
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const user = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      provider: 'email',
    };
    localStorage.setItem('atelion_user', JSON.stringify(user));
    return user;
  },

  async signUp({ name, email, password }) {
    await new Promise((res) => setTimeout(res, 500));
    if (!email || !password) {
      throw new Error('All fields are required.');
    }
    const user = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email,
      provider: 'email',
    };
    localStorage.setItem('atelion_user', JSON.stringify(user));
    return user;
  },

  async signInWithGoogle() {
    await new Promise((res) => setTimeout(res, 600));
    const user = {
      id: 'usr_g_' + Math.random().toString(36).substr(2, 9),
      name: 'Google User',
      email: 'user@gmail.com',
      provider: 'google',
    };
    localStorage.setItem('atelion_user', JSON.stringify(user));
    return user;
  },

  getCurrentUser() {
    try {
      const data = localStorage.getItem('atelion_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  signOut() {
    localStorage.removeItem('atelion_user');
  }
};

