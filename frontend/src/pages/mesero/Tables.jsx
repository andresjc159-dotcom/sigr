import { useState, useEffect } from 'react';
import { tableService, productService, categoryService, toppingService, orderService } from '../../services/api';

const MeseroTables = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [mesaOrders, setMesaOrders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarMesas, 5000);
    return () => clearInterval(interval);
  }, []);

  const cargarDatos = async () => {
    try {
      const [mesasData, catsData, prodsData, topsData] = await Promise.all([
        tableService.getTables(),
        categoryService.getCategories(),
        productService.getProducts(),
        toppingService.getToppings()
      ]);
      setMesas(mesasData);
      setCategorias(catsData);
      setProductos(prodsData);
      setToppings(topsData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarMesas = async () => {
    const data = await tableService.getTables();
    setMesas(data);
  };

  const cargarPedidosMesa = async (mesaId) => {
    try {
      const orders = await orderService.getOrders();
      const pedidosMesa = orders.filter(o => o.mesa_id === mesaId);
      setMesaOrders(pedidosMesa);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    }
  };

  const seleccionarMesa = (mesa) => {
    setSelectedMesa(mesa);
    setOrderItems([]);
    setSelectedProduct(null);
    setSelectedToppings([]);
    setCantidad(1);
    setObservaciones('');
    cargarPedidosMesa(mesa.id);
  };

  const cerrarPedido = () => {
    setSelectedMesa(null);
    setOrderItems([]);
    setMesaOrders([]);
  };

  const agregarItem = () => {
    if (!selectedProduct) {
      alert('Selecciona un producto');
      return;
    }
    
    const producto = productos.find(p => String(p.id) === String(selectedProduct));
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }
    
    const toppingsSeleccionados = toppings.filter(t => selectedToppings.includes(String(t.id)));
    const precioToppings = toppingsSeleccionados.reduce((sum, t) => sum + parseFloat(t.precio), 0);
    
    const item = {
      id: Date.now(),
      producto_id: producto.id,
      producto_nombre: producto.nombre,
      precio_unitario: parseFloat(producto.precio),
      cantidad: cantidad,
      observaciones: observaciones,
      toppings: toppingsSeleccionados,
      precio_total: (parseFloat(producto.precio) + precioToppings) * cantidad
    };

    setOrderItems([...orderItems, item]);
    setSelectedProduct(null);
    setSelectedToppings([]);
    setCantidad(1);
    setObservaciones('');
  };

  const quitarItem = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const guardarPedido = async () => {
    if (orderItems.length === 0) {
      alert('Agrega al menos un producto al pedido');
      return;
    }

    setSaving(true);
    try {
      const items = orderItems.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        observaciones: item.observaciones
      }));

      await orderService.createOrder({
        mesa_id: selectedMesa.id,
        tipo: 'local',
        mesero_id: JSON.parse(localStorage.getItem('user'))?.id,
        items: items
      });

      alert('Pedido creado exitosamente');
      await tableService.updateStatus(selectedMesa.id, 'ocupada');
      cargarMesas();
      setOrderItems([]);
      cargarPedidosMesa(selectedMesa.id);
    } catch (error) {
      alert('Error al crear pedido: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const liberarMesa = async () => {
    if (!confirm('¿Liberar esta mesa? La mesa quedará disponible.')) return;
    
    try {
      await tableService.updateStatus(selectedMesa.id, 'disponible');
      alert('Mesa liberada');
      cargarMesas();
      cerrarPedido();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getColor = (estado) => {
    switch (estado) {
      case 'disponible': return '#10b981';
      case 'ocupada': return '#f59e0b';
      case 'reservada': return '#3b82f6';
      default: return '#ef4444';
    }
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.precio_total, 0);
  const impuesto = subtotal * 0.1;
  const total = subtotal + impuesto;

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  if (selectedMesa) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, color: '#1a1a1a' }}>Mesa {selectedMesa.numero}</h1>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              {selectedMesa.estado === 'ocupada' ? 'Con pedidos activos' : 'Libre'}
            </span>
          </div>
          <button onClick={cerrarPedido} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            ← Volver a Mesas
          </button>
        </div>

        {mesaOrders.length > 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: 20, marginBottom: 24, border: '2px solid #e63946' }}>
            <h3 style={{ color: '#1a1a1a', margin: '0 0 16px 0' }}>Pedidos Activos de la Mesa</h3>
            {mesaOrders.map(pedido => {
              const estadoColors = {
                pendiente: { bg: '#fef3c7', color: '#92400e' },
                en_cocina: { bg: '#dbeafe', color: '#1e40af' },
                listo: { bg: '#d1fae5', color: '#065f46' },
                entregado: { bg: '#e0e7ff', color: '#3730a3' },
                cancelado: { bg: '#fee2e2', color: '#991b1b' }
              };
              const estColor = estadoColors[pedido.estado] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <div key={pedido.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>Pedido #{pedido.numero_pedido}</span>
                    <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: estColor.bg, color: estColor.color }}>
                      {pedido.estado?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#6b7280' }}>
                    {new Date(pedido.creado_en).toLocaleString('es-ES')}
                  </p>
                  {(pedido.detalles || []).map((det, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < (pedido.detalles?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <span style={{ fontSize: 14, color: '#1a1a1a' }}>{det.cantidad}x {det.producto_nombre || 'Producto'}</span>
                      <span style={{ fontSize: 14, color: '#e63946' }}>${(parseFloat(det.precio_unitario) * det.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Total:</span>
                    <span style={{ color: '#e63946' }}>${parseFloat(pedido.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 }}>
          <div>
            <div style={{ background: 'white', borderRadius: 12, padding: 20 }}>
              <h3 style={{ color: '#1a1a1a', margin: '0 0 16px 0' }}>Agregar Producto</h3>
              
              <select
                value={selectedProduct || ''}
                onChange={(e) => setSelectedProduct(e.target.value || null)}
                style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, marginBottom: 12, fontSize: 14 }}
              >
                <option value="">Seleccionar producto...</option>
                {categorias.map(cat => {
                  const prods = productos.filter(p => p.categoria_id === cat.id && p.estado === 'activo');
                  if (prods.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={cat.nombre.toUpperCase()}>
                      {prods.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre} - ${parseFloat(p.precio).toFixed(2)}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>

              {selectedProduct && (
                <>
                  {toppings.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, display: 'block' }}>Toppings:</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {toppings.map(t => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setSelectedToppings(prev => 
                                prev.includes(String(t.id)) ? prev.filter(id => id !== String(t.id)) : [...prev, String(t.id)]
                              );
                            }}
                            style={{
                              padding: '6px 12px',
                              border: '2px solid',
                              borderColor: selectedToppings.includes(String(t.id)) ? '#7c3aed' : '#e5e7eb',
                              background: selectedToppings.includes(String(t.id)) ? '#ede9fe' : 'white',
                              color: selectedToppings.includes(String(t.id)) ? '#6d28d9' : '#374151',
                              borderRadius: 20,
                              fontSize: 12,
                              cursor: 'pointer'
                            }}
                          >
                            + {t.nombre} (${parseFloat(t.precio).toFixed(2)})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'block' }}>Cantidad:</label>
                    <input
                      type="number"
                      min="1"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, color: '#6b7280', marginBottom: 4, display: 'block' }}>Observaciones:</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej: sin cebolla, bien cocido..."
                      style={{ width: '100%', padding: 10, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 60, resize: 'vertical' }}
                    />
                  </div>

                  <button
                    onClick={agregarItem}
                    style={{ width: '100%', padding: 12, background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                  >
                    Agregar al Pedido
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: 12, padding: 20, position: 'sticky', top: 20 }}>
              <h3 style={{ color: '#1a1a1a', margin: '0 0 16px 0' }}>Pedido Actual</h3>
              
              {orderItems.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>Sin productos agregados</p>
              ) : (
                <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                  {orderItems.map((item, index) => (
                    <div key={item.id} style={{ padding: '12px 0', borderBottom: index < orderItems.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 500, color: '#1a1a1a' }}>{item.cantidad}x {item.producto_nombre}</p>
                          {item.toppings.length > 0 && (
                            <p style={{ margin: '2px 0', fontSize: 12, color: '#7c3aed' }}>
                              {item.toppings.map(t => t.nombre).join(', ')}
                            </p>
                          )}
                          {item.observaciones && (
                            <p style={{ margin: '2px 0', fontSize: 12, color: '#6b7280' }}>{item.observaciones}</p>
                          )}
                          <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#e63946' }}>${item.precio_total.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => quitarItem(item.id)}
                          style={{ padding: '4px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {orderItems.length > 0 && (
                <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#6b7280' }}>
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#6b7280' }}>
                    <span>Impuesto (10%):</span>
                    <span>${impuesto.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>
                    <span>Total:</span>
                    <span style={{ color: '#e63946' }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                <button
                  onClick={guardarPedido}
                  disabled={saving || orderItems.length === 0}
                  style={{
                    padding: 14,
                    background: orderItems.length === 0 ? '#9ca3af' : '#e63946',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: orderItems.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 16,
                    fontWeight: 600
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar Pedido'}
                </button>
                
                <button
                  onClick={liberarMesa}
                  disabled={selectedMesa.estado === 'disponible'}
                  style={{
                    padding: 14,
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: selectedMesa.estado === 'disponible' ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: selectedMesa.estado === 'disponible' ? 0.6 : 1
                  }}
                >
                  Liberar Mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24, color: '#1a1a1a' }}>Mesas</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16 }}>
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            onClick={() => seleccionarMesa(mesa)}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 20,
              cursor: 'pointer',
              borderLeft: `4px solid ${getColor(mesa.estado)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>Mesa {mesa.numero}</h3>
            <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>Capacidad: {mesa.capacidad}</p>
            <span style={{
              padding: '4px 10px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              background: mesa.estado === 'disponible' ? '#d1fae5' : mesa.estado === 'ocupada' ? '#fef3c7' : '#dbeafe',
              color: mesa.estado === 'disponible' ? '#065f46' : mesa.estado === 'ocupada' ? '#92400e' : '#1e40af'
            }}>
              {mesa.estado.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeseroTables;