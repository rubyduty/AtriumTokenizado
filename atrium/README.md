# Atrium

**API REST profesional de gestión de usuarios y tokens de sesión**, acompañada de una interfaz web SaaS moderna.

> Proyecto universitario pensado para impresionar: arquitectura limpia, seguridad real, respuestas unificadas, frontend conectado a la API y documentación lista para defender.

---

## Descripción

Atrium permite:

- Registrar usuarios con contraseñas **hasheadas** (bcrypt, cost 12)
- Iniciar sesión y generar **tokens de sesión** persistidos en base de datos
- Listar los 10 primeros usuarios (sin nunca exponer passwords)
- Actualizar el nombre del usuario autenticado mediante `Authorization: Bearer`
- Monitorizar el estado de la API desde un dashboard visual

| Capa | Stack |
|------|--------|
| Backend | Node.js · Express · Prisma · PostgreSQL · bcrypt · Zod · Helmet · CORS · rate-limit |
| Frontend | React 18+ · Vite · TypeScript · Tailwind CSS · Framer Motion · Lucide · React Router · Axios |
| Tooling | Docker Compose · Vitest · Supertest · Postman |

---

## Arquitectura

```
atrium/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Orquestan HTTP → service
│   │   ├── services/        # Lógica de negocio
│   │   ├── routes/          # Definición de endpoints
│   │   ├── middleware/      # Auth, validación, errores
│   │   ├── validators/      # Esquemas Zod
│   │   ├── utils/           # Respuestas, hash, tokens
│   │   ├── config/          # env + Prisma client
│   │   ├── app.js           # Express app
│   │   └── server.js        # Bootstrap
│   ├── prisma/              # schema + migrations + seed
│   └── tests/               # Vitest + Supertest
├── frontend/
│   └── src/
│       ├── pages/           # Login, Register, Dashboard, Profile
│       ├── components/
│       ├── contexts/        # Auth + Toasts
│       ├── layouts/
│       ├── lib/api.ts       # Cliente HTTP
│       └── types/
├── postman/users-api.postman_collection.json
├── docker-compose.yml
└── README.md
```

**Flujo de capas:** `Route → Middleware (validate/auth) → Controller → Service → Prisma → PostgreSQL`

---

## Requisitos previos

- Node.js **≥ 18**
- npm **≥ 9**
- Docker (recomendado) **o** PostgreSQL 16+ local

---

## Instalación rápida

### 1. Clonar / entrar al proyecto

```bash
cd atrium
```

### 2. Base de datos

**Con Docker (recomendado):**

```bash
docker compose up -d postgres
```

Espera a que el healthcheck esté verde (`docker compose ps`).

**Sin Docker:** crea una base `atrium` y un usuario, y ajusta `DATABASE_URL` en `backend/.env`.

### 3. Variables de entorno

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Valores por defecto:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | `postgresql://atrium:atrium_dev_2024@localhost:5432/atrium?schema=public` |
| `PORT` | `4000` |
| `CORS_ORIGIN` | `http://localhost:5173` |
| `BCRYPT_ROUNDS` | `12` |
| `TOKEN_TTL_DAYS` | `7` |
| `VITE_API_URL` | `http://localhost:4000` |

### 4. Dependencias, migraciones y seed

```bash
npm install
npm install --prefix backend
npm install --prefix frontend

cd backend
npx prisma migrate deploy
npm run prisma:seed
cd ..
```

### 5. Arrancar

**Terminal A — Backend**

```bash
npm run dev --prefix backend
# → http://localhost:4000
```

**Terminal B — Frontend**

```bash
npm run dev --prefix frontend
# → http://localhost:5173
```

Opcional (ambos a la vez desde la raíz, tras `npm install` en raíz):

```bash
npm run dev
```

---

## Credenciales demo (seed)

Tras el seed, todos estos usuarios tienen la contraseña **`Demo123!`**:

| Nombre | Email |
|--------|--------|
| Ana García | `ana@atrium.dev` |
| Carlos Ruiz | `carlos@atrium.dev` |
| María López | `maria@atrium.dev` |
| Demo User | `demo@atrium.dev` |
| Elena Martín | `elena@atrium.dev` |

Usa **`demo@atrium.dev` / `Demo123!`** en el login del frontend.

---

## Endpoints de la API

Todas las respuestas siguen el formato unificado:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### `GET /api/health`

Comprueba API + base de datos.

```bash
curl http://localhost:4000/api/health
```

### `GET /api/users`

Devuelve los **10 primeros** usuarios (sin passwords).

```bash
curl http://localhost:4000/api/users
```

### `POST /api/users`

Crea un usuario. Valida nombre, email y fortaleza de contraseña. Email único → `409`.

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Juan Pérez","email":"juan@example.com","password":"Password123!"}'
```

### `POST /api/auth/login`

Verifica bcrypt, crea fila en `tokens`, devuelve token + usuario.

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@atrium.dev","password":"Demo123!"}'
```

Credenciales incorrectas → HTTP `401`, message `"Credenciales incorrectas"`, `data: null`.

### `PATCH /api/users/name`

Requiere `Authorization: Bearer <token>`.

```bash
curl -X PATCH http://localhost:4000/api/users/name \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name":"Nuevo Nombre"}'
```

Token inválido/expirado → HTTP `401`, message `"Token no válido o sesión inexistente"`.

---

## Autenticación

1. El usuario hace login con email + password.
2. El servidor compara el password con el **hash bcrypt** almacenado.
3. Si es correcto, genera un token con `crypto.randomBytes(32).toString('hex')`.
4. Guarda el token en la tabla `tokens` ligado a `userId`, con `expiresAt` (7 días por defecto).
5. El cliente envía `Authorization: Bearer <token>` en rutas protegidas.
6. El middleware `requireAuth` busca el token, comprueba expiración y carga el usuario.

**Las contraseñas nunca se devuelven** en ninguna respuesta (serializer + `select` de Prisma).

---

## Postman

1. Abre Postman → **Import** → selecciona `postman/users-api.postman_collection.json`
2. Variable de colección `baseUrl` = `http://localhost:4000`
3. Ejecuta **Auth → POST Login** (usa `demo@atrium.dev`)
4. El script de test guarda automáticamente `token`
5. Ejecuta **Users → PATCH Update Name** — ya lleva el Bearer

---

## Tests

```bash
cd backend
npm test
```

Cubren: health, crear usuario, hash, email duplicado, validaciones, login ok/fail, GET 10 users sin password, PATCH name con Bearer, token inválido.

---

## Modelos

### User

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID | PK |
| name | String | |
| email | String | único, indexado |
| password | String | hash bcrypt — **nunca en respuestas** |
| createdAt / updatedAt | DateTime | |

### Token

| Campo | Tipo | Notas |
|-------|------|--------|
| id | UUID | PK |
| token | String | único, 64 hex |
| userId | UUID | FK → User, cascade |
| createdAt | DateTime | |
| expiresAt | DateTime | TTL configurable |

---

## Decisiones técnicas

- **Controllers / Services / Routes:** separación clara para explicar y testear.
- **Zod** en el borde HTTP: errores de validación → `400` con mensaje en español.
- **Prisma** como ORM tipado y migraciones versionadas.
- **Respuestas unificadas** (`success`, `message`, `data`) para que el frontend y Postman sean predecibles.
- **Tokens en BD** (no JWT firmado) para poder revocar/expirar de forma explícita y relacionar Token ↔ User.
- **Helmet + CORS + rate-limit** en login como capa básica de hardening.
- **Frontend TypeScript** con AuthContext, rutas protegidas, toasts y estados de carga reales.

---

## Seguridad

- Passwords hasheadas con **bcrypt** (cost 12 en producción/desarrollo).
- Tokens criptográficamente seguros (`crypto.randomBytes`).
- Expiración de sesión (`TOKEN_TTL_DAYS`).
- Nunca se serializa `password`.
- Validación de entrada (Zod) y límite de body JSON.
- `.env` en `.gitignore`; plantilla en `.env.example`.
- Rate limiting en `/api/auth/login`.
- CORS restringido al origen del frontend.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| `Can't reach database` | `docker compose up -d postgres` o revisa `DATABASE_URL` |
| CORS error en el navegador | Comprueba `CORS_ORIGIN` = `http://localhost:5173` |
| Puerto 4000 ocupado | Cambia `PORT` en `backend/.env` |
| Migraciones pendientes | `cd backend && npx prisma migrate deploy` |
| Seed no corre | `cd backend && npm run prisma:seed` |
| Frontend no habla con API | Revisa `VITE_API_URL` y que el backend esté arriba |

---

## Cómo defender este proyecto delante del profesor

### Por qué se utiliza hash para passwords

Porque si alguien roba la base de datos, **no obtiene las contraseñas en claro**. bcrypt es una función de hash adaptativa con *salt* automático: cada password produce un hash distinto y es costosa de forzar por fuerza bruta.

### Cómo funciona el login

1. El cliente envía email + password.
2. Se busca el usuario por email.
3. Se compara con `bcrypt.compare(password, user.password)`.
4. Si falla (usuario inexistente **o** password incorrecta) se responde el **mismo** mensaje (`Credenciales incorrectas`) para no filtrar si el email existe.
5. Si acierta, se crea un Token y se devuelve.

### Cómo se genera el token

Con `crypto.randomBytes(32).toString('hex')` → 64 caracteres hexadecimales de entropía criptográfica. No es predecible ni derivado del password.

### Cómo se relaciona Token con User

Relación **1:N** en Prisma: un User tiene muchos Token. La FK `userId` tiene `onDelete: Cascade` (si se borra el usuario, desaparecen sus sesiones).

### Cómo se protege el endpoint PATCH

El middleware `requireAuth` exige `Authorization: Bearer …`, busca el token en BD, verifica que no haya expirado y adjunta `req.user`. Sin eso, el controller ni siquiera se ejecuta.

### Por qué `Authorization: Bearer`

Es el estándar HTTP para tokens de acceso (OAuth 2.0 / APIs REST). El frontend y Postman lo envían igual; el backend lo parsea de forma uniforme.

### Por qué `success`, `message` y `data`

Contrato estable: el frontend siempre sabe dónde mirar el resultado, el mensaje para el toast, y el payload. Facilita errores controlados (`success: false`) sin romper el tipado.

### Por qué try/catch

Para no tumbar el proceso Node ante un fallo de BD o lógica, y devolver un JSON coherente vía el error handler centralizado.

### Ventajas de separar controllers / services / routes

- Routes: solo cableado HTTP.
- Controllers: adaptan request/response.
- Services: lógica reutilizable y testeable sin Express.
Así se explica y se mantiene mejor.

### Cómo demostrar en Postman

Importar la colección → Login (guarda token) → GET users → PATCH name → Login fallido. Mostrar que en ninguna respuesta aparece `password`.

### Decisiones de seguridad tomadas

bcrypt cost 12, tokens aleatorios con TTL, validación Zod, helmet, CORS, rate-limit login, no secretos en código, passwords fuera de las respuestas.

---

## Preguntas del profesor (y respuestas)

**¿Por qué no usáis JWT?**  
Porque el enunciado pide un modelo Token en base de datos ligado al usuario. Almacenarlo en BD permite revocar sesiones y comprobar expiración de forma explícita. JWT sería válido en otros contextos, pero aquí Token↔User es un requisito.

**¿Dónde se hashea la password?**  
En `user.service.js` → `hashPassword` (`utils/password.js`) **antes** del `prisma.user.create`. Nunca se guarda el texto plano.

**¿Qué pasa si el token ha caducado?**  
`requireAuth` lo detecta (`expiresAt < now`), lo borra y responde 401 con `"Token no válido o sesión inexistente"`.

**¿Cómo garantizas que no se filtra el password?**  
`select` de Prisma excluye `password` en lecturas públicas, y el serializer `serializeUser` solo expone id, name, email, fechas. Los tests comprueban `password === undefined`.

**¿Qué es Zod?**  
Una librería de validación de esquemas. Si el body no cumple (email inválido, password débil…), se corta en el middleware con HTTP 400.

**¿Cómo escalas esto?**  
Separando servicios, indexando email/token, moviendo rate-limit a Redis, y añadiendo refresh tokens / rotación. La arquitectura actual ya lo permite sin reescribir todo.

**¿El frontend es solo maqueta?**  
No: Login, Registro, Dashboard y Perfil llaman a la API real (`axios` + `VITE_API_URL`).

---

## Licencia

Proyecto académico — uso educativo.
