# Misión 10 — Vista de resultados de búsqueda

**Tipo:** producto. **Abierta el** 2026-09-01. **Nace de:** división de la misión 09 (ver su
[README](../09-layout-general/README.md)).

**Estado de la misión:** cerrada 2026-09-04

**En foco:** —

**Última actualización:** 2026-09-04

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Cierre:** los 4 slices del plan de construcción (S-001 a S-004) están mergeados en `main` — foto/rating
en `/api/search` (#171), `SearchResultCard.vue` vertical foto-arriba (#173), ancho máximo `max-w-6xl` y
grid `auto-fit` centrado (#175), skeleton con la misma forma que la card nueva (#178). S-003 tuvo una
corrección en vivo del dueño de producto ya reflejada en `experiencia.md` (UX-003, revisión 2026-09-04,
[PR #176](https://github.com/PatricioTabilo/datealo/pull/176)): centra el contenedor, no las cards dentro
de su fila.

## Brief

Nace de dividir la misión 09 ("mejoras de UI/UX") en problemas de diseño independientes — el header y el
footer que envuelven `/buscar` ya quedaron resueltos en la 09, pero cómo se ven los resultados en sí (las
cards, el grid, el espaciado, mobile y desktop) es un problema aparte, sin investigar todavía.

Los `SearchResultCard` y el layout de `/buscar` hoy tienen un grid `lg:grid-cols-3` en desktop pero nunca
recibieron una pasada de diseño dedicada — nacieron junto con la lógica de búsqueda (misión 06), priorizando
que funcionara antes que cómo se ve.

## Temas a explorar

Notas sueltas, sin evidencia ni decisión todavía — punto de partida para `investigacion.md`, no su
resultado.

- **Cards de resultado (`SearchResultCard.vue`).** Qué información muestra cada una, jerarquía visual,
  cómo se ve con y sin foto de perfil (ver [misión 08](../08-foto-perfil-profesional/)).
- **Grid y layout de la lista.** Cómo se organiza en mobile (una columna) y en desktop (grid) — espaciado,
  densidad, cuántos resultados por fila.
- **Estados de la vista** (`SearchEmptyState`, cargando, comuna vecina) — si necesitan la misma pasada de
  diseño que las cards con datos.
