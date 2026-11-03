# Checklist de accesibilidad (Etapa 6)

Verificación manual en Expo Go (iOS y Android) y con VoiceOver / TalkBack cuando sea posible.

## Objetivos mínimos

| Criterio | Estado | Notas |
|---|---|---|
| Áreas táctiles ≥ 44pt (`theme.touchTarget`) | Hecho | `Button`, `TextField`, iconos de borrar/cerrar modal |
| Contraste AA en textos y botones primarios | Hecho | Tokens en `src/ui/theme/tokens.ts` |
| `accessibilityLabel` en acciones sin texto visible | Hecho | Cerrar modal, borrar contexto, editar entrada |
| `accessibilityRole="header"` en títulos de sección | Hecho | Context, modal, pantallas con encabezado |
| Live regions en errores y éxito de generación | Hecho | `ErrorState`, mensaje de éxito y “Generando…” en Chat |
| Chips solo lectura no anunciados como botón | Hecho | `Chip` sin `onPress` usa `View` + rol texto (SEO en detalle) |
| Burbujas de chat anunciadas con rol y autor | Hecho | `ChatMessageBubble` |

## Pantallas

- **Chat:** composer con label de campo; lista de mensajes accesible; estados generating/success/error con live region donde aplica.
- **Artículos:** filas con título accesible (`ArticleListRow`); estados vacío/error con acciones etiquetadas.
- **Contexto:** editar/borrar por fila; keywords editables vía chip.

## Comandos de regresión

```bash
npm run typecheck && npm run lint && npm test
```
