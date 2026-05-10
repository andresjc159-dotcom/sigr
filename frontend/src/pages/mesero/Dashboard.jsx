import { useState, useEffect } from 'react';
import { tableService, orderService } from '../../services/api';

const MeseroDashboard = () => {
  const [mesas, setMesas] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [m, p] = await Promise.all([tableService.getTables(), orderService.getOrders()]);
      setMesas(m);
      setPedidos(p);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Cargando...</div>;

  const getColor = (estado) => {
    if (estado === 'disponible') return '#2a9d8f';
    if (estado === 'ocupada') return '#f4a261';
    if (estado === 'reservada') return '#3498db';
    return '#e63946';
  };

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 32 }}>Mesas</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 16 }}>
        {mesas.map(mesa => (
          <div key={mesa.id} style={{ 
            padding: 20, 
            borderRadius: 12, 
            background: getColor(mesa.estado),
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{mesa.numero}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{mesa.estado}</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>{mesa.ubicacion}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 40 }}>Pedidos Recientes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pedidos.length === 0 && <p style={{ color: '#6c757d' }}>No hay pedidos</p>}
        {pedidos.slice(0, 10).map(pedido => (
          <div key={pedido.id} style={{ background: 'white', padding: 16, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 'bold' }}>#{pedido.numero_pedido}</span>
              <span style={{ marginLeft: 16, color: '#6c757d' }}>{pedido.tipo}</span>
            </div>
            <span style={{ fontWeight: 'bold', color: '#e63946' }}>${pedido.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeseroDashboard;