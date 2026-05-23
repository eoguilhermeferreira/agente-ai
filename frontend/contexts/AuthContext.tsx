'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User, Company } from '@/types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  companyPhone?: string;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('chatnex_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (tkn: string) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      setUser(res.data.user);
      setCompany(res.data.company);
    } catch {
      localStorage.removeItem('chatnex_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser, company: newCompany } = res.data;
    localStorage.setItem('chatnex_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
    router.push('/dashboard');
  };

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data);
    const { token: newToken, user: newUser, company: newCompany } = res.data;
    localStorage.setItem('chatnex_token', newToken);
    setToken(newToken);
    setUser(newUser);
    setCompany(newCompany);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('chatnex_token');
    setToken(null);
    setUser(null);
    setCompany(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, company, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
