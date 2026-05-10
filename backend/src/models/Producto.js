import { query } from '../config/database.js';

export const CategoriaModel = {
  async findAll() {
    const result = await query(
      'SELECT * FROM categorias WHERE activo = TRUE ORDER BY orden'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT * FROM categorias WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { nombre, descripcion, imagen, orden = 0 } = data;
    const result = await query(
      `INSERT INTO categorias (nombre, descripcion, imagen, orden)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre, descripcion, imagen, orden]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { nombre, descripcion, imagen, orden, activo } = data;
    const fields = [];
    const params = [];

    if (nombre !== undefined) {
      params.push(nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (descripcion !== undefined) {
      params.push(descripcion);
      fields.push(`descripcion = $${params.length}`);
    }
    if (imagen !== undefined) {
      params.push(imagen);
      fields.push(`imagen = $${params.length}`);
    }
    if (orden !== undefined) {
      params.push(orden);
      fields.push(`orden = $${params.length}`);
    }
    if (activo !== undefined) {
      params.push(activo);
      fields.push(`activo = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE categorias SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE categorias SET activo = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};

export const ProductoModel = {
  async findAll(categoryId) {
    let sql = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.estado = \'activo\'';
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      sql += ` AND p.categoria_id = $${params.length}`;
    }

    sql += ' ORDER BY p.destacado DESC, p.nombre';

    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByCategoria(categoriaId) {
    const result = await query(
      'SELECT * FROM productos WHERE categoria_id = $1 AND estado = \'activo\' ORDER BY nombre',
      [categoriaId]
    );
    return result.rows;
  },

  async findDestacados() {
    const result = await query(
      'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.destacado = TRUE AND p.estado = \'activo\' ORDER BY p.nombre'
    );
    return result.rows;
  },

  async search(query) {
    const result = await query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.estado = 'activo' AND (p.nombre ILIKE $1 OR p.descripcion ILIKE $1)
       ORDER BY p.nombre`,
      [`%${query}%`]
    );
    return result.rows;
  },

  async create(productData) {
    const {
      nombre,
      descripcion,
      precio,
      imagen,
      categoria_id,
      estado = 'activo',
      destacado = false,
      stock,
      calorias,
      tiempo_prep_min,
      creado_por
    } = productData;

    const result = await query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen, categoria_id, estado, destacado, stock, calorias, tiempo_prep_min, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [nombre, descripcion, precio, imagen, categoria_id, estado, destacado, stock, tiempo_prep_min, creado_por]
    );
    return result.rows[0];
  },

  async update(id, productData) {
    const {
      nombre,
      descripcion,
      precio,
      imagen,
      categoria_id,
      estado,
      destacado,
      stock,
      calorias,
      tiempo_prep_min
    } = productData;

    const fields = [];
    const params = [];

    if (nombre !== undefined) {
      params.push(nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (descripcion !== undefined) {
      params.push(descripcion);
      fields.push(`descripcion = $${params.length}`);
    }
    if (precio !== undefined) {
      params.push(precio);
      fields.push(`precio = $${params.length}`);
    }
    if (imagen !== undefined) {
      params.push(imagen);
      fields.push(`imagen = $${params.length}`);
    }
    if (categoria_id !== undefined) {
      params.push(categoria_id);
      fields.push(`categoria_id = $${params.length}`);
    }
    if (estado !== undefined) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }
    if (destacado !== undefined) {
      params.push(destacado);
      fields.push(`destacado = $${params.length}`);
    }
    if (stock !== undefined) {
      params.push(stock);
      fields.push(`stock = $${params.length}`);
    }
    if (calorias !== undefined) {
      params.push(calorias);
      fields.push(`calorias = $${params.length}`);
    }
    if (tiempo_prep_min !== undefined) {
      params.push(tiempo_prep_min);
      fields.push(`tiempo_prep_min = $${params.length}`);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  },

  async delete(id) {
    const result = await query(
      'UPDATE productos SET estado = \'inactivo\' WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async findLowStock() {
    const result = await query(
      `SELECT p.*, c.nombre as categoria_nombre 
       FROM productos p 
       JOIN categorias c ON p.categoria_id = c.id 
       WHERE p.stock IS NOT NULL AND p.stock < 5 AND p.estado = 'activo'
       ORDER BY p.stock`
    );
    return result.rows;
  }
};

export default { CategoriaModel, ProductoModel };