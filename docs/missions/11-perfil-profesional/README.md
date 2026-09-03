# Misión 11 — Vista de detalle de perfil de profesional

**Tipo:** producto. **Abierta el** 2026-09-01. **Nace de:** división de la misión 09 (ver su
[README](../09-layout-general/README.md)).

**Estado de la misión:** exploración

**Última actualización:** 2026-09-01

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** arrancar `investigacion.md` — sin fecha límite todavía, se agenda cuando se retome. El
dueño de producto la ordenó después de la misión 10 (vista de resultados) y antes de la 12 (hero y copy).

## Brief

Nace de dividir la misión 09 ("mejoras de UI/UX") en problemas de diseño independientes — la navegación
que envuelve `/profesionales/[id]` (header, flecha atrás) ya quedó resuelta en la 09, pero el contenido de
la vista en sí (galería de fotos, ficha de contacto, distribución en desktop) es un problema aparte.

`app/pages/profesionales/[id].vue` ya tiene una distribución de dos columnas en desktop
(`lg:flex`), pero — igual que la vista de resultados (misión 10) — nunca recibió una pasada de diseño
dedicada.

## Temas a explorar

Notas sueltas, sin evidencia ni decisión todavía — punto de partida para `investigacion.md`, no su
resultado.

- **Galería de fotos (`ProfessionalPublicPhotos.vue`).** Cómo se ve en mobile (carrusel) y desktop
  (columna fija) — proporciones, cuántas fotos antes de necesitar scroll o expansión.
- **Ficha de contacto.** Jerarquía de la información (nombre, categoría, comuna, precio orientativo,
  reseñas) y del CTA de contacto (WhatsApp/teléfono) en ambos tamaños.
- **Estados de la vista** (cargando, tardando, no encontrado) — si necesitan la misma pasada de diseño que
  el estado con datos.
