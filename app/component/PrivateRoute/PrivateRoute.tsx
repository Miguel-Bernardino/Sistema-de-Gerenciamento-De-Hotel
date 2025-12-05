/**
 * Componente para proteger rotas que requerem autenticação
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '~/utils/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    console.log('⚠️ Acesso negado: usuário não autenticado');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
