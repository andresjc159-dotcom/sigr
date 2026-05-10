import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="hero">
      <div className="hero-bg" />
      <div className="hero-content animate-fade-in">
        <h1 className="hero-title">Donde cada plato cuenta una historia</h1>
        <p className="hero-subtitle">
          Descubre una experiencia gastronómica única. Sabores auténticos, ingredientes frescos y un ambiente que te hacen sentir como en casa.
        </p>
        <div className="hero-buttons">
          <Link to="/menu" className="btn btn-primary btn-lg">
            Ver Menú
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg">
            Crear Cuenta
          </Link>
        </div>
      </div>
      
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="grid grid-3 stagger">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍽️</div>
              <h3>Ingredientes Frescos</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Solo lo mejor de lo mejor</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👨‍🍳</div>
              <h3>Chefs Expertos</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Años de experiencia</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💫</div>
              <h3>Ambiente Única</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Perfecto para compartir</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;