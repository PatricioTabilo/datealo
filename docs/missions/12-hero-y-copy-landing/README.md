# Misión 12 — Hero y copy de la landing

**Tipo:** producto. **Carril:** Light Spec — copy y hero de landing, sin RLS, sin dato de usuario, 100%
reversible. **Abierta el** 2026-09-01. **Nace de:** división de la misión 09 (ver su
[README](../09-layout-general/README.md)) — investigación ya hecha, movida acá con su contenido.

**Estado de la misión:** cerrada 2026-09-06

**En foco:** —

**Última actualización:** 2026-09-06

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Cierre:** los 3 slices del plan de construcción están mergeados en `main` — copy del hero sin
"verificado" (S-001, [#205](https://github.com/PatricioTabilo/datealo/pull/205)), buscador del hero
rediseñado como pill segmentada (S-002, [#206](https://github.com/PatricioTabilo/datealo/pull/206)), CTA
directo de profesionales en el nav (S-003, [#209](https://github.com/PatricioTabilo/datealo/pull/209)).
TR-002 quedó verificado dentro de S-003: el link nuevo no repite el bug de mobile que pausó el issue #155.

Dos correcciones en vivo durante delivery, ambas ya reflejadas en los documentos antes de tocar código
(loop de vuelta de `discovery-product`):

- **S-002** — el dropdown de categoría del buscador pasó a mostrar ícono por opción, igual que el panel de
  `/buscar` (`CompactSearchBarPanel`) — D-003 original solo pedía texto plano. Registrado como
  [D-005](./producto.md#d-005) y [TC-004](./ingenieria.md#tc-004).
- **S-003** — el CTA de profesionales pasó de link de texto a botón turquesa con texto oscuro (mismo
  patrón que "Buscar", pero con su propio color) — el dueño de producto lo pidió más llamativo al verlo en
  vivo, y corrigió el contraste (blanco sobre turquesa) en la misma revisión.

Aparte de la misión: comparando el sitio en dos navegadores con preferencia de sistema distinta, se detectó
que Nuxt UI cambiaba el tono de `primary` con el modo oscuro del sistema (Datealo no tiene modo oscuro
propio) — no es parte de esta misión, quedó como
[fix aparte (#211)](https://github.com/PatricioTabilo/datealo/pull/211).

## Brief

Nace de la misma investigación que arrancó como parte de la misión 09 ("mejoras de UI/UX") — al dividir
esa misión por tamaño de alcance, el hero y el copy de la landing quedaron como su propio problema: es una
cuestión de mensaje y pulido visual de una sección específica, no de navegación general.

`investigacion.md` tiene el problema (un copy que nunca fue revisado a propósito, solo heredado de un
cambio técnico), seis evidencias, seis conclusiones y el ideal. La más importante: el hero y
`LandingSolution` usan la palabra "verificado" sin que exista ninguna funcionalidad de verificación de
profesionales, ni planificada — el dueño de producto confirmó que se retira, no se pospone.

`producto.md` está **vigente** — aprobado por Patricio el 2026-09-04. Recorta ese ideal a una
funcionalidad, F-001 (revisión de hero y copy), con tres decisiones: D-001 (se revisa a propósito), D-002
(sale la palabra "verificado"), D-003 (el buscador del hero sigue el mismo lenguaje visual que
`CompactSearchBar`, el buscador ya construido para `/buscar` — pill redondeada, campos segmentados, botón
circular, en línea con el estándar Airbnb que pidió el dueño de producto).

`experiencia.md` también está **vigente** — aprobado por Patricio el 2026-09-04, tras una evaluación
heurística independiente y cuatro rondas de mockup (`design-mockups/hero.html`). El buscador del hero
mantiene los dos campos siempre visibles (sin sheet, a diferencia de `CompactSearchBar`), con placeholder
largo en mobile y corto en desktop (donde la pill es más angosta) — detalle en UX-001/UX-002.

**Ampliación (2026-09-04):** se sumó F-002 — retomar la mitad simple del
[issue #155](https://github.com/PatricioTabilo/datealo/issues/155) de la misión 09, que Patricio pausó y
derivó acá: reemplazar "Para profesionales" en `LandingNavbar.vue` por un link directo, "Publícate"
(sin sesión) o "Mi perfil" (con sesión), igual que ya hace `AppHeader.vue`. La otra mitad de ese issue —si
el nav necesita `CompactSearchBar` tras hacer scroll, y si el hero seguiría necesitando su propio
buscador— queda explícitamente fuera de esta misión (ver "Fuera de alcance" en `producto.md`).

## Temas a explorar

Ya cubiertos por la investigación y el producto actuales.

- **Mensaje del hero contra la alternativa real.** Resuelto en dirección: los trust items actuales
  ("gratis", "sin registro", "contacto directo") no diferencian a Datealo del grupo de WhatsApp que el
  headline nombra — falta reforzar lo que sí es distinto.
- **Dimensión emocional del copy.** El copy cubre lo funcional, roza lo social, no nombra la ansiedad que
  `LANDING_PROBLEM` ya describe — pendiente de explorar en la redacción final.
- **Buscador del hero.** Resuelto: sigue el patrón visual de `CompactSearchBar` (D-003) — campos grandes,
  íconos por campo, botón circular — sin fila de accesos rápidos por categoría.
- **"Verificado".** Resuelto: sale del copy. No hay funcionalidad de verificación ni plan de construirla.
