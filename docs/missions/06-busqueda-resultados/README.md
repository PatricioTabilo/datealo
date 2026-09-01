# Misión 06 — Búsqueda y resultados

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-08-31

**Última actualización:** 2026-08-31

Quinta de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 03](../03-taxonomia-categorias-y-comunas/) (contra qué categorías/comunas se filtra) y de
[misión 04](../04-registro-perfil-profesional/)/[05](../05-perfil-publico-profesional/) (que existan
perfiles reales que buscar — sin datos, no hay resultados que mostrar ni relevancia que ordenar).

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** ninguno — los 5 issues del plan de construcción
([#94](https://github.com/PatricioTabilo/datealo/issues/94)–[#98](https://github.com/PatricioTabilo/datealo/issues/98))
están cerrados y mergeados.

`producto.md` vigente — aprobado por Patricio el 2026-08-28. D-001 a D-004 aceptadas; D-001 (orden por
completitud del perfil) queda marcada explícitamente como interina, y D-002 (comuna vecina = comparte
límite real) llevó a activar Frutillar, Puerto Montt y Llanquihue en el catálogo de comunas junto con
Puerto Varas.

`experiencia.md` vigente — aprobado por Patricio el 2026-08-29. Una sola vista reactiva (V-001, UXF-001),
comuna exacta y comunas vecinas en la misma lista (UX-002), sin pestañas ni mapa. Mockup validado en
`design-mockups/resultados-busqueda.html` (9 frames, móvil y desktop).

`ingenieria.md` vigente — aprobado por Patricio el 2026-08-29, tras auditoría en contexto separado
(`clean-architecture`, `domain-driven-design`, `supabase-postgres-best-practices`). Endpoint único `GET
/api/search` (F-001+F-002 a la vez), tabla nueva `comuna_vecinas` con adyacencia geográfica precalculada
una sola vez (riesgo abierto no bloqueante: TR-001, qué tan confiable es el dataset elegido), y extracción
del composable compartido `useSlowLoad()` desde la misión 05.

## Brief

El buscador filtra por categoría y comuna y ve una lista de profesionales — el "buscar" del MVP. La
dirección que salió de la conversación de roadmap (2026-08-13) es ordenar por relevancia y cercanía por
comuna, como un portal inmobiliario, sin geolocalización de precisión — pero es una recomendación a
confirmar en `producto.md`, no una decisión ratificada.

Sin resultados mientras se escribe (debounce 300ms) y empty states que inviten a probar otra categoría o
comuna cercana son estándar del producto, no algo que se re-discuta acá (`CLAUDE.md`).
