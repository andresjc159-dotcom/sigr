# Manual de Despliegue en Vercel - Red Velvet

## Arquitectura

```
[ Usuarios ] → Vercel CDN → Frontend (React SPA)
                              ↕ API calls
                        Backend (Node.js/Express)
                              ↕
                     PostgreSQL (Neon o Supabase)
```

| Componente | Servicio |
|------------|----------|
| Frontend | **Vercel** (static SPA) |
| Backend | **Railway / Render / Fly.io** (Express con disco) |
| Base de datos | **Neon** (PostgreSQL serverless) |
| Imágenes | **Cloudinary** o **Uploadthing** (opcional) |

> **Nota**: El backend usa `multer` con disco local para subir imágenes. En Vercel serverless no hay disco persistente. Por eso el backend se despliega en un servicio que sí lo soporte (Railway, Render) o se migra a cloud storage.

---

## 1. Frontend en Vercel

### 1.1 Pre-requisitos
- Cuenta en [vercel.com](https://vercel.com)
- Repositorio en GitHub, GitLab o Bitbucket

### 1.2 Variables de entorno en Vercel

Ir a: Project → Settings → Environment Variables

| Variable | Valor |
|----------|-------|
| `VITE_API_BASE` | `https://api.tudominio.com/api/v1` (URL del backend) |
| `VITE_IMG_BASE` | `https://api.tudominio.com` (mismo backend, para imágenes) |

### 1.3 Desplegar

#### Opción A: Desde Git (recomendado)
1. Conectar repositorio en Vercel
2. Seleccionar `frontend/` como **Root Directory**
3. Framework: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Variables de entorno (las de arriba)
7. Click **Deploy**

#### Opción B: Desde CLI
```bash
npm i -g vercel
cd frontend
vercel --prod
```

### 1.4 SPA Routing
El archivo `vercel.json` ya incluye rewrites para que todas las rutas funcionen:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 2. Base de Datos (Neon)

### 2.1 Crear base de datos serverless
1. Ir a [neon.tech](https://neon.tech)
2. Crear proyecto y obtener la **connection string**:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/red_velvet?sslmode=require
   ```

### 2.2 Ejecutar schema
```bash
psql "<connection-string>" -f backend/schema.sql
```

### 2.3 Crear usuarios de prueba (opcional)
```bash
cd backend
psql "<connection-string>" -c "
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol) VALUES
('Master', 'Red Velvet', 'master@redvelvet.com', '\$2b\$10\$...hash...', 'master'),
('Admin', 'Red Velvet', 'admin@redvelvet.com', '\$2b\$10\$...hash...', 'administrador'),
('Mesero', 'Red Velvet', 'mesero1@redvelvet.com', '\$2b\$10\$...hash...', 'mesero'),
('Juan', 'Cliente', 'cliente@redvelvet.com', '\$2b\$10\$...hash...', 'cliente');
```

---

## 3. Backend en Railway

### 3.1 Crear cuenta en Railway
1. Ir a [railway.app](https://railway.app)
2. Iniciar sesión con GitHub

### 3.2 Configurar proyecto
1. **New Project** → **Deploy from GitHub repo**
2. Seleccionar el repo
3. Root directory: `backend/`
4. Start command: `node src/server.js`

### 3.3 Variables de entorno en Railway

| Variable | Valor |
|----------|-------|
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `DB_HOST` | Host de Neon |
| `DB_PORT` | `5432` |
| `DB_NAME` | `red_velvet` |
| `DB_USER` | Usuario de Neon |
| `DB_PASSWORD` | Password de Neon |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `UPLOAD_PATH` | `./uploads` |
| `CORS_ORIGIN` | `https://tudominio.vercel.app` |

### 3.4 Persistent Volume (para uploads)
Railway soporta discos persistentes:
1. Ir a **Volumes** → **New Volume**
2. Montar en `/app/uploads`
3. Railway lo asigna automáticamente a `UPLOAD_PATH`

### 3.5 Obtener URL pública
Railway asigna una URL tipo `https://redvelvet-api.up.railway.app`.
Usar esa URL como `VITE_API_BASE` en Vercel.

---

## 4. Alternativa: Backend en Render

### 4.1 Crear servicio Web
1. Ir a [render.com](https://render.com)
2. **New Web Service** → Conectar repo
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `node src/server.js`
6. Plan: **Starter** ($7/mes, incluye disco persistente)

### 4.2 Variables de entorno
Las mismas que en Railway (sección 3.3).

Render soporta disco persistente automáticamente para servicios web.

---

## 5. Alternativa: Todo en Vercel (Serverless)

Si se quiere el backend también en Vercel como serverless function:

### 5.1 Adaptar backend para serverless
Crear `api/index.js` en la raíz del proyecto:

```js
import app from '../backend/src/server.js';
export default app;
```

### 5.2 Configurar en Vercel
- Root directory: `/`
- Build command: `cd backend && npm install`
- Output: `api/` (serverless functions)

### 5.3 Limitaciones
- ❌ `multer` **no funciona** (no hay disco persistente)
  - Alternativa: migrar a **Cloudinary** o **Uploadthing**
- ❌ El upload de imágenes debe cambiarse a subida directa a cloud storage
- ✅ PostgreSQL funciona bien con Neon

---

## 6. Migración de Imágenes a Cloudinary (opcional)

Si se quiere usar Vercel para todo, hay que reemplazar multer:

### 6.1 Instalar SDK
```bash
cd backend
npm install cloudinary
```

### 6.2 Reemplazar multer en routes/index.js
```js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// En lugar de multer, subir directo a Cloudinary
router.post('/products/:id/image', authenticate, authorize('master', 'administrador'), async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      folder: 'red-velvet/products'
    });
    await query('UPDATE productos SET imagen = $1 WHERE id = $2', [result.secure_url, req.params.id]);
    res.json({ imagen: result.secure_url });
  } catch (error) {
    next(error);
  }
});
```

### 6.3 Actualizar frontend
Ya no es necesario `IMG_BASE` porque `cloudinary.secure_url` es una URL completa.

---

## 7. Resumen de URLs Finales

| Componente | URL |
|------------|-----|
| Frontend | `https://redvelvet.vercel.app` |
| Backend API | `https://redvelvet-api.up.railway.app` |
| Imágenes | `https://redvelvet-api.up.railway.app/uploads/...` |
| Base de datos | `postgresql://...neon.tech/red_velvet` |

### Configuración cruzada

**En Vercel (frontend):**
```
VITE_API_BASE = https://redvelvet-api.up.railway.app/api/v1
VITE_IMG_BASE = https://redvelvet-api.up.railway.app
```

**En Railway/Neon (backend):**
```
CORS_ORIGIN = https://redvelvet.vercel.app
DB_HOST = ep-xxxx.us-east-2.aws.neon.tech
```

---

## 8. DNS Personalizado (opcional)

### 8.1 Dominio propio
```bash
# En Vercel
Settings → Domains → añadir tudominio.com

# En Railway
Settings → Domains → añadir api.tudominio.com
```

### 8.2 Configuración DNS
| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | `@` | `cname.vercel-dns.com` |
| CNAME | `api` | `railway.app` |

---

## 9. Verificación Post-Despliegue

```bash
# Probar backend
curl https://redvelvet-api.up.railway.app/api/v1/auth/login \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@redvelvet.com","password":"admin123"}'

# Probar frontend
curl -I https://redvelvet.vercel.app

# Probar health
curl https://redvelvet-api.up.railway.app/health
```

---

## 10. Costos Estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Pro (gratuito) | $0 |
| Railway | Starter | $5/mes |
| Neon | Free tier | $0 |
| Cloudinary (opcional) | Free tier | $0 |
| Dominio (opcional) | .com | ~$10/año |
| **Total** | | **~$5/mes** |
