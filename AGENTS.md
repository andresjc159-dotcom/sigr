# Requisitos - Red Velvet Restaurant System

## Prerequisitos del Sistema

| Requisito | Versión Mínima |
|-----------|---------------|
| Node.js | 18.x |
| PostgreSQL | 14.x |
| npm | 9.x |

## Dependencias del Proyecto

### Backend
```bash
cd backend && npm install
```
- express ^4.21.0
- cors ^2.8.5
- dotenv ^16.4.5
- helmet ^7.1.0
- jsonwebtoken ^9.0.3
- bcrypt ^6.0.0
- multer ^1.4.5-lts.1
- pg ^8.12.0
- uuid ^10.0.0

### Frontend
```bash
cd frontend && npm install
```
- react ^18.3.1
- react-dom ^18.3.1
- react-router-dom ^6.26.0

---

## Configuración Paso a Paso

### 1. Base de Datos

```bash
psql -U postgres
CREATE DATABASE red_velvet;
\q
```

### 2. Schema

```bash
psql -U postgres -d red_velvet -f schema.sql
```

### 3. Variables de Entorno

Crear archivo `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=red_velvet
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=super-secret-key-change-this
JWT_REFRESH_SECRET=refresh-secret-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_PATH=./uploads
CORS_ORIGIN=http://localhost:5173
```

### 4. Usuarios de Prueba

```bash
cd backend
node seedUsers.js
```

### 5. Iniciar Servicios

```bash
# Terminal 1 - Backend (puerto 3000)
cd backend && npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd frontend && npm run dev
```

### 6. Acceder

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/v1

---

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Master | master@redvelvet.com | master123 |
| Administrador | admin@redvelvet.com | admin123 |
| Mesero | mesero1@redvelvet.com | mesero123 |
| Cliente | cliente@redvelvet.com | cliente123 |

---

## Tablas de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios (master, admin, mesero, cliente) |
| `configuracion_visual` | Tema del restaurante (colores, logos) |
| `categorias` | Categorías del menú |
| `productos` | Productos con precio, stock, `ingredientes` (JSONB), imagen |
| `toppings` | Complementos para productos (con precio) |
| `mesas` | Mesas con capacidad y ubicación |
| `pedidos` | Pedidos local/domicilio, flujo estados, método y estado de pago |
| `detalles_pedido` | Items por pedido (producto, cantidad, precio, observaciones) |
| `reservas` | Reservaciones con asignación de mesa |

## Enums de la BD

| Enum | Valores |
|------|---------|
| `rol_usuario` | master, administrador, mesero, cliente |
| `estado_usuario` | activo, inactivo |
| `estado_producto` | activo, inactivo, agotado |
| `estado_mesa` | disponible, ocupada, reservada, fuera_de_servicio |
| `tipo_pedido` | local, domicilio |
| `estado_pedido` | pendiente, en_cocina, listo, entregado, cancelado |
| `metodo_pago` | efectivo, tarjeta, transferencia |
| `estado_pago` | pendiente, pagado, reembolsado |
| `estado_reserva` | pendiente, confirmada, cancelada, completada, no_asistio |

---

## Estructura de Rutas

### Frontend
| Ruta | Descripción |
|------|-------------|
| `/` | Página pública (inicio) |
| `/menu` | Menú público con carrito |
| `/login` | Login con redirect post-login |
| `/register` | Registro de cliente |
| `/cliente/menu` | Menú cliente |
| `/cliente/carrito` | Carrito |
| `/cliente/checkout` | Checkout 3 pasos |
| `/cliente/mis-pedidos` | Seguimiento de pedidos |
| `/cliente/reservas` | Reservas |
| `/master` | Dashboard master |
| `/master/empleados` | Gestión empleados |
| `/master/productos` | Gestión productos (con ingredientes e imagen) |
| `/master/toppings` | Gestión toppings |
| `/master/visual` | Personalización visual |
| `/admin` | Dashboard admin |
| `/admin/caja` | Caja (confirmar pagos, reporte, exportar CSV) |
| `/admin/pedidos` | Gestión pedidos |
| `/admin/mesas` | Mapa de mesas |
| `/admin/reservas` | Reservas (asignar mesa) |
| `/admin/inventario` | Inventario/stock |
| `/mesero/mesas` | Mapa de mesas, crear pedidos |
| `/mesero/pedidos` | Pedidos activos, generar ticket |

### API
| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| /api/v1/auth/login | POST | No | Login |
| /api/v1/auth/register | POST | No | Registro cliente |
| /api/v1/auth/profile | GET | Sí | Perfil usuario |
| /api/v1/employees | GET/POST/PUT/DELETE | Master | CRUD empleados |
| /api/v1/categorias | GET/POST/PUT/DELETE | * | CRUD categorías |
| /api/v1/products | GET/POST | * | CRUD productos |
| /api/v1/products/:id/image | POST | Admin/Master | Subir imagen (20MB) |
| /api/v1/orders | GET/POST | Sí | CRUD pedidos |
| /api/v1/orders/:id/status | PATCH | Admin/Mesero | Cambiar estado pedido |
| /api/v1/orders/:id/payment | PATCH | Admin/Master | Confirmar pago |
| /api/v1/sales/daily | GET | Admin/Master | Reporte diario |
| /api/v1/sales/daily/export | GET | Admin/Master | Exportar CSV |
| /api/v1/tables | GET/POST/PUT | Admin/Mesero | CRUD mesas |
| /api/v1/tables/:id/state | PATCH | Admin/Mesero | Cambiar estado mesa |
| /api/v1/toppings | GET/POST | * | CRUD toppings |
| /api/v1/reservations | GET/POST | * | CRUD reservas |
| /api/v1/reservations/:id/table | PATCH | Admin/Master | Asignar mesa |
| /api/v1/reservations/availability | GET | No | Disponibilidad |
| /api/v1/config/theme | GET/PUT | Master | Tema visual |

---

## Troubleshooting

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `.env`

### Error de CORS
- Verificar `CORS_ORIGIN` en `.env`

### Puerto en uso
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Token expirado
- Hacer login nuevamente

### "File too large" al subir imagen
- Límite: 20MB por archivo
- Comprimir la imagen o reducir su resolución
