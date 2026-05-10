import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const DashboardLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantName = theme?.nombre_restaurante || 'Red Velvet';
  const primaryColor = theme?.color_primario || '#e63946';

  const getLinks = () => {
    if (!user) return [];
    const links = [];
    if (hasRole('master')) {
      links.push(
        { to: '/master', label: 'Dashboard' },
        { to: '/master/empleados', label: 'Empleados' },
        { to: '/master/productos', label: 'Productos' },
        { to: '/master/toppings', label: 'Toppings' },
        { to: '/master/visual', label: 'Visual' }
      );
    }
    if (hasRole('master', 'administrador')) {
      links.push(
        { to: '/admin', label: 'Dashboard' },
        { to: '/admin/caja', label: 'Caja' },
        { to: '/admin/pedidos', label: 'Pedidos' },
        { to: '/admin/mesas', label: 'Mesas' },
        { to: '/admin/reservas', label: 'Reservas' },
        { to: '/admin/inventario', label: 'Inventario' }
      );
    }
    if (hasRole('master', 'administrador', 'mesero')) {
      links.push(
        { to: '/mesero/pedidos', label: 'Pedidos' },
        { to: '/mesero/mesas', label: 'Mesas' }
      );
    }
    if (hasRole('cliente')) {
      links.push(
        { to: '/cliente/menu', label: 'Menú' },
        { to: '/cliente/carrito', label: 'Carrito' },
        { to: '/cliente/mis-pedidos', label: 'Mis Pedidos' },
        { to: '/cliente/reservas', label: 'Reservas' }
      );
    }
    return links;
  };

  const isActive = (to) => location.pathname === to;

  if (!user) {
    navigate('/login', { replace: true });
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ 
        width: 260, 
        background: '#1a1a2e', 
        color: '#ffffff', 
        padding: 24, 
        display: 'flex', 
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 32, color: primaryColor, fontWeight: 'bold' }}>♥</div>
          <h2 style={{ margin: '8px 0 0', color: '#ffffff' }}>{restaurantName}</h2>
          <div style={{ 
            display: 'inline-block',
            fontSize: 12, 
            background: primaryColor, 
            color: '#ffffff',
            padding: '4px 8px', 
            borderRadius: 4,
            marginTop: 8
          }}>{user.rol}</div>
          <p style={{ fontSize: 13, color: '#a0a0a0', marginTop: 8, marginBottom: 0 }}>{user.nombre} {user.apellido}</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          {getLinks().map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'block',
                padding: '10px 12px',
                color: isActive(link.to) ? '#ffffff' : '#a0a0a0',
                background: isActive(link.to) ? primaryColor : 'transparent',
                borderRadius: 8,
                marginBottom: 4,
                textDecoration: 'none',
                fontSize: 14
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button 
          onClick={logout} 
          style={{ 
            width: '100%', 
            padding: 12, 
            background: 'rgba(255,255,255,0.1)', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: 8, 
            cursor: 'pointer', 
            fontSize: 14
          }}
        >
          Cerrar Sesión
        </button>
      </aside>
      
      <main style={{ flex: 1, padding: 32, background: '#f8f9fa', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;