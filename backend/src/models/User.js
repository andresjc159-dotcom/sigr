import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

export const UserModel = {
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      'SELECT id, nombre, apellido, email, telefono, rol, estado, foto_perfil, ultimo_acceso, creado_en FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findAll(filters = {}) {
    let sql = 'SELECT id, nombre, apellido, email, telefono, rol, estado, ultimo_acceso, creado_en FROM usuarios WHERE 1=1';
    const params = [];
    
    if (filters.rol) {
      params.push(filters.rol);
      sql += ` AND rol = $${params.length}`;
    }
    if (filters.estado) {
      params.push(filters.estado);
      sql += ` AND estado = $${params.length}`;
    }
    if (filters.excludeCliente) {
      sql += ` AND rol != 'cliente'`;
    }
    
    sql += ' ORDER BY creado_en DESC';
    
    const result = await query(sql, params);
    return result.rows;
  },

  async create(userData) {
    const { nombre, apellido, email, telefono, password, rol = 'cliente' } = userData;
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, apellido, email, rol, estado, creado_en`,
      [nombre, apellido, email, telefono, passwordHash, rol]
    );
    return result.rows[0];
  },

  async update(id, userData) {
    const { nombre, apellido, telefono, rol, estado } = userData;
    const fields = [];
    const params = [];
    
    if (nombre !== undefined) {
      params.push(nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (apellido !== undefined) {
      params.push(apellido);
      fields.push(`apellido = $${params.length}`);
    }
    if (telefono !== undefined) {
      params.push(telefono);
      fields.push(`telefono = $${params.length}`);
    }
    if (rol !== undefined) {
      params.push(rol);
      fields.push(`rol = $${params.length}`);
    }
    if (estado !== undefined) {
      params.push(estado);
      fields.push(`estado = $${params.length}`);
    }
    
    if (fields.length === 0) return this.findById(id);
    
    params.push(id);
    const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;
    
    const result = await query(sql, params);
    return result.rows[0];
  },

  async updateRefreshToken(id, refreshToken) {
    const result = await query(
      'UPDATE usuarios SET refresh_token = $1, ultimo_acceso = NOW() WHERE id = $2 RETURNING id',
      [refreshToken, id]
    );
    return result.rows[0];
  },

  async toggleStatus(id) {
    const user = await this.findById(id);
    if (!user) return null;
    
    const newEstado = user.estado === 'activo' ? 'inactivo' : 'activo';
    const result = await query(
      'UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING *',
      [newEstado, id]
    );
    return result.rows[0];
  },

  async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }
};

export default { UserModel };