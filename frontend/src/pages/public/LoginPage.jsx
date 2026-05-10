import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';
import { API_BASE } from '../../config';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error de login');
      }
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      
      if (redirectAfterLogin) {
        window.location.href = redirectAfterLogin;
      } else {
        const roleRoutes = {
          master: '/master',
          administrador: '/admin',
          mesero: '/mesero',
          cliente: '/cliente'
        };
        window.location.href = roleRoutes[data.user.rol] || '/';
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>♥</span>
          <h1 style={{ color: '#e63946', marginTop: 8 }}>Red Velvet</h1>
          <p style={{ color: '#6c757d' }}>Inicia sesión</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20 }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Email</label>
            <input
              type="email"
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Contraseña</label>
            <input
              type="password"
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, background: '#e63946', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 24, color: '#6c757d' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: '#e63946', fontWeight: 600 }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;