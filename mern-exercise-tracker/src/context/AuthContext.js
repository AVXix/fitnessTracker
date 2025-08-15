import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('authUser');
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to read auth from storage', e);
    }
  }, []);

  const signIn = (email) => {
    const u = { email };
    setUser(u);
    try {
      localStorage.setItem('authUser', JSON.stringify(u));
    } catch (e) {
      console.error('Failed to save auth to storage', e);
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem('authUser');
    } catch (e) {
      console.error('Failed to clear auth storage', e);
    }
  };

  const value = useMemo(() => ({ user, isAuthenticated: !!user, signIn, signOut }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
