# Misión 15 — Múltiples comunas por profesional

**Tipo:** producto. **Carril:** Full Spec — toca el modelo de datos de `professionals` (hoy una sola
comuna por profesional) y cómo `/api/search` filtra por comuna. **Abierta el** 2026-09-06.
**Nace de:** ninguna.

**Estado de la misión:** definición

**En foco:** ninguno — discovery completo, los tres documentos (`producto.md`, `experiencia.md`,
`ingenieria.md`) están vigentes

**Última actualización:** 2026-09-07

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** abrir el PR de discovery con los tres documentos vigentes (paso 6 de la secuencia,
`docs/missions/README.md`) — todavía no abierto. Recién después de mergeado, cerrar el worktree
(`ExitWorktree action: "remove"`) y, ya en la raíz, cortar el Plan de construcción de `ingenieria.md`
(S-001 a S-010) en issues. `ingenieria.md` diseña `professional_comunas` (tabla de relación que reemplaza a
`professionals.comuna_codigo`), 4 contratos (TC-001 a TC-004), su RLS (auditada contra el checklist de
`seguridad-datos`), y 5 decisiones técnicas (T-001 a T-005) — incluida una ventana de migración entre
slices y un consumidor de `comunaCodigo` que la auditoría del Carril Full Spec encontró y ya quedó
corregido en el propio documento.

## Brief

Hoy un profesional declara una sola comuna en su perfil. En zonas menos densas que Santiago, un mismo
profesional suele cubrir varias comunas vecinas — el ejemplo que dio el dueño de producto: alguien en la
Región de los Lagos puede atender tanto en Llanquihue como en Frutillar o Puerto Varas. Con una sola
comuna, ese profesional solo aparece en las búsquedas de una, perdiendo cobertura real en las otras dos
donde también trabaja.

Esta misión es independiente de la [14](../14-multiples-categorias-profesional/) (múltiples categorías) —
resuelve el mismo tipo de limitación (un solo valor donde la realidad tiene varios) pero en el eje
geográfico, no el de oficio. Ya existe una noción de "comunas vecinas" en el producto (búsqueda de
resultados, misión 06) para cuando una comuna no tiene profesionales — esta misión es distinta: no es una
sugerencia de fallback, es que el profesional declare explícitamente en cuáles trabaja.

## Temas a explorar

- **Relación con "comunas vecinas" (misión 06).** Esa función ya existe para *ampliar* una búsqueda sin
  resultados hacia comunas cercanas. Esta misión deja que el profesional declare sus comunas reales —
  evaluar si ambas conviven o si una vuelve redundante a la otra en ciertos casos.
- **Cuántas comunas tiene sentido permitir.** Sin límite, o un tope razonable — y si el tope debería ser
  distinto según la densidad de la zona (Santiago vs. regiones).
- **Cómo se ve en el perfil público y en las cards de resultado.** Mostrar varias comunas sin que la card
  se sienta sobrecargada — hoy `comunaNombre` es un dato singular.
- **Cómo busca alguien.** El buscador filtra por una comuna a la vez (`/buscar?comuna=X`) — un profesional
  con varias comunas debe aparecer en los resultados de cualquiera de las que atienda.
- **Impacto en el modelo de datos.** Pasar de una columna simple a una tabla de relación
  (`professional_comunas` o similar), con su policy RLS y migración de los datos existentes.
- **Impacto en `/api/search`.** El filtro por comuna pasa a un `EXISTS`/join — mismo tipo de evaluación de
  costo que la misión 14, posiblemente compartiendo el mismo patrón de solución.
