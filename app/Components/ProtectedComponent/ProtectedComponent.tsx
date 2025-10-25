/**
 * 🔒 Wrapper para Rotas Protegidas
 * Envolve componentes que precisam de autenticação
 */

import React from 'react';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';

interface ProtectedComponentProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

export default function ProtectedComponent({ component: Component, ...props }: ProtectedComponentProps) {
  return (
    <ProtectedRoute>
      <Component {...props} />
    </ProtectedRoute>
  );
}


