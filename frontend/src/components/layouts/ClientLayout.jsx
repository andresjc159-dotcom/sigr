import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { loadTheme } from '../../services/api';
import './ClientLayout.css';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="client-layout">
      <header className="client-header">
        <div className="container">
          <Link to="/cliente" className="logo">Red Velvet</Link>
          <nav className="client-nav">
            <Link to="/cliente/menu">Menú</Link>
            <Link to="/cliente/reservas">Reservas</Link>
            <Link to="/cliente/carrito">Carrito ({cartCount})</Link>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </nav>
        </div>
      </header>
      <main className="client-main">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;