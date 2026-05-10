import { useState, useEffect } from 'react';
import { cartService, orderService } from '../../services/api';

const CheckoutPage = () => {
  const [items, setItems] = useState([]);
  const [paso, setPaso] = useState(1);
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [referencia, setReferencia] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  useEffect(() => {
    setItems(cartService.getCart());
  }, []);

  const total = cartService.getTotal();

  const confirmarPedido = async () => {
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    
    setCargando(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const pedido = await orderService.createOrder({
        cliente_id: user.id,
        tipo: 'domicilio',
        direccion_entrega: direccion,
        ciudad,
        referencia,
        items: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          observaciones: item.observations
        }))
      });
      cartService.clearCart();
      setPedidoConfirmado(pedido);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (pedidoConfirmado) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 40, maxWidth: 500, margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✓</div>
          <h2 style={{ color: '#1a1a1a', marginBottom: 16 }}>¡Pedido Confirmado!</h2>
          <p style={{ color: '#6b7280' }}>Número de pedido: <strong style={{ color: '#e63946' }}>#{pedidoConfirmado.numero_pedido}</strong></p>
          <p style={{ color: '#6b7280', marginTop: 8 }}>Te notificaremos cuando esté listo.</p>
          <a 
            href="/cliente/menu" 
            style={{ 
              display: 'inline-block', 
              marginTop: 24, 
              padding: '12px 24px', 
              background: '#e63946', 
              color: 'white', 
              textDecoration: 'none', 
              borderRadius: 8 
            }}
          >
            Volver al Menú
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: '#1a1a1a', marginBottom: 24 }}>Checkout</h1>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[
          { num: 1, label: 'Revisar' },
          { num: 2, label: 'Dirección' },
          { num: 3, label: 'Pago' }
        ].map((p) => (
          <div
            key={p.num}
            style={{
              padding: '10px 20px',
              background: paso === p.num ? '#e63946' : '#ffffff',
              color: paso === p.num ? 'white' : '#374151',
              borderRadius: 20,
              fontWeight: paso === p.num ? 600 : 400,
              border: paso === p.num ? 'none' : '2px solid #e5e7eb'
            }}
          >
            {p.num}. {p.label}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {paso === 1 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>Resumen del Pedido</h2>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <div>
                <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{item.name}</span>
                {item.toppings && item.toppings.length > 0 && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#7c3aed' }}>
                    + {item.toppings.map(t => t.nombre).join(', ')}
                  </p>
                )}
                {item.observations && (
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                    Obs: {item.observations}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#1a1a1a' }}>x{item.cantidad}</span>
                <span style={{ color: '#e63946', fontWeight: 600, marginLeft: 8 }}>
                  ${((parseFloat(item.precio) + (item.toppings?.reduce((t, top) => t + parseFloat(top.precio), 0) || 0)) * item.cantidad).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '2px solid #e5e7eb', marginTop: 8 }}>
            <h3 style={{ margin: 0, color: '#1a1a1a' }}>Total:</h3>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#e63946' }}>${total.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => setPaso(2)} 
            style={{ 
              width: '100%', 
              padding: 14, 
              background: '#e63946', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              marginTop: 16,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Siguiente →
          </button>
        </div>
      )}

      {paso === 2 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>Dirección de Entrega</h2>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Dirección *</label>
            <input
              type="text"
              placeholder="Calle, número, edificio..."
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Ciudad *</label>
            <input
              type="text"
              placeholder="Ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#374151' }}>Referencia (opcional)</label>
            <input
              type="text"
              placeholder="Entre calles, punto de referencia..."
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 16, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button 
              onClick={() => setPaso(1)}
              style={{ 
                flex: 1, 
                padding: 12, 
                background: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              ← Atrás
            </button>
            <button 
              onClick={() => setPaso(3)}
              disabled={!direccion || !ciudad}
              style={{ 
                flex: 2, 
                padding: 12, 
                background: '#e63946', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                cursor: (!direccion || !ciudad) ? 'not-allowed' : 'pointer',
                opacity: (!direccion || !ciudad) ? 0.6 : 1
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {paso === 3 && (
        <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>Método de Pago</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { value: 'efectivo', label: '💵 Efectivo', desc: 'Paga al recibir' },
              { value: 'tarjeta', label: '💳 Tarjeta', desc: 'Visa, Mastercard' },
              { value: 'transferencia', label: '🏦 Transferencia', desc: 'Bancomer, Santander' }
            ].map((metodo) => (
              <label 
                key={metodo.value}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                  border: `2px solid ${metodoPago === metodo.value ? '#e63946' : '#e5e7eb'}`,
                  borderRadius: 8,
                  background: metodoPago === metodo.value ? '#fef2f2' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value={metodo.value}
                  checked={metodoPago === metodo.value}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  style={{ width: 20, height: 20 }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{metodo.label}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>{metodo.desc}</span>
                </div>
              </label>
            ))}
          </div>
          
          <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Total a pagar:</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#e63946' }}>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button 
              onClick={() => setPaso(2)}
              style={{ 
                flex: 1, 
                padding: 12, 
                background: '#f3f4f6', 
                color: '#374151', 
                border: 'none', 
                borderRadius: 8, 
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              ← Atrás
            </button>
            <button 
              onClick={confirmarPedido}
              disabled={cargando}
              style={{ 
                flex: 2, 
                padding: 14, 
                background: '#059669', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                cursor: cargando ? 'wait' : 'pointer',
                fontSize: 16,
                fontWeight: 600
              }}
            >
              {cargando ? 'Procesando...' : '✓ Confirmar Pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;