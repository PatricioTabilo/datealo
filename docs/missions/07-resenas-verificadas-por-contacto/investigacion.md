# Misión: reseñas verificadas por contacto — Investigación

**Estado:** activo

**Última actualización:** 2026-08-29

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

## El problema aparece cuando Carmen quiere avisarle a la próxima persona que Marcelo cumple

**Situación:** Carmen encontró a Marcelo, gasfiter de Ñuñoa, en el perfil público que dejó misión 05. Lo
contactó por WhatsApp un sábado a las 22:14, coordinaron por ese mismo chat y Marcelo le arregló la llave
que goteaba el lunes siguiente. Todo el intercambio — precio, horario, el trabajo mismo — ocurrió fuera de
Datealo, como D-001 de misión 04 y D-002 de misión 05 decidieron a propósito.

**Acción o necesidad:** Carmen quiere dejar una reseña de Marcelo, para que la próxima persona que busque
un gasfiter en Ñuñoa sepa que cumple. Es exactamente el gesto que sostiene la promesa de la landing:
"reseñas reales, sin inventadas".

**Respuesta actual:** hoy Datealo no tiene dónde dejarla. Fuera de Datealo, Carmen lo comentaría en el
grupo de WhatsApp del edificio, o buscaría si Marcelo tiene ficha en Google Maps — ninguna de las dos
opciones ayuda a alguien que está buscando específicamente en Datealo.

**Consecuencia:** si Datealo abre un formulario de reseña sin ningún filtro, dos cosas rompen la promesa el
mismo día que se lanza: un competidor de Marcelo puede dejarle una reseña de una estrella sin haberlo
contactado nunca, y Marcelo (o cualquier profesional) puede autoreseñarse con una cuenta falsa. Lo que hace
única a esta misión no es "cómo se ve una reseña" — es que **el evento de contacto del que depende, por
diseño de misión 05, no guarda ninguna identidad**: `professional_contact_events` (D-002 de
[producto.md de misión 05](../05-perfil-publico-profesional/producto.md#d-002)) solo sabe que "hubo un
contacto en el perfil de Marcelo el sábado a las 22:14" — no sabe que fue Carmen. Esa misma misión dejó la
pregunta abierta y apuntando acá: [Q-001 de producto.md de misión 05](../05-perfil-publico-profesional/producto.md#q-001).

## Preguntas que la investigación debe resolver

<!--
Solo preguntas capaces de cambiar el ideal o una decisión. Al resolver una, moverla a evidencia o
conclusión. No es un backlog.
-->

- ¿Qué puede significar realmente "verificado por contacto" cuando el registro del contacto (D-002 de
  misión 05) no guarda ninguna identidad? ¿Probar que esta reseña corresponde a un contacto real y
  específico, o solo elevar el costo de fabricar una reseña falsa lo suficiente para que no valga la pena?
- Misión 04 evaluó y descartó OTP por SMS/WhatsApp para autenticar al profesional, por el costo real de
  contratar Twilio antes de tener un solo profesional registrado (D-001 de producto.md de misión 04). El
  brief de esta misión propone el mismo mecanismo para el buscador. ¿Sigue siendo válido el mismo rechazo,
  o hay una razón distinta que lo justifique acá?
- ¿Existe un mecanismo que ate la reseña al momento del contacto sin pedirle nada al buscador — ni cuenta,
  ni teléfono, ni código — aprovechando que el contacto y la reseña pueden ocurrir en el mismo dispositivo?

## Evidencia

<!--
Un hecho verificable con fuente y límite. Prioriza observación directa, entrevistas y comportamiento
comprobado. Los benchmarks de otros productos también son evidencia: qué hacen, qué trade-off eligieron y
qué no aplica a Datealo.

Datealo no tiene datos de uso propios todavía. Cuando la única evidencia disponible sea un benchmark o
una entrevista, la columna "límite" es lo que impide que se lea como dato duro.
-->

| ID    | Tipo   | Fuente                                                                                  | Hecho verificable                                                                                                    | Límite de la evidencia |
| ----- | ------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| E-001 | código | [D-002 y Q-001, producto.md misión 05](../05-perfil-publico-profesional/producto.md#d-002) | `professional_contact_events` no tiene ninguna columna que identifique a quien contactó — decisión explícita, con reapertura condicionada a que misión 07 la necesite | Es la restricción vigente hoy; no dice si conviene revisarla, solo que existe |
| E-002 | código | [D-001, producto.md misión 04](../04-registro-perfil-profesional/producto.md#d-001)        | OTP por SMS/WhatsApp para el profesional se descartó por el costo real de contratar Twilio antes de tener un profesional registrado, no por dudas de que funcionara | Es sobre autenticar al profesional, no al buscador — el costo es el mismo proveedor, pero el problema que resuelve es distinto |
| E-003 | benchmark | [Trustworthy Shopping at Amazon](https://trustworthyshopping.aboutamazon.com/how-amazon-maintains-a-trusted-review-experience) | El badge "Verified Purchase" se calcula comparando la reseña contra el historial de compra de la cuenta del comprador — no le pide nada nuevo en el momento de reseñar | Depende de que exista un registro de transacción ligado a una cuenta persistente — justo lo que D-002 de misión 05 decidió no tener |
| E-004 | benchmark | [Search Engine Land — cómo Google y Yelp manejan reseñas falsas](https://searchengineland.com/how-google-and-yelp-handle-fake-reviews-and-policy-violations-374071), [Google: nuevas formas de proteger negocios en Maps](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/) | Google Maps no verifica que una reseña corresponda a una visita o compra real; en 2025 removió más de 292 millones de reseñas que violaban sus políticas, y hay estafas activas de extorsión con reseñas negativas falsas contra negocios pequeños | La escala de moderación de Google (equipos + ML) no es transferible a Datealo, pero el patrón de abuso — reseña falsa como arma contra un negocio chico sin defensa — sí es comparable: los profesionales de Datealo son ese mismo perfil de negocio |
| E-005 | benchmark | [Twilio Verify pricing](https://www.twilio.com/en-us/pricing) | Un OTP con Twilio Verify parte en USD 0,05 por verificación — no es gratis, y exige cuenta y contrato con un proveedor internacional de SMS | El costo por verificación es bajo en términos absolutos; lo que ya bloqueó a misión 04 no fue el precio unitario sino contratar el proveedor antes de tener tracción — ese argumento no cambia por el precio |
| E-006 | código | [`CLAUDE.md`](../../../CLAUDE.md), sección "Tipos de usuario" | El profesional "no es un usuario técnico y gestiona su perfil entre trabajos" — no una persona que entra a revisar un dashboard seguido | Es una descripción de producto ya aceptada como perfil de usuario, no una medición de comportamiento real todavía |

## Conclusiones

<!--
Una conclusión interpreta evidencia; no es una preferencia ni una funcionalidad. El título expresa el
hallazgo, no el tema.
-->

<a id="c-001"></a>

### C-001 — "Verificado por contacto" no puede significar prueba de que este contacto específico ocurrió

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** el evento de contacto que misión 05 registra es, a propósito, anónimo — solo sabe
  "hubo un contacto en este perfil, a esta hora". No existe ningún dato en el sistema que diga que fue
  Carmen quien generó ese contacto específico. Ningún mecanismo que Datealo agregue del lado de la reseña
  puede cruzar contra un dato que nunca se guardó del lado del contacto.
- **Implicación:** el nombre "reseña verificada por contacto" describe una intención de producto —reducir
  el costo de una reseña inventada—, no una garantía criptográfica de que ese contacto puntual ocurrió.
  `producto.md` tiene que decidir qué nivel de prueba es honesto de comunicar, sin prometer más de lo que
  el sistema entrega — el guardrail de "confianza primero" de `CLAUDE.md` se rompe si el badge promete algo
  que Datealo no puede respaldar.
- **Confianza:** alta — no es una interpretación disputable, es la consecuencia directa de una decisión de
  diseño ya tomada y documentada en otra misión.

<a id="c-002"></a>

### C-002 — Repetir el camino de OTP por SMS que misión 04 ya rechazó, para un problema secundario, necesita una razón nueva

- **Sustento:** [E-002](#e-002), [E-005](#e-005).
- **Razonamiento:** misión 04 evaluó exactamente este mecanismo (OTP por SMS/WhatsApp vía Twilio) para
  autenticar al profesional — el lado del marketplace que sí necesita identidad persistente — y lo descartó
  por el costo de contratar un proveedor de SMS antes de tener el primer profesional. El costo por mensaje
  es bajo (E-005), pero eso no fue lo que lo descartó: fue contratar el proveedor mismo. Reseñas es un
  problema con menos necesidad de identidad persistente que autenticación (la reseña no necesita que
  Carmen vuelva a entrar mañana), así que el mismo argumento pesa igual o más fuerte acá.
- **Implicación:** si `producto.md` igual elige OTP por teléfono para el buscador, tiene que declarar
  explícitamente por qué el costo que bloqueó a misión 04 deja de ser bloqueante acá — o buscar un mecanismo
  que no dependa de contratar Twilio.
- **Confianza:** alta — el precedente es interno, de una misión hermana, con la misma restricción de
  pre-lanzamiento que sigue vigente hoy.

<a id="c-003"></a>

### C-003 — Un token del navegador, guardado en el momento del contacto, ata la reseña a un contacto real sin pedirle nada a nadie

- **Sustento:** [E-001](#e-001) (la reapertura de D-002 de misión 05 contempla exactamente este caso —
  "si misión 07 concluye que necesita datos adicionales del momento del contacto").
- **Razonamiento:** Carmen contacta y reseña casi siempre desde el mismo teléfono, en el mismo navegador.
  Si el evento de contacto (F-002 de misión 05) deja algo en ese navegador —sin identificar a Carmen, sin
  pedirle nada—, ese mismo algo puede exigirse al momento de reseñar. No prueba que fue Carmen la persona
  física, pero sí prueba que ese dispositivo generó un contacto real con Marcelo antes de intentar
  reseñarlo — el mismo nivel de prueba que C-001 concluye que es honesto prometer.
- **Implicación:** esta es la alternativa más barata y menos fricciosa de las tres preguntas abiertas, y no
  tiene el costo de infraestructura de C-002. Su debilidad — que el token es copiable o se pierde si Carmen
  cambia de dispositivo o borra datos del navegador — es un caso límite real que `producto.md` tiene que
  resolver (ej. qué pasa si Carmen quiere reseñar desde el computador después de haber contactado desde el
  celular), no una razón para descartarla de plano.
- **Confianza:** media — no hay precedente externo directo porque es una construcción a medida de la
  restricción que D-002 de misión 05 ya impuso; la solidez real depende del diseño técnico que
  `ingenieria.md` tendría que definir, y de qué tan seguido ocurre el caso de cambio de dispositivo.

<a id="c-004"></a>

### C-004 — Dejar el formulario de reseña completamente abierto expone a profesionales sin defensa al mismo abuso que sufren los negocios chicos en Google Maps

- **Sustento:** [E-004](#e-004).
- **Razonamiento:** el patrón de abuso que describe E-004 —reseña negativa falsa usada para extorsionar a
  un negocio chico— no depende de la escala de la plataforma, depende de que el formulario de reseña esté
  abierto sin ningún costo de fabricarla. Marcelo es exactamente el perfil de negocio que ese patrón
  ataca: una persona sola, sin equipo legal ni de moderación propio.
- **Implicación:** algún filtro —aunque no sea prueba criptográfica, ver C-001— no es opcional. La pregunta
  que resuelve `producto.md` no es "¿hace falta un filtro?", es "¿cuál, con qué costo de fricción y de
  infraestructura?" — entre C-002 (OTP, costo de proveedor) y C-003 (token de navegador, costo de robustez).
- **Confianza:** media — la evidencia es de la escala de Google, no transferible en volumen absoluto, pero
  el mecanismo de abuso no depende de volumen, solo de que exista la superficie sin filtro.

<a id="c-005"></a>

### C-005 — Un profesional que no entra seguido a la plataforma solo se entera de una reseña nueva si Datealo se lo empuja

- **Sustento:** [E-006](#e-006).
- **Razonamiento:** si el profesional gestiona su perfil "entre trabajos", desde el celular, y no es un
  usuario técnico de dashboards, el canal correcto para avisarle de algo que afecta su reputación no puede
  ser "que entre a revisar" — tiene que llegarle a un lugar que ya revisa por otro motivo. El correo ya es
  ese lugar: es el mismo canal que misión 04 usa para su enlace mágico de ingreso, así que un profesional
  activo ya lo revisa con regularidad.
- **Implicación:** el aviso de reseña nueva se justifica como correo individual, no como algo que el
  profesional descubre solo si entra a Datealo por su cuenta.
- **Confianza:** media — la descripción del profesional como usuario poco técnico está aceptada en
  `CLAUDE.md`, pero no hay todavía un profesional real que confirme el hábito de revisar correo.

## El ideal: cualquier reseña en Datealo viene de alguien que de verdad contactó al profesional, sin pedirle cuenta a nadie

<!--
El ideal es el producto de la investigación: la dirección que la evidencia sostiene, sin restricciones de
implementación. El recorte a la primera entrega no vive aquí — vive en producto.md como decisión de
alcance. Esta sección sí se reescribe cuando nueva evidencia cambia la dirección.
-->

### El resultado ideal se ve así

Carmen contactó a Marcelo un sábado por la noche desde el celular. El lunes, con la llave ya arreglada,
vuelve a abrir el perfil de Marcelo en el mismo celular y encuentra el botón "Dejar una reseña" ya
habilitado — no tuvo que guardar ningún código ni recordar una fecha. Escribe cuatro líneas y elige cuatro
estrellas, sin crear cuenta ni poner contraseña. La reseña aparece en el perfil de Marcelo con una marca
que dice, en el lenguaje de la landing, algo como "esta persona contactó a Marcelo por Datealo" — no "reseña
verificada" a secas, que prometería más de lo que el sistema puede probar (C-001). Si alguien que nunca
contactó a Marcelo —un competidor, un curioso— intenta dejarle una reseña desde un perfil que nunca abrió
el botón de contacto, Datealo no le muestra el formulario. Marcelo recibe un correo individual cada vez que
le llega una reseña nueva, buena o mala, con el contenido completo en el cuerpo del correo — sin tener que
entrar a la plataforma para leerla.

### Capacidades del ideal

| Capacidad                          | Acción habilitada                                             | Respuesta esperada                                                            | Conclusión que la justifica |
| ----------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Reseñar sin cuenta                  | Dejar una reseña de un profesional sin crear cuenta ni contraseña | El formulario se completa y publica sin pedir identidad persistente               | [C-001](#c-001), [C-003](#c-003) |
| Filtro de acceso al formulario      | El formulario de reseña solo aparece o se acepta si hubo un contacto real desde ese dispositivo | Un intento sin contacto previo no llega a publicar una reseña                    | [C-003](#c-003), [C-004](#c-004) |
| Marca honesta en la reseña publicada| Cualquier buscador que lee el perfil ve qué nivel de garantía tiene la reseña | El texto de la marca no promete una verificación que Datealo no puede respaldar | [C-001](#c-001) |
| Aviso al profesional                | El profesional se entera de cada reseña nueva sin tener que entrar a Datealo | Correo individual por reseña, con el contenido completo, buena o mala             | [C-005](#c-005) |

### El ideal no significa que Datealo audita cada reseña a mano ni que hay 100% de certeza de que el contacto ocurrió

- "Verificado por contacto" significa que existe una barrera real que sube el costo de fabricar una reseña
  falsa — no que Datealo revisó cada caso ni que es matemáticamente imposible falsear una.
- No significa pedirle al buscador que cree una cuenta persistente, recuerde una contraseña o teclee un
  código — eso es exactamente la fricción que D-001 de misión 04 y D-001/D-002 de misión 05 ya evitaron del
  lado del contacto, y que esta misión no debería reintroducir del lado de la reseña sin una razón nueva
  (C-002).
- No significa que el profesional puede impugnar o borrar una reseña real que no le gustó — eso es un
  problema distinto (moderación/disputas), fuera de esta misión salvo que la evidencia lo traiga de vuelta.

## Referencias

<!-- Fuentes primarias citadas por las evidencias. El enlace no sustituye el hecho y el límite en E-xxx. -->

- [How Amazon maintains a trusted review experience](https://trustworthyshopping.aboutamazon.com/how-amazon-maintains-a-trusted-review-experience): usado en E-003 para cómo Amazon verifica sin exponer datos nuevos del comprador.
- [How Google and Yelp handle fake reviews and policy violations](https://searchengineland.com/how-google-and-yelp-handle-fake-reviews-and-policy-violations-374071): usado en E-004 para el patrón de abuso sin verificación.
- [New ways we're protecting businesses on Maps](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/): usado en E-004 para la escala de reseñas removidas por Google en 2025.
- [Twilio Pricing](https://www.twilio.com/en-us/pricing): usado en E-005 para el costo por verificación de Twilio Verify.
