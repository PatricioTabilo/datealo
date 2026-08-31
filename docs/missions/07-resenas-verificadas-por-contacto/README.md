# Misión 07 — Reseñas verificadas por contacto

**Tipo:** producto. **Abierta el** 2026-08-13. **Nace de:** ninguna.

**Estado de la misión:** en construcción

**Última actualización:** 2026-08-31

Sexta y última misión hacia el MVP (registrarse, mostrarse, buscar, reseñar). Depende de
[misión 02](../02-base-de-datos-y-auth/) (`sendEmail()` para notificar al profesional — la identidad
ligera del buscador que este README mencionaba ya no aplica: [D-001](./producto.md#d-001) resuelve la
verificación con un token de navegador, sin cuenta de ningún tipo) y de
[misión 05](../05-perfil-publico-profesional/) (el evento de contacto al que se ata cada reseña, y su
[Q-001](../05-perfil-publico-profesional/producto.md#q-001), que esta misión responde en
[D-001](./producto.md#d-001)).

**Documentos:** [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

**En foco:** Construcción — los cuatro documentos de discovery están vigentes. `producto.md` con sus tres
funcionalidades y tres decisiones ([D-001](./producto.md#d-001), [D-002](./producto.md#d-002),
[D-003](./producto.md#d-003)); `experiencia.md` **vigente — aprobado el 2026-08-30**, tras evaluación
heurística en un agente aislado; `ingenieria.md` **vigente — aprobado el 2026-08-31**, tras dos auditorías
independientes (la primera tumbó un diseño del token que no verificaba nada contra un contacto real; la
segunda encontró que el documento implicaba más protección de la que hay, corregido con TR-003). De paso,
esta misión dejó un patrón universal nuevo en "Patrones de interacción que ya están decididos" del skill
`discovery-ux`: todo toast de Datealo va en `bottom-right`, 5000ms, sin variar por dispositivo.

El plan de construcción quedó cortado en 7 slices (walking skeleton del mecanismo de verificación primero,
UI después, correo al final — ver "Plan de construcción" de `ingenieria.md`), con sus issues ya creados:
[#107](https://github.com/PatricioTabilo/datealo/issues/107) a
[#113](https://github.com/PatricioTabilo/datealo/issues/113).

**Próximo hito:** construir S-001 ([#107](https://github.com/PatricioTabilo/datealo/issues/107)) — extender
`POST /contacts` con el token opcional, la base de todo lo demás.

## Brief

Después de contactar a un profesional, el buscador puede dejar una reseña — atada al hecho de que el
contacto realmente ocurrió, no un formulario abierto que cualquiera llena. Es la pieza que sostiene la
promesa de "reseñas reales, sin inventadas" que la landing ya le mostró a gente real.

**Dirección confirmada (reemplaza la propuesta original de este brief):** la conversación de roadmap
(2026-08-13) exploró verificar por teléfono (OTP puntual) en vez de pedirle cuenta persistente al
buscador. La investigación de esta misión ([investigacion.md](./investigacion.md)) encontró que ese
mecanismo repite, sin razón nueva, el mismo costo de infraestructura (contratar Twilio) que
[misión 04 ya rechazó](../04-registro-perfil-profesional/producto.md#d-001) para el profesional. La
dirección que `producto.md` deja en su lugar — [D-001](./producto.md#d-001), aceptada el 2026-08-29 — es
un token que el navegador guarda en el momento del contacto, sin vencimiento por tiempo: sin OTP, sin
cuenta, sin costo de proveedor externo. `producto.md` también agrega [D-002](./producto.md#d-002): la
reseña lleva un nombre de texto libre y opcional, nunca un teléfono.

**También entra en el alcance:** cuando llega una reseña nueva, el profesional recibe un correo —
individual por reseña, no un digest agrupado (no hay volumen todavía que lo justifique), y siempre, buena o
mala, porque afecta su reputación igual. Lo mantiene volviendo a la plataforma y es el gancho natural si
más adelante se agrega poder responder una reseña. El contenido y el trigger son de esta misión; el envío
lo deja listo la 02.
