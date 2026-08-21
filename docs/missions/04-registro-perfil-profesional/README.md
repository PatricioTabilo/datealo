# Misión 04 — Registro y perfil de profesional

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** exploración

**Última actualización:** 2026-08-20

Tercera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (login del profesional, y el `sendEmail()` que esta misión usa
para el primer correo real del producto) y de [misión 03](../03-taxonomia-categorias-y-comunas/) (contra
qué categorías y comunas se registra).

| Documento     | Estado    | Qué falta para su gate              |
| ------------- | --------- | ------------------------------------ |
| Investigación | activo    | situación y consecuencia concretas, 4 conclusiones (C-001 a C-004) con confianza alta/media, ideal con capacidades observables — se acumula, no bloquea |
| Producto      | pendiente | escribir `producto.md` a partir de las conclusiones de investigación |
| Experiencia   | pendiente | —                                     |
| Ingeniería    | pendiente | —                                     |

**Próximo hito:** escribir `producto.md` — sin fecha límite todavía.

## Brief

El profesional crea su cuenta y completa su perfil público: qué servicios ofrece, en qué comuna trabaja,
fotos de trabajos anteriores, precios orientativos. Es el "registrarse" del MVP, y el lado "mostrarse"
desde quien ofrece el servicio — acá vive el login del profesional, sobre lo que la misión 02 termine
ratificando (no necesariamente email/password o magic link — eso también queda por confirmar).

Al completar el registro, algo le tiene que confirmar al profesional que su solicitud llegó y que se va a
validar pronto — un correo, no dejarlo mirando una pantalla sin saber si funcionó. El contenido y el
trigger exacto son de esta misión; el mecanismo de envío lo deja listo la 02.

Verificación de profesional queda fuera de esta misión: para el MVP es manual, un admin marca el flag
directamente en la base — no hay flujo que construir todavía.
