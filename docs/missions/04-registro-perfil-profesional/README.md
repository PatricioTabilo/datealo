# Misión 04 — Registro y perfil de profesional

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** definición

**Última actualización:** 2026-08-22

Tercera de seis misiones hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (login del profesional, y el `sendEmail()` que esta misión usa
para el primer correo real del producto) y de [misión 03](../03-taxonomia-categorias-y-comunas/) (contra
qué categorías y comunas se registra).

| Documento     | Estado    | Qué falta para su gate              |
| ------------- | --------- | ------------------------------------ |
| Investigación | activo    | situación y consecuencia concretas, 4 conclusiones (C-001 a C-004) con confianza alta/media, ideal con capacidades observables — se acumula, no bloquea |
| Producto      | borrador  | esperando revisión de Patricio — 3 funcionalidades (F-001 a F-003), 3 decisiones (D-001 a D-003), sin preguntas bloqueantes |
| Experiencia   | pendiente | —                                     |
| Ingeniería    | pendiente | —                                     |

**Próximo hito:** que Patricio revise y apruebe `producto.md` — sin fecha límite todavía.

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
