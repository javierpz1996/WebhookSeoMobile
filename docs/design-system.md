# Design System — Apple (Article Studio)

Tokens en `src/ui/theme/tokens.ts`, consumidos vía `ThemeProvider` y helpers en `src/ui/theme/`. Componentes de marca en `src/ui/design-system/`. **Cero literales** de color, tipo, radio o sombra fuera del tema.

Modo oscuro: **pendiente**; los nombres son semánticos (`textPrimary`, `surface`, `brand.link`).

## Paleta

### Marca

| Token | Hex | Uso |
|---|---|---|
| `colors.brand.link` | `#0066CC` | Enlaces inline, controles de texto azul, variante `ghost`/`link` de botones |
| `colors.brand.cta` | `#0071E3` | Botón primario compacto (píldora), conversión |
| `colors.brand.ctaPressed` | `#0077ED` | Pulsado del CTA |

### Acento

| Token | Hex | Uso |
|---|---|---|
| `colors.accent.launch` | `#B64400` | Etiquetas “Nuevo” / launch (`LaunchLabel`), solo texto |

### Neutros

| Token | Hex | Uso |
|---|---|---|
| `neutral.ink` | `#1D1D1F` | Titulares, cuerpo principal, nav |
| `neutral.slate` | `#707070` | Secundario, legal, metadatos |
| `neutral.steel` | `#86868B` | Bordes inactivos, placeholders |
| `neutral.hairline` | `#D6D6D6` | Divisores 1px |
| `neutral.controlGray` | `#E6E6E8` | Controles deshabilitados |
| `neutral.studioMist` | `#F5F5F7` | Bandas de sección / fondo alterno |
| `neutral.paperFrost` | `#FAFAFC` | Superficie elevada suave |
| `neutral.galleryWhite` | `#FFFFFF` | Canvas principal |

Alias `neutral[50]`…`[900]` se mantienen por compatibilidad con código existente.

## Tipografía

Escala **minor third** desde 14px base. Familias:

- **Display:** SF Pro Display → fallback `Inter`, Helvetica Neue, Arial (`fontFamily.display`)
- **Text:** SF Pro Text → mismos fallbacks (`fontFamily.text`)

Helper: `typographyStyle(theme, variant)` en `src/ui/theme/typography.ts`.

| Variante | Tamaño / peso / interlineado | Uso |
|---|---|---|
| `heroDisplay` | 80 / 600 / 84, −1.2px tracking | Hero (usar con moderación en móvil) |
| `featureHeading` | 40 / 600 / 40 | Titular de feature / alias `display`, `h1` |
| `title24` | 24 / 600 / 28 | Secciones (`h2`) |
| `body17` | 17 / 400 / 25, −0.374px | Cuerpo y párrafos (`body`) |
| `nav17` | 17 / 500 / 25 | Navegación in-page |
| `body14` | 14 / 400 / 20 | Metadatos (`bodySm`) |
| `caption12` | 12 / 400 / 16 | Pie, timestamps (`caption`) |
| `launchLabel` | 12 / 400 | Launch naranja |
| `buttonLabel` | 12 / 400 | Etiqueta en píldoras CTA |

Componente: `<AppleText variant="body17" color="link" />` (`src/ui/design-system/apple-text.tsx`).

## Espaciado y forma

| Token | Valor | Uso |
|---|---|---|
| `spacing.unit` | 4px | Base |
| `spacing.elementGap` | 20px | Entre controles relacionados |
| `spacing.cardPadding` | 28px | Interior de tarjetas |
| `spacing.sectionGap` | 90px | Entre bloques narrativos |
| `spacing.xs`…`3xl` | 4…48 | Escala general |

| Radio | Valor | Elemento |
|---|---|---|
| `radius.link` | 10px | Enlaces / botones secundarios |
| `radius.navigation` | 20px | Nav / drawer |
| `radius.card` / `image` | 28px | Tarjetas e imágenes editoriales |
| `radius.pill` | 36px | CTA y chips |
| `radius.input` | 999px | Campos tipo píldora |

## Sombras

Solo **`level1`** y **`level2`** (alias `e1`, `e2`). **No usar sombra** en feature cards editoriales (`SurfaceCard` por defecto sin sombra). Gradientes: no.

Helper: `shadowStyle(theme, 'level1')`.

## Motion

Tokens en `theme.motion`: duraciones `instant` 100ms, `fast` 200ms, `normal` 350ms, `slow` 500ms; escala al pulsar `0.98`. Componente `AnimatedPressable` (Reanimated) para feedback táctil. Respetar *Reduce Motion* en animaciones futuras.

## Componentes base (`src/ui/components/`)

| Componente | Design system |
|---|---|
| `Button` | CTA `#0071E3` + píldora 36px; `ghost`/`link` en Apple Blue |
| `TextField` | Borde steel, foco link blue, radio píldora |
| `Chip` | Píldora 36px, selección ink sobre blanco |
| `EmptyState`, `ErrorState`, … | Consumen tokens semánticos |

## Design system (`src/ui/design-system/`)

| Export | Rol |
|---|---|
| `AppleText` | Tipografía tokenizada |
| `SurfaceCard` | Tarjeta 28px, sin sombra |
| `Section` | Bloque con `sectionGap` / `elementGap` |
| `LinkText` | Enlace Apple Blue subrayado |
| `LaunchLabel` | Texto launch `#B64400` |
| `HairlineDivider` | Separador 1px |
| `AnimatedPressable` | Escala al pulsar |

Barrel: `import { AppleText, SurfaceCard } from '@/ui/design-system'`.

## Markdown

Estilos en `src/ui/markdown/article-markdown-styles.ts`: enlaces → `colors.primary` (link blue), radios de imagen → `radius.image`, fondos código → `neutral.studioMist` / `paperFrost`.

## Do / Don't (resumen)

**Do:** canvas `#FFFFFF`; bandas `#F5F5F7`; CTA solo en píldoras compactas; links `#0066CC`; cards 28px sin sombra; secciones ~90px.

**Don't:** gradientes decorativos; sombras en cards editoriales; `#0071E3` como fondo hero; bold 700 en display; pills de color para launch (solo texto naranja).

## Accesibilidad

Objetivos ≥ 44pt (`touchTarget`). Contraste AA. `accessibilityLabel` en controles. Errores con live region donde aplique.
