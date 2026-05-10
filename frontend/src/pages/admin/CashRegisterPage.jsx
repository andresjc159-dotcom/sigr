import { useState, useEffect, useCallback } from 'react';
import { orderService, salesService } from '../../services/api';

const CashRegisterPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().slice(0, 10));
  const [pagandoId, setPagandoId] = useState(null);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarDatos = useCallback(async () => {
    try {
      const [pedidosData, reporteData] = await Promise.all([
        orderService.getOrders(),
        salesService.getDaily(filtroFecha)
      ]);
      const hoy = filtroFecha;
      const pedidosDelDia = pedidosData.filter(p =>
        p.creado_en?.slice(0, 10) === hoy && p.estado !== 'cancelado'
      );
      setPedidos(pedidosDelDia);
      setReporte(reporteData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  }, [filtroFecha]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const confirmarPago = async (pedido, metodo) => {
    setPagandoId(pedido.id);
    setMensaje(null);
    try {
      await orderService.confirmPayment(pedido.id, metodo, 'pagado');
      setMensaje({ tipo: 'exito', texto: `✅ Pedido #${pedido.numero_pedido} pagado con ${metodo}` });
      cargarDatos();
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ Error: ' + error.message });
      alert('Error: ' + error.message);
    } finally {
      setPagandoId(null);
    }
  };

  const exportarCSV = async () => {
    setExportando(true);
    try {
      const csv = await salesService.exportDaily(filtroFecha);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-diario-${filtroFecha}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setExportando(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: { bg: '#fef3c7', color: '#92400e' },
      en_cocina: { bg: '#dbeafe', color: '#1e40af' },
      listo: { bg: '#d1fae5', color: '#065f46' },
      entregado: { bg: '#e0e7ff', color: '#3730a3' }
    };
    const s = estilos[estado] || { bg: '#f3f4f6', color: '#374151' };
    return <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>{estado?.replace('_', ' ')}</span>;
  };

  if (cargando) return <div style={{ padding: 40, color: '#1a1a1a' }}>Cargando...</div>;

  const pendientesPago = pedidos.filter(p => p.estado_pago === 'pendiente');
  const pagados = pedidos.filter(p => p.estado_pago === 'pagado');

  return (
    <div style={{ padding: 40, color: '#1a1a1a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Caja</h1>
        {mensaje && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            background: mensaje.tipo === 'exito' ? '#d1fae5' : '#fee2e2',
            color: mensaje.tipo === 'exito' ? '#065f46' : '#991b1b',
            border: `2px solid ${mensaje.tipo === 'exito' ? '#a7f3d0' : '#fecaca'}`
          }}>
            {mensaje.texto}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
            style={{ padding: '8px 12px', border: '2px solid #e5e7eb', borderRadius: 8, fontSize: 14 }}
          />
          <button
            onClick={exportarCSV}
            disabled={exportando}
            style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            {exportando ? 'Exportando...' : '⬇ Exportar CSV'}
          </button>
          <button
            onClick={cargarDatos}
            style={{ padding: '8px 16px', background: '#f0f0f0', color: '#1a1a1a', border: '2px solid #d1d5db', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {reporte && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Total Facturado</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#059669' }}>${parseFloat(reporte.total_facturado || 0).toFixed(2)}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Pedidos</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>{reporte.total_pedidos}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Ticket Promedio</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#0369a1' }}>${parseFloat(reporte.ticket_promedio || 0).toFixed(2)}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Pendientes</p>
            <p style={{ margin: '8px 0 0', fontSize: 28, fontWeight: 700, color: '#d97706' }}>{reporte.pagos_pendientes}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Efectivo</p>
            <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#059669' }}>${parseFloat(reporte.total_efectivo || 0).toFixed(2)}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Tarjeta</p>
            <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#0369a1' }}>${parseFloat(reporte.total_tarjeta || 0).toFixed(2)}</p>
          </div>
          <div style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Transferencia</p>
            <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, color: '#7c3aed' }}>${parseFloat(reporte.total_transferencia || 0).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Pendientes de Pago ({pendientesPago.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendientesPago.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No hay pedidos pendientes de pago</p>
          ) : (
            pendientesPago.map(pedido => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>Pedido #{pedido.numero_pedido}</strong>
                    {getEstadoBadge(pedido.estado)}
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: pedido.tipo === 'domicilio' ? '#ede9fe' : '#dbeafe', color: pedido.tipo === 'domicilio' ? '#6d28d9' : '#1e40af', fontWeight: 600, fontSize: 11 }}>
                      {pedido.tipo === 'domicilio' ? '🏠 Domicilio' : '🍽️ Local'}
                    </span>
                  </div>
                  {pedido.mesa_numero && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>Mesa #{pedido.mesa_numero}</p>}
                  {pedido.cliente_nombre && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>👤 {pedido.cliente_nombre} {pedido.cliente_apellido || ''}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: '#e63946' }}>${parseFloat(pedido.total || 0).toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['efectivo', 'tarjeta', 'transferencia'].map(metodo => (
                      <button
                        key={metodo}
                        onClick={() => confirmarPago(pedido, metodo)}
                        disabled={pagandoId === pedido.id}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 600,
                          background: metodo === 'efectivo' ? '#d1fae5' : metodo === 'tarjeta' ? '#dbeafe' : '#ede9fe',
                          color: metodo === 'efectivo' ? '#065f46' : metodo === 'tarjeta' ? '#1e40af' : '#6d28d9'
                        }}
                      >
                        {metodo === 'efectivo' ? '💵 Efectivo' : metodo === 'tarjeta' ? '💳 Tarjeta' : '🏦 Transferencia'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Pagados ({pagados.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pagados.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No hay pedidos pagados hoy</p>
          ) : (
            pagados.map(pedido => (
              <div key={pedido.id} style={{ background: 'white', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, opacity: 0.75 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>#{pedido.numero_pedido}</strong>
                    {getEstadoBadge(pedido.estado)}
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: '#d1fae5', color: '#065f46', fontWeight: 600, fontSize: 11 }}>
                      ✅ Pagado
                    </span>
                    {pedido.metodo_pago && <span style={{ fontSize: 12, color: '#6b7280' }}>({pedido.metodo_pago})</span>}
                  </div>
                </div>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#059669' }}>${parseFloat(pedido.total || 0).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CashRegisterPage;