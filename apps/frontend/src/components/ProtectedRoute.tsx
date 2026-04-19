import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { ROUTES } from '../constants/routes';

type TProps = { children: React.ReactNode };

export default function ProtectedRoute({ children }: TProps): React.JSX.Element {
  const token = useSelector((state: RootState) => state.auth.token);
  if (token === null) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
}
