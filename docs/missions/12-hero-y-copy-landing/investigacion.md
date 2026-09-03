# Misión: hero y copy de la landing — Investigación

**Estado:** activo

**Última actualización:** 2026-09-01

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento se acumula: la evidencia y las conclusiones no se borran cuando el alcance cambia, porque
explican por qué el producto es como es. Lo que sí se actualiza es el ideal, que resume la dirección que
la investigación sostiene hoy.

Gate de salida — la investigación sostiene un producto.md cuando:
- el problema tiene situación y consecuencia concretas, no una categoría abstracta
- al menos una conclusión con confianza alta o media respalda la dirección
- el ideal describe capacidades observables, no intenciones
-->

## El problema aparece cuando el copy del hero nunca fue escrito a propósito

**Situación:** el hero de la landing pasó por un cambio funcional reciente (commits 2026-08-30/31): el
formulario de lista de espera se reemplazó por un buscador en vivo conectado a `/buscar`. El copy que
acompaña ese buscador (headline, subheadline, trust items) no se reescribió como parte de ese cambio —
sigue siendo, en esencia, el mismo texto adaptado.

**Acción o necesidad:** alguien llega por primera vez a datealo.cl y tiene unos segundos para entender qué
es Datealo y decidir si sigue explorando.

**Respuesta actual:** ve un headline que ya nombra la alternativa real ("grupos de Facebook"), pero trust
items que repiten atributos que esa misma alternativa también tiene, y una claim de confianza
("profesionales verificados") que la plataforma no puede respaldar hoy.

**Consecuencia:** el hero no está mal escrito, pero tampoco fue *investigado* — es la primera versión que
salió de un cambio técnico, no el resultado de pensar deliberadamente qué necesita comunicar contra la
alternativa real del usuario (el grupo de WhatsApp del edificio).

## Preguntas que la investigación debe resolver

- ¿El copy actual del hero (ya actualizado al buscador en vivo) se da por bueno o necesita una revisión de
  mensaje dedicada, más allá del cambio funcional que lo produjo?
- ¿Qué reemplaza a "verificado" como mensaje de confianza, dado que esa palabra no tiene respaldo real?
- ¿El buscador del hero necesita un ajuste visual (tamaño, íconos) además del mensaje?

## Evidencia

<!--
Un hecho verificable con fuente y límite. Prioriza observación directa, entrevistas y comportamiento
comprobado. Los benchmarks de otros productos también son evidencia: qué hacen, qué trade-off eligieron y
qué no aplica a Datealo.

Datealo no tiene datos de uso propios todavía. Cuando la única evidencia disponible sea un benchmark o
una entrevista, la columna "límite" es lo que impide que se lea como dato duro.
-->

| ID    | Tipo        | Fuente                                              | Hecho verificable | Límite de la evidencia |
| ----- | ----------- | ---------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código      | `app/constants/landing.ts` (`LANDING_HERO`)          | El copy actual del hero ("Deja de buscar en grupos de Facebook. Encuentra profesionales reales, cerca de ti.", trust items "Gratis", "Sin registro", "Contacto directo") ya refleja el cambio de lista de espera a buscador en vivo — no queda copy residual de "acceso anticipado". | Confirma que el copy está actualizado técnicamente, no que fue validado como mensaje ganador. |
| E-002 | análisis (posicionamiento) | skill `obviously-awesome` aplicado al hero actual | Los trust items del hero ("Gratis", "Sin registro", "Contacto directo") son atributos que el grupo de WhatsApp/Facebook también tiene — no pasan el "solo nosotros" del framework, y no diferencian a Datealo de la alternativa que el propio headline acaba de nombrar. Lo que un grupo de WhatsApp no ofrece (ordenar por cercanía, categorización clara) sí existe funcionalmente en el buscador del hero, pero no se comunica como diferenciador. | Es un análisis de coherencia interna del mensaje contra un framework, no una prueba con usuarios reales de qué convierte mejor. |
| E-003 | código + producto | `server/db/schema/*.ts`, `app/constants/landing.ts:5,47,51-52,104`, [D-001 de misión 07](../07-resenas-verificadas-por-contacto/producto.md#d-001) | No existe ningún campo de verificación en el schema de profesionales, ni ninguna misión que planifique construirlo. Pese a eso, `LandingSolution` ya afirma como hecho "Cada profesional pasa por un proceso de verificación" y el hero dice "profesionales verificados". Misión 07 ya resolvió esta misma tensión para las reseñas: nunca dice "verificada" a secas, siempre "verificada por contacto" — porque lo único que Datealo puede respaldar es que el contacto ocurrió. | Confirma que "verificado" no es una funcionalidad planeada en ningún horizonte visible, no solo que falta hoy. |
| E-004 | análisis (JTBD) | skill `jobs-to-be-done` aplicado al trabajo que alguien contrata al buscar un profesional de servicios para el hogar | El trabajo tiene tres dimensiones: funcional (encontrar rápido a alguien confiable, cerca, disponible), emocional (dejar la ansiedad de "¿me va a estafar o no va a llegar?" — alivio), social (evitar la exposición de pedir ayuda o depender de la buena voluntad de un grupo). El copy actual del hero cubre la funcional y roza la social ("deja de buscar en grupos"), pero no nombra la emocional — que `LANDING_PROBLEM` ya identificó como consecuencia ("la ruleta de la confianza", "el maestro fantasma"). | Es una aplicación del framework sobre conocimiento de dominio ya documentado (`CLAUDE.md`, `LANDING_PROBLEM`), no entrevistas nuevas con usuarios de Datealo. |
| E-005 | benchmark   | [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/) — referencia aportada por el dueño de producto | El buscador del hero de la referencia tiene inputs más grandes (con íconos por campo), más padding, y un botón de búsqueda con ícono + texto — se siente "más trabajado" que el buscador actual de Datealo, que no tiene íconos ni el mismo padding. | Es un theme genérico, sirve como referencia de tamaño/jerarquía visual, no de contenido — ver [misión 09](../09-layout-general/investigacion.md#c-003) para el análisis completo de esta referencia. |

## Conclusiones

<a id="c-001"></a>

### C-001 — El copy del hero ya no arrastra el mensaje de lista de espera, pero no ha sido validado como mensaje ganador

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** el cambio reciente fue funcional — reemplazar el formulario por el buscador en vivo —
  no una iteración de copy. Que el texto ya no mencione "lista de espera" es necesario pero no es lo mismo
  que "está bien investigado".
- **Implicación:** el copy del hero se trata como pendiente de revisión propia (tono, claridad de la
  propuesta de valor, jerarquía con el buscador).
- **Confianza:** media.

<a id="c-002"></a>

### C-002 — Los trust items del hero repiten atributos de la alternativa que el headline acaba de nombrar, en vez de reforzar lo que sí es distinto

- **Sustento:** [E-002](#e-002).
- **Razonamiento:** "Gratis", "Sin registro" y "Contacto directo" son verdaderos también para un grupo de
  WhatsApp o Facebook Marketplace — no superan el "solo nosotros" del framework de posicionamiento. Lo que
  esa alternativa no ofrece (ordenar por cercanía, categorización clara) ya existe funcionalmente en el
  buscador del hero, pero no aparece comunicado como diferenciador.
- **Implicación:** la revisión de copy debe evaluar reemplazar o complementar esos trust items con algo
  que sí distinga a Datealo de la alternativa que el propio headline nombra.
- **Confianza:** media — es un análisis de coherencia del mensaje, no una prueba con usuarios reales.

<a id="c-003"></a>

### C-003 — "Verificado" no es una promesa aplazada, es una palabra sin funcionalidad detrás — ni hoy ni planificada. El respaldo real de confianza que Datealo sí tiene es la reseña

- **Sustento:** [E-003](#e-003).
- **Razonamiento:** el dueño de producto confirmó que no existe ningún plan de construir verificación
  formal de profesionales. "Verificado" es, como mucho, una lectura social informal (un perfil con varias
  reseñas reales se *siente* verificado), nunca una funcionalidad de la plataforma. Datealo ya resolvió
  esta misma tensión para las reseñas en la misión 07: nunca dice "verificada" a secas, siempre "verificada
  por contacto".
- **Implicación:** la palabra "verificado" sale del copy que describe profesionales — el hero y
  `LandingSolution` la usan hoy sin respaldo. El mensaje de confianza se apoya en reseñas reales de la
  misma zona y en los atributos de [C-002](#c-002) (cercanía, categorización).
- **Confianza:** alta — se apoya en la confirmación directa del dueño de producto.

<a id="c-004"></a>

### C-004 — El copy actual cubre la dimensión funcional del trabajo, roza la social, pero no nombra la emocional

- **Sustento:** [E-004](#e-004).
- **Razonamiento:** "Deja de buscar en grupos de Facebook" es funcional y social a la vez (dejar de
  depender de otros); "Encuentra profesionales reales, cerca de ti" es funcional. Ninguna línea nombra el
  alivio de dejar la ansiedad de "¿me va a estafar o no va a llegar?" — la misma consecuencia que
  `LANDING_PROBLEM` ya identificó ("la ruleta de la confianza", "el maestro fantasma") pero que el hero no
  retoma.
- **Implicación:** la revisión de copy debería explorar si sumar la dimensión emocional fortalece el
  mensaje, sin caer en urgencia artificial — guardrail ya vigente en `CLAUDE.md`.
- **Confianza:** media.

<a id="c-005"></a>

### C-005 — El buscador del hero necesita mayor tamaño, padding e íconos por campo

- **Sustento:** [E-005](#e-005).
- **Razonamiento:** el dueño de producto comparó el buscador actual contra la referencia y lo describió
  como "simplón" — los inputs no tienen íconos, tienen menos padding, y el botón de búsqueda es un link de
  texto en vez de un botón trabajado.
- **Implicación:** el ajuste visual del buscador del hero (íconos por campo, más padding, botón más
  amigable) entra en esta misión, sin fila de accesos rápidos por categoría (descartada explícitamente por
  el dueño de producto).
- **Confianza:** alta — confirmado directamente por el dueño de producto.

## El ideal: el hero comunica en segundos qué es Datealo, por qué es mejor que preguntarle al vecino, y con un buscador que se ve tan cuidado como el resto de la sección

<!--
El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. El recorte a la primera entrega no vive aquí — vive en producto.md como decisión de
alcance. Esta sección sí se reescribe cuando nueva evidencia cambia la dirección.
-->

### El resultado ideal se ve así

Alguien en Ñuñoa abre datealo.cl por primera vez, después de una mala experiencia con el "maestro
fantasma" del grupo del edificio. El hero le habla directo a esa frustración — no solo "hay profesionales
cerca", sino que reconoce la ansiedad de no saber si esta vez sí va a funcionar. El buscador se ve tan
cuidado como el resto de la sección: campos grandes con íconos, un botón de búsqueda que invita a
tocarlo. Ningún trust item promete algo que Datealo no puede respaldar todavía.

### Capacidades del ideal

| Capacidad | Acción habilitada | Respuesta esperada | Conclusión que la justifica |
| --------- | -------------------- | ------------------------------------- | --------------------------- |
| Copy revisado | alguien llega a la landing por primera vez | entiende en segundos qué hace Datealo, sin repetir atributos de la alternativa que ya conoce | [C-001](#c-001), [C-002](#c-002), [C-004](#c-004) |
| Mensaje de confianza honesto | cualquiera que lea el hero o la sección de soluciones | ningún texto afirma verificación que no existe; la confianza se apoya en reseñas reales | [C-003](#c-003) |
| Buscador del hero pulido | alguien interactúa con el buscador del hero | campos grandes, con íconos, botón de búsqueda trabajado | [C-005](#c-005) |

### El ideal no significa

- No significa agregar urgencia artificial ni prometer cobertura de profesionales que no existe — guardrail
  ya vigente en `CLAUDE.md`.
- No significa cambiar la estructura funcional del buscador del hero (categoría + comuna + CTA) — eso ya
  está resuelto por la misión de búsqueda.

## Referencias

<!-- Fuentes primarias citadas por las evidencias. El enlace no sustituye el hecho y el límite en E-xxx. -->

- [listivo6.tangiblewp.com](https://listivo6.tangiblewp.com/): usado en E-005 para el tamaño/jerarquía del
  buscador de referencia.
