import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../../services/api';
import { IMG_BASE } from '../../config';

const CartPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(cartService.getCart());
  }, []);

  const actualizarCantidad = (index, cantidad) => {
    if (cantidad <= 0) {
      eliminarItem(index);
      return;
    }
    const nuevoCarrito = cartService.updateQuantity(index, cantidad);
    setItems([...nuevoCarrito]);
  };

  const eliminarItem = (index) => {
    const nuevoCarrito = cartService.removeItem(index);
    setItems([...nuevoCarrito]);
  };

  const total = cartService.getTotal();

  if (items.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1 style={{ color: '#1a1a1a' }}>Carrito de Compras</h1>
        <p style={{ color: '#6b7280', marginTop: 16 }}>Tu carrito está vacío</p>
        <Link 
          to="/cliente/menu" 
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
          Ver Menú
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ color: '#1a1a1a', marginBottom: 24 }}>Carrito de Compras</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, index) => (
          <div key={index} style={{ background: 'white', borderRadius: 12, padding: 20, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            {item.imagen && (
              <img 
                src={item.imagen && item.imagen.startsWith('http') ? item.imagen : `${IMG_BASE}${item.imagen}`} 
                alt={item.name} 
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#1a1a1a' }}>{item.name}</h3>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: 14 }}>${parseFloat(item.precio).toFixed(2)}</p>
              {item.toppings && item.toppings.length > 0 && (
                <p style={{ margin: '0 0 4px 0', color: '#7c3aed', fontSize: 12 }}>
                  Toppings: {item.toppings.map(t => t.nombre).join(', ')}
                </p>
              )}
              {item.observations && (
                <p style={{ margin: 0, color: '#6b7280', fontSize: 12, fontStyle: 'italic' }}>Obs: {item.observations}</p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                style={{ width: 36, height: 36, background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer' }}
              >-</button>
              <span style={{ fontSize: 18, fontWeight: 600, minWidth: 30, textAlign: 'center' }}>{item.cantidad}</span>
              <button 
                onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                style={{ width: 36, height: 36, background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer' }}
              >+</button>
              <button 
                onClick={() => eliminarItem(index)}
                style={{ padding: '8px 16px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginTop: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#1a1a1a' }}>Total:</h2>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#e63946' }}>${total.toFixed(2)}</span>
        </div>
        <Link 
          to="/cliente/checkout" 
          style={{ 
            display: 'block', 
            textAlign: 'center', 
            padding: 14, 
            background: '#e63946', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: 8, 
            fontSize: 16,
            fontWeight: 600 
          }}
        >
          Proceder al Pago
        </Link>
      </div>
    </div>
  );
};

export default CartPage;