# Article Studio

**Article Studio** es una aplicación móvil (iOS y Android) construida con **Expo** y **TypeScript** que guía al usuario por un **chat estructurado** para definir parámetros SEO, genera artículos mediante un **webhook de n8n** (o un **modo demo** local) y los **persiste en el dispositivo** para consultarlos offline. La interfaz está en español; el idioma del artículo generado es configurable en el flujo de chat.

Objetivo del producto: ofrecer un flujo simple de **“conversación → artículos listos para publicar”** sin backend propio en el repositorio: la inteligencia y el pipeline viven en n8n; la app es cliente, almacén local y capa de presentación.

---

## ¿Qué hace?

| Área | Descripción |
|------|-------------|
| **Chat** | Formulario conversacional paso a paso (idioma, tema, tono, audiencia, keywords, extensión, secciones, cantidad de artículos, prompt opcional). Revisión, generación, reintento ante errores y nueva generación. |
| **Generación** | `POST` multipart al webhook configurado, o **stub** en el teléfono si no hay URL (modo demo). Tras la respuesta, enriquecimiento de imágenes (portada + cuerpo) y guardado local. |
| **Artículos** | Listado paginado, detalle con Markdown, metadatos SEO, FAQ e imagen de portada. |
| **Contexto** | Biblioteca reutilizable de temas, keywords y valores por defecto; se fusiona con el borrador del chat y se envía a n8n como JSON en el campo `context`. |
| **Recientes** | En el menú lateral, acceso a **sesiones de chat** guardadas al completar una generación (tema, historial de mensajes, enlace al artículo). |
| **Persistencia** | Artículos, contexto y sesiones de chat en **JSON** (por defecto) o **SQLite** según configuración. Sin sincronización en la nube. |

---

## Tecnologías utilizadas

| Capa | Stack |
|------|--------|
| **Frontend / cliente** | React Native 0.88, React 19, Expo SDK 58, Expo Router (Drawer), TypeScript estricto, Zustand, react-hook-form + Valibot, react-native-marked, expo-image |
| **Backend (propio)** | *No incluido en este repo.* La lógica de generación corre en **n8n** (workflow externo). |
| **Database** | **expo-sqlite** (modo nativo) o documento **JSON** en AsyncStorage / `localStorage` (`EXPO_PUBLIC_USE_JSON_STORAGE`, por defecto `true`) |
| **Authentication** | *No hay cuentas de usuario.* Webhook n8n público en el `.env` del repo; opcional `EXPO_PUBLIC_WEBHOOK_TOKEN` si el workflow lo exige. |
| **APIs externas** | Webhook n8n (generación), Wikimedia Commons / Wikipedia, Openverse (imágenes temáticas); NetInfo (estado de red) |

---

## Arquitectura

La app sigue **capas con zonas de importación unidireccionales** (validadas con ESLint):

```text
app (rutas, composición)
  → features (chat, articles, context: UI + hooks/stores)
    → composition / core (puertos, tipos, Result)
  → data (único lugar con fetch y SQL)
  → ui (design system, strings, Markdown)
```

- **`core`**: dominio puro, puertos (`ArticleRepository`, `ContextRepository`, `ChatSessionRepository`, `GenerationClient`), utilidades y `Result<T, E>`.
- **`data`**: adaptadores — cliente HTTP, schemas Valibot, repositorios SQLite/JSON, migraciones.
- **`features`**: casos de uso por pantalla; no llaman `fetch` ni SQL directamente.
- **Composición**: `createAppData()` instancia repositorios y el cliente de generación; `AppDataProvider` los expone a la UI.

Flujo de datos resumido:

```text
Chat (UI) → GenerationClient → n8n
         → ArticleRepository / ChatSessionRepository → SQLite o JSON
Artículos (UI) → ArticleRepository (lectura paginada)
Contexto (UI) → ContextRepository
```

Documentación detallada: [docs/architecture.md](docs/architecture.md) · Decisiones: [docs/adr/](docs/adr/) · Glosario: [GLOSSARY.md](GLOSSARY.md).

---

## Estructura del proyecto

```text
article-studio/
├── app.config.ts          # Expo: extra (webhook, storage), plugins
├── AGENTS.md              # Reglas para desarrollo y agentes
├── docs/                  # Arquitectura, API, BD, roadmap, ADR
├── patches/               # patch-package (p. ej. react-native-drawer-layout)
├── src/
│   ├── app/               # Rutas Expo Router (_layout Drawer, chat, articles, context)
│   ├── core/              # Tipos, puertos, constantes, Result
│   ├── data/              # API n8n, DB, migraciones, repositorios
│   ├── features/          # chat · articles · context
│   ├── ui/                # Tema, componentes, strings (es), Markdown, drawer
│   └── composition/       # AppDataProvider, hooks de arranque
└── package.json
```

Archivos de referencia rápida:

| Necesidad | Ubicación |
|-----------|-----------|
| Contrato HTTP n8n | [docs/api.md](docs/api.md) · `src/data/api/` |
| Esquema y migraciones | [docs/database.md](docs/database.md) · `src/data/db/migrations/` |
| Diseño y tokens | [docs/design-system.md](docs/design-system.md) · `src/ui/theme/` |
| Convenciones y tests | [docs/conventions.md](docs/conventions.md) |

---

## Instalación

### Requisitos

- **Node.js** 20 LTS o superior  
- **npm** (incluido con Node)  
- **Expo Go** en el dispositivo (iOS / Android)  
- Misma red Wi‑Fi que la máquina de desarrollo **o** túnel Expo (ver abajo)

### Pasos

```bash
git clone <url-del-repo>
cd article-studio   # carpeta del proyecto (slug: article-studio)
npm install         # aplica patches vía postinstall (patch-package)
npm start           # usa el .env incluido (webhook n8n de demo)
```

Escaneá el QR con Expo Go. El repositorio trae **`.env` ya configurado** (generación real contra n8n, no stub). Tras cambiar variables, reiniciá con `npx expo start -c`.

**Modo demo (sin n8n):** vaciá `EXPO_PUBLIC_WEBHOOK_URL` o poné `EXPO_PUBLIC_USE_GENERATION_STUB=true` en `.env` (banner azul “Modo demo”).

**Web (opcional):**

```bash
npm run web
# o: npx expo start --web --clear
```

**Tester en otra red:**

```bash
npm run start:tunnel
```

Requiere cuenta Expo (gratuita).

**Calidad del código:**

```bash
npm run typecheck
npm run lint
npm test
```

---

## Variables de entorno

El archivo **[`.env`](.env)** va **incluido en el repositorio** para que un clon funcione sin pasos extra. La URL apunta a un workflow **n8n** de demo; las credenciales de **Groq** (u otros modelos) están configuradas **en ese workflow**, no en la app.

| Variable | Descripción | Valor en el repo |
|----------|-------------|------------------|
| `EXPO_PUBLIC_WEBHOOK_URL` | URL del webhook n8n (`POST` multipart) | `https://javierpz8.app.n8n.cloud/webhook/article-studio-generate` |
| `EXPO_PUBLIC_WEBHOOK_TOKEN` | Token opcional; header `x-api-key` | Vacío (webhook abierto) |
| `EXPO_PUBLIC_USE_GENERATION_STUB` | Fuerza generación local sin red | `false` |
| `EXPO_PUBLIC_USE_JSON_STORAGE` | `true`: JSON; `false`: SQLite nativo | `true` |

Para overrides personales usá **`.env.local`** (ignorado por git). Referencia: [`.env.example`](.env.example).

---

## API / Endpoints

La app **no expone** REST propio. El único endpoint consumido es el **webhook de n8n** configurado en `EXPO_PUBLIC_WEBHOOK_URL`.

| | |
|--|--|
| **Método** | `POST` |
| **Content-Type** | `multipart/form-data` |
| **Timeout** | 60 s |
| **Reintentos automáticos** | No (reintento manual desde la UI) |

### Campos del request (resumen)

| Campo | Descripción |
|-------|-------------|
| `language`, `topic`, `tone`, `audience` | Parámetros del artículo |
| `keywords` | Lista separada por comas |
| `wordCount`, `sections`, `articleCount` | Números enteros |
| `context` | JSON: `{ topics, keywords, defaults }` desde la pantalla Contexto |
| `prompt` | Texto libre opcional del chat |

### Respuesta esperada (provisional)

JSON con array `articles[]`: `title`, `content` (Markdown), `seo`, `faq`, `coverImage` opcional, etc. Validado con Valibot en `src/data/api/`.

Contrato completo, errores tipados y enriquecimiento de imágenes: **[docs/api.md](docs/api.md)** (marcado **provisional** — [ADR-0004](docs/adr/0004-n8n-contract-is-provisional.md)).

---

## Flujo de funcionamiento

1. **Arranque**: carga de persistencia (JSON async o SQLite sync), migraciones si aplica, composición de `AppData`.
2. **Chat**: el usuario responde cada paso; el store guarda mensajes y borrador (`GenerationParams` parcial).
3. **Revisión**: merge con **Contexto** (`mergeGenerationParams`); validación de campos obligatorios.
4. **Generación**: comprobación de red → `POST` n8n o stub → parseo y normalización de Markdown (`\n` literales, etc.).
5. **Medios**: búsqueda de portada (titular del artículo, ranking estricto) e imágenes inline (tema + keywords); inyección en Markdown si hace falta.
6. **Persistencia**: guardado de cada `Article`; una **sesión de chat** por artículo generado (Recientes).
7. **Consulta**: listado y detalle leen del repositorio local sin red.

El borrador del chat en curso vive en **memoria (Zustand)** hasta cerrar la app o iniciar “Nueva generación”; las sesiones completadas sí persisten.

---

## Base de datos

Dos modos (elegidos por env):

### Modo JSON (default)

Documento versionado (`article-studio.json.v1` / v2 con `chatSessions`) en AsyncStorage o `localStorage`.

### Modo SQLite

Archivo `article-studio.db` en el sandbox de la app, migraciones forward-only:

| Tabla | Contenido |
|-------|-----------|
| `articles` | Artículos generados (Markdown, SEO, FAQ, params JSON, portada, timestamps) |
| `context_entries` | Temas, keywords y defaults (`kind`: topic \| keyword \| default) |
| `chat_sessions` | Historial de chat + `article_id` + `topic` (migración v0002) |

No hay claves foráneas entre tablas: cada artículo guarda un snapshot de los params usados. Detalle: **[docs/database.md](docs/database.md)**.

---

## Consideraciones técnicas

**Arquitectura**

- TypeScript `strict`, sin `any`; errores de I/O como `Result`, no excepciones en UI.
- SQL y `fetch` solo en `src/data/`; fronteras validadas con Valibot.
- Zonas de importación: `core` ← `ui` / `data` ← `features` ← `app`.

**Seguridad**

- Este repo **publica a propósito** la URL del webhook n8n de demo; no uses la misma cuenta para datos sensibles.
- La app no guarda la API key de Groq: la usa el workflow en n8n.cloud.
- En cliente móvil cualquier valor en `.env` es extraíble; rate limit y cuotas deben controlarse en n8n/Groq.
- Sin login de usuarios; datos locales al dispositivo.

**Limitaciones conocidas**

- Contrato n8n **no cerrado** con workflow de producción.
- **Sin borrado** de artículos desde la UI (repositorio sí soporta `remove`).
- **Sin sync** multi-dispositivo ni búsqueda full-text en listados.
- Imágenes: dependencia de APIs públicas; portada puede quedar vacía si no pasa el umbral de relevancia.
- Parche **`patch-package`** en `react-native-drawer-layout` (warning Reanimated 4); ver `patches/` y [docs/roadmap.md](docs/roadmap.md).

**i18n**: UI en español (`src/ui/strings/es.ts`); segundo idioma de interfaz pendiente.

---

## Documentación adicional

| Documento | Contenido |
|-----------|-----------|
| [docs/roadmap.md](docs/roadmap.md) | Etapas, estado y pendientes |
| [docs/accessibility-checklist.md](docs/accessibility-checklist.md) | Criterios de accesibilidad |
| [AGENTS.md](AGENTS.md) | Reglas para contribuir / agentes IA |

---

## Licencia

Proyecto privado (`"private": true` en `package.json`). Definir licencia explícita si el repositorio se publica.
