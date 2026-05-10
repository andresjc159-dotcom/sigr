import { query, getClient } from '../config/database.js';

export const PedidoModel = {
async findAll(filters = {}) {
    let sql = `SELECT p.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email, u.telefono,
               m.numero as mesa_numero, mes.nombre as mesero_nombre, mes.apellido as mesero_apellido
               FROM pedidos p 
               LEFT JOIN usuarios u ON p.cliente_id = u.id
               LEFT JOIN mesas m ON p.mesa_id = m.id
               LEFT JOIN usuarios mes ON p.mesero_id = mes.id
               WHERE 1=1`;
    const params = [];

    if (filters.estado) {
      params.push(filters.estado);
      sql += ` AND p.estado = $${params.length}`;
    }
    if (filters.tipo) {
      params.push(filters.tipo);
      sql += ` AND p.tipo = $${params.length}`;
    }
    if (filters.cliente_id) {
      params.push(filters.cliente_id);
      sql += ` AND p.cliente_id = $${params.length}`;
    }
    if (filters.mesero_id) {
      params.push(filters.mesero_id);
      sql += ` AND p.mesero_id = $${params.length}`;
    }
    if (filters.fecha) {
      params.push(filters.fecha);
      sql += ` AND DATE(p.creado_en) = $${params.length}`;
    }

    sql += ' ORDER BY p.creado_en DESC';

    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      `SELECT p.*, u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email, u.telefono,
              m.numero as mesa_numero, mes.nombre as mesero_nombre, mes.apellido as mesero_apellido
       FROM pedidos p 
       LEFT JOIN usuarios u ON p.cliente_id = u.id
       LEFT JOIN mesas m ON p.mesa_id = m.id
       LEFT JOIN usuarios mes ON p.mesero_id = mes.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async findByNumero(numero) {
    const result = await query(
      'SELECT * FROM pedidos WHERE numero_pedido = $1',
      [numero]
    );
    return result.rows[0];
  },

  async create(pedidoData) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const {
        cliente_id,
        mesero_id,
        mesa_id,
        tipo = 'local',
        direccion_entrega,
        ciudad,
        referencia,
        items,
        notas
      } = pedidoData;

      let subtotal = 0;
      for (const item of items) {
        subtotal += item.precio_unitario * item.cantidad;
      }
      const impuesto = subtotal * 0.1;
      const total = subtotal + impuesto;

      const pedidoResult = await client.query(
        `INSERT INTO pedidos (cliente_id, mesero_id, mesa_id, tipo, direccion_entrega, ciudad, referencia, subtotal, impuesto, total, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [cliente_id, mesero_id, mesa_id, tipo, direccion_entrega, ciudad, referencia, subtotal, impuesto, total, notas]
      );
      const pedido = pedidoResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, observaciones)
           VALUES ($1, $2, $3, $4, $5)`,
          [pedido.id, item.producto_id, item.cantidad, item.precio_unitario, item.observaciones]
        );
      }

      if (mesa_id && tipo === 'local') {
        await client.query(
          'UPDATE mesas SET estado = $1 WHERE id = $2',
          ['ocupada', mesa_id]
        );
      }

      await client.query('COMMIT');
      return this.findById(pedido.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async updateStatus(id, estado, motivoCancelacion) {
    const fields = ['estado = $1'];
    const params = [estado];

    if (motivoCancelacion) {
      params.push(motivoCancelacion);
      fields.push(`motivo_cancelacion = $${params.length}`);
    }

    params.push(id);
    const sql = `UPDATE pedidos SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    const pedido = result.rows[0];

    if (pedido && pedido.mesa_id && (estado === 'entregado' || estado === 'cancelado')) {
      await query(
        'UPDATE mesas SET estado = $1 WHERE id = $2',
        ['disponible', pedido.mesa_id]
      );
    }

    return pedido;
  },

  async updatePayment(id, metodo_pago, estado_pago) {
    const result = await query(
      'UPDATE pedidos SET metodo_pago = $1, estado_pago = $2 WHERE id = $3 RETURNING *',
      [metodo_pago, estado_pago, id]
    );
    return result.rows[0];
  },

  async reasignarMesero(pedidoId, meseroId) {
    const result = await query(
      'UPDATE pedidos SET mesero_id = $1 WHERE id = $2 RETURNING *',
      [meseroId, pedidoId]
    );
    return result.rows[0];
  },

  async getDetalles(pedidoId) {
    const result = await query(
      `SELECT dp.*, p.nombre as producto_nombre, p.imagen as producto_imagen
       FROM detalles_pedido dp
       JOIN productos p ON dp.producto_id = p.id
       WHERE dp.pedido_id = $1`,
      [pedidoId]
    );
    return result.rows;
  },

  async getStatsDaily() {
    const result = await query(
      `SELECT 
        COUNT(*) as total_pedidos,
        SUM(total) as total_facturado,
        AVG(total) as ticket_promedio
       FROM pedidos
       WHERE DATE(creado_en) = CURRENT_DATE AND estado != 'cancelado'`
    );
    return result.rows[0];
  },

  async getStatsRange(startDate, endDate) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_pedidos,
        SUM(total) as total_facturado,
        AVG(total) as ticket_promedio
       FROM pedidos
       WHERE DATE(creado_en) BETWEEN $1 AND $2 AND estado != 'cancelado'`,
      [startDate, endDate]
    );
    return result.rows[0];
  }
};

export default { PedidoModel };