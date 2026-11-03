# Roadmap

Seis etapas, en orden de dependencia. Nada empieza antes de cerrar la etapa anterior; los criterios de "terminada" son verificables (comando o acción manual), no subjetivos.

**Dependencias:**
```
1 Fundamentos ─► 2 Dominio+persistencia ─┬─► 3 Context ─┐
                                          └─► 4 Chat ───┼─► 5 Articles ─► 6 Endurecimiento
                                          (2 es prerrequisito de ambas)
```

## Estado (2026-10-29)

| Etapa | Estado |
|---|---|
| 1 Fundamentos | **Cerrada** |
| 2 Dominio y persistencia | **Cerrada** |
| 3 Context | **Cerrada** |
| 4 Chat y generación | **Funcional** (stub / URL configurable; contrato n8n no validado en producción) |
| 5 Articles | **Cerrada** |
| 6 Endurecimiento | **Cerrada** — ver [accessibility-checklist.md](accessibility-checklist.md) |

## Etapa 1 — Fundamentos

`create-expo-app` (TypeScript, nombre `article-studio`), Expo Router con el mapa de rutas del Q9 (pantallas placeholder), tsconfig estricto, ESLint con zonas de importación, Prettier, `jest-expo`, theme con tokens, catálogo de strings, Drawer con los 3 destinos.

**Termina cuando:** la app corre en Expo Go; el Drawer navega Chat/Articles/Context; los tokens importan y ningún color está hardcodeado; `tsc --noEmit`, `eslint .` y `jest` en verde.

## Etapa 2 — Dominio y persistencia

Tipos de `core` (`Article`, `GenerationParams`, `Context`, `Result`), puertos, `SqlDriver` + driver expo-sqlite, migración `v0001-baseline`, `ArticleRepository` y `ContextRepository` con driver fake en memoria y tests.

**Termina cuando:** tests unitarios de repositorios verdes (guardar, listar paginado, borrar, merge de defaults); la app abre la DB real en Expo Go con WAL y `user_version = 1`; un reinicio conserva los datos.

## Etapa 3 — Context

CRUD de topics, keywords y defaults: lista agrupada, alta/edición con `react-hook-form` + `valibot`, chips, estados vacío/carga/error, strings del catálogo.

**Termina cuando:** se puede crear/editar/borrar una entrada de cada `kind`, sobrevive al reinicio, y un `default` queda reflejado en el merge de `GenerationParams` (test).

## Etapa 4 — Chat y generación

Mensajes del chat (sesión), composer, formulario paso a paso con validación valibot, fusión de Context → `GenerationParams`, `ApiClient` multipart, schema de respuesta, manejo de errores (`Result` + estados offline/timeout/http/invalid), persistencia del artículo recibido.

**Termina cuando:** desde el Chat se genera un artículo contra el endpoint real (o stub de desarrollo), aparece en `articles`, y los 5 errores de `api.md` muestran su estado correspondiente. **Cierre de la validación PENDIENTE del contrato n8n (ADR-0004).**

## Etapa 5 — Articles

Listado paginado (20/pág) con `FlatList` + `Skeleton`, orden por `created_at DESC`, pantalla de detalle con `react-native-marked`, metadatos SEO, FAQ, portada con `expo-image`, estados vacío/error.

**Termina cuando:** el historial persiste tras cerrar y reabrir la app; el detalle renderiza Markdown, SEO, FAQ y portada; un artículo recién generado es visible sin recargar nada.

## Etapa 6 — Endurecimiento

Accesibilidad (44pt, AA, labels, live regions), rendimiento (listas, imágenes con caché, re-renders), revisión de dependencias instaladas vs usadas, docs actualizados con lo aprendido, decisiones PENDIENTE revisadas.

**Termina cuando:** checklist de accesibilidad y `tsc/eslint/jest` en verde; sin dependencias directas sin usar; esta lista refleja el estado real.

**Hecho en código:** checklist en `docs/accessibility-checklist.md`; `FlatList` con `windowSize` / batch en Chat y Artículos; burbujas memoizadas; `Chip` display-only; token `colors.overlay`; dependencia directa `expo-status-bar` eliminada (sigue vía `expo-router`).

**Probar con otra persona:** [README.md](../README.md) — modo demo sin `.env`, script `npm run start:tunnel` si no comparten Wi‑Fi.

## PENDIENTE (decisiones abiertas registradas a lo largo de los docs)

| Pendiente | Dónde vive | Estado |
|---|---|---|
| Contrato real de n8n (campos, auth, idempotencia, tonos) | `docs/api.md`, ADR-0004 | **Abierto** — app usa stub o URL en `extra.webhookUrl`; falta validación contra n8n real |
| Historial del chat y borrador persistente | `docs/architecture.md`, `docs/database.md` | **Abierto** — chat solo en memoria de sesión (Zustand) |
| Borrado de artículos (¿existe?) | `docs/database.md` | **Parcial** — repos `remove`; sin UI |
| Persistencia JSON vs SQLite | `docs/database.md`, `.env` | **JSON por defecto** (prototipo); SQLite con `EXPO_PUBLIC_USE_JSON_STORAGE=false` |
| Dark mode | `docs/design-system.md` | Post-Etapa 6 |
| i18n runtime (segundo idioma de UI) | `docs/conventions.md` | Cuando exista demanda |
| E2E con Maestro | `docs/conventions.md` | Cuando el flujo crítico se estabilice |
| Búsqueda por título en el listado | `docs/database.md` | Si el volumen lo pide |
| TanStack Query si aparecen más endpoints | `docs/architecture.md` | Si crece la API |
| `patch-package` (parche a `react-native-drawer-layout`) | `patches/`, `postinstall` | Quita WARN de Reanimated 4 en drawer nativo hasta fix upstream |
