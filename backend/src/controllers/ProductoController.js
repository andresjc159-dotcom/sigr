import { query } from '../config/database.js';

export const CategoriaController = {
  async getAll(req, res) {
    try {
      const result = await query('SELECT * FROM categorias WHERE activo = TRUE ORDER BY orden');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export const ProductoController = {
  async getAll(req, res) {
    try {
      const { categoria } = req.query;
      let sql = 'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.estado = $1';
      const params = ['activo'];
      if (categoria) {
        sql += ' AND p.categoria_id = $2';
        params.push(categoria);
      }
      sql += ' ORDER BY p.destacado DESC, p.nombre';
      const result = await query(sql, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  
  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await query(
        'SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default { CategoriaController, ProductoController };