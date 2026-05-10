# Red Velvet - Sistema de Gestión Restaurante

Sistema web unificado para el restaurante "Red Velvet" que atiende tanto a clientes externos (pedidos en línea y reservas) como al equipo interno (meseros, administradores y master).

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| **Master** | SuperAdmin con control absoluto. CRUD de empleados, productos, toppings, personalización visual. |
| **Administrador** | Gestión operativa. Caja (confirmar pagos), reportes diarios, pedidos, mesas, inventario, reservas (asignar mesa). |
| **Mesero** | Interfaz táctil. Mapa de mesas, creación de pedidos por mesa con toppings, cierre de cuenta (generar ticket), liberar mesa. |
| **Cliente** | Usuario público. Menú, carrito con toppings, checkout paso a paso, seguimiento de pedidos, reservas. |

## Prerequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

## Instalación

### Backend

```bash
cd red-velvet/backend
npm install
```

Crear archivo `.env` basado en `.env.example` y completar las variables.

```bash
psql -U postgres -d red_velvet -f schema.sql
npm run dev
```

### Frontend

```bash
cd red-velvet/frontend
npm install
npm run dev
```

## Variables de Entorno Requeridas

### Backend `.env`

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto del servidor (3000) |
| NODE_ENV | Entorno (development/production) |
| DB_HOST | Host de PostgreSQL (localhost) |
| DB_PORT | Puerto de PostgreSQL (5432) |
| DB_NAME | Nombre de la base de datos (red_velvet) |
| DB_USER | Usuario de PostgreSQL (postgres) |
| DB_PASSWORD | Contraseña de PostgreSQL |
| JWT_SECRET | Clave secreta para JWT |
| JWT_REFRESH_SECRET | Clave secreta para refresh token |
| JWT_EXPIRES_IN | Tiempo de expiración access token (15m) |
| JWT_REFRESH_EXPIRES_IN | Tiempo de expiración refresh token (7d) |
| UPLOAD_PATH | Ruta para archivos subidos (./uploads) |
| CORS_ORIGIN | Origen permitido para CORS (http://localhost:5173) |

## Esquema de Base de Datos

### Tablas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Usuarios del sistema (master, admin, mesero, cliente) |
| `categorias` | Categorías de productos del menú |
| `productos` | Productos con precio, stock, ingredientes (JSONB), imagen |
| `toppings` | Complementos adicionales para productos |
| `mesas` | Mesas del restaurante con capacidad y ubicación |
| `pedidos` | Pedidos (local/domicilio) con flujo de estados y pago |
| `detalles_pedido` | Items individuales dentro de cada pedido |
| `reservas` | Reservaciones con asignación de mesa |
| `configuracion_visual` | Tema del restaurante (colores, logos, nombre) |

### Estados (Enums)

| Enum | Valores |
|------|---------|
| `rol_usuario` | `master`, `administrador`, `mesero`, `cliente` |
| `estado_usuario` | `activo`, `inactivo` |
| `estado_producto` | `activo`, `inactivo`, `agotado` |
| `estado_mesa` | `disponible`, `ocupada`, `reservada`, `fuera_de_servicio` |
| `tipo_pedido` | `local`, `domicilio` |
| `estado_pedido` | `pendiente`, `en_cocina`, `listo`, `entregado`, `cancelado` |
| `metodo_pago` | `efectivo`, `tarjeta`, `transferencia` |
| `estado_pago` | `pendiente`, `pagado`, `reembolsado` |
| `estado_reserva` | `pendiente`, `confirmada`, `cancelada`, `completada`, `no_asistio` |

## Estructura del Proyecto

```
red-velvet/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection, multer config
│   │   ├── middleware/     # Auth, authorize, error handler
│   │   └── routes/
│   │       └── index.js    # ALL endpoints centralized
│   ├── uploads/            # Imágenes subidas (productos, logos)
│   └── schema.sql          # Esquema completo de BD
└── frontend/
    ├── public/
    └── src/
        ├── components/
        │   └── layouts/    # DashboardLayout, PublicLayout
        ├── context/        # AuthContext, ThemeContext
        ├── pages/          # admin/, client/, master/, mesero/, public/
        ├── routes/         # Router principal
        └── services/       # api.js (todos los servicios)
```

## API Endpoints

### Autenticación (`/api/v1/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | No | Iniciar sesión |
| POST | `/register` | No | Registrar nuevo cliente |
| GET | `/profile` | Sí | Obtener perfil del usuario |
| POST | `/refresh` | No | Refrescar token |

### Productos (`/api/v1/products`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/products` | No | Listar productos (filtro por categoría) |
| GET | `/products/:id` | No | Obtener producto |
| POST | `/products` | Admin/Master | Crear producto |
| PUT | `/products/:id` | Admin/Master | Actualizar producto |
| DELETE | `/products/:id` | Admin/Master | Soft-delete producto |
| POST | `/products/:id/image` | Admin/Master | Subir imagen (multer, 20MB max) |

### Categorías (`/api/v1/categorias`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/categorias` | No | Listar categorías activas |
| POST | `/categorias` | Admin/Master | Crear categoría |
| PUT | `/categorias/:id` | Admin/Master | Actualizar categoría |
| DELETE | `/categorias/:id` | Admin/Master | Eliminar categoría |

### Pedidos (`/api/v1/orders`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/orders` | Sí | Listar pedidos (cliente ve solo los suyos) |
| POST | `/orders` | Sí | Crear pedido |
| PATCH | `/orders/:id/status` | Admin/Mesero | Cambiar estado del pedido |
| PATCH | `/orders/:id/payment` | Admin/Master | Confirmar pago (método + estado) |

### Ventas (`/api/v1/sales`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/sales/daily` | Admin/Master | Reporte diario (totales, métodos de pago) |
| GET | `/sales/daily/export` | Admin/Master | Descargar CSV del reporte diario |

### Mesas (`/api/v1/tables`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/tables` | Admin/Mesero | Listar mesas |
| POST | `/tables` | Admin/Master | Crear mesa |
| PUT | `/tables/:id` | Admin/Master | Actualizar mesa |
| PATCH | `/tables/:id/state` | Admin/Mesero | Cambiar estado de mesa |

### Toppings (`/api/v1/toppings`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/toppings` | No | Listar toppings activos |
| POST | `/toppings` | Master | Crear topping |
| PUT | `/toppings/:id` | Master | Actualizar topping |
| DELETE | `/toppings/:id` | Master | Soft-delete topping |

### Reservas (`/api/v1/reservations`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/reservations` | Admin/Master | Listar todas las reservas |
| POST | `/reservations` | No | Crear reserva |
| GET | `/reservations/my` | Cliente | Mis reservas |
| GET | `/reservations/availability` | No | Disponibilidad por fecha |
| PATCH | `/reservations/:id/table` | Admin/Master | Asignar mesa a reserva |

### Empleados (`/api/v1/employees`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/employees` | Master | Listar empleados |
| POST | `/employees` | Master | Crear empleado |
| PUT | `/employees/:id` | Master | Actualizar empleado |
| DELETE | `/employees/:id` | Master | Desactivar empleado |

### Configuración Visual (`/api/v1/config`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/config/theme` | No | Obtener tema activo |
| PUT | `/config/theme` | Master | Actualizar tema |
| POST | `/upload/config/:tipo` | Master | Subir logo/favicon |

## Frontend - Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/` | Público | Landing page |
| `/menu` | Público | Menú con carrito y personalización (toppings) |
| `/login` | Público | Inicio de sesión con redirect post-login |
| `/register` | Público | Registro de cliente |
| `/cliente/menu` | Cliente | Menú con carrito lateral |
| `/cliente/carrito` | Cliente | Carrito de compras |
| `/cliente/checkout` | Cliente | Checkout 3 pasos (Revisar → Dirección → Pago) |
| `/cliente/mis-pedidos` | Cliente | Seguimiento de pedidos con estados |
| `/cliente/reservas` | Cliente | Reservar mesa |
| `/master` | Master | Dashboard |
| `/master/empleados` | Master | CRUD empleados |
| `/master/productos` | Master | CRUD productos con imágenes e ingredientes |
| `/master/toppings` | Master | CRUD toppings |
| `/master/visual` | Master | Personalización visual (colores, logos) |
| `/admin` | Admin | Dashboard |
| `/admin/caja` | Admin/Master | Caja: confirmar pagos, reporte diario, exportar CSV |
| `/admin/pedidos` | Admin/Master | Gestión de pedidos |
| `/admin/mesas` | Admin/Master | Mapa y estados de mesas |
| `/admin/reservas` | Admin/Master | Reservas con asignación de mesa |
| `/admin/inventario` | Admin/Master | Control de stock |
| `/mesero/mesas` | Mesero | Mapa de mesas, crear pedidos con toppings |
| `/mesero/pedidos` | Mesero | Pedidos activos, generar ticket, marcar entregado |

## Usuarios de Prueba

Ejecutar seed:
```bash
cd backend
node seedUsers.js
```

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Master | master@redvelvet.com | master123 |
| Administrador | admin@redvelvet.com | admin123 |
| Mesero | mesero1@redvelvet.com | mesero123 |
| Cliente | cliente@redvelvet.com | cliente123 |

## Troubleshooting

### Error de conexión a PostgreSQL
Verificar que PostgreSQL esté ejecutándose y las credenciales en `.env`.

### Error de CORS
Verificar `CORS_ORIGIN` en `.env`.

### Puerto en uso
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Token expirado
Hacer login nuevamente.

### Subida de imágenes
- Límite: 20MB por archivo
- Formatos: cualquier imagen
- Ruta: `backend/uploads/`
- Servido estáticamente en `http://localhost:3000/uploads/`

### Soft-deletes
Todos los módulos (productos, empleados, toppings) usan soft-delete cambiando `estado` a `inactivo`. Nunca se eliminan físicamente de la BD.

### Asignación de mesas en reservas
Una mesa ya asignada a una reserva activa en la misma fecha no aparece disponible para otras reservas.

## Licencia

Privado - Red Velvet Restaurant
