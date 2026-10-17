'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/lib/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fitforge_token');
    if (token) {
      authApi
        .getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('fitforge_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (credential) => {
    const { access_token } = await authApi.loginWithGoogle(credential);
    localStorage.setItem('fitforge_token', access_token);
    const me = await authApi.getMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem('fitforge_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
