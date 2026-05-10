import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';

const MyOrdersPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userEmail = user.email || user.email_cliente || '';
      const data = await orderService.getOrders();
      const misPedidos = data.filter(p => 
        String(p.cliente_id) === String(user.id) || 
        p.cliente_email === userEmail ||
        (userEmail && p.cliente_email && p.cliente_email.toLowerCase() === userEmail.toLowerCase())
      );
      setPedidos(misPedidos);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (id) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrders(newExpanded);
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: { bg: '#fef3c7', color: '#92400e', icon: '⏳' },
      en_cocina: { bg: '#dbeafe', color: '#1e40af', icon: '👨‍🍳' },
      listo: { bg: '#d1fae5', color: '#065f46', icon: '✓' },
      entregado: { bg: '#e0e7ff', color: '#3730a3', icon: '✅' },
      cancelado: { bg: '#fee2e2', color: '#991b1b', icon: '❌' }
    };
    return colores[estado] || { bg: '#f3f4f6', color: '#374151', icon: '❓' };
  };

  const getSiguienteEstado = (estado) => {
    const flujo = {
      pendiente: 'en_cocina',
      en_cocina: 'listo',
      listo: 'entregado'
    };
    return flujo[estado];
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    if (!confirm('¿Confirmar que el pedido está listo?')) return;
    try {
      await orderService.updateStatus(id, nuevoEstado);
      cargarPedidos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const pedidosActivos = pedidos.filter(p => !['entregado', 'cancelado'].includes(p.estado));
  const pedidosHistorial = pedidos.filter(p => ['entregado', 'cancelado'].includes(p.estado));

  const filteredPedidos = filtro === 'activos' ? pedidosActivos : 
                         filtro === 'historial' ? pedidosHistorial : 
                         pedidos;

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#1a1a1a' }}>
      <p>Cargando pedidos...</p>
    </div>
  );

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: '#1a1a1a', marginBottom: 24 }}>Mis Pedidos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos', count: pedidos.length },
          { key: 'activos', label: 'En Proceso', count: pedidosActivos.length },
          { key: 'historial', label: 'Historial', count: pedidosHistorial.length }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 14,
              background: filtro === f.key ? '#e63946' : '#ffffff',
              color: filtro === f.key ? '#ffffff' : '#374151',
              fontWeight: filtro === f.key ? 600 : 400,
              border: filtro === f.key ? 'none' : '2px solid #e5e7eb'
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {pedidosActivos.length > 0 && (
        <div style={{ background: '#fef3c7', borderRadius: 12, padding: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <div>
            <p style={{ margin: 0, color: '#92400e', fontWeight: 600 }}>
              {pedidosActivos.length} pedido(s) en proceso
            </p>
            <p style={{ margin: '4px 0 0', color: '#b45309', fontSize: 13 }}>
              Te notificaremos cuando esté listo para recoger/entregar
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredPedidos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📦</span>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>No tienes pedidos</p>
            <a 
              href="/cliente/menu" 
              style={{ 
                padding: '12px 24px', 
                background: '#e63946', 
                color: 'white', 
                textDecoration: 'none', 
                borderRadius: 8 
              }}
            >
              Ver Menú
            </a>
          </div>
        ) : (
          filteredPedidos.map((pedido) => {
            const estadoStyle = getEstadoColor(pedido.estado);
            const isExpanded = expandedOrders.has(pedido.id);
            const detalles = pedido.detalles || [];
            const siguienteEstado = getSiguienteEstado(pedido.estado);

            return (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h3 style={{ margin: 0, color: '#1a1a1a' }}>Pedido #{pedido.numero_pedido}</h3>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {estadoStyle.icon} {pedido.estado?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      {new Date(pedido.creado_en).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      background: pedido.tipo === 'domicilio' ? '#ede9fe' : '#dbeafe',
                      color: pedido.tipo === 'domicilio' ? '#6d28d9' : '#1e40af'
                    }}>
                      {pedido.tipo === 'domicilio' ? '🏠 Domicilio' : '🍽️ Local'}
                    </span>
                  </div>
                </div>

                {pedido.direccion_entrega && (
                  <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#6b7280' }}>
                    📍 Entregar en: {pedido.direccion_entrega}{pedido.ciudad ? `, ${pedido.ciudad}` : ''}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>TOTAL</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 24, color: '#e63946' }}>
                      ${parseFloat(pedido.total || 0).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {siguienteEstado && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, siguienteEstado)}
                        style={{ 
                          padding: '8px 16px', 
                          background: '#059669', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: 'pointer',
                          fontSize: 13
                        }}
                      >
                        ✓ Confirmar recibido
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleOrderDetails(pedido.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0369a1',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
                  {detalles.length} producto(s) - {isExpanded ? 'Ocultar' : 'Ver detalles'}
                </button>

                {isExpanded && detalles.length > 0 && (
                  <div style={{ marginTop: 12, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>PRODUCTO</th>
                          <th style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>CANT.</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((det, index) => (
                          <tr key={index}>
                            <td style={{ padding: '10px 0', color: '#1a1a1a' }}>
                              {det.cantidad}x {det.producto_nombre || 'Producto'}
                              {det.observaciones && (
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Obs: {det.observaciones}</p>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', padding: '10px 0', color: '#1a1a1a' }}>{det.cantidad}</td>
                            <td style={{ textAlign: 'right', padding: '10px 0', color: '#e63946', fontWeight: 600 }}>
                              ${(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {pedido.estado === 'cancelado' && pedido.motivo_cancelacion && (
                  <div style={{ marginTop: 12, padding: 12, background: '#fee2e2', borderRadius: 8 }}>
                    <p style={{ margin: 0, color: '#991b1b', fontSize: 13 }}>
                      <strong>Motivo de cancelación:</strong> {pedido.motivo_cancelacion}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;