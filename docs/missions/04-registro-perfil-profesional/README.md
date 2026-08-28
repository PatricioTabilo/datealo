# Misión 04 — Registro y perfil de profesional

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** cerrada 2026-08-28

**Última actualización:** 2026-08-28

Tercera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (login del profesional, y el `sendEmail()` que esta misión usa
para el primer correo real del producto) y de [misión 03](../03-taxonomia-categorias-y-comunas/) (contra
qué categorías y comunas se registra).

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

Plan de construcción completo: S-001 a S-006 (issues [#73](https://github.com/PatricioTabilo/datealo/issues/73),
[#74](https://github.com/PatricioTabilo/datealo/issues/74), [#75](https://github.com/PatricioTabilo/datealo/issues/75),
[#76](https://github.com/PatricioTabilo/datealo/issues/76), [#77](https://github.com/PatricioTabilo/datealo/issues/77),
[#78](https://github.com/PatricioTabilo/datealo/issues/78)) mergeados. El profesional puede registrarse con
enlace mágico, quedar publicado de inmediato, y editar cualquier campo de su perfil incluidas las fotos.

## Brief

El profesional crea su cuenta y completa su perfil público: qué servicios ofrece, en qué comuna trabaja,
fotos de trabajos anteriores, precios orientativos. Es el "registrarse" del MVP, y el lado "mostrarse"
desde quien ofrece el servicio — acá vive el login del profesional, sobre lo que la misión 02 termine
ratificando (no necesariamente email/password o magic link — eso también queda por confirmar).

Al completar el registro, algo le tiene que confirmar al profesional que su perfil ya quedó publicado — un
correo, no dejarlo mirando una pantalla sin saber si funcionó. El contenido y el trigger exacto son de esta
misión; el mecanismo de envío lo deja listo la 02.

Verificación de profesional queda fuera de esta misión: al lanzamiento el perfil se activa solo, sin que
nadie lo revise (D-002 en `producto.md`) — no hay flujo manual que construir todavía. Si eso cambia más
adelante, el mecanismo (`activa`, igual que categorías y comunas) ya existe.
