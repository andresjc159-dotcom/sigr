import { useState, useEffect } from 'react';
import { orderService } from '../../services/api';

const AdminOrders = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPedidos();
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

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await orderService.updateStatus(id, nuevoEstado);
      cargarPedidos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const abrirModalCancelar = (id) => {
    setCancelOrderId(id);
    setMotivoCancelacion('');
    setShowModal(true);
  };

  const confirmarCancelacion = async () => {
    if (!motivoCancelacion.trim()) {
      alert('Por favor ingresa un motivo de cancelación');
      return;
    }
    setCanceling(true);
    try {
      await orderService.updateStatus(cancelOrderId, 'cancelado', motivoCancelacion);
      setShowModal(false);
      setCancelOrderId(null);
      setMotivoCancelacion('');
      cargarPedidos();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setCanceling(false);
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
      pendiente: { bg: '#fef3c7', color: '#92400e' },
      en_cocina: { bg: '#dbeafe', color: '#1e40af' },
      listo: { bg: '#d1fae5', color: '#065f46' },
      entregado: { bg: '#e0e7ff', color: '#3730a3' },
      cancelado: { bg: '#fee2e2', color: '#991b1b' }
    };
    return colores[estado] || { bg: '#f3f4f6', color: '#374151' };
  };

  const puedeCancelar = (estado) => {
    return ['pendiente', 'en_cocina', 'entregado'].includes(estado);
  };

  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtro);

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando pedidos...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24, color: '#1a1a1a' }}>Pedidos</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {['todos', 'pendiente', 'en_cocina', 'listo', 'entregado', 'cancelado'].map((est) => {
          const count = est === 'todos' ? pedidos.length : pedidos.filter(p => p.estado === est).length;
          return (
            <button
              key={est}
              onClick={() => setFiltro(est)}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 14,
                background: filtro === est ? '#e63946' : '#f3f4f6',
                color: filtro === est ? 'white' : '#374151',
                fontWeight: filtro === est ? 600 : 400
              }}
            >
              {est === 'todos' ? 'Todos' : est.replace('_', ' ').toUpperCase()} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtrados.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6c757d' }}>No hay pedidos</p>
        ) : (
          filtrados.map((pedido) => {
            const estadoStyle = getEstadoColor(pedido.estado);
            const isExpanded = expandedOrders.has(pedido.id);
            const detalles = pedido.detalles || [];
            const esDomicilio = !pedido.mesa_numero;

            return (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <h3 style={{ margin: 0, color: '#1a1a1a' }}>Pedido #{pedido.numero_pedido}</h3>
                      {esDomicilio && (
                        <span style={{ padding: '4px 10px', background: '#ede9fe', color: '#6d28d9', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          DOMICILIO
                        </span>
                      )}
                      {!esDomicilio && (
                        <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                          MESA {pedido.mesa_numero}
                        </span>
                      )}
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
                    {pedido.estado.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
                  {esDomicilio ? (
                    <>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>CLIENTE</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#1a1a1a' }}>
                          {pedido.cliente_nombre ? `${pedido.cliente_nombre} ${pedido.cliente_apellido}` : 'Cliente'}
                        </p>
                        {pedido.cliente_email && <span style={{ fontSize: 12, color: '#6b7280' }}>{pedido.cliente_email}</span>}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>DIRECCIÓN</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#1a1a1a' }}>
                          {pedido.direccion || 'No especificada'}
                        </p>
                        {pedido.telefono && <span style={{ fontSize: 12, color: '#6b7280' }}>Tel: {pedido.telefono}</span>}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>TOTAL</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#e63946', fontSize: 18 }}>${parseFloat(pedido.total || 0).toFixed(2)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>MESA</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#1a1a1a' }}>Mesa {pedido.mesa_numero}</p>
                        {pedido.mesa_ubicacion && <span style={{ fontSize: 12, color: '#6b7280' }}>{pedido.mesa_ubicacion}</span>}
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>CLIENTE</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 500, color: '#1a1a1a' }}>
                          {pedido.cliente_nombre ? `${pedido.cliente_nombre} ${pedido.cliente_apellido}` : 'No registrado'}
                        </p>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>TOTAL</span>
                        <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#e63946', fontSize: 18 }}>${parseFloat(pedido.total || 0).toFixed(2)}</p>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginBottom: 12 }}>
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
                            <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#6c757d' }}>PRODUCTO</th>
                            <th style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: '#6c757d' }}>CANT.</th>
                            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6c757d' }}>PRECIO</th>
                            <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 12, color: '#6c757d' }}>SUBTOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detalles.map((det, index) => (
                            <tr key={index} style={{ borderBottom: index < detalles.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                              <td style={{ padding: '10px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  {det.producto_imagen && (
                                    <img
                                      src={det.producto_imagen.startsWith('/') ? `http://localhost:3000${det.producto_imagen}` : det.producto_imagen}
                                      alt={det.producto_nombre}
                                      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  )}
                                  <div>
                                    <p style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>{det.producto_nombre || 'Producto'}</p>
                                    {det.observaciones && <p style={{ margin: 0, fontSize: 12, color: '#6c757d' }}>{det.observaciones}</p>}
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: '10px 0' }}>{det.cantidad}</td>
                              <td style={{ textAlign: 'right', padding: '10px 0' }}>${parseFloat(det.precio_unitario).toFixed(2)}</td>
                              <td style={{ textAlign: 'right', padding: '10px 0', fontWeight: 600 }}>${parseFloat(det.subtotal || det.precio_unitario * det.cantidad).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'right', padding: '12px 0 0', fontSize: 12, color: '#6c757d' }}>Subtotal</td>
                            <td style={{ textAlign: 'right', padding: '12px 0 0' }}>${parseFloat(pedido.subtotal).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'right', fontSize: 12, color: '#6c757d' }}>Impuesto (10%)</td>
                            <td style={{ textAlign: 'right' }}>${parseFloat(pedido.impuesto).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 600, color: '#e63946' }}>Total</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#e63946' }}>${parseFloat(pedido.total).toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}

                  {isExpanded && detalles.length === 0 && (
                    <div style={{ marginTop: 12, padding: 16, background: '#f8f9fa', borderRadius: 8, color: '#6c757d', textAlign: 'center' }}>
                      Sin detalles del pedido
                    </div>
                  )}
                </div>

                {pedido.motivo_cancelacion && (
                  <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>Motivo de cancelación: </span>
                    <span style={{ color: '#991b1b' }}>{pedido.motivo_cancelacion}</span>
                  </div>
                )}

                {pedido.notas && (
                  <div style={{ padding: 12, background: '#fef9c3', borderRadius: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: '#854d0e', fontWeight: 600 }}>Notas: </span>
                    <span style={{ color: '#854d0e' }}>{pedido.notas}</span>
                  </div>
                )}

                {pedido.estado !== 'cancelado' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {pedido.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'en_cocina')}
                          style={{ padding: '10px 20px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                        >
                          ✓ Confirmar Pedido
                        </button>
                        <button
                          onClick={() => abrirModalCancelar(pedido.id)}
                          style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                        >
                          ✕ Cancelar
                        </button>
                      </>
                    )}

                    {pedido.estado === 'en_cocina' && (
                      <>
                        <button
                          onClick={() => cambiarEstado(pedido.id, 'listo')}
                          style={{ padding: '10px 20px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                        >
                          ✓ Marcar Listo
                        </button>
                        <button
                          onClick={() => abrirModalCancelar(pedido.id)}
                          style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                        >
                          ✕ Cancelar
                        </button>
                      </>
                    )}

                    {pedido.estado === 'listo' && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, 'entregado')}
                        style={{ padding: '10px 20px', background: '#2a9d8f', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                      >
                        ✓ Confirmar Entregado
                      </button>
                    )}

                    {pedido.estado === 'entregado' && (
                      <>
                        <span style={{ padding: '10px 20px', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          ✓ Pedido Completado
                        </span>
                        <button
                          onClick={() => abrirModalCancelar(pedido.id)}
                          style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                        >
                          ✕ Cancelar
                        </button>
                      </>
                    )}
                  </div>
                )}

                {pedido.estado === 'cancelado' && (
                  <span style={{ padding: '10px 20px', background: '#fee2e2', color: '#991b1b', borderRadius: 8, fontWeight: 500, display: 'inline-block' }}>
                    ✕ Pedido Cancelado
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            maxWidth: 450,
            width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <h2 style={{ marginTop: 0 }}>Cancelar Pedido</h2>
            <p style={{ color: '#6c757d' }}>Por favor ingresa el motivo de la cancelación</p>
            <textarea
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
              placeholder="Ej: Cliente canceló, Sin ingredientes, Error en el pedido..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: 12,
                border: '2px solid #dee2e6',
                borderRadius: 8,
                fontSize: 14,
                resize: 'vertical',
                marginBottom: 16,
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                disabled={canceling}
                style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Volver
              </button>
              <button
                onClick={confirmarCancelacion}
                disabled={canceling}
                style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
              >
                {canceling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;