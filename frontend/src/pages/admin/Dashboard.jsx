import { useState, useEffect } from 'react';
import { salesService } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_pedidos: 0, total_facturado: 0, ticket_promedio: 0 });

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    const data = await salesService.getDaily();
    setStats(data);
  };

  const [rango, setRango] = useState('dia');
  const cambiarRango = async (nuevoRango) => {
    setRango(nuevoRango);
    const data = nuevoRango === 'semana' 
      ? await salesService.getWeekly() 
      : nuevoRango === 'mes' 
        ? await salesService.getMonthly()
        : await salesService.getDaily();
    setStats(data);
  };

  return (
    <div className="container">
      <h1>Dashboard Administrador</h1>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['dia', 'semana', 'mes'].map((r) => (
          <button key={r} className={`btn ${rango === r ? 'btn-primary' : 'btn-secondary'}`} onClick={() => cambiarRango(r)}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3>Pedidos</h3>
          <p style={{ fontSize: 32 }}>{stats.total_pedidos || 0}</p>
        </div>
        <div className="card">
          <h3>Total Facturado</h3>
          <p style={{ fontSize: 32 }}>${stats.total_facturado || 0}</p>
        </div>
        <div className="card">
          <h3>Ticket Promedio</h3>
          <p style={{ fontSize: 32 }}>${stats.ticket_promedio || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;