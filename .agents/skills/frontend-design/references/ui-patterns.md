# UI Patterns

## Estructura recomendada

- `pages/**`: orquestar la pagina.
- `components/**`: UI reusable sin acceso directo a secretos.
- `composables/useXxx.ts`: queries y mutaciones a Supabase.
- `types/**`: tipos de dominio compartidos.

## Patron de datos

1. Resolver sesion en plugin/composable.
2. Ejecutar query en composable.
3. Exponer `data`, `pending`, `error`, `refresh`.
4. Renderizar estados explicitos en componente.

## Patron de formularios

1. Inicializar `form` reactivo.
2. Validar antes de enviar.
3. Ejecutar mutacion.
4. Mostrar feedback de exito/error.
5. Refrescar fuente de datos.

## Convenciones visuales

- Usar componentes DaisyUI (`btn`, `input`, `select`, `card`, `alert`, `modal`).
- Mantener espaciado consistente con clases utilitarias (`gap-*`, `space-y-*`, `p-*`).
- Priorizar legibilidad y contraste.
