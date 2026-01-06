import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🛍️</div>
          <p className="text-gray-700 font-nunito">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirigir según el rol del usuario
    if (user?.role === 'admin' || user?.role === 'vendor') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;

