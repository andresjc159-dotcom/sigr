import { useState, useEffect } from 'react';
import { tableService } from '../../services/api';

const AdminTables = () => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ numero: '', capacidad: '', ubicacion: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      const data = await tableService.getTables();
      setMesas(data);
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
        numero: parseInt(form.numero),
        capacidad: parseInt(form.capacidad),
        ubicacion: form.ubicacion || null
      };

      if (editingId) {
        await tableService.updateTable(editingId, data);
      } else {
        await tableService.createTable(data);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ numero: '', capacidad: '', ubicacion: '' });
      cargarMesas();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const editar = (mesa) => {
    setEditingId(mesa.id);
    setForm({
      numero: mesa.numero.toString(),
      capacidad: mesa.capacidad.toString(),
      ubicacion: mesa.ubicacion || ''
    });
    setShowForm(true);
  };

  const eliminar = async (id, numero) => {
    if (confirm(`¿Desactivar la mesa ${numero}? Esta mesa no estará disponible.`)) {
      try {
        await tableService.deleteTable(id);
        cargarMesas();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await tableService.updateStatus(id, estado);
      cargarMesas();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      disponible: { bg: '#d1fae5', color: '#065f46' },
      ocupada: { bg: '#fee2e2', color: '#991b1b' },
      reservada: { bg: '#dbeafe', color: '#1e40af' },
      fuera_de_servicio: { bg: '#e5e5e5', color: '#6b7280' }
    };
    return colores[estado] || { bg: '#f3f4f6', color: '#374151' };
  };

  const getEstadoIcon = (estado) => {
    const iconos = {
      disponible: '🟢',
      ocupada: '🔴',
      reservada: '🟡',
      fuera_de_servicio: '⚫'
    };
    return iconos[estado] || '⚪';
  };

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1a1a1a' }}>Gestión de Mesas</h1>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ numero: '', capacidad: '', ubicacion: '' }); }} 
          style={{ padding: '12px 24px', background: '#e63946', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : '+ Nueva Mesa'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#ffffff', padding: 24, borderRadius: 12, marginBottom: 24, maxWidth: 500 }}>
          <h3 style={{ marginTop: 0, color: '#1a1a1a' }}>{editingId ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Número de mesa</label>
              <input
                type="number"
                value={form.numero}
                onChange={e => setForm({...form, numero: e.target.value})}
                style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box', color: '#1a1a1a' }}
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Capacidad</label>
              <input
                type="number"
                value={form.capacidad}
                onChange={e => setForm({...form, capacidad: e.target.value})}
                style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box', color: '#1a1a1a' }}
                placeholder="4"
                min="1"
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6c757d', marginBottom: 4 }}>Ubicación</label>
            <input
              type="text"
              value={form.ubicacion}
              onChange={e => setForm({...form, ubicacion: e.target.value})}
              style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box', color: '#1a1a1a' }}
              placeholder="Terraza, Interior, Bar..."
            />
          </div>
          <button onClick={guardar} disabled={saving} style={{ padding: '12px 24px', background: '#e63946', color: '#ffffff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Mesa')}
          </button>
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: 12, overflow: 'hidden' }}>
        {mesas.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: '#6c757d' }}>No hay mesas registradas</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#6c757d' }}>MESA</th>
                <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>UBICACIÓN</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#6c757d' }}>CAPACIDAD</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#6c757d' }}>ESTADO</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#6c757d' }}>CAMBIAR ESTADO</th>
                <th style={{ padding: 16, textAlign: 'center', fontSize: 12, color: '#6c757d' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {mesas.map(mesa => {
                const estadoStyle = getEstadoColor(mesa.estado);
                return (
                  <tr key={mesa.id} style={{ borderTop: '1px solid #dee2e6', color: '#1a1a1a' }}>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      {!mesa.activo ? (
                        <span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>Mesa {mesa.numero}</span>
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: 18, color: '#1a1a1a' }}>{mesa.numero}</span>
                      )}
                    </td>
                    <td style={{ padding: 16, color: '#1a1a1a' }}>{mesa.ubicacion || '-'}</td>
                    <td style={{ padding: 16, textAlign: 'center', color: '#1a1a1a' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {mesa.capacidad} 👤
                      </span>
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: estadoStyle.bg,
                        color: estadoStyle.color
                      }}>
                        {getEstadoIcon(mesa.estado)} {mesa.estado.replace('_', ' ')}
                      </span>
                      {!mesa.activo && (
                        <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#991b1b' }}>(Inactiva)</span>
                      )}
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <select
                        value={mesa.estado}
                        onChange={e => cambiarEstado(mesa.id, e.target.value)}
                        disabled={!mesa.activo}
                        style={{ 
                          padding: '6px 12px', 
                          border: '1px solid #dee2e6', 
                          borderRadius: 6, 
                          cursor: mesa.activo ? 'pointer' : 'not-allowed', 
                          opacity: mesa.activo ? 1 : 0.5,
                          color: '#1a1a1a'
                        }}
                      >
                        <option value="disponible">🟢 Disponible</option>
                        <option value="ocupada">🔴 Ocupada</option>
                        <option value="reservada">🟡 Reservada</option>
                        <option value="fuera_de_servicio">⚫ Fuera de servicio</option>
                      </select>
                    </td>
                    <td style={{ padding: 16, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {mesa.activo && (
                          <>
                            <button 
                              onClick={() => editar(mesa)} 
                              style={{ padding: '6px 12px', background: '#e0e7ff', color: '#3730a3', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                            >
                              Editar
                            </button>
                            <button 
                              onClick={() => eliminar(mesa.id, mesa.numero)} 
                              style={{ padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                            >
                              Desactivar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTables;