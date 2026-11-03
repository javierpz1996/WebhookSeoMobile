# API — Integración con n8n

> ⚠️ **Contrato PROVISIONAL** (ver [ADR-0004](./adr/0004-n8n-contract-is-provisional.md)). Definido del lado de la app porque el workflow de n8n no estaba disponible. Todo lo marcado **PENDIENTE** debe validarse contra el workflow real antes de dar por cerrada la Etapa 4. Un solo lugar del código conoce el formato de entrada y salida: `src/data/api/`.

## Endpoint

| | |
|---|---|
| Método | `POST` |
| URL | `EXPO_PUBLIC_WEBHOOK_URL` (`.env` versionado → `app.config.ts` → `expo-constants`) |
| Content-Type | `multipart/form-data` |
| Timeout | 60 s (la generación es lenta; **PENDIENTE** ajustar con el workflow real) |
| Reintentos automáticos | **No.** El POST puede no ser idempotente; reintenta solo el usuario. **PENDIENTE**: idempotencia en n8n. |

## Autenticación

El webhook del repo está **abierto** (`EXPO_PUBLIC_WEBHOOK_TOKEN` vacío en `.env`).

- Si el workflow exige token: header `x-api-key` desde `extra` de `app.config.ts`, origen `EXPO_PUBLIC_WEBHOOK_TOKEN` en `.env`.
- La medida real de protección (rate-limit, allowlist, rotación de keys Groq en n8n) es del lado de n8n, no de la app.
- Recordatorio: en una app móvil cualquier valor en `.env` es extraíble; no es seguridad de perímetro.

## Request

Campos `multipart/form-data` de una **Generation**:

| Campo | Tipo | Ejemplo | Notas |
|---|---|---|---|
| `language` | string | `es` | ISO 639-1. Idioma **del artículo**, no de la UI |
| `topic` | string | `inversión cripto` | |
| `tone` | string | `formal` | Catálogo de tonos **PENDIENTE** (¿libre o enum?) |
| `audience` | string | `principiantes` | |
| `keywords` | string | `bitcoin,custodia,cold` | Separadas por coma **PENDIENTE** de confirmar |
| `wordCount` | number | `1200` | |
| `sections` | number | `5` | Secciones del artículo |
| `articleCount` | number | `3` | Cantidad de artículos a generar |
| `context` | string (JSON) | `{"topics":["..."],"keywords":["..."],"defaults":{}}` | Contexto reutilizable serializado **PENDIENTE** de confirmar |
| `prompt` | string | *"3 artículos cortos…"* | Texto libre opcional del Chat (extra, nunca define los otros campos) |

Valores fusionados antes del envío: los `defaults` del Context completan los campos de `GenerationParams` no definidos explícitamente.

## Response

Esquema provisional (validado con valibot en `src/data/api/schemas.ts`):

```jsonc
{
  "articles": [
    {
      "title": "Cómo custodiar tus claves",
      "slug": "como-custodiar-tus-claves",          // PENDIENTE
      "seo": {
        "title": "…",                               // PENDIENTE: ¿objeto o campos planos?
        "description": "…",
        "keywords": ["custodia", "claves"]
      },
      "content": "# Cómo custodiar…\n\nCuerpo en Markdown…",
      "faq": [ { "question": "…", "answer": "…" } ],
      "coverImage": "https://…/portada.jpg"          // PENDIENTE: URL o binario
    }
  ]
}
```

Tras validar la respuesta, la app **busca imágenes temáticas** con criterio por **tema + keywords**:

- **Portada:** busca según el **título del artículo** con query corta (tokens fuertes, sin “guía/turismo”), exige **≥2 coincidencias** en el nombre del archivo cuando el titular lo permite, **score mínimo** y el mejor candidato entre Openverse/Commons; Wikipedia solo si el título de la página coincide con el titular.
- **Cuerpo:** cada imagen inline usa una **keyword** (rotación por sección o la que aparezca en el `##`) más el tema; mismas reglas de relevancia.
- Se filtran mapas, informes técnicos y escudos.

Si la forma real cambia, se edita **solo** ese schema y el mapeo DTO → `Article`.

## Manejo de errores

Todos los errores se convierten a `Result<T, GenerationError>` (`core/types`); nunca se lanza una excepción hacia la UI:

| Error | Causa | Comportamiento en UI |
|---|---|---|
| `network-offline` | Sin conexión (NetInfo) | Estado "sin conexión" + reintentar; **el borrador del Chat no se pierde** |
| `timeout` | > 60 s | `ErrorState` + reintentar |
| `http-error` | 4xx/5xx (se conserva el status) | `ErrorState`; 429 → aviso de límite |
| `invalid-response` | El JSON no pasa el schema | `ErrorState` + log técnico; nunca guardar artículo a medias |
| `unknown` | Fallo inesperado | `ErrorState` genérico |

Códigos HTTP no mapeados → `http-error` con su status. El texto visible al usuario sale del catálogo de strings (`api.errors.*`), no del error técnico.

## Offline

Leer artículos y editar Context: **funciona sin conexión** (SQLite local). Generar: **requiere red**; si no la hay, el Chat muestra el estado offline sin enviar.
