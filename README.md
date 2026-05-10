# Red Velvet - Sistema de Gestión Restaurante

Sistema web unificado para el restaurante "Red Velvet" que atiende tanto a clientes externos (pedidos en línea y reservas) como al equipo interno (meseros, administradores y master).

## Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| **Master** | SuperAdmin con control absoluto. CRUD de empleados, gestión de productos, personalización visual. |
| **Administrador** | Gestión operativa. Visualización de ventas, control de pedidos, inventario básico. |
| **Mesero** | Interfaz táctil. Mapa de mesas, creación de pedidos por mesa, cierre de cuenta. |
| **Cliente** | Usuario público. Catálogo, carrito, checkout, reservas. |

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

Ejecutar migraciones de base de datos (consultar schema SQL).

```bash
npm run dev
```

### Frontend

```bash
cd red-velvet/frontend
npm install
npm run dev
```

## Variables de Entorno Requeridas

### Backend

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto del servidor |
| NODE_ENV | Entorno (development/production) |
| DB_HOST | Host de PostgreSQL |
| DB_PORT | Puerto de PostgreSQL |
| DB_NAME | Nombre de la base de datos |
| DB_USER | Usuario de PostgreSQL |
| DB_PASSWORD | Contraseña de PostgreSQL |
| JWT_SECRET | Clave secreta para JWT |
| JWT_REFRESH_SECRET | Clave secreta para refresh token |
| JWT_EXPIRES_IN | Tiempo de expiración del access token |
| JWT_REFRESH_EXPIRES_IN | Tiempo de expiración del refresh token |
| UPLOAD_PATH | Ruta para archivos subidos |
| CORS_ORIGIN | Origen permitido para CORS |

## Estructura del Proyecto

```
red-velvet/
├── backend/           # API REST con Express
│   ├── src/
│   │   ├── config/   # Configuraciones
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── uploads/      # Archivos subidos
└── frontend/         # SPA con React + Vite
    ├── public/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── routes/
        ├── services/
        └── styles/
```

## API Versionado

La API usa versionado en la URL: `/api/v1/...`

## Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|------|----------|
| Master | master@redvelvet.com | master123 |
| Administrador | admin@redvelvet.com | admin123 |
| Mesero | mesero1@redvelvet.com | mesero123 |
| Mesero | mesero2@redvelvet.com | mesero123 |
| Cliente | cliente@redvelvet.com | cliente123 |

### Crear Usuarios de Prueba

Ejecutar el script para crear los usuarios en la base de datos:

```bash
cd backend
node seedUsers.js
```

Primero ejecutar el schema SQL y configurar la base de datos.

## Licencia

Privado - Red Velvet Restaurant