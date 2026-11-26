import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { logoutService } from '@/modules/auth/services/login.service';
import api from '@/lib/axios';
import type { PermissionAction } from '@/lib/permissions';

interface AuthUserRole {
  id: number;
  name: string;
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AuthUserRole;
  isActive: boolean;
  permissions: string[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
  can: (permission: PermissionAction) => boolean;
  refreshProfile: () => Promise<void>;
}

interface ProfileEnvelope {
  data: AuthUser;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    api.get<ProfileEnvelope>('auth/profile')
      .then((response) => {
        setUser(response.data.data);
        setIsAuthenticated(true);
        setIsLoading(false);
      })
      .catch(() => {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, []);

  const login = () => {
    api.get<ProfileEnvelope>('auth/profile')
      .then((response) => setUser(response.data.data))
      .catch(() => setUser(null));
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  const refreshProfile = useCallback(async () => {
    try {
      const response = await api.get<ProfileEnvelope>('auth/profile');
      setUser(response.data.data);
    } catch {
      setUser(null);
    }
  }, []);

  const can = useCallback(
    (permission: PermissionAction) => user?.permissions?.includes(permission) ?? false,
    [user],
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout, can, refreshProfile }}>
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
