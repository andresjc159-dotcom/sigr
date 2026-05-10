import { useState, useEffect } from 'react';
import { productService } from '../../services/api';

const AdminInventory = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);
  const [stockAction, setStockAction] = useState('sumar');
  const [stockAmount, setStockAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    try {
      const data = await productService.getProducts();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirAjustarStock = (producto) => {
    setEditingStock(producto);
    setStockAmount('');
    setStockAction('sumar');
  };

  const cerrarAjustarStock = () => {
    setEditingStock(null);
    setStockAmount('');
  };

  const ajustarStock = async () => {
    if (!stockAmount || parseInt(stockAmount) <= 0) {
      alert('Ingresa una cantidad válida');
      return;
    }

    setAdjusting(true);
    try {
      const cantidad = parseInt(stockAmount);
      await productService.updateStock(editingStock.id, cantidad);
      cerrarAjustarStock();
      cargarInventario();
    } catch (error) {
      alert('Error al ajustar stock: ' + error.message);
    } finally {
      setAdjusting(false);
    }
  };

  const bajoStock = productos.filter(p => p.stock !== null && p.stock < 5);
  const sinStock = productos.filter(p => p.stock !== null && p.stock === 0);

  if (loading) {
    return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando inventario...</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24, color: '#1a1a1a' }}>Inventario</h1>
      
      {sinStock.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #dc2626', marginBottom: 24, background: '#fef2f2' }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 8px 0' }}>Sin Stock</h3>
          {sinStock.map((prod) => (
            <p key={prod.id} style={{ margin: '4px 0', color: '#991b1b' }}>{prod.nombre}</p>
          ))}
        </div>
      )}
      
      {bajoStock.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: 24, background: '#fffbeb' }}>
          <h3 style={{ color: '#d97706', margin: '0 0 8px 0' }}>Stock Bajo</h3>
          {bajoStock.map((prod) => (
            <p key={prod.id} style={{ margin: '4px 0', color: '#92400e' }}>{prod.nombre}: {prod.stock} unidades</p>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {productos.map((prod) => (
          <div key={prod.id} className="card" style={{ background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#1a1a1a' }}>{prod.nombre}</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#6b7280' }}>{prod.categoria_nombre || 'Sin categoría'}</p>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: 12,
                fontSize: 11,
                fontWeight: 600,
                background: prod.stock === 0 ? '#fee2e2' : prod.stock < 5 ? '#fef3c7' : '#d1fae5',
                color: prod.stock === 0 ? '#991b1b' : prod.stock < 5 ? '#92400e' : '#065f46'
              }}>
                {prod.stock === 0 ? 'AGOTADO' : prod.stock < 5 ? 'BAJO' : 'OK'}
              </span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginTop: 16,
              padding: '12px',
              background: '#f9fafb',
              borderRadius: 8
            }}>
              <div>
                <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Stock Actual</span>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1a1a1a' }}>
                  {prod.stock ?? '∞'}
                </p>
              </div>
              <button
                onClick={() => abrirAjustarStock(prod)}
                style={{
                  padding: '8px 16px',
                  background: '#e63946',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                Ajustar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingStock && (
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
            padding: 32,
            borderRadius: 16,
            width: 400,
            maxWidth: '90%'
          }}>
            <h2 style={{ margin: '0 0 24px 0', color: '#1a1a1a' }}>
              Ajustar Stock: {editingStock.nombre}
            </h2>
            <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
              Stock actual: <strong>{editingStock.stock ?? '∞'}</strong>
            </p>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setStockAction('sumar')}
                style={{
                  flex: 1,
                  padding: 12,
                  border: '2px solid',
                  borderColor: stockAction === 'sumar' ? '#059669' : '#e5e7eb',
                  background: stockAction === 'sumar' ? '#d1fae5' : 'white',
                  color: stockAction === 'sumar' ? '#059669' : '#6b7280',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                + Agregar
              </button>
              <button
                onClick={() => setStockAction('restar')}
                style={{
                  flex: 1,
                  padding: 12,
                  border: '2px solid',
                  borderColor: stockAction === 'restar' ? '#dc2626' : '#e5e7eb',
                  background: stockAction === 'restar' ? '#fee2e2' : 'white',
                  color: stockAction === 'restar' ? '#dc2626' : '#6b7280',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                - Quitar
              </button>
            </div>
            
            <input
              type="number"
              min="1"
              value={stockAmount}
              onChange={(e) => setStockAmount(e.target.value)}
              placeholder="Cantidad"
              style={{
                width: '100%',
                padding: 12,
                fontSize: 16,
                border: '2px solid #e5e7eb',
                borderRadius: 8,
                marginBottom: 24,
                boxSizing: 'border-box'
              }}
            />
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={cerrarAjustarStock}
                disabled={adjusting}
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
                Cancelar
              </button>
              <button
                onClick={ajustarStock}
                disabled={adjusting}
                style={{
                  flex: 1,
                  padding: 12,
                  background: stockAction === 'sumar' ? '#059669' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  cursor: adjusting ? 'wait' : 'pointer',
                  fontWeight: 600,
                  opacity: adjusting ? 0.7 : 1
                }}
              >
                {adjusting ? 'Guardando...' : stockAction === 'sumar' ? 'Agregar' : 'Quitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;