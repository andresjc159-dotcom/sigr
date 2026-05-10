import { useState, useEffect } from 'react';
import { reservationService, tableService } from '../../services/api';

const AdminReservationsPage = () => {
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [asignandoId, setAsignandoId] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [reservasData, mesasData] = await Promise.all([
        reservationService.getAllReservations(),
        tableService.getTables()
      ]);
      setReservas(reservasData);
      setMesas(mesasData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const asignarMesa = async (reservaId, mesaId) => {
    setAsignandoId(reservaId);
    try {
      await reservationService.assignTable(reservaId, mesaId);
      cargarDatos();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAsignandoId(null);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      pendiente: { bg: '#fef3c7', color: '#92400e' },
      confirmada: { bg: '#d1fae5', color: '#065f46' },
      cancelada: { bg: '#fee2e2', color: '#991b1b' },
      completada: { bg: '#e0e7ff', color: '#3730a3' }
    };
    return colores[estado] || { bg: '#f3f4f6', color: '#374151' };
  };

  const reservasFiltradas = filtro === 'todas' ? reservas :
    reservas.filter(r => r.estado === filtro);

  const mesasDisponibles = (reserva) => {
    const mesasOcupadas = reservas.filter(r =>
      r.id !== reserva.id &&
      r.mesa_id &&
      r.estado !== 'cancelada' &&
      r.estado !== 'completada' &&
      r.fecha_reserva?.slice(0, 10) === reserva.fecha_reserva?.slice(0, 10)
    ).map(r => r.mesa_id);
    return mesas.filter(m => m.activo !== false && !mesasOcupadas.includes(m.id));
  };

  if (cargando) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  return (
    <div style={{ padding: 40, color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Reservas</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { key: 'todas', label: 'Todas' },
            { key: 'pendiente', label: 'Pendientes' },
            { key: 'confirmada', label: 'Confirmadas' },
            { key: 'completada', label: 'Completadas' },
            { key: 'cancelada', label: 'Canceladas' }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 13,
                background: filtro === f.key ? '#e63946' : '#ffffff',
                color: filtro === f.key ? '#ffffff' : '#374151',
                fontWeight: filtro === f.key ? 600 : 400,
                border: filtro === f.key ? 'none' : '2px solid #e5e7eb'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reservasFiltradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 16 }}>
            <p style={{ color: '#6b7280' }}>No hay reservas</p>
          </div>
        ) : (
          reservasFiltradas.map(reserva => {
            const estadoStyle = getEstadoColor(reserva.estado);
            return (
              <div key={reserva.id} style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 16 }}>{reserva.nombre_contacto}</span>
                      <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: estadoStyle.bg, color: estadoStyle.color }}>
                        {reserva.estado?.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0', fontSize: 13, color: '#6b7280' }}>
                      {new Date(reserva.fecha_reserva).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} | {reserva.hora_inicio?.slice(0, 5)} | {reserva.num_personas} persona(s)
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 13 }}>
                    {reserva.cliente_nombre && (
                      <p style={{ margin: 0, color: '#374151' }}>👤 {reserva.cliente_nombre} {reserva.cliente_apellido || ''}</p>
                    )}
                    <p style={{ margin: '4px 0 0', color: '#6b7280' }}>📞 {reserva.telefono}</p>
                    {reserva.email_contacto && <p style={{ margin: '2px 0 0', color: '#6b7280' }}>✉️ {reserva.email_contacto}</p>}
                  </div>
                </div>

                {reserva.nota_especial && (
                  <div style={{ padding: 10, background: '#f0f9ff', borderRadius: 8, marginBottom: 12 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#0369a1' }}>📝 {reserva.nota_especial}</p>
                  </div>
                )}

                {reserva.mesa_id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: '#d1fae5', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: '#065f46' }}>✅ Mesa #{reserva.mesa_numero} ({reserva.mesa_ubicacion || 'Sin ubicación'})</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>🪑 Sin mesa asignada</span>
                    <select
                      style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}
                      onChange={(e) => {
                        if (e.target.value) {
                          asignarMesa(reserva.id, e.target.value);
                        }
                      }}
                      disabled={asignandoId === reserva.id}
                      defaultValue=""
                    >
                      <option value="" disabled>Asignar mesa...</option>
                      {mesasDisponibles(reserva).map(m => (
                        <option key={m.id} value={m.id}>Mesa #{m.numero} - {m.ubicacion || 'Sin ubicación'} ({m.capacidad} pers)</option>
                      ))}
                    </select>
                    {asignandoId === reserva.id && <span style={{ fontSize: 13, color: '#6b7280' }}>Asignando...</span>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminReservationsPage;