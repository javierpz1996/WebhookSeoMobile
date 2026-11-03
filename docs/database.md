# Database — Modelo de datos y persistencia local

Motor: **expo-sqlite** (incluido en Expo Go), un único archivo en el sandbox de la app. Decisión y alternativas: [ADR-0001](./adr/0001-expo-sqlite-as-local-database.md).

## Capa de repositorio (lo que hace reemplazable la BD)

```
features/*  ──►  puertos en core/ports  ◄── implementa ──  data/repositories
                        ▲                                        │
                        └──────────  SqlDriver (core)  ◄──────────┤
                                                          data/db/sqlite-driver
```

- `core/ports` declara `ArticleRepository`, `ContextRepository` y `SqlDriver` como interfaces puras que devuelven `Result<T, DbError>`.
- `data/repositories` es la **única** capa que arma SQL; `features` jamás ve SQL ni el driver.
- `bootstrap.ts` instancia los adaptadores y los entrega por contexto.
- **Cambio a una BD real**: se implementa un nuevo driver/repositorios cumpliendo los puertos; ninguna feature se entera.

## Esquema (migración baseline)

```sql
CREATE TABLE articles (
  id                TEXT PRIMARY KEY NOT NULL,
  title             TEXT NOT NULL,
  slug              TEXT,
  content_markdown  TEXT NOT NULL,
  seo_title         TEXT,
  seo_description   TEXT,
  seo_keywords      TEXT NOT NULL DEFAULT '[]',   -- array JSON
  faq               TEXT NOT NULL DEFAULT '[]',   -- array de {question, answer}
  cover_image_url   TEXT,
  language          TEXT NOT NULL,
  topic             TEXT NOT NULL,
  params            TEXT NOT NULL,                -- JSON GenerationParams usados
  created_at        INTEGER NOT NULL              -- epoch ms
) STRICT;
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

CREATE TABLE context_entries (
  id         TEXT PRIMARY KEY NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('topic','keyword','default')),
  value      TEXT NOT NULL,
  meta       TEXT,                                 -- JSON: nota / campo que completa
  position   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
) STRICT;
CREATE INDEX idx_context_kind_position ON context_entries(kind, position);
```

**Compromiso documentado:** SEO y FAQ viven como JSON en columnas (no tablas hijas). Es suficiente porque el agregado se lee y se escribe completo y el repository aísla el modelo; normalizar al pasar a una BD real tocaría solo `data/`.

## Reglas de apertura y migraciones

1. Abrir **sincrónicamente**, en orden: `user_version` → `journal_mode = WAL` → `synchronous = FULL` → `foreign_keys = ON`. Todas las tablas `STRICT`.
2. Migraciones **forward-only**: un archivo congelado por versión (`v0001-baseline.ts`), en orden, cada paso y su sello en una transacción. **Nunca editar un paso ya enviado.**
3. **Snapshot antes de migrar** si hay tablas: `VACUUM INTO 'app.db.vN.bak'`, conservar los 2 últimos tras éxito.
4. **Nunca crash-loop al iniciar**: archivo dañado, de versión más nueva o en `user_version` 0 desconocido → se deja intacto y se corre sesión en memoria con un mensaje explicable en la primera pantalla. Abrir nunca lanza.
5. Preferencias clave-valor (si aparecen) van al kv-store de expo-sqlite; secretos a `expo-secure-store`. **No hay secretos hoy.**

## Estrategia de almacenamiento

| Dato | Dónde | Retención |
|---|---|---|
| Artículos | tabla `articles` | Hasta que el usuario borre (función **PENDIENTE**: ¿habrá borrado? no está en el alcance actual) |
| Context (topics/keywords/defaults) | tabla `context_entries` | Permanente |
| Historial del chat | JSON doc `chatSessions` / tabla `chat_sessions` | Hasta borrado del artículo (**PENDIENTE**); se guarda al completar una generación |
| Borrador de la Generation | — | **PENDIENTE**: por defecto vive en memoria |
| Imágenes de portada | caché de `expo-image` | Regenerable; no es fuente de verdad |

## Volumen y consultas (decisión Q18)

Cientos de artículos con decenas de entradas de Context. Por eso: índice por `created_at DESC`, paginación de **20 en 20** (`LIMIT/OFFSET` con sello de última página), y búsqueda por título **fuera de alcance** por ahora (se agrega con `LIKE` sobre el índice si el volumen lo pide).

## Relaciones

No hay claves foráneas entre tablas: `Article.params` guarda un snapshot del JSON usado (incluido el `context` enviado), porque un artículo no debe cambiar si el Context se edita después. `context_entries` es independiente.
