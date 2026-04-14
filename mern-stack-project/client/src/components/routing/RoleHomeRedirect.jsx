import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function RoleHomeRedirect() {
  const { user } = useAuth();

  if (user?.role === 'teacher') {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/student" replace />;
}

export default RoleHomeRedirect;