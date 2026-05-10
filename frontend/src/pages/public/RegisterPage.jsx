import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/v1';

const RegisterPage = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, email, telefono, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar');
      }
      
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        window.location.href = '/login';
        return;
      }
      
      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginData.user));
      
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      
      if (redirectAfterLogin) {
        window.location.href = redirectAfterLogin;
      } else {
        window.location.href = '/cliente/menu';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: 40 }}>
      <div style={{ width: '100%', maxWidth: 450, background: 'white', padding: 40, borderRadius: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 48 }}>♥</span>
          <h1 style={{ color: '#e63946', marginTop: 8 }}>Red Velvet</h1>
          <p style={{ color: '#6c757d' }}>Crea tu cuenta</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20 }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Apellido</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
                required
              />
            </div>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#1a1a1a' }}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: 14, border: '2px solid #dee2e6', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: 14, background: '#e63946', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: 24, color: '#6c757d' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#e63946', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;