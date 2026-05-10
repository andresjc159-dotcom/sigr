import { useState, useEffect } from 'react';
import { reservationService } from '../../services/api';

const ReservationsPage = () => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [numPersonas, setNumPersonas] = useState(2);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nota, setNota] = useState('');
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [reservaConfirmada, setReservaConfirmada] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fecha && hora && numPersonas) {
      verificarDisponibilidad();
    }
  }, [fecha, hora, numPersonas]);

  const verificarDisponibilidad = async () => {
    try {
      const data = await reservationService.getAvailability(fecha);
      setDisponibilidad(data);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmarReserva = async () => {
    setCargando(true);
    setError('');
    try {
      const reserva = await reservationService.create({
        fecha_reserva: fecha,
        hora_inicio: hora,
        num_personas: numPersonas,
        nombre_contacto: nombre,
        telefono: telefono,
        email_contacto: email,
        nota_especial: nota
      });
      setReservaConfirmada(reserva);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (reservaConfirmada) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', maxWidth: 500, margin: '40px auto' }}>
          <h2>¡Reserva Confirmada!</h2>
          <p>Fecha: {new Date(reservaConfirmada.fecha_reserva).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Hora: {reservaConfirmada.hora_inicio?.length > 5 ? reservaConfirmada.hora_inicio.slice(0, 5) : reservaConfirmada.hora_inicio}</p>
          <p>Personas: {reservaConfirmada.num_personas}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Reservar Mesa</h1>
      {error && <div className="error">{error}</div>}
      
      <div className="card">
        <label>Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input"
          min={new Date().toISOString().split('T')[0]}
        />
        
        <label>Hora</label>
        <select value={hora} onChange={(e) => setHora(e.target.value)} className="input">
          <option value="">Seleccionar hora</option>
          {['12:00', '12:30', '13:00', '13:30', '14:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        
        <label>Número de personas</label>
        <select value={numPersonas} onChange={(e) => setNumPersonas(parseInt(e.target.value))} className="input">
          {[1,2,3,4,5,6,7,8].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        
        <label>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="input"
          required
        />
        
        <label>Teléfono</label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="input"
          required
        />
        
        <label>Email (opcional)</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        
        <label>Nota especial (opcional)</label>
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="input"
          rows={3}
        />
        
        <button className="btn btn-primary" onClick={confirmarReserva} disabled={cargando} style={{ marginTop: 16 }}>
          {cargando ? 'Confirmando...' : 'Confirmar Reserva'}
        </button>
      </div>
    </div>
  );
};

export default ReservationsPage;