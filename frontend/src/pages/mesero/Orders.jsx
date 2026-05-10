import { useState, useEffect } from 'react';
import { orderService, tableService } from '../../services/api';

const MeseroOrders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('activos');
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [generandoCuenta, setGenerandoCuenta] = useState(null);
  const [ticketPedido, setTicketPedido] = useState(null);

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await orderService.getOrders();
      setPedidos(data);
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

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await orderService.updateStatus(id, nuevoEstado);
      cargarPedidos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const generarCuenta = async (pedido) => {
    if (!confirm('¿Generar cuenta y liberar la mesa?')) return;
    setGenerandoCuenta(pedido.id);
    try {
      if (pedido.mesa_id) {
        await tableService.updateStatus(pedido.mesa_id, 'disponible');
      }
      setTicketPedido(pedido);
      await orderService.updateStatus(pedido.id, 'entregado');
      cargarPedidos();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setGenerandoCuenta(null);
    }
  };

  const cerrarTicket = () => {
    setTicketPedido(null);
  };

  const imprimirTicket = () => {
    window.print();
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: { bg: '#fef3c7', color: '#92400e' },
      en_cocina: { bg: '#dbeafe', color: '#1e40af' },
      listo: { bg: '#d1fae5', color: '#065f46' },
      entregado: { bg: '#e0e7ff', color: '#3730a3' },
      cancelado: { bg: '#fee2e2', color: '#991b1b' }
    };
    return colores[estado] || { bg: '#f3f4f6', color: '#374151' };
  };

  const pedidosActivos = pedidos.filter(p => !['entregado', 'cancelado'].includes(p.estado));
  const pedidosListos = pedidos.filter(p => p.estado === 'listo');
  const pedidosEntregados = pedidos.filter(p => ['entregado', 'cancelado'].includes(p.estado));

  const filteredPedidos = filtro === 'activos' ? pedidosActivos : 
                         filtro === 'listos' ? pedidosListos : 
                         filtro === 'historial' ? pedidosEntregados : 
                         pedidos;

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24, color: '#1a1a1a' }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos', count: pedidos.length },
          { key: 'activos', label: 'Activos', count: pedidosActivos.length },
          { key: 'listos', label: 'Listos para Cuenta', count: pedidosListos.length },
          { key: 'historial', label: 'Historial', count: pedidosEntregados.length }
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
              background: filtro === f.key ? '#e63946' : '#f3f4f6',
              color: filtro === f.key ? 'white' : '#374151',
              fontWeight: filtro === f.key ? 600 : 400
            }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {pedidosListos.length > 0 && (
        <div style={{ background: '#d1fae5', border: '2px solid #059669', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#065f46' }}>
            Pedidos Listos para Generar Cuenta ({pedidosListos.length})
          </h3>
          <p style={{ margin: 0, color: '#065f46', fontSize: 14 }}>
            Estos pedidos están listos. Presiona "Generar Cuenta" para cerrar la cuenta y liberar la mesa.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredPedidos.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280' }}>No hay pedidos</p>
        ) : (
          filteredPedidos.map((pedido) => {
            const estadoStyle = getEstadoColor(pedido.estado);
            const isExpanded = expandedOrders.has(pedido.id);
            const detalles = pedido.detalles || [];

            return (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h3 style={{ margin: 0, color: '#1a1a1a' }}>Pedido #{pedido.numero_pedido}</h3>
                      <span style={{
                        padding: '4px 10px',
                        background: pedido.mesa_numero ? '#dbeafe' : '#ede9fe',
                        color: pedido.mesa_numero ? '#1e40af' : '#6d28d9',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {pedido.mesa_numero ? `MESA ${pedido.mesa_numero}` : 'DOMICILIO'}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>
                      {new Date(pedido.creado_en).toLocaleString('es-ES')}
                    </span>
                  </div>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    background: estadoStyle.bg,
                    color: estadoStyle.color,
                    textTransform: 'capitalize'
                  }}>
                    {pedido.estado?.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>TOTAL</span>
                    <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 24, color: '#e63946' }}>
                      ${parseFloat(pedido.total || 0).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {pedido.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'en_cocina')}
                        style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                      >
                        Enviar a Cocina
                      </button>
                    )}
                    {pedido.estado === 'en_cocina' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'listo')}
                        style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
                      >
                        Marcar Listo
                      </button>
                    )}
                    {pedido.estado === 'listo' && (
                      <button
                        onClick={() => generarCuenta(pedido)}
                        disabled={generandoCuenta === pedido.id}
                        style={{ 
                          padding: '10px 20px', 
                          background: '#059669', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: 8, 
                          cursor: generandoCuenta === pedido.id ? 'wait' : 'pointer', 
                          fontSize: 14,
                          fontWeight: 600
                        }}
                      >
                        {generandoCuenta === pedido.id ? 'Generando...' : '💰 Generar Cuenta'}
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
                  {detalles.length} item(s) - {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                </button>

                {isExpanded && detalles.length > 0 && (
                  <div style={{ marginTop: 12, padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>PRODUCTO</th>
                          <th style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>CANT.</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>PRECIO</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6b7280' }}>SUBTOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalles.map((det, index) => (
                          <tr key={index} style={{ borderBottom: index < detalles.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <td style={{ padding: '10px 0', color: '#1a1a1a' }}>{det.cantidad}x {det.producto_nombre || 'Producto'}</td>
                            <td style={{ textAlign: 'center', padding: '10px 0', color: '#1a1a1a' }}>{det.cantidad}</td>
                            <td style={{ textAlign: 'right', padding: '10px 0', color: '#1a1a1a' }}>${parseFloat(det.precio_unitario).toFixed(2)}</td>
                            <td style={{ textAlign: 'right', padding: '10px 0', color: '#e63946', fontWeight: 600 }}>
                              ${(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {ticketPedido && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            width: 320,
            maxWidth: '90%',
            padding: 24,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: 16, marginBottom: 16 }}>
              <h2 style={{ margin: 0, color: '#1a1a1a', fontSize: 20 }}>♥ RED VELVET</h2>
              <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 12 }}>Gracias por su visita</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>
                <strong>Pedido #:</strong> {ticketPedido.numero_pedido}
              </p>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>
                <strong>Mesa:</strong> {ticketPedido.mesa_numero || 'Domicilio'}
              </p>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>
                <strong>Fecha:</strong> {new Date(ticketPedido.creado_en).toLocaleString('es-ES')}
              </p>
            </div>

            <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '12px 0', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 8 }}>
                <span>PRODUCTO</span>
                <span>SUBTOTAL</span>
              </div>
              {(ticketPedido.detalles || []).map((det, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: '#1a1a1a' }}>
                    {det.cantidad}x {det.producto_nombre || 'Producto'}
                  </span>
                  <span style={{ fontSize: 13, color: '#1a1a1a' }}>
                    ${(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ color: '#1a1a1a' }}>${parseFloat(ticketPedido.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#6b7280' }}>Impuesto (10%)</span>
                <span style={{ color: '#1a1a1a' }}>${parseFloat(ticketPedido.impuesto || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: '#e63946', marginTop: 8 }}>
                <span>TOTAL</span>
                <span>${parseFloat(ticketPedido.total || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', borderTop: '2px dashed #ccc', paddingTop: 16 }}>
              <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>¡Buen provecho!</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={imprimirTicket}
                  style={{ flex: 1, padding: 12, background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={cerrarTicket}
                  style={{ flex: 1, padding: 12, background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeseroOrders;