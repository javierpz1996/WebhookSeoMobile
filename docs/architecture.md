# Architecture

App móvil **Article Studio** (`article-studio`): React Native + Expo (SDK actual) + TypeScript estricto, iOS y Android, ejecutándose primero en Expo Go. Sin web, sin backend propio, sin sincronización multi-dispositivo.

Decisiones estructurales con justificación completa: [ADR-0001](./adr/0001-expo-sqlite-as-local-database.md), [ADR-0002](./adr/0002-feature-first-layout-with-import-zones.md), [ADR-0003](./adr/0003-chat-is-a-structured-conversational-form.md), [ADR-0004](./adr/0004-n8n-contract-is-provisional.md). Vocabulario: [GLOSSARY.md](../GLOSSARY.md).

## Principios

1. TypeScript estricto: sin `any`, sin aserciones no nulas, inferencia de tipos desde valibot.
2. Zonas de importación de un solo sentido, verificadas con ESLint.
3. `core` es puro: cero React Native, cero I/O, cero dependencias.
4. Todo I/O (SQLite, red) pasa por puertos declarados en `core` e implementados en `data`.
5. Una sola raíz de composición: ahí se instancian los adaptadores.
6. Sin abstracciones especulativas: solo se construye lo decidido.

## Estructura de carpetas

```
article-studio/
├── AGENTS.md                  # reglas cortas + índice de docs
├── GLOSSARY.md
├── docs/
│   ├── architecture.md        # este archivo
│   ├── design-system.md
│   ├── api.md
│   ├── database.md
│   ├── conventions.md
│   ├── roadmap.md
│   └── adr/
├── app.config.ts
└── src/
    ├── app/                   # Expo Router + raíz de composición
    │   ├── _layout.tsx        # Drawer: Chat | Articles | Context
    │   ├── index.tsx          # Chat
    │   ├── articles/
    │   │   ├── index.tsx      # listado paginado
    │   │   └── [id].tsx       # detalle
    │   └── context.tsx        # sección reutilizable
    ├── core/                  # puro: tipos, puertos, utils, Result
    │   ├── types/
    │   ├── ports/
    │   └── utils/
    ├── data/                  # adaptadores: única zona de I/O
    │   ├── db/                # SqlDriver, esquema, migraciones/
    │   ├── repositories/      # article-repository, context-repository
    │   └── api/               # api-client, schemas de n8n (DTO)
    ├── features/
    │   ├── chat/              # model/ (hooks + store) · view/ · components/
    │   ├── articles/
    │   └── context/
    ├── ui/                    # design system
    │   ├── theme/             # tokens.ts, ThemeProvider.tsx
    │   ├── components/        # Button, TextField, Card, Modal, estados…
    │   ├── markdown/          # envoltorio de react-native-marked + estilos
    │   └── strings/           # catálogo es con claves semánticas
    └── bootstrap.ts           # wires: instanciar adaptadores → providers
```

## Responsabilidades por módulo

| Módulo | Hace | No hace |
|---|---|---|
| `core` | Tipos de dominio, interfaces de puertos (`ArticleRepository`, `ContextRepository`, `GenerationClient`), `Result<T,E>`, utilidades puras | Importar React, React Native, SQL o `fetch` |
| `data` | Implementar puertos: SQL, migraciones, `fetch` multipart, schemas de respuesta | Contener lógica de UI ni reglas de negocio |
| `features/*` | Pantallas, hooks, stores de Zustand, orquestación de su caso de uso | Escribir SQL, llamar `fetch` directamente, importar otra feature |
| `ui` | Tokens, componentes base, catálogo de strings, renderizado de Markdown | Conocer dominio (`Article`) o datos |
| `app` | Rutas, layouts, `bootstrap.ts` (composición) | Contener lógica de negocio |

## Flujo de datos

**Generar (escritura):**
```
Chat (view) → hook useGenerateArticles → store de Zustand (estado)
   → GenerationClient (data/api): multipart POST
   → schema valibot de respuesta → tipos de core
   → ArticleRepository.save() (puerto) → SqlDriver → SQLite
   → el store refresca; Articles lee del repositorio
```

**Consultar (lectura):**
```
Articles (view) → hook useArticles(page) → ArticleRepository.list(page)
   → filas SQLite → Artículos tipados → UI
```

**Contexto:**
```
Context (view) → ContextRepository → SQLite
   → al generar: el hook combina Context + GenerationParams
     (los defaults completan campos no definidos) antes del POST
```

## Dependencias entre capas

```
app ──────────────► features ──► ui
 │                    │
 │                    ├──► core  (tipos y puertos)
 │                    └──► data  (implementaciones, vía puertos)
 └──► data + core + ui + features   (solo bootstrap.ts compone)
```

- `core` no importa nada de lo anterior.
- `ui` no importa `features`, `data` ni `core` de dominio (solo tipos primitivos si hace falta).
- `data` importa `core` (implementa sus puertos), nunca `features` ni `ui`.
- `features/*` no se importan entre sí.

## Estado: quién es dueño de qué

| Dato | Dueño | Por qué |
|---|---|---|
| Borrador de la Generation, mensajes del Chat, estados de envío | Zustand (en `features/chat`) | Estado de UI efímero, no persistido |
| Topics, keywords, defaults | SQLite vía `ContextRepository` | Persistente, reutilizable |
| Artículos generados | SQLite vía `ArticleRepository` | Fuente de verdad única; no se cachea en otro lado |
| PREFERENCIAS de app | — | Hoy no existen; si aparecen, kv-store de expo-sqlite |

## Pendientes abiertos de arquitectura

- **Historial del chat al reiniciar la app**: decisión no tomada. Por defecto de trabajo el Chat es de sesión (Zustand sin persistencia); si quieres historial persistente, se modela una tabla `chat_messages` en `database.md` antes de la Etapa 4.
