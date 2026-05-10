import { query } from '../config/database.js';

export const MesaModel = {
  async findAll() {
    const result = await query(
      'SELECT m.*, u.nombre as mesero_nombre, u.apellido as mesero_apellido FROM mesas m LEFT JOIN usuarios u ON m.mesero_id = u.id WHERE m.activo = TRUE ORDER BY m.numero'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT m.*, u.nombre as mesero_nombre, u.apellido as mesero_apellido FROM mesas m LEFT JOIN usuarios u ON m.mesero_id = u.id WHERE m.id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByEstado(estado) {
    const result = await query(
      'SELECT * FROM mesas WHERE estado = $1 AND activo = TRUE ORDER BY numero',
      [estado]
    );
    return result.rows;
  },

  async findAvailable(fecha, hora) {
    const result = await query(
      `SELECT m.* FROM mesas m 
       WHERE m.activo = TRUE AND m.estado = 'disponible'
       AND m.id NOT IN (
         SELECT mesa_id FROM reservas 
         WHERE fecha_reserva = $1 AND estado IN ('pendiente', 'confirmada')
         AND (hora_inicio <= $2 AND hora_fin > $2)
       )
       ORDER BY m.capacidad`,
      [fecha, hora]
    );
    return result.rows;
  },

  async create(data) {
    const { numero, capacidad, ubicacion } = data;
    const result = await query(
      `INSERT INTO mesas (numero, capacidad, ubicacion)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [numero, capacidad, ubicacion]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { numero, capacidad, ubicacion, estado, mesero_id } = data;
    const fields = [];
    const params = [];

    if (numero !== undefined) {
      params.push(numero);
      fields.push(`numero = $${params.length}`);
    }
    if (capacidad !== undefined) {
      params.push(capacidad);
      fields.push(`capacidad = $${params.length}`);
    }
    if (ubicacion !== undefined) {
      params.push(ubicacion);
      fields.push(`ubicacion = $${params.length}`);
    }
    if (estado !== undefined) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }
    if (mesero_id !== undefined) {
      params.push(mesero_id);
      fields.push(`mesero_id = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE mesas SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE mesas SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async assignMesero(mesaId, meseroId) {
    const result = await query(
      'UPDATE mesas SET mesero_id = $1 WHERE id = $2 RETURNING *',
      [meseroId, mesaId]
    );
    return result.rows[0];
  }
};

export default { MesaModel };