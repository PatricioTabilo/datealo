# Misión 09 — Layout general (navbar, footer, TOS)

**Tipo:** producto. **Abierta el** 2026-08-31. **Nace de:** ninguna.

**Estado de la misión:** en construcción

**Última actualización:** 2026-09-02

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** los 8 issues del plan de construcción ya están abiertos
([#148](https://github.com/PatricioTabilo/datealo/issues/148) a
[#155](https://github.com/PatricioTabilo/datealo/issues/155), ver tabla en
[`ingenieria.md`](./ingenieria.md#plan-de-construcción)) — arrancar por S-001, S-003 y S-004 (sin
dependencias entre sí), en la raíz del repo, un PR chico por issue. Sin fecha límite todavía.

`ingenieria.md` **vigente — aprobado por Patricio el 2026-09-02**: sin tablas nuevas (reutiliza
`GET /api/professionals/me` y agrega una sola query de solo lectura, comunas frecuentes); layout de Nuxt
nuevo (`general.vue`) más `AppHeader`/`AppFooter`/`CompactSearchBar`/`LegalHeader` compartidos, 8 slices y
5 decisiones técnicas. Durante el diseño se detectó y corrigió una contradicción real con el `/api/search`
de la misión 06 (exige categoría **y** comuna — "buscar solo con categoría" no existía en el código; ver
[C-016](./investigacion.md#c-016)), que ya quedó reflejada en `producto.md` y `experiencia.md`.

`producto.md` **vigente — aprobado por Patricio el 2026-09-02**: F-001 a F-004 y las siete decisiones
(D-001 a D-007) quedan confirmadas tal cual. El copy de Términos y Privacidad también queda aprobado (ver
[`contenido/`](./contenido/)).

`experiencia.md` **vigente — aprobado por Patricio el 2026-09-02**: flujos (UXF-001 a UXF-003), decisiones
(UX-001 a UX-005) y los 4 mockups de `design-mockups/` quedan confirmados, incluida una segunda evaluación
heurística sobre el rediseño del header (íconos puros en mobile, grid de 3 zonas en desktop) que cerró sin
hallazgos bloqueantes.

## Brief

Nace de un primer intento de agregar header y footer al layout general de la app (`/buscar`,
`/profesionales/[id]`, `/profesional/*`, que hoy quedan pelados fuera de la landing) — se implementó, se
revisó visualmente y no convenció; se descartó sin mergear (issue #105, PR #106 cerrados).

Originalmente esta misión juntaba también el hero/copy de la landing y las vistas de `/buscar` y del
perfil público — al investigar en profundidad resultó ser demasiado alcance para una sola misión. Se
dividió en cuatro (ver el [registro de misiones](../README.md)):

- **09 (esta)** — la navegación que envuelve toda la app: header con patrón de profundidad, buscador
  compacto reutilizable, footer con navegación real (landing y general), y páginas simples de Términos y
  Privacidad.
- **[10 — vista de resultados de búsqueda](../10-vista-resultados-busqueda/)** — cómo se ven las cards y
  el grid de `/buscar`, mobile y desktop, separado del header que ya resuelve esta misión.
- **[11 — vista de detalle de perfil](../11-perfil-profesional/)** — galería de fotos, ficha de contacto y
  layout del perfil público, mobile y desktop, mismo criterio.
- **[12 — hero y copy de la landing](../12-hero-y-copy-landing/)** — mensaje, tono y pulido visual del
  hero, sin tocar navegación.

`investigacion.md` tiene el problema, la evidencia (código actual, el intento descartado, benchmarks de
footer/header, capturas de Airbnb aportadas por el dueño de producto, investigación de patrones mobile y
de branding, y la investigación legal para Términos/Privacidad), doce conclusiones y el ideal.
`producto.md` recorta ese ideal a cuatro funcionalidades: header con patrón de profundidad (F-001),
buscador compacto reutilizable (F-002), footer con navegación real (F-003), y páginas simples de Términos
y Privacidad (F-004).

## Temas a explorar

Ya cubiertos por la investigación y el producto actuales — quedan acá como registro de dónde salió el
alcance, no como pendientes.

- **Header y footer del layout general.** Resuelto: el header sigue un patrón de profundidad (logo+nav en
  landing, flecha+resumen en `/buscar`, solo flecha en perfil); el footer tiene marca + buscador (link
  genérico, sin categorías individuales) + profesional + contacto + legal, apilados en mobile sin
  acordeón (footer chico a propósito), en fila en desktop.
- **Buscador en mobile vs. desktop.** Resuelto: patrón expandible en mobile (botón que abre vista
  completa), inline compacto en desktop — reemplaza la barra de filtros ad-hoc que tiene hoy `/buscar`.
- **Bottom nav.** Evaluado y descartado explícitamente — Datealo no tiene suficientes destinos reales que
  lo justifiquen hoy (ver [D-007](./producto.md#d-007)).
- **TOS y Privacidad.** Resuelto: copy real aprobado el 2026-09-02, en
  [`contenido/politica-privacidad.md`](./contenido/politica-privacidad.md) y
  [`contenido/terminos-y-condiciones.md`](./contenido/terminos-y-condiciones.md) — verificado contra el
  schema real de datos (email de profesional, campos del perfil, token anónimo de reseña; sin analítica ni
  tracking de terceros).
