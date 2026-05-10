import { useState, useEffect } from 'react';
import { menuService, productService, cartService } from '../../services/api';

const API_BASE = 'http://localhost:3000/api/v1';
const IMG_BASE = 'http://localhost:3000';

const MenuPage = () => {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [toppings, setToppings] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [observaciones, setObservaciones] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const [catsData, prodsData, topsData] = await Promise.all([
        fetch(`${API_BASE}/categorias`).then(r => r.json()),
        productService.getProducts(),
        fetch(`${API_BASE}/toppings`).then(r => r.json())
      ]);
      setCategorias(catsData);
      setProductos(prodsData);
      setToppings(topsData || []);
      setCart(cartService.getCart());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrar = async (catId) => {
    setCategoria(catId);
    if (catId) {
      const prods = await productService.getProducts();
      setProductos(prods.filter(p => p.categoria_id === catId));
    } else {
      const prods = await productService.getProducts();
      setProductos(prods);
    }
  };

  const abrirModal = (producto) => {
    setSelectedProduct(producto);
    setSelectedToppings([]);
    setObservaciones('');
    setCantidad(1);
    setShowModal(true);
  };

  const agregarAlCarrito = () => {
    if (!selectedProduct) return;
    
    const toppingsSeleccionados = toppings.filter(t => selectedToppings.includes(t.id));
    const precioToppings = toppingsSeleccionados.reduce((sum, t) => sum + parseFloat(t.precio), 0);
    
    cartService.addItem(selectedProduct, cantidad, observaciones, toppingsSeleccionados);
    setCart(cartService.getCart());
    setShowModal(false);
  };

  const quitarItem = (index) => {
    const currentCart = cartService.getCart();
    currentCart.splice(index, 1);
    cartService.saveCart(currentCart);
    setCart([...currentCart]);
  };

  const vaciarCarrito = () => {
    cartService.clearCart();
    setCart([]);
  };

  const irCheckout = () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    const user = localStorage.getItem('user');
    if (!user) {
      localStorage.setItem('redirectAfterLogin', '/cliente/checkout');
      window.location.href = '/login';
    } else {
      window.location.href = '/cliente/checkout';
    }
  };

  const totalCarrito = cart.reduce((sum, item) => sum + (parseFloat(item.precio) + (item.toppings?.reduce((t, top) => t + parseFloat(top.precio), 0) || 0)) * item.cantidad, 0);
  const productosActivos = productos.filter(p => p.estado === 'activo');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <header style={{ background: '#ffffff', padding: '16px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#1a1a1a', fontSize: 24 }}>Nuestro Menú</h1>
          <button 
            onClick={() => setShowCart(!showCart)}
            style={{ 
              padding: '12px 24px', 
              background: '#e63946', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: 8, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 16,
              fontWeight: 600
            }}
          >
            🛒 Carrito ({cart.length})
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => filtrar(null)} style={{ padding: '10px 20px', background: !categoria ? '#e63946' : '#ffffff', color: !categoria ? '#ffffff' : '#1a1a1a', border: '1px solid #e5e7eb', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>
            Todos
          </button>
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => filtrar(cat.id)} style={{ padding: '10px 20px', background: categoria === cat.id ? '#e63946' : '#ffffff', color: categoria === cat.id ? '#ffffff' : '#1a1a1a', border: '1px solid #e5e7eb', borderRadius: 20, cursor: 'pointer', fontWeight: 500 }}>
              {cat.nombre}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
          {productosActivos.map(producto => (
            <div key={producto.id} style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {producto.imagen && (
                <img 
                  src={producto.imagen && producto.imagen.startsWith('http') ? producto.imagen : `${IMG_BASE}${producto.imagen}`} 
                  alt={producto.nombre} 
                  style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div style={{ padding: 16, background: '#ffffff' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1a1a1a', fontSize: 18, fontWeight: 600 }}>{producto.nombre}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 12px 0', lineHeight: 1.4 }}>{producto.descripcion || 'Delicioso platillo'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 'bold', color: '#e63946' }}>${parseFloat(producto.precio).toFixed(2)}</span>
                  <button onClick={() => abrirModal(producto)} style={{ padding: '10px 20px', background: '#e63946', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}>
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {productosActivos.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>No hay productos disponibles</p>}
      </div>

      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          background: '#ffffff',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: 20, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1a1a1a' }}>Carrito de Compras</h2>
            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: 40 }}>El carrito está vacío</p>
            ) : (
              cart.map((item, index) => (
                <div key={index} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{item.name}</span>
                    <button onClick={() => quitarItem(index)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 4, cursor: 'pointer', padding: '2px 8px' }}>×</button>
                  </div>
                  <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>Cantidad: {item.cantidad}</p>
                  {item.toppings && item.toppings.length > 0 && (
                    <p style={{ margin: '4px 0', fontSize: 12, color: '#7c3aed' }}>
                      Toppings: {item.toppings.map(t => t.nombre).join(', ')}
                    </p>
                  )}
                  {item.observations && (
                    <p style={{ margin: '4px 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                      Obs: {item.observations}
                    </p>
                  )}
                  <p style={{ margin: '4px 0', fontSize: 14, color: '#e63946', fontWeight: 600 }}>
                    ${((parseFloat(item.precio) + (item.toppings?.reduce((t, top) => t + parseFloat(top.precio), 0) || 0)) * item.cantidad).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: 20, borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#1a1a1a' }}>
                <span>Total:</span>
                <span style={{ color: '#e63946' }}>${totalCarrito.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={vaciarCarrito} style={{ flex: 1, padding: 12, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Vaciar
                </button>
                <button onClick={irCheckout} style={{ flex: 2, padding: 12, background: '#e63946', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                  Ir al Pago
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && selectedProduct && (
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
          zIndex: 300
        }}>
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 24, width: 450, maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#1a1a1a' }}>{selectedProduct.nombre}</h2>
                <p style={{ margin: '4px 0 0', color: '#e63946', fontSize: 18, fontWeight: 600 }}>
                  ${parseFloat(selectedProduct.precio).toFixed(2)}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>

            {toppings.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, display: 'block' }}>
                  Toppings (+)
                </label>
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
                        padding: '8px 14px',
                        border: '2px solid',
                        borderColor: selectedToppings.includes(String(t.id)) ? '#7c3aed' : '#e5e7eb',
                        background: selectedToppings.includes(String(t.id)) ? '#ede9fe' : '#ffffff',
                        color: selectedToppings.includes(String(t.id)) ? '#6d28d9' : '#374151',
                        borderRadius: 20,
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      {t.nombre} (+${parseFloat(t.precio).toFixed(2)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, display: 'block' }}>
                Cantidad
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button 
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  style={{ width: 40, height: 40, background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 20, cursor: 'pointer' }}
                >-</button>
                <span style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{cantidad}</span>
                <button 
                  onClick={() => setCantidad(cantidad + 1)}
                  style={{ width: 40, height: 40, background: '#f3f4f6', border: 'none', borderRadius: 8, fontSize: 20, cursor: 'pointer' }}
                >+</button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, display: 'block' }}>
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ej: sin cebolla, bien cocido..."
                style={{ width: '100%', padding: 12, border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14, minHeight: 80, resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <button
              onClick={agregarAlCarrito}
              style={{ width: '100%', padding: 14, background: '#e63946', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;