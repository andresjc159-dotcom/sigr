import { useState, useEffect } from 'react';
import { employeeService } from '../../services/api';

const MasterEmployees = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '', rol: 'mesero' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      const data = await employeeService.getEmployees();
      setEmpleados(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await employeeService.createEmployee(form);
      setShowForm(false);
      setForm({ nombre: '', apellido: '', email: '', telefono: '', password: '', rol: 'mesero' });
      cargarEmpleados();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, nombre, estadoActual) => {
    const accion = estadoActual === 'activo' ? 'Desactivar' : 'Reactivar';
    if (confirm(`¿${accion} a ${nombre}? ${estadoActual === 'activo' ? 'No podrá acceder al sistema.' : 'Volverá a tener acceso.'}`)) {
      try {
        await employeeService.toggleEmployeeStatus(id);
        cargarEmpleados();
      } catch (error) {
        alert(error.message);
      }
    }
  };

  if (loading) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: '#1a1a1a' }}>Empleados</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
          {showForm ? 'Cancelar' : '+ Nuevo'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: 24, borderRadius: 12, marginBottom: 24 }}>
          <h3>Nuevo Empleado</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
            <input placeholder="Apellido" value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
            <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <input placeholder="Contraseña" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }} />
            <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} style={{ padding: 12, border: '2px solid #dee2e6', borderRadius: 8 }}>
              <option value="mesero">Mesero</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <button onClick={guardar} disabled={saving} style={{ marginTop: 16, padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>NOMBRE</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>EMAIL</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>ROL</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>ESTADO</th>
              <th style={{ padding: 16, textAlign: 'left', fontSize: 12, color: '#6c757d' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(emp => (
              <tr key={emp.id} style={{ borderTop: '1px solid #dee2e6' }}>
                <td style={{ padding: 16, color: '#1a1a1a' }}>{emp.nombre} {emp.apellido}</td>
                <td style={{ padding: 16, color: '#1a1a1a' }}>{emp.email}</td>
                <td style={{ padding: 16 }}><span style={{ padding: '4px 12px', background: '#e63946', color: 'white', borderRadius: 20, fontSize: 12 }}>{emp.rol}</span></td>
                <td style={{ padding: 16 }}>
                  <span style={{ padding: '4px 12px', background: emp.estado === 'activo' ? '#d4edda' : '#fee2e2', color: emp.estado === 'activo' ? '#155724' : '#991b1b', borderRadius: 20, fontSize: 12 }}>
                    {emp.estado}
                  </span>
                </td>
                <td style={{ padding: 16 }}>
                  <button onClick={() => toggleStatus(emp.id, `${emp.nombre} ${emp.apellido}`, emp.estado)} style={{ padding: '6px 16px', background: emp.estado === 'activo' ? '#fbbf24' : '#34d399', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                    {emp.estado === 'activo' ? 'Desactivar' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterEmployees;
