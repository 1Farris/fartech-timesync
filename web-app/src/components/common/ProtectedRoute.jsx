import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth(); 

  // If we are still checking Firebase or fetching the Profile, wait.
  if (loading) {
    return <div>Loading session...</div>; // Or a nice Spinner component
  }

  // ONLY redirect if loading is finished and we still have no user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}