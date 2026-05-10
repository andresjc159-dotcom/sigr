import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './PublicLayout.css';

const PublicLayout = () => {
  const { theme } = useTheme();
  const restaurantName = theme?.nombre_restaurante || 'Red Velvet';
  const logoUrl = theme?.logo_principal ? `http://localhost:3000${theme.logo_principal}` : null;
  const primaryColor = theme?.color_primario || '#e63946';

  return (
    <div className="layout">
      <header className="header" style={{ backgroundColor: primaryColor }}>
        <div className="container header-inner">
          <Link to="/" className="logo">
            {logoUrl ? (
              <img src={logoUrl} alt={restaurantName} style={{ height: 40, objectFit: 'contain' }} />
            ) : (
              <>
                <span className="logo-icon">♥</span>
                <span className="logo-text">{restaurantName}</span>
              </>
            )}
          </Link>
          <nav className="nav">
            <Link to="/menu" className="nav-link">Menú</Link>
            <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <p style={{ color: '#1a1a1a' }}>© 2024 {restaurantName}. {theme?.slogan || 'Delicias que enamoran.'}</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;