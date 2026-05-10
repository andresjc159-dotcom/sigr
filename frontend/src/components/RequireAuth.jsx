import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Cargando...</p>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    const redirectMap = {
      master: '/master',
      administrador: '/admin',
      mesero: '/mesero',
      cliente: '/cliente/menu'
    };
    return <Navigate to={redirectMap[user.rol] || '/'} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
