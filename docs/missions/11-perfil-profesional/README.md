# Misión 11 — Vista de detalle de perfil de profesional

**Tipo:** producto. **Abierta el** 2026-09-01. **Nace de:** división de la misión 09 (ver su
[README](../09-layout-general/README.md)).

**Estado de la misión:** cerrada 2026-09-04

**Última actualización:** 2026-09-04

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

`producto.md` **vigente — aprobado por Patricio el 2026-09-03**: F-001 y las decisiones D-001 a D-003
quedan confirmadas tal cual (revisadas también contra `jobs-to-be-done` y `lean-analytics`).

`experiencia.md` **vigente — aprobado por Patricio el 2026-09-04**: UXF-001 y las decisiones UX-001 a
UX-005 quedan confirmadas — incluye el nombre junto al avatar del sidebar y el sidebar sticky en CSS Grid
durante toda la lectura de reseñas (UX-005), agregados tras revisar el mockup con el dueño de producto.

`ingenieria.md` **vigente — aprobado por Patricio el 2026-09-04**: contratos (TC-001), sin cambios de
datos ni RLS, y dos decisiones técnicas (T-001 CSS Grid, T-002 medir el CTA en vez de adivinar el
buffer). Pasó por una auditoría en agente separado que encontró y corrigió dos hallazgos bloqueantes
antes de llegar a este estado. Una tercera decisión (T-003) se propuso y se descartó ya en ejecución — ver
abajo.

**Construida:** S-001 a S-004 del plan de construcción mergeados
([#189](https://github.com/PatricioTabilo/datealo/pull/189),
[#190](https://github.com/PatricioTabilo/datealo/pull/190),
[#191](https://github.com/PatricioTabilo/datealo/pull/191),
[#192](https://github.com/PatricioTabilo/datealo/pull/192)). **S-005 se retiró sin código** — partía de
T-003 ("mostrar la invitación a reseñar sin haber contactado"), que resultó estar mal fundada: el
comportamiento actual ya es el que `experiencia.md` de la
[misión 07](../07-resenas-verificadas-por-contacto/) decidió a propósito (el mecanismo anti-fraude de las
reseñas verificadas por contacto), no un bug de esta misión. Detalle en
[`ingenieria.md`](./ingenieria.md#t-003).

**Misión cerrada.** Discovery y construcción completos — la 09 se cerró el 2026-09-04 (S-008 movido a la
misión 12), y ahora la 11 también.

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
