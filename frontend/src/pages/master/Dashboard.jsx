import { useState, useEffect } from 'react';
import { salesService } from '../../services/api';

const MasterDashboard = () => {
  const [stats, setStats] = useState({ total_pedidos: '0', total_facturado: '0', ticket_promedio: '0' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      const data = await salesService.getDaily();
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 32 }}>Dashboard</h1>
      
      {error && (
        <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 24 }}>
          {error}
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Pedidos Hoy</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#e63946' }}>{stats.total_pedidos}</div>
        </div>
        
        <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Facturado Hoy</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#2a9d8f' }}>${stats.total_facturado}</div>
        </div>
        
        <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
          <div style={{ fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Ticket Promedio</div>
          <div style={{ fontSize: 36, fontWeight: 'bold', color: '#f4a261' }}>${stats.ticket_promedio}</div>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
