import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

// ============ AUTH ============

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const user = result.rows[0];
    if (user.estado !== 'activo') {
      return res.status(401).json({ message: 'Cuenta inactiva' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const accessToken = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    await query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);
    res.json({ accessToken, refreshToken, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, rol: user.rol } });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/register', async (req, res, next) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;
    
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ message: 'Nombre, apellido, email y contraseña son requeridos' });
    }
    
    const existing = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre, apellido, email, rol, estado',
      [nombre, apellido, email, telefono || null, passwordHash, 'cliente', 'activo']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/auth/refresh', async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(400).json({ message: 'Refresh token requerido' });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const result = await query('SELECT * FROM usuarios WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || result.rows[0].refresh_token !== token) {
      return res.status(401).json({ message: 'Refresh token inválido' });
    }
    const user = result.rows[0];
    const newAccessToken = jwt.sign({ id: user.id, email: user.email, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    await query('UPDATE usuarios SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);
    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

router.get('/auth/profile', authenticate, async (req, res, next) => {
  try {
    const result = await query('SELECT id, nombre, apellido, email, rol, estado, foto_perfil FROM usuarios WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ CATEGORIES ============

router.get('/categorias', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM categorias WHERE activo = TRUE ORDER BY orden');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/categorias', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { nombre, descripcion, orden = 0 } = req.body;
    const result = await query('INSERT INTO categorias (nombre, descripcion, orden) VALUES ($1, $2, $3) RETURNING *', [nombre, descripcion, orden]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/categorias/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo } = req.body;
    const result = await query('UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), orden = COALESCE($3, orden), activo = COALESCE($4, activo) WHERE id = $5 RETURNING *', [nombre, descripcion, orden, activo, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/categorias/:id', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE categorias SET activo = FALSE WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ PRODUCTS ============

router.get('/products', async (req, res, next) => {
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
    next(error);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT p.*, c.nombre as categoria_nombre FROM productos p JOIN categorias c ON p.categoria_id = c.id WHERE p.id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/products', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, categoria_id, stock = 20, destacado = false, calorias, tiempo_prep_min, ingredientes = [] } = req.body;
    const result = await query(
      'INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock, destacado, calorias, tiempo_prep_min, estado, ingredientes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [nombre, descripcion, precio, categoria_id, stock, destacado, calorias, tiempo_prep_min, 'activo', JSON.stringify(ingredientes)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/products/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, stock, destacado, estado, calorias, tiempo_prep_min, ingredientes } = req.body;
    const result = await query(
      'UPDATE productos SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), precio = COALESCE($3, precio), categoria_id = COALESCE($4, categoria_id), stock = COALESCE($5, stock), destacado = COALESCE($6, destacado), estado = COALESCE($7, estado), calorias = COALESCE($8, calorias), tiempo_prep_min = COALESCE($9, tiempo_prep_min), ingredientes = COALESCE($10, ingredientes) WHERE id = $11 RETURNING *',
      [nombre, descripcion, precio, categoria_id, stock, destacado, estado, calorias, tiempo_prep_min, ingredientes ? JSON.stringify(ingredientes) : null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/products/:id/stock', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad, operacion } = req.body;
    
    let newStock;
    if (operacion === 'sumar') {
      newStock = query('UPDATE productos SET stock = COALESCE(stock, 0) + $1 WHERE id = $2 RETURNING *', [cantidad, id]);
    } else if (operacion === 'restar') {
      newStock = query('UPDATE productos SET stock = GREATEST(0, COALESCE(stock, 0) - $1) WHERE id = $2 RETURNING *', [cantidad, id]);
    } else {
      newStock = query('UPDATE productos SET stock = $1 WHERE id = $2 RETURNING *', [cantidad, id]);
    }
    
    const result = await newStock;
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE productos SET estado = $1 WHERE id = $2 RETURNING *', ['inactivo', id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto desactivado', producto: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ============ PRODUCT IMAGE UPLOAD ============

router.post('/products/:id/image', authenticate, authorize('master', 'administrador'), upload.single('imagen'), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    const imagePath = `/uploads/${req.file.filename}`;
    const result = await query('UPDATE productos SET imagen = $1 WHERE id = $2 RETURNING *', [imagePath, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Imagen subida exitosamente', imagen: imagePath, producto: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ============ EMPLOYEES ============

router.get('/employees', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const result = await query("SELECT id, nombre, apellido, email, telefono, rol, estado, ultimo_acceso, creado_en FROM usuarios WHERE rol != 'cliente' ORDER BY rol, nombre");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/employees', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { nombre, apellido, email, telefono, password, rol } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await query('INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nombre, apellido, email, telefono, rol, estado', [nombre, apellido, email, telefono, hash, rol]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/employees/:id', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, rol } = req.body;
    const result = await query('UPDATE usuarios SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), telefono = COALESCE($3, telefono), rol = COALESCE($4, rol) WHERE id = $5 RETURNING id, nombre, apellido, email, telefono, rol, estado', [nombre, apellido, telefono, rol, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/employees/:id/toggle-status', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT estado FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empleado no encontrado' });
    const newEstado = result.rows[0].estado === 'activo' ? 'inactivo' : 'activo';
    const updated = await query('UPDATE usuarios SET estado = $1 WHERE id = $2 RETURNING id, nombre, apellido, email, rol, estado', [newEstado, id]);
    res.json(updated.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ TABLES ============

router.get('/tables', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM mesas ORDER BY numero');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/tables', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { numero, capacidad, ubicacion } = req.body;
    if (!numero || !capacidad) return res.status(400).json({ error: 'Número y capacidad son requeridos' });
    const result = await query(
      'INSERT INTO mesas (numero, capacidad, ubicacion, estado) VALUES ($1, $2, $3, $4) RETURNING *',
      [numero, capacidad, ubicacion || null, 'disponible']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/tables/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { numero, capacidad, ubicacion, estado } = req.body;
    const result = await query(
      'UPDATE mesas SET numero = COALESCE($1, numero), capacidad = COALESCE($2, capacidad), ubicacion = COALESCE($3, ubicacion), estado = COALESCE($4, estado) WHERE id = $5 RETURNING *',
      [numero, capacidad, ubicacion, estado, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.patch('/tables/:id/status', authenticate, authorize('master', 'administrador', 'mesero'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const result = await query('UPDATE mesas SET estado = $1::estado_mesa WHERE id = $2 RETURNING *', [estado, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/tables/:id', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE mesas SET activo = FALSE WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json({ message: 'Mesa desactivada', mesa: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ============ ORDERS ============

router.get('/orders', authenticate, authorize('master', 'administrador', 'mesero', 'cliente'), async (req, res, next) => {
  try {
    let clienteFilter = '';
    const params = [];
    if (req.user.rol === 'cliente') {
      params.push(req.user.id);
      clienteFilter = ` WHERE p.cliente_id = $${params.length}`;
    }
    const result = await query(
      `SELECT p.*, 
              u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email,
              m.numero as mesa_numero, m.ubicacion as mesa_ubicacion, m.id as mesa_id
       FROM pedidos p
       LEFT JOIN usuarios u ON p.cliente_id = u.id
       LEFT JOIN mesas m ON p.mesa_id = m.id
       ${clienteFilter}
       ORDER BY p.creado_en DESC LIMIT 100`,
      params
    );

    for (const pedido of result.rows) {
      const detalles = await query(
        `SELECT dp.*, pr.nombre as producto_nombre, pr.imagen as producto_imagen
         FROM detalles_pedido dp
         LEFT JOIN productos pr ON dp.producto_id = pr.id
         WHERE dp.pedido_id = $1`,
        [pedido.id]
      );
      pedido.detalles = detalles.rows;
    }

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/orders', authenticate, async (req, res, next) => {
  try {
    const { cliente_id, mesa_id, tipo, items, notas, mesero_id } = req.body;
    const meseroIdFinal = mesero_id || req.user.id;
    let subtotal = 0;
    if (items && items.length > 0) {
      for (const item of items) {
        subtotal += item.precio_unitario * item.cantidad;
      }
    }
    const impuesto = subtotal * 0.1;
    const total = subtotal + impuesto;
    const result = await query('INSERT INTO pedidos (cliente_id, mesa_id, mesero_id, tipo, subtotal, impuesto, total, notas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [cliente_id, mesa_id, meseroIdFinal, tipo, subtotal, impuesto, total, notas]);
    const pedido = result.rows[0];
    if (items && items.length > 0) {
      for (const item of items) {
        await query('INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, observaciones) VALUES ($1, $2, $3, $4, $5)', [pedido.id, item.producto_id, item.cantidad, item.precio_unitario, item.observaciones]);
      }
    }
    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/status', authenticate, authorize('master', 'administrador', 'mesero'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, motivo } = req.body;
    let sql = 'UPDATE pedidos SET estado = $1::estado_pedido';
    const params = [estado];
    
    if (estado === 'cancelado' && motivo) {
      params.push(motivo);
      sql += ', motivo_cancelacion = $2';
    }
    
    params.push(id);
    sql += ` WHERE id = $${params.length} RETURNING *`;
    const result = await query(sql, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ SALES ============

router.get('/sales/daily', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const dateFilter = fecha ? `DATE(p.creado_en) = $1` : 'DATE(p.creado_en) = CURRENT_DATE';
    const params = fecha ? [fecha] : [];
    
    const result = await query(
      `SELECT 
        COALESCE(COUNT(*), 0)::int as total_pedidos,
        COALESCE(SUM(p.total), 0)::float as total_facturado,
        COALESCE(AVG(p.total), 0)::float as ticket_promedio,
        COALESCE(COUNT(*) FILTER (WHERE p.estado_pago = 'pendiente'), 0)::int as pagos_pendientes,
        COALESCE(COUNT(*) FILTER (WHERE p.estado_pago = 'pagado'), 0)::int as pagos_completados,
        COALESCE(SUM(p.total) FILTER (WHERE p.metodo_pago = 'efectivo'), 0)::float as total_efectivo,
        COALESCE(SUM(p.total) FILTER (WHERE p.metodo_pago = 'tarjeta'), 0)::float as total_tarjeta,
        COALESCE(SUM(p.total) FILTER (WHERE p.metodo_pago = 'transferencia'), 0)::float as total_transferencia
       FROM pedidos p
       WHERE ${dateFilter} AND p.estado != 'cancelado'`,
      params
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/sales/daily/export', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const dateFilter = fecha ? `DATE(p.creado_en) = $1` : 'DATE(p.creado_en) = CURRENT_DATE';
    const params = fecha ? [fecha] : [];
    
    const result = await query(
      `SELECT p.numero_pedido, p.tipo, p.estado, p.total, p.metodo_pago, p.estado_pago, 
              p.direccion_entrega, p.ciudad, p.notas,
              p.creado_en,
              u.nombre as cliente_nombre, u.apellido as cliente_apellido,
              m.numero as mesa_numero
       FROM pedidos p
       LEFT JOIN usuarios u ON p.cliente_id = u.id
       LEFT JOIN mesas m ON p.mesa_id = m.id
       WHERE ${dateFilter} AND p.estado != 'cancelado'
       ORDER BY p.creado_en ASC`,
      params
    );
    
    const rows = result.rows;
    let csv = 'Numero,Tipo,Estado,Total,Metodo Pago,Estado Pago,Cliente,Mesa,Direccion,Ciudad,Fecha\n';
    for (const r of rows) {
      const cliente = [r.cliente_nombre, r.cliente_apellido].filter(Boolean).join(' ') || '-';
      csv += `${r.numero_pedido},${r.tipo},${r.estado},${r.total},${r.metodo_pago || '-'},${r.estado_pago},"${cliente}",${r.mesa_numero || '-'},"${r.direccion_entrega || ''}","${r.ciudad || ''}",${r.creado_en}\n`;
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-diario-${fecha || new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.patch('/orders/:id/payment', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { metodo_pago, estado_pago } = req.body;
    if (!metodo_pago || !estado_pago) {
      return res.status(400).json({ error: 'metodo_pago y estado_pago son requeridos' });
    }
    const result = await query(
      'UPDATE pedidos SET metodo_pago = $1::metodo_pago, estado_pago = $2::estado_pago WHERE id = $3 RETURNING *',
      [metodo_pago, estado_pago, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ CONFIG THEME ============

router.get('/config/theme', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM configuracion_visual WHERE activo = TRUE ORDER BY actualizado_en DESC LIMIT 1');
    if (result.rows.length === 0) return res.status(404).json({ error: 'Configuración no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/config/theme', authenticate, authorize('master'), async (req, res, next) => {
  try {
    const { color_primario, color_secundario, color_acento, modo_tema, nombre_restaurante, slogan, logo_principal, logo_blanco, favicon } = req.body;
    const result = await query(
      `UPDATE configuracion_visual SET 
        color_primario = COALESCE($1, color_primario), 
        color_secundario = COALESCE($2, color_secundario), 
        color_acento = COALESCE($3, color_acento), 
        modo_tema = COALESCE($4, modo_tema), 
        nombre_restaurante = COALESCE($5, nombre_restaurante), 
        slogan = COALESCE($6, slogan),
        logo_principal = COALESCE($7, logo_principal),
        logo_blanco = COALESCE($8, logo_blanco),
        favicon = COALESCE($9, favicon)
       WHERE activo = TRUE RETURNING *`,
      [color_primario, color_secundario, color_acento, modo_tema, nombre_restaurante, slogan, logo_principal, logo_blanco, favicon]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Configuración no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// ============ UPLOAD CONFIG IMAGES ============

router.post('/upload/config/:tipo', authenticate, authorize('master'), upload.single('imagen'), async (req, res, next) => {
  try {
    const { tipo } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    
    const validTipos = ['logo_principal', 'logo_blanco', 'favicon'];
    if (!validTipos.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de logo inválido' });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    const result = await query(
      `UPDATE configuracion_visual SET ${tipo} = $1 WHERE activo = TRUE RETURNING *`,
      [imagePath]
    );
    
    res.json({ message: 'Imagen subida', path: imagePath, config: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// ============ RESERVATIONS ============

router.post('/reservations', async (req, res, next) => {
  try {
    const { fecha_reserva, hora_inicio, num_personas, nombre_contacto, telefono, email_contacto, nota_especial, cliente_id, mesa_id } = req.body;
    const result = await query(
      'INSERT INTO reservas (cliente_id, mesa_id, nombre_contacto, telefono, email_contacto, fecha_reserva, hora_inicio, num_personas, nota_especial) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [cliente_id || null, mesa_id || null, nombre_contacto, telefono, email_contacto || null, fecha_reserva, hora_inicio, num_personas, nota_especial || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/reservations/availability', async (req, res, next) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });
    const result = await query('SELECT m.*, COUNT(r.id) as reservas_count FROM mesas m LEFT JOIN reservas r ON m.id = r.mesa_id AND r.fecha_reserva = $1 AND r.estado IN ($2, $3) WHERE m.activo = TRUE GROUP BY m.id ORDER BY m.numero', [fecha, 'pendiente', 'confirmada']);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/reservations', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT r.*, m.numero as mesa_numero, m.ubicacion as mesa_ubicacion,
              u.nombre as cliente_nombre, u.apellido as cliente_apellido, u.email as cliente_email
       FROM reservas r
       LEFT JOIN mesas m ON r.mesa_id = m.id
       LEFT JOIN usuarios u ON r.cliente_id = u.id
       ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.patch('/reservations/:id/table', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mesa_id } = req.body;
    const result = await query(
      'UPDATE reservas SET mesa_id = $1, estado = $2 WHERE id = $3 RETURNING *',
      [mesa_id, 'confirmada', id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/reservations/my', authenticate, async (req, res, next) => {
  try {
    const result = await query('SELECT r.*, m.numero as mesa_numero, m.ubicacion as mesa_ubicacion FROM reservas r LEFT JOIN mesas m ON r.mesa_id = m.id WHERE r.cliente_id = $1 ORDER BY r.fecha_reserva DESC, r.hora_inicio DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// ============ TOPPINGS ============

router.get('/toppings', async (req, res, next) => {
  try {
    const { activo } = req.query;
    let sql = 'SELECT * FROM toppings WHERE 1=1';
    const params = [];
    if (activo !== undefined) {
      params.push(activo === 'true');
      sql += ` AND activo = $${params.length}`;
    }
    sql += ' ORDER BY nombre';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/toppings', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const result = await query(
      'INSERT INTO toppings (nombre, descripcion, precio, categoria) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio || 0, categoria || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/toppings/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, activo } = req.body;
    const result = await query(
      'UPDATE toppings SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), precio = COALESCE($3, precio), categoria = COALESCE($4, categoria), activo = COALESCE($5, activo) WHERE id = $6 RETURNING *',
      [nombre, descripcion, precio, categoria, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Topping no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/toppings/:id', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('UPDATE toppings SET activo = FALSE WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Topping no encontrado' });
    res.json({ message: 'Topping desactivado', topping: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;
