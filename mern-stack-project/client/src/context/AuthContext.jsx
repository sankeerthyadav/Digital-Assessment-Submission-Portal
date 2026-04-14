import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearAuth,
  getAuthEventName,
  getToken,
  getUser,
  isTokenExpired,
  saveAuth,
} from '../utils/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearAuth();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const syncAuth = () => {
      const nextToken = getToken();
      if (nextToken && isTokenExpired(nextToken)) {
        clearAuth();
        setToken(null);
        setUser(null);
        return;
      }

      setToken(nextToken);
      setUser(getUser());
    };

    window.addEventListener(getAuthEventName(), syncAuth);
    return () => window.removeEventListener(getAuthEventName(), syncAuth);
  }, []);

  const login = (nextToken, nextUser) => {
    saveAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token) && !isTokenExpired(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}