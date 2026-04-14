import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/student" replace />;
}

export default PublicOnlyRoute;