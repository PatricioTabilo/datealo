# Misión 11 — Vista de detalle de perfil de profesional

**Tipo:** producto. **Abierta el** 2026-09-01. **Nace de:** división de la misión 09 (ver su
[README](../09-layout-general/README.md)).

**Estado de la misión:** lista para construir

**Última actualización:** 2026-09-04

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

`producto.md` **vigente — aprobado por Patricio el 2026-09-03**: F-001 y las decisiones D-001 a D-003
quedan confirmadas tal cual (revisadas también contra `jobs-to-be-done` y `lean-analytics`).

`experiencia.md` **vigente — aprobado por Patricio el 2026-09-04**: UXF-001 y las decisiones UX-001 a
UX-005 quedan confirmadas — incluye el nombre junto al avatar del sidebar y el sidebar sticky en CSS Grid
durante toda la lectura de reseñas (UX-005), agregados tras revisar el mockup con el dueño de producto.

`ingenieria.md` **vigente — aprobado por Patricio el 2026-09-04**: contratos (TC-001), sin cambios de
datos ni RLS, y tres decisiones técnicas (T-001 CSS Grid, T-002 medir el CTA en vez de adivinar el buffer,
T-003 corrige un bug preexistente de CL-003 que esta misión hizo visible), en 5 slices de construcción.
Pasó por una auditoría en agente separado que encontró y corrigió dos hallazgos bloqueantes antes de
llegar a este estado.

**Discovery cerrado.** Próximo hito: los issues del plan de construcción ya están abiertos
([#181](https://github.com/PatricioTabilo/datealo/issues/181) a
[#185](https://github.com/PatricioTabilo/datealo/issues/185), ver tabla en
[`ingenieria.md`](./ingenieria.md#plan-de-construcción)). La ejecución todavía no arranca: la misión 09
sigue `en construcción` (le queda el issue #155 abierto) y `CLAUDE.md` fija una sola misión en delivery a
la vez — queda pendiente de que el dueño de producto decida si esperar a que la 09 cierre o hacer una
excepción explícita.

## Brief

Nace de dividir la misión 09 ("mejoras de UI/UX") en problemas de diseño independientes — la navegación
que envuelve `/profesionales/[id]` (header, flecha atrás) ya quedó resuelta en la 09, pero el contenido de
la vista en sí (galería de fotos, ficha de contacto, distribución en desktop) es un problema aparte.

`app/pages/profesionales/[id].vue` ya tiene una distribución de dos columnas en desktop
(`lg:flex`), pero — igual que la vista de resultados (misión 10) — nunca recibió una pasada de diseño
dedicada. Al auditar el código se confirmó además un bug concreto: el CTA fijo "Escribir por WhatsApp" se
solapa visualmente con el footer general en mobile — el buffer que la misión 09 agregó para eso
(`general.vue`, `pb-24`) no está pensado para el contenido de esta barra (ver
[E-001](./investigacion.md#e-001)).

## Temas a explorar

- **Galería de fotos (`ProfessionalPublicPhotos.vue`).** Cómo se ve en mobile (carrusel) y desktop
  (columna fija) — proporciones, cuántas fotos antes de necesitar scroll o expansión.
- **Ficha de contacto.** Jerarquía de la información (nombre, categoría, comuna, precio orientativo,
  reseñas) y del CTA de contacto (WhatsApp/teléfono) en ambos tamaños. En investigación: sacar
  identidad+ubicación de la tarjeta lateral (referencia de directorio de servicios) y mover las reseñas a
  una sección propia, separada del contacto (referencia de Airbnb) — ver
  [C-002](./investigacion.md#c-002) y [C-003](./investigacion.md#c-003).
- **Estados de la vista** (cargando, tardando, no encontrado) — si necesitan la misma pasada de diseño que
  el estado con datos.
