# LUMEN & CO. — Frontend

Frontend completo para el e-commerce **LUMEN & CO.** (decoración y hogar), construido con **React + Vite + TypeScript + Tailwind CSS**. Incluye control de acceso por roles (RBAC), carrito y checkout, chatbot con base de conocimiento simulada, y paneles internos para empleados y administradores.

El frontend está **100% funcional con datos mock** (`src/lib/mockData.ts`) y preparado para conectarse a un backend real en **FastAPI** con base de datos **PostgreSQL en NeonDB**, sin tener que tocar los componentes de UI.

---

## 1. Requisitos

- Node.js 18 o superior
- npm 9 o superior

## 2. Instalación

```bash
npm install
cp .env.example .env
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## 3. Variables de entorno (`.env`)

| Variable          | Descripción                                                                 | Valor por defecto              |
|-------------------|------------------------------------------------------------------------------|---------------------------------|
| `VITE_API_URL`    | URL base del backend FastAPI                                                | `http://localhost:8000/api`    |
| `VITE_USE_MOCK`   | Si es `"true"`, usa los datos mock en vez de llamar al backend               | `true`                          |

Para conectar el backend real, basta con poner `VITE_USE_MOCK=false` en el `.env` y apuntar `VITE_API_URL` al servidor FastAPI. Todas las funciones en `src/lib/api.ts` ya están escritas para llamar a los endpoints reales en ese modo — no hay que modificar ningún componente ni página.

## 4. Cuentas de prueba (modo mock)

| Rol      | Correo               | Contraseña        |
|----------|-----------------------|-------------------|
| Cliente  | maria@cliente.com     | cualquiera (8+ car.) |
| Cliente  | jorge@cliente.com     | cualquiera (8+ car.) |
| Empleado | lucia@lumenco.com     | cualquiera (8+ car.) |
| Admin    | admin@lumenco.com     | cualquiera (8+ car.) |

En modo mock, cualquier contraseña de 8 o más caracteres es aceptada para estos correos.

---

## 5. Estructura de carpetas

```
src/
├── components/
│   ├── layout/         # Navbar, Footer, Layout general
│   ├── ui/              # Button, Input, Badge, Card (componentes base)
│   ├── Chatbot.tsx       # Widget flotante de chat con lógica por rol
│   ├── ProductCard.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts            # Cliente HTTP: mock <-> FastAPI (un solo punto de cambio)
│   └── mockData.ts        # Productos, pedidos, usuarios, tickets, KB
├── pages/
│   ├── (públicas)         # Home, Catalog, ProductDetail, Cart, Checkout, Login, etc.
│   ├── account/            # Perfil, Pedidos, Favoritos (rol client+)
│   ├── employee/            # Panel interno (rol employee+)
│   └── admin/                # Dashboard, CRUD productos/usuarios, KB (rol admin)
├── store/
│   ├── authStore.ts        # Sesión + JWT (Zustand + localStorage)
│   ├── cartStore.ts
│   ├── favoritesStore.ts
│   └── themeStore.ts        # Modo claro/oscuro persistente
├── types/index.ts            # Tipos compartidos (contrato con el backend)
└── App.tsx                    # Definición de rutas y protección por rol
```

---

## 6. Roles y permisos (RBAC)

| Ruta                          | Guest | Client | Employee | Admin |
|-------------------------------|:-----:|:------:|:--------:|:-----:|
| `/`, `/catalogo`, `/producto/:slug` | ✅ | ✅ | ✅ | ✅ |
| `/carrito`                     | ✅ (simula checkout, pide login) | ✅ | ✅ | ✅ |
| `/checkout`                    | ❌ → redirige a `/login` | ✅ | ✅ | ✅ |
| `/cuenta/*`                     | ❌ | ✅ | ✅ | ✅ |
| `/panel` (interno)               | ❌ | ❌ | ✅ | ✅ |
| `/admin/*`                        | ❌ | ❌ | ❌ | ✅ |

La protección se implementa en dos capas:
1. **Frontend** (`ProtectedRoute.tsx`): oculta rutas y redirige según el rol guardado en el JWT decodificado en el store de auth. Esto es solo UX — nunca debe ser la única barrera.
2. **Backend (a implementar)**: cada endpoint debe validar el rol contenido en el JWT en el propio servidor antes de responder. El frontend nunca debe ser la única fuente de verdad sobre permisos.

---

## 7. Base de conocimiento + Chatbot (RAG simulado)

El chatbot (`src/components/Chatbot.tsx`) envía cada mensaje a `sendChatMessage(message, role, userId)`, que en modo real llama a:

```
POST /chat
Body: { "message": string, "role": "guest"|"client"|"employee"|"admin", "user_id": string | null }
```

**Contrato esperado del backend:**
1. Verificar el JWT del request (si existe) — nunca confiar en el `role` que envía el cliente sin validarlo contra el token.
2. Filtrar los artículos de la base de conocimiento (`knowledge_base` en la tabla SQL) por el campo `visible_para` según el rol ya validado.
3. Pasar solo esos artículos filtrados como contexto al LLM (RAG).
4. Si no hay artículos relevantes visibles para ese rol, responder literalmente: `"No tengo acceso a esa información."`

En el modo mock (`VITE_USE_MOCK=true`), esta lógica se simula en `src/lib/api.ts` con un filtro simple por palabras clave sobre `mockKBArticles`.

---

## 8. Endpoints esperados de FastAPI

| Método | Endpoint                          | Rol mínimo | Descripción                                      |
|--------|-------------------------------------|------------|----------------------------------------------------|
| GET    | `/api/products`                      | guest      | Lista de productos del catálogo                    |
| GET    | `/api/products/{slug}`                | guest      | Detalle de un producto                             |
| POST   | `/api/auth/register`                   | guest      | Registro de nuevo cliente                          |
| POST   | `/api/auth/login`                       | guest      | Login, devuelve `{ user, token }`                  |
| POST   | `/api/auth/logout`                       | client     | Invalida el token (opcional, según estrategia JWT) |
| GET    | `/api/orders?clienteId=`                  | client     | Pedidos del cliente autenticado                    |
| POST   | `/api/orders`                              | client     | Crea un nuevo pedido (checkout)                    |
| GET    | `/api/orders` (todos)                       | employee   | Lista completa de pedidos                          |
| PATCH  | `/api/orders/{id}`                           | employee   | Cambia el estado de un pedido                      |
| GET    | `/api/support/tickets`                        | employee   | Lista de tickets de soporte                        |
| POST   | `/api/support/tickets/{id}/reply`               | employee   | Responder un ticket                                |
| GET    | `/api/knowledge-base?role=`                      | guest      | Artículos KB visibles para ese rol                 |
| GET    | `/api/knowledge-base/all`                          | admin      | Todos los artículos KB, sin filtrar                |
| POST   | `/api/knowledge-base`                               | admin      | Crear artículo KB                                  |
| PUT    | `/api/knowledge-base/{id}`                            | admin      | Editar artículo KB                                 |
| DELETE | `/api/knowledge-base/{id}`                              | admin      | Eliminar artículo KB                                |
| POST   | `/api/chat`                                              | guest      | Endpoint del chatbot (RAG con control de acceso)    |
| GET    | `/api/admin/metrics`                                      | admin      | KPIs del dashboard (ventas, pedidos activos, etc.)  |
| GET    | `/api/admin/users`                                          | admin      | Lista de usuarios y empleados                       |
| PATCH  | `/api/admin/users/{id}`                                       | admin      | Cambiar rol o datos de un usuario                   |
| DELETE | `/api/admin/users/{id}`                                         | admin      | Eliminar usuario                                    |
| POST   | `/api/admin/products`                                             | admin      | Crear producto                                      |
| PUT    | `/api/admin/products/{id}`                                          | admin      | Editar producto (incluye precio)                    |
| DELETE | `/api/admin/products/{id}`                                            | admin      | Eliminar producto                                   |

---

## 9. Esquema de base de datos (PostgreSQL en NeonDB)

```sql
CREATE TYPE rol_usuario AS ENUM ('guest', 'client', 'employee', 'admin');
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'enviado', 'entregado', 'cancelado');
CREATE TYPE estado_ticket AS ENUM ('abierto', 'en_proceso', 'resuelto');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rol rol_usuario NOT NULL DEFAULT 'client',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(180) UNIQUE NOT NULL,
    nombre VARCHAR(180) NOT NULL,
    categoria VARCHAR(80) NOT NULL,
    precio_usd NUMERIC(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    imagen_url TEXT,
    descripcion_corta TEXT,
    descripcion_larga TEXT,
    materiales TEXT[],
    destacado BOOLEAN NOT NULL DEFAULT false,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    total_usd NUMERIC(10, 2) NOT NULL,
    estado estado_pedido NOT NULL DEFAULT 'pendiente',
    direccion_envio TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pedido_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario_usd NUMERIC(10, 2) NOT NULL
);

CREATE TABLE tickets_soporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES usuarios(id),
    asunto VARCHAR(200) NOT NULL,
    estado estado_ticket NOT NULL DEFAULT 'abierto',
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ticket_mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets_soporte(id) ON DELETE CASCADE,
    autor_id UUID REFERENCES usuarios(id),
    texto TEXT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    contenido TEXT NOT NULL,
    visible_para rol_usuario[] NOT NULL DEFAULT ARRAY['admin']::rol_usuario[],
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE favoritos (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, producto_id)
);

CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_kb_categoria ON knowledge_base(categoria);
```

---

## 10. Pasos para conectar el backend FastAPI

1. Levanta el backend FastAPI (fuera de este repositorio) apuntando a tu instancia de NeonDB (usa el connection string que te da Neon en `DATABASE_URL`).
2. Implementa los endpoints de la tabla de la sección 8, devolviendo JSON con las mismas formas que ves en `src/types/index.ts`.
3. Configura CORS en FastAPI para aceptar el origen del frontend (`http://localhost:5173` en desarrollo).
4. En este proyecto, copia `.env.example` a `.env`, pon `VITE_API_URL=http://localhost:8000/api` y `VITE_USE_MOCK=false`.
5. Reinicia `npm run dev`. La app dejará de usar `mockData.ts` y empezará a llamar al backend real a través de `src/lib/api.ts`, sin cambios adicionales en componentes o páginas.
6. Verifica que el JWT que emite `/auth/login` incluya el rol del usuario (`rol`) para que el backend pueda validar permisos en cada endpoint protegido.

---

## 11. Modo claro / oscuro y responsive

- El toggle de tema vive en el Navbar y persiste en `localStorage` (`useThemeStore`).
- Todas las vistas (catálogo, checkout, paneles internos, chatbot) están cubiertas por las clases `dark:` de Tailwind.
- Mobile-first: menú hamburguesa en el Navbar, grids que colapsan de 4 a 2 columnas, y las tablas de los paneles interno/admin se convierten en tarjetas apiladas por debajo de `md`.

## 12. Scripts disponibles

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción (tsc + vite build)
npm run preview   # sirve el build de producción localmente
npm run lint      # linting con ESLint
```
