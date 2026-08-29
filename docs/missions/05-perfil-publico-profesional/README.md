# Misión 05 — Perfil público de profesional

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-08-29

**Última actualización:** 2026-08-29

Cuarta de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 04](../04-registro-perfil-profesional/): sin perfiles de profesional reales, no hay qué mostrar.

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Construida:** [#90](https://github.com/PatricioTabilo/datealo/pull/90) (perfil público,
`GET /api/professionals/[id]`), [#91](https://github.com/PatricioTabilo/datealo/pull/91) (evento de
contacto, tabla y `POST /contacts`), [#92](https://github.com/PatricioTabilo/datealo/pull/92) (vista
`/profesionales/[id]`, con el refinamiento de desktop del 2026-08-29). El perfil público de un profesional
ya es alcanzable en producción con su `id` real.

## Brief

Lo que ve el buscador al entrar al perfil de un profesional: fotos, precios orientativos, y el botón de
contacto directo (WhatsApp o teléfono, sin intermediarios — la landing ya lo prometió). Es el lado
"mostrarse" desde quien busca.

Reseñas y badge de verificado quedan fuera de esta entrega (ver "Fuera de alcance" en `producto.md`):
reseñas porque dependen de la misión 07, que todavía no existe; verificado porque hoy no hay ningún
mecanismo real detrás de esa palabra — mostrarlo sin respaldo sería peor que no tenerlo.

Acá vive el evento de contacto: cuando el buscador aprieta el botón, eso queda registrado — es lo que
después habilita dejar una reseña en la [misión 07](../07-resenas-verificadas-por-contacto/), sin esta
misión esa no tiene de qué agarrarse.
