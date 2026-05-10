# Manual de Despliegue - Red Velvet Restaurant System

## 1. Requisitos del Servidor

### Hardware Mínimo
| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 1 vCPU | 2 vCPUs |
| RAM | 1 GB | 2 GB |
| Disco | 10 GB | 20 GB (SSD) |

### Software Requerido
| Software | Versión Mínima |
|----------|---------------|
| Node.js | 18.x LTS |
| PostgreSQL | 14.x |
| npm | 9.x |
| pm2 | 5.x (para producción) |
| nginx | 1.24+ (opcional, como proxy inverso) |

---

## 2. Preparación del Servidor

### 2.1 Actualizar sistema
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl git gcc-c++ make
```

### 2.2 Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

### 2.3 Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2.4 Instalar PM2 (para producción)
```bash
npm install -g pm2
```

### 2.5 Instalar Nginx (opcional, para producción)
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
```

---

## 3. Configuración de Base de Datos

### 3.1 Crear usuario y base de datos
```bash
sudo -u postgres psql
```

```sql
CREATE USER redvelvet WITH PASSWORD 'password_seguro';
CREATE DATABASE red_velvet OWNER redvelvet;
GRANT ALL PRIVILEGES ON DATABASE red_velvet TO redvelvet;
\q
```

### 3.2 Ejecutar schema
```bash
psql -U redvelvet -d red_velvet -h localhost -f schema.sql
```

### 3.3 Seed de datos de prueba (opcional)
```bash
node seedUsers.js
```

---

## 4. Despliegue del Backend

### 4.1 Clonar repositorio
```bash
git clone <url-del-repositorio> /var/www/red-velvet
cd /var/www/red-velvet/backend
```

### 4.2 Instalar dependencias
```bash
npm install --production
```

### 4.3 Configurar variables de entorno
```bash
cp .env.example .env
nano .env
```

Configuración para producción:
```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=red_velvet
DB_USER=redvelvet
DB_PASSWORD=password_seguro

JWT_SECRET=<generar-secreto-aleatorio>
JWT_REFRESH_SECRET=<generar-secreto-aleatorio>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
CORS_ORIGIN=https://tudominio.com
```

> **Importante**: Generar secretos JWT seguros:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4.4 Crear directorio de uploads
```bash
mkdir -p uploads
chmod 755 uploads
```

### 4.5 Iniciar con PM2
```bash
pm2 start src/server.js --name redvelvet-api
pm2 save
pm2 startup  # Para que inicie automáticamente al reiniciar el servidor
```

---

## 5. Despliegue del Frontend

### 5.1 Instalar dependencias y construir
```bash
cd /var/www/red-velvet/frontend
npm install
```

### 5.2 Configurar API_BASE para producción
Editar `src/services/api.js` y cambiar `API_BASE`:
```js
const API_BASE = 'https://api.tudominio.com/api/v1';
// o
const API_BASE = '/api/v1';  // si usas nginx como proxy
```

### 5.3 Construir para producción
```bash
npm run build
```

Los archivos estáticos se generan en `dist/`.

### 5.4 Servir con Nginx
```nginx
# /etc/nginx/sites-available/redvelvet
server {
    listen 80;
    server_name tudominio.com www.tudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudominio.com www.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    # Frontend (SPA)
    root /var/www/red-velvet/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos subidos
    location /uploads/ {
        alias /var/www/red-velvet/backend/uploads/;
        add_header Access-Control-Allow-Origin *;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 5.5 Habilitar sitio y SSL
```bash
# SSL con Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tudominio.com -d www.tudominio.com

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/redvelvet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Estructura Final en Producción

```
/var/www/red-velvet/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   └── routes/
│   │       └── index.js
│   ├── uploads/              # Imágenes subidas
│   ├── .env                  # Variables de entorno
│   ├── package.json
│   └── schema.sql
├── frontend/
│   ├── dist/                 # Build estático servido por nginx
│   └── src/
└── .gitignore
```

---

## 7. Comandos Útiles

### PM2
```bash
pm2 list                    # Listar procesos
pm2 logs redvelvet-api      # Ver logs
pm2 restart redvelvet-api   # Reiniciar
pm2 stop redvelvet-api      # Detener
pm2 delete redvelvet-api    # Eliminar del listado
```

### Nginx
```bash
sudo nginx -t                  # Probar configuración
sudo systemctl reload nginx    # Recargar sin downtime
sudo systemctl restart nginx   # Reiniciar
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Logs de la aplicación
```bash
pm2 logs redvelvet-api --lines 100
```

### Backup de base de datos
```bash
# Backup
pg_dump -U redvelvet -h localhost red_velvet > backup-$(date +%Y%m%d).sql

# Restore
psql -U redvelvet -h localhost -d red_velvet -f backup-20250510.sql
```

---

## 8. Monitoreo y Mantenimiento

### 8.1 Verificar salud del servidor
```bash
# Uso de recursos
htop
df -h
free -h

# Estado de servicios
pm2 status
sudo systemctl status nginx
sudo systemctl status postgresql
```

### 8.2 Rotación de logs (logrotate)
Crear `/etc/logrotate.d/redvelvet`:
```
/var/www/red-velvet/backend/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 8.3 Actualización del sistema
```bash
cd /var/www/red-velvet
git pull origin main
cd backend && npm install --production && pm2 restart redvelvet-api
cd ../frontend && npm install && npm run build
```

---

## 9. Seguridad

### 9.1 Firewall (UFW)
```bash
sudo ufw allow 22/tcp           # SSH
sudo ufw allow 80/tcp           # HTTP
sudo ufw allow 443/tcp          # HTTPS
sudo ufw enable
```

### 9.2 Headers de seguridad en Nginx
Ya incluidos en la configuración de ejemplo (X-Frame-Options, X-Content-Type-Options, etc.).

### 9.3 Prácticas recomendadas
- No exponer el puerto 3000 directamente (usar nginx como proxy)
- Cambiar las contraseñas de BD y JWT secrets periódicamente
- Mantener Node.js y dependencias actualizadas (`npm audit fix`)
- Usar HTTPS obligatorio
- Restringir acceso SSH solo con llaves
- Backups automáticos diarios de la BD

---

## 10. Variables de Entorno - Resumen

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| PORT | Puerto del backend | 3000 |
| NODE_ENV | Entorno | production |
| DB_HOST | Host PostgreSQL | localhost |
| DB_PORT | Puerto PostgreSQL | 5432 |
| DB_NAME | Base de datos | red_velvet |
| DB_USER | Usuario BD | redvelvet |
| DB_PASSWORD | Contraseña BD | password_seguro |
| JWT_SECRET | Secreto access token | <hex de 64 chars> |
| JWT_REFRESH_SECRET | Secreto refresh token | <hex de 64 chars> |
| JWT_EXPIRES_IN | Expiración access token | 15m |
| JWT_REFRESH_EXPIRES_IN | Expiración refresh token | 7d |
| UPLOAD_PATH | Ruta de uploads | ./uploads |
| CORS_ORIGIN | Origen CORS | https://tudominio.com |

---

## 11. Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Backend | Node.js + Express |
| Frontend | React 18 + Vite |
| Base de datos | PostgreSQL 14+ |
| Autenticación | JWT (access + refresh tokens) |
| Archivos | Multer (upload), Nginx (serve) |
| Proxy inverso | Nginx |
| Gestor de procesos | PM2 |
| SSL | Let's Encrypt / Certbot |
