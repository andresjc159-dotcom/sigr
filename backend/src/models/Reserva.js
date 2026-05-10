import { query } from '../config/database.js';

export const ReservaModel = {
  async findAll(filters = {}) {
    let sql = `SELECT r.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, 
              m.numero as mesa_numero, mes.nombre as mesero_nombre
              FROM reservas r 
              LEFT JOIN usuarios u ON r.cliente_id = u.id
              LEFT JOIN mesas m ON r.mesa_id = m.id
              LEFT JOIN usuarios mes ON r.gestionado_por = mes.id
              WHERE 1=1`;
    const params = [];

    if (filters.estado) {
      params.push(filters.estado);
      sql += ` AND r.estado = $${params.length}`;
    }
    if (filters.fecha) {
      params.push(filters.fecha);
      sql += ` AND r.fecha_reserva = $${params.length}`;
    }
    if (filters.cliente_id) {
      params.push(filters.cliente_id);
      sql += ` AND r.cliente_id = $${params.length}`;
    }

    sql += ' ORDER BY r.fecha_reserva, r.hora_inicio';

    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      `SELECT r.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, 
              m.numero as mesa_numero
       FROM reservas r 
       LEFT JOIN usuarios u ON r.cliente_id = u.id
       LEFT JOIN mesas m ON r.mesa_id = m.id
       WHERE r.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(reservaData) {
    const {
      cliente_id,
      mesa_id,
      nombre_contacto,
      telefono,
      email_contacto,
      fecha_reserva,
      hora_inicio,
      num_personas,
      nota_especial,
      gestionado_por
    } = reservaData;

    const horaFin = calcularHoraFin(hora_inicio, num_personas);

    const result = await query(
      `INSERT INTO reservas (cliente_id, mesa_id, nombre_contacto, telefono, email_contacto, fecha_reserva, hora_inicio, hora_fin, num_personas, nota_especial, gestionado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [cliente_id, mesa_id, nombre_contacto, telefono, email_contacto, fecha_reserva, hora_inicio, horaFin, num_personas, nota_especial, gestionado_por]
    );
    return result.rows[0];
  },

  async update(id, reservaData) {
    const { estado, nota_interna, mesa_id } = reservaData;
    const fields = [];
    const params = [];

    if (estado !== undefined) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }
    if (nota_interna !== undefined) {
      params.push(nota_interna);
      fields.push(`nota_interna = $${params.length}`);
    }
    if (mesa_id !== undefined) {
      params.push(mesa_id);
      fields.push(`mesa_id = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE reservas SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  },

  async getAvailability(fecha, hora, num_personas) {
    const result = await query(
      `SELECT m.* FROM mesas m
       WHERE m.activo = TRUE 
       AND m.capacidad >= $1
       AND m.estado != 'fuera_de_servicio'
       AND NOT EXISTS (
         SELECT 1 FROM reservas r
         WHERE r.mesa_id = m.id
         AND r.fecha_reserva = $2
         AND r.estado IN ('pendiente', 'confirmada')
         AND (
           (r.hora_inicio <= $3 AND r.hora_fin > $3)
           OR (r.hora_inicio < $4 AND r.hora_fin >= $4)
           OR (r.hora_inicio >= $3 AND r.hora_fin <= $4)
         )
       )
       ORDER BY m.capacidad`,
      [num_personas, fecha, hora, calcularHoraFin(hora, num_personas)]
    );
    return result.rows;
  },

  async findByFecha(fecha) {
    const result = await query(
      `SELECT r.*, m.numero as mesa_numero
       FROM reservas r
       LEFT JOIN mesas m ON r.mesa_id = m.id
       WHERE r.fecha_reserva = $1 AND r.estado IN ('pendiente', 'confirmada')
       ORDER BY r.hora_inicio`,
      [fecha]
    );
    return result.rows;
  }
};

function calcularHoraFin(horaInicio, numPersonas) {
  const [hours, minutes] = horaInicio.split(':').map(Number);
  const duracionMinutos = 90 + (numPersonas * 15);
  let totalMinutos = hours * 60 + minutes + duracionMinutos;
  const newHours = Math.floor(totalMinutos / 60) % 24;
  const newMinutes = totalMinutos % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
}

export default { ReservaModel };