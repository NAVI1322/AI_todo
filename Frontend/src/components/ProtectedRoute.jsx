import { Navigate } from 'react-router-dom';
import { authService } from '../services/api';

export function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
} 