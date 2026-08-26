# Misión 07 — Reseñas verificadas por contacto

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** exploración

**Última actualización:** 2026-08-13

Sexta y última misión hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (la identidad ligera del buscador, cualquiera sea el mecanismo que
esa misión ratifique, y el `sendEmail()` para notificar al profesional) y de
[misión 05](../05-perfil-publico-profesional/) (el evento de contacto al que se ata cada reseña).

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**Próximo hito:** ninguno todavía — esta misión no se ha empezado a trabajar.

## Brief

Después de contactar a un profesional, el buscador puede dejar una reseña — atada al hecho de que el
contacto realmente ocurrió, no un formulario abierto que cualquiera llena. Es la pieza que sostiene la
promesa de "reseñas reales, sin inventadas" que la landing ya le mostró a gente real.

**Dirección a confirmar, no decisión cerrada:** la conversación de roadmap (2026-08-13) exploró verificar
por teléfono (OTP puntual, no cuenta completa) en vez de pedirle cuenta persistente al buscador — el
buscador no la necesita para buscar ni para contactar, por el principio de "sin fricción" de `CLAUDE.md`.
Hay research general sobre verificación de reviews sin transacción dentro de la plataforma que la respalda,
pero el mecanismo exacto (qué se verifica, cuándo, con qué fricción real) se define en el `producto.md` y
`experiencia.md` de esta misión, no acá.

**También entra en el alcance:** cuando llega una reseña nueva, el profesional recibe un correo —
individual por reseña, no un digest agrupado (no hay volumen todavía que lo justifique), y siempre, buena o
mala, porque afecta su reputación igual. Lo mantiene volviendo a la plataforma y es el gancho natural si
más adelante se agrega poder responder una reseña. El contenido y el trigger son de esta misión; el envío
lo deja listo la 02.
