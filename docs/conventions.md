# Conventions

Convenciones aplicables a todo el código. Las reglas cortas verificables están también en [AGENTS.md](../AGENTS.md); aquí vive el detalle con ejemplos.

## Nombres

| Qué | Convención | Ejemplo |
|---|---|---|
| Componentes / tipos | `PascalCase`, un componente por archivo, archivo = nombre | `Button.tsx`, `ArticleCard.tsx` |
| Módulos, hooks, stores | `camelCase`, archivo = lo que exporta | `useGenerateArticles.ts`, `articleStore.ts` |
| Constantes de verdad | `SCREAMING_SNAKE` | `PAGE_SIZE = 20` |
| Tipos y interfaces | `PascalCase`, **sin prefijo `I`** | `GenerationParams`, `ArticleRepository` |
| Uniones tipo enum | `type` literal, no `enum` | `type ContextKind = 'topic' \| 'keyword' \| 'default'` |
| IDs | `id` (string UUID), nunca `xid`/`uid` | |
| Funciones | verbos: `save`, `list`, `parse` | |
| Sin abreviaturas inventadas | `params`, `src`… ok; `cfg`, `mgr`, `util` no | |

## Componentes

```tsx
// features/articles/components/ArticleCard.tsx
type ArticleCardProps = { article: Article; onPress: (id: string) => void };

export function ArticleCard({ article, onPress }: ArticleCardProps) { … }
```

- Export **nombrado**, nunca `export default`.
- Un componente = presentacional o contenedor, no ambos. La lógica vive en `model/` (hooks + store), la vista en `view/`.
- Props tipadas y exportadas; sin `any`, sin `React.FC`.
- Estilos: `StyleSheet.create` con tokens del tema (`useTheme()`), **cero colores/espaciados literales**.
- Todo texto visible sale del catálogo (`src/ui/strings`), nunca un literal en JSX.
- Textos de accesibilidad: `accessibilityLabel` obligatorio en iconos y botones solo-icono.

## Hooks y estado

- Prefijo `use`; se definen en `features/<f>/model/`.
- Los efectos secundarios (red, BD) van dentro de hooks que llaman **solo a puertos**, nunca a `fetch` o SQL directos.
- Estado de UI/efímero → Zustand con selectors granulares (`useStore(s => s.x)`) para evitar re-renders.
- Estado persistente → repositorio, jamás duplicado en un store como fuente de verdad.

## Servicios / data

- `src/data/api/`: `apiClient` es el único lugar con `fetch`; funciones en infinitivo-nominal (`generateArticles`), devolviendo `Result<T, ApiError>`.
- `src/data/db/`: SQL solo aquí; funciones `list/save/remove` por repositorio.
- Toda respuesta externa se valida con un schema valibot en la frontera (`parseOrInvalid`); los tipos internos se derivan del schema o de `core`, nunca del DTO crudo.

## Errores

- `Result<T, E>` en todo I/O. `try/catch` solo en la frontera (adaptador), convertido a `Result`.
- Nunca `catch {}` vacío, nunca error tragado sin registrar.
- La UI recibe `ErrorState` con mensaje del catálogo, no el `Error` técnico.

## Tipos

- `tsconfig`: `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride`.
- Preferir `type` sobre `interface`; `readonly` donde no se muta.
- Fechas: epoch ms (`number`) en dominio y BD; `string` ISO solo en la red.

## Strings

- Claves semánticas en `src/ui/strings/es.ts`: `chat.send`, `articles.empty.title`, `api.errors.timeout`.
- Agrupadas por pantalla/módulo; el índice de claves tipado impide escribir una clave inexistente.
- i18n runtime: **PENDIENTE** (no se agrega dependencia hasta que haya un segundo idioma).

## Testing

- Ubicación: `__tests__/` junto al archivo. Nombre: `nombre-del-archivo.test.ts`.
- Runner: `jest-expo`; componentes con `@testing-library/react-native`.
- **Qué se testea:** `core` (lógicas puras), `data` (repositorios con driver fake, parser de la respuesta de n8n, fusionado de Context), hooks con lógica, y componentes con lógica real (validación, estados).
- **Qué no:** pantallas presentacionales sin lógica, snapshots de UI masivos, implementaciones privadas.
- Los repositorios se prueban contra un driver fake en memoria y, en CI, contra un archivo SQLite real.
- E2E (Maestro): **PENDIENTE**.

## Commit y calidad

- Gate: `tsc --noEmit` + `eslint .` + `jest` en verde antes de mergear.
- Commas convencionales (Conventional Commits): `feat(chat): …`, `fix(articles): …`.
