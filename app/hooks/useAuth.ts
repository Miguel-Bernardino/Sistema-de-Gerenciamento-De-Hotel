/**
 * Hook para gerenciar estado de autenticação
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, isAuthenticated, logout as authLogout, AuthUser } from '~/utils/auth';

interface UseAuthReturn {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();
  
  const logout = useCallback(() => {
    authLogout();
    navigate('/login');
  }, [navigate]);

  return {
    token: getToken(),
    user: getUser(),
    isAuthenticated: isAuthenticated(),
    logout
  };
};
