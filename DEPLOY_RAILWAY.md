# Despliegue en Railway — DRUTS

Guía paso a paso para desplegar la tienda DRUTS (Next.js + NestJS + PostgreSQL) en [Railway](https://railway.app).

> **Nota:** Redis no es necesario, no se usa actualmente en el código.

---

## 1. Preparación del repositorio

Sube el proyecto a GitHub (Railway despliega desde Git):

```bash
cd /Users/andrey.oliveros/Documents/proyectos/calzado
git init
git add .
git commit -m "Initial commit DRUTS"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/druts.git
git push -u origin main
```

---

## 2. Crear el proyecto en Railway

1. Entra a https://railway.app y crea cuenta (puedes usar GitHub).
2. Click en **New Project → Deploy from GitHub repo** y selecciona el repositorio `druts`.
3. Cancela el deploy automático: el proyecto tiene **dos servicios** (frontend y backend) que vamos a configurar manualmente.

---

## 3. Provisionar PostgreSQL

1. En el canvas del proyecto, click **+ New → Database → PostgreSQL**.
2. Railway crea la base de datos y expone variables como `DATABASE_URL`, `PGHOST`, `PGUSER`, etc.
3. Renombra el servicio a `postgres` para tenerlo claro.

---

## 4. Crear el servicio **Backend** (NestJS)

1. En el canvas, click **+ New → GitHub Repo → druts** (otra vez, mismo repo).
2. Renómbralo a `backend`.
3. Entra al servicio → **Settings**:
   - **Root Directory:** `backend`
   - **Build:** automático (Railway detecta `Dockerfile` y `railway.toml`).
   - **Healthcheck Path:** ya configurado en `railway.toml` → `/health`.
4. Ve a **Variables → Raw Editor** y pega:

```env
NODE_ENV=production
PORT=3001

# Conexión a Postgres (Railway la inyecta automáticamente cuando vinculas el servicio)
DATABASE_URL=${{ Postgres.DATABASE_URL }}
DB_SSL=true

# CRÍTICO: Solo el primer despliegue. Crea las tablas con synchronize.
# Después de correr el seed, cambia esto a "false" o elimínalo.
DB_SYNC=true

# JWT — genera uno fuerte: openssl rand -base64 64
JWT_SECRET=PEGAR-AQUI-UN-SECRETO-LARGO-Y-RANDOM
JWT_EXPIRES_IN=7d

# CORS — actualiza con la URL pública del frontend (paso 5)
FRONTEND_URL=https://druts-frontend.up.railway.app
```

5. **Settings → Networking → Generate Domain** para obtener una URL pública (algo como `druts-backend.up.railway.app`).
6. Espera a que termine el deploy (verás logs en vivo).

---

## 5. Crear el servicio **Frontend** (Next.js)

1. **+ New → GitHub Repo → druts** (tercera vez).
2. Renómbralo a `frontend`.
3. **Settings**:
   - **Root Directory:** `frontend`
4. **Variables → Raw Editor**:

```env
# URL pública del backend del paso 4 (sin /api/v1 al final)
NEXT_PUBLIC_API_URL=https://druts-backend.up.railway.app
```

> Esta variable se inyecta también durante el `docker build` para que Next.js la incruste en el bundle.

5. **Settings → Networking → Generate Domain** para obtener la URL pública (ej: `druts-frontend.up.railway.app`).
6. Vuelve al servicio `backend` y actualiza `FRONTEND_URL` con esta URL → redespliega.

---

## 6. Inicializar la base de datos (seed)

Después de que el backend esté **Live**, hay que crear las tablas y poblar los datos demo (categorías, productos DRUTS, usuarios, cupones).

Tienes dos opciones:

### Opción A — Desde la UI de Railway (más simple)

1. En el servicio `backend`, ve a la pestaña **Settings → Deploy**.
2. En **Custom Start Command** pon temporalmente:
   ```
   node dist/main & sleep 8 && node dist/database/seeds/run-seed.js && wait
   ```
3. Redeploy. En los logs verás:
   ```
   ✅ 5 categorías creadas
   ✅ Marca DRUTS creada
   ✅ Usuarios demo (admin@druts.co / Admin123!)
   ✅ 8 productos creados
   ```
4. Una vez ejecutado, **vuelve a poner el start command original** (vacío o `node dist/main`) y **cambia `DB_SYNC` a `false`**. Redeploy.

### Opción B — Desde tu terminal con Railway CLI

```bash
# Instalar CLI (una vez)
npm i -g @railway/cli
railway login

# Conectar proyecto
cd backend
railway link

# Ejecutar seed contra la base de datos remota
railway run npm run seed:prod
```

---

## 7. Verificar el despliegue

### Backend
```bash
curl https://druts-backend.up.railway.app/health
# {"status":"ok","timestamp":"..."}

curl https://druts-backend.up.railway.app/api/v1/products?limit=2
# Lista de productos DRUTS
```

### Frontend
Abre `https://druts-frontend.up.railway.app` — deberías ver:
- Hero editorial DRUTS
- Categorías Sneakers / Botas / Casuales / Premium / Lifestyle
- Productos del catálogo

### Panel admin
1. Entra a `/auth/login`
2. Credenciales: `admin@druts.co` / `Admin123!`
3. Visita `/admin/dashboard`, `/admin/customers`, `/admin/coupons`, `/admin/analytics`

---

## 8. Endurecer producción

Una vez que verifiques que todo funciona:

| Variable | Cambio |
|---|---|
| `DB_SYNC` | Quitar o poner `false` (evita que TypeORM modifique el esquema) |
| `JWT_SECRET` | Confirmar que es uno aleatorio (no el de demo) |
| Custom domain | En cada servicio: **Settings → Networking → Custom Domain** (apunta tu dominio con CNAME) |

---

## Costes estimados

| Servicio | Plan | Costo aprox. |
|---|---|---|
| Postgres | Hobby | ~$5/mes (incluye 1 GB) |
| Backend | Hobby | ~$5/mes (incluye 8 GB-h) |
| Frontend | Hobby | ~$5/mes |
| **Total** | | **~$15/mes** |

Railway da **$5 USD gratis** cada mes en el plan free, suficiente para pruebas.

---

## Troubleshooting

**❌ El backend arranca pero no se conecta a la DB**
- Confirma que vinculaste `DATABASE_URL=${{ Postgres.DATABASE_URL }}` (con la sintaxis exacta).
- Verifica que `DB_SSL=true` esté presente (Railway Postgres requiere SSL).

**❌ El frontend muestra páginas pero el catálogo está vacío**
- Verifica que `NEXT_PUBLIC_API_URL` apunte al backend correcto **sin `/api/v1` al final**.
- Si cambiaste la variable, **redespliega** el frontend (Next.js inyecta variables `NEXT_PUBLIC_*` en build time).

**❌ CORS error en consola del navegador**
- En el backend, `FRONTEND_URL` debe ser la URL exacta del frontend (con `https://`, sin slash final).
- Para múltiples dominios, separa con coma: `FRONTEND_URL=https://druts.com,https://www.druts.com`.

**❌ El seed falla con "relation does not exist"**
- `DB_SYNC` debe estar en `true` la primera vez para que TypeORM cree las tablas.

**❌ Las imágenes no cargan**
- Las fotos de productos se sirven desde `frontend/public/druts/*.png` y van incluidas en la imagen Docker. Verifica con `curl https://druts-frontend.up.railway.app/druts/logo.png`.
