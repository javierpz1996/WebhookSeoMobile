# AGENTS.md — Article Studio

App móvil (React Native + Expo + TypeScript estricto, iOS/Android, Expo Go) que genera artículos SEO vía un chat conectado a un webhook de n8n y los guarda localmente con SQLite.

## Documentación (fuente de verdad)

| Necesidad | Documento |
|---|---|
| Estructura, capas, flujo de datos | [docs/architecture.md](docs/architecture.md) |
| Tokens, componentes, accesibilidad | [docs/design-system.md](docs/design-system.md) |
| Contrato con n8n, errores | [docs/api.md](docs/api.md) |
| Esquema, repositorios, migraciones | [docs/database.md](docs/database.md) |
| Nombres, estructura de código, testing | [docs/conventions.md](docs/conventions.md) |
| Etapas, criterios, pendientes | [docs/roadmap.md](docs/roadmap.md) |
| Vocabulario canónico | [GLOSSARY.md](GLOSSARY.md) |
| Por qué decisiones difíciles | [docs/adr/](docs/adr/) |

## Reglas duras (no negociables)

1. **TypeScript estricto**: sin `any`, sin `!`, sin `enum`. `strict` + `noUncheckedIndexedAccess`.
2. **Zonas de importación de un solo sentido** (ESLint lo falla): `core` importa nada · `ui` importa `core` · `data` importa `core` · `features` importan `core`/`ui`/`data` · nada importa `app` salvo `bootstrap.ts`.
3. **SQL solo en `src/data/`** y `fetch` solo en `src/data/api/apiClient.ts`. Las features hablan con puertos (`core/ports`).
4. **Toda respuesta externa se valida** con un schema valibot en la frontera; los tipos internos no vienen del DTO.
5. **Todo I/O devuelve `Result<T, E>`**; las excepciones no llegan a la UI. Errores de red/DB → estado + reintento manual, jamás `catch {}` vacío.
6. **Ningún literal visual**: colores, espacios, tamaños y textos salen de `src/ui/theme` y `src/ui/strings`.
7. **Sin dependencias nuevas** sin justificación escrita en el PR (lista aprobada en `docs/roadmap.md`/`conventions`).
8. **Secretos en el repo**: `.env` **sí se versiona** aquí (webhook n8n de demo); no añadir claves de producción. Groq/API keys del LLM viven en n8n, no en la app. Overrides locales solo en `.env*.local` (ignorado).
9. **Migraciones de SQLite congeladas**: nunca editar un paso ya enviado.
10. **Sin abstracciones especulativas**: si no está en los docs, no se construye.

## Skills instaladas → cuándo usarla

| Tarea | Skill |
|---|---|
| Listas, imágenes, navegación, perf. RN | `vercel-react-native-skills` |
| Pantallas, estilos, controles nativos | `expo-native-ui` |
| Fetch, errores de red, offline, estados | `expo-data-fetching` |
| Rutas, Drawer, links | `expo-router` |
| SQLite, repositorios, migraciones | `persistence-and-migrations` |
| Estructura de carpetas, puertos, zonas | `architecture-and-boundaries` |
| Formularios con valibot/RHF | `forms-and-input` |
| Stores Zustand | `state-management-zustand` |
| Spinner/vacío/error/toasts | `ui-states-and-feedback` |
| `Result` y errores tipados | `error-handling-typed-results` |
| Calidad visual de pantallas | `mobile-app-ui-design` |

No instalar skills nuevas sin revisarlas (ver `find-skills`).

## Criterios de calidad

- Gates en verde antes de mergear: `tsc --noEmit` · `eslint .` · `jest`.
- Componentes pequeños y con un solo motivo de cambio; lógica fuera de la vista.
- Sin duplicación: si dos pantallas repiten lógica o estilos, sube a componente/función compartida.
- Accesibilidad: 44pt, contraste AA, `accessibilityLabel`, live regions en errores.
- Pendientes: se documentan en `docs/roadmap.md`, nunca se resuelven en silencio.
