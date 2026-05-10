import { useState, useEffect } from 'react';
import { toppingService } from '../../services/api';

const Toppings = () => {
  const [toppings, setToppings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', categoria: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarToppings();
  }, []);

  const cargarToppings = async () => {
    try {
      const data = await toppingService.getToppings();
      setToppings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    setSaving(true);
    try {
      const data = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: parseFloat(form.precio) || 0,
        categoria: form.categoria || null
      };

      if (editingId) {
        await toppingService.updateTopping(editingId, data);
      } else {
        await toppingService.createTopping(data);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ nombre: '', descripcion: '', precio: '', categoria: '' });
      cargarToppings();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editar = (topping) => {
    setEditingId(topping.id);
    setForm({
      nombre: topping.nombre,
      descripcion: topping.descripcion || '',
      precio: topping.precio,
      categoria: topping.categoria || ''
    });
    setShowForm(true);
  };

  const eliminar = async (id, nombre) => {
    if (confirm(`¿Desactivar "${nombre}"?`)) {
      try {
        await toppingService.deleteTopping(id);
        cargarToppings();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1a1a1a' }}>Toppings</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ nombre: '', descripcion: '', precio: '', categoria: '' }); }} style={{ padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24, maxWidth: 500 }}>
          <h3>{editingId ? 'Editar Topping' : 'Nuevo Topping'}</h3>
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <input placeholder="Precio" type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
            <input placeholder="Categoría (opcional)" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
          </div>
          <button onClick={guardar} disabled={saving} style={{ padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden' }}>
        {toppings.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>No hay toppings creados</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>NOMBRE</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>DESCRIPCION</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>CATEGORIA</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>PRECIO</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {toppings.map(t => (
                <tr key={t.id} style={{ borderTop: '1px solid #dee2e6' }}>
                  <td style={{ padding: 16, fontWeight: 500, color: '#1a1a1a' }}>{t.nombre}</td>
                  <td style={{ padding: 16, color: '#4b5563', fontSize: 14 }}>{t.descripcion || '-'}</td>
                  <td style={{ padding: 16 }}>
                    {t.categoria && <span style={{ padding: '4px 12px', background: '#f3f4f6', color: '#4b5563', borderRadius: 20, fontSize: 12 }}>{t.categoria}</span>}
                  </td>
                  <td style={{ padding: 16, fontWeight: 600, color: '#e63946' }}>${parseFloat(t.precio).toFixed(2)}</td>
                  <td style={{ padding: 16 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => editar(t)} style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Editar</button>
                      <button onClick={() => eliminar(t.id, t.nombre)} style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Toppings;