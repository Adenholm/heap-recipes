import { createContext, useEffect, useState } from "react";
import api from "../service/apiClient";
import { ReactNode } from "react";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => void;
  onRegister: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(null!);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const handleLogin = async (username: string, password: string) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    setToken(data.token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const handleRegister = async (email: string, password: string) => {
    await api.post('/auth/register', { email, password });
  };

  const value = {
    token,
    isAuthenticated: !!token,
    onLogin: handleLogin,
    onLogout: handleLogout,
    onRegister: handleRegister,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};