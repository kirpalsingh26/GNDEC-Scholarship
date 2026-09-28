import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { User, StudentProfile } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  quickSwitchDemo: (role: 'STUDENT' | 'OFFICER' | 'ADMIN') => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!localStorage.getItem('token')) {
        setIsLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        if (res.data.data.profile) {
          localStorage.setItem('profile', JSON.stringify(res.data.data.profile));
        }
      }
    } catch (err) {
      console.error('Failed to verify active session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: jwtToken, user: userData, profile: profileData } = res.data.data;
      setToken(jwtToken);
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/auth/register', payload);
    if (res.data.success) {
      const { token: jwtToken, user: userData, profile: profileData } = res.data.data;
      setToken(jwtToken);
      setUser(userData);
      setProfile(profileData);
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      if (profileData) {
        localStorage.setItem('profile', JSON.stringify(profileData));
      }
    }
  };

  const quickSwitchDemo = async (role: 'STUDENT' | 'OFFICER' | 'ADMIN') => {
    const credentials = {
      STUDENT: { email: 'student@gndec.ac.in', password: 'Student@123' },
      OFFICER: { email: 'officer.rajesh@gndec.ac.in', password: 'Officer@123' },
      ADMIN: { email: 'admin@gndec.ac.in', password: 'Admin@123' },
    };

    const target = credentials[role];
    if (target) {
      await login(target.email, target.password);
    }
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        quickSwitchDemo,
        refreshUser,
        refreshProfile: refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
