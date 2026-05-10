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
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE red_velvet;

# Salir
\q
```

### 2. Schema

Ejecutar el archivo SQL con el schema completo proporcionado al inicio.

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
|-----|------|----------|
| Master | master@redvelvet.com | master123 |
| Administrador | admin@redvelvet.com | admin123 |
| Mesero | mesero1@redvelvet.com | mesero123 |
| Cliente | cliente@redvelvet.com | cliente123 |

---

## Estructura de Rutas

### Frontend
| Ruta | Descripción |
|------|-------------|
| / | Página pública (inicio) |
| /menu | Menú público |
| /login | Login |
| /register | Registro |
| /cliente | Panel cliente |
| /cliente/menu | Menú cliente |
| /cliente/carrito | Carrito |
| /cliente/checkout | Checkout |
| /cliente/reservas | Reservas |
| /master | Dashboard master |
| /master/empleados | Gestión empleados |
| /master/productos | Gestión productos |
| /master/visual | Personalización visual |
| /admin | Dashboard admin |
| /admin/pedidos | Gestión pedidos |
| /admin/inventario | Inventario |
| /mesero | Dashboard mesero |
| /mesero/mesas | Mapa de mesas |
| /mesero/pedidos | Pedidos |

### API
| Endpoint | Descripción |
|----------|-------------|
| /api/v1/auth/login | Login |
| /api/v1/auth/register | Registro |
| /api/v1/auth/profile | Perfil usuario |
| /api/v1/employees | Empleados (master) |
| /api/v1/config/theme | Configuración visual |
| /api/v1/categorias | Categorías |
| /api/v1/productos | Productos |
| /api/v1/orders | Pedidos |
| /api/v1/reservations | Reservas |
| /api/v1/tables | Mesas |

---

## Troubleshooting

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `.env`

### Error de CORS
- Verificar `CORS_ORIGIN` en `.env`

### Puerto en uso
- Cambiar puerto en `.env` o matar proceso:
```bash
lsof -ti:3000 | xargs kill -9
```

### Token expirado
- Hacer login nuevamente