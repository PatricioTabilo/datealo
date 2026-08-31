# Misión: reseñas verificadas por contacto — Producto

**Estado:** vigente — aprobado por Patricio el 2026-08-29, con [D-003](#d-003) aceptada el 2026-08-30

**Última actualización:** 2026-08-30

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Este documento es la spec viva del resultado: qué construimos ahora y bajo qué reglas. El porqué vive en
investigacion.md — aquí solo se enlaza. Se reescribe cuando el alcance cambia; no acumula historia.

Gate de salida — producto.md está listo para experiencia.md cuando:
- cada funcionalidad tiene formato JTBD, reglas y al menos un caso límite con comportamiento definido
- cada funcionalidad enlaza una conclusión de investigacion.md y una señal de éxito
- cada funcionalidad declara a qué lado del marketplace sirve, y qué necesita del otro lado para funcionar
- no hay decisiones de producto delegadas a diseño o ingeniería
- las decisiones propuestas tienen fecha límite en el README
-->

## Qué construimos: el buscador deja una reseña sin cuenta, filtrada por si su navegador generó un contacto real

**Resultado:** Carmen puede dejar una reseña de Marcelo después de haberlo contactado, sin crear cuenta ni
teclear ningún código; cualquier otro buscador que abra el perfil de Marcelo ve esa reseña; Marcelo recibe
un correo cada vez que le llega una nueva.

**Recorte respecto del ideal:** el ideal ([investigacion.md](./investigacion.md)) sostiene una barrera real contra reseñas fabricadas, sin pedirle nada a nadie. Esta entrega la resuelve con
un token que el navegador guarda en el momento del contacto ([D-001](#d-001)) — no con OTP por teléfono,
que el brief original de esta misión proponía como dirección a confirmar, y que la investigación desaconseja
por el mismo costo de infraestructura que misión 04 ya rechazó ([C-002 de investigacion.md](./investigacion.md#c-002)).
Queda fuera de esta entrega poder reseñar desde un dispositivo distinto al que contactó, borrar una reseña
sin dejar otra en su lugar ([D-003](#d-003)), y cualquier moderación humana de contenido.

**Restricciones aceptadas:** una reseña es rating (1 a 5 estrellas, obligatorio), comentario de texto
(opcional) y nombre de quien reseña (texto libre, opcional, ver [D-002](#d-002)); un dispositivo mantiene
como máximo una reseña vigente por profesional; no hay límite de categoría ni comuna — aplica a cualquier
profesional con perfil activo (misión 04) y evento de contacto registrado (misión 05).

## Funcionalidades

| ID    | Funcionalidad                                              | Lado         | Sustento             | Éxito |
| ----- | ------------------------------------------------------------ | ------------ | ---------------------- | ----- |
| F-001 | Dejar una reseña de un profesional que se contactó de verdad | buscador     | C-001, C-003, D-001, D-002 | M-001 |
| F-002 | Ver las reseñas de un profesional en su perfil                | buscador     | C-001                  | M-001 |
| F-003 | Avisar por correo al profesional cuando le llega una reseña   | profesional  | C-005                  | M-002 |

<a id="f-001"></a>

### F-001 — Dejar una reseña de un profesional que se contactó de verdad

Cuando Carmen ya contactó a Marcelo por WhatsApp desde el perfil de Datealo y el trabajo terminó,
quiero dejarle una reseña con estrellas y un comentario,
para que la próxima persona que busque un gasfiter en Ñuñoa sepa que cumple.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** que exista al menos un perfil de
profesional activo (misión 04) con el que el mismo navegador haya generado un evento de contacto
(F-002 de misión 05) — sin eso, el formulario nunca se habilita.

**Sustento:** [C-001](./investigacion.md#c-001) y [C-003](./investigacion.md#c-003) de investigación,
[D-001](#d-001) y [D-002](#d-002) de esta misión. **Éxito:** [M-001](#m-001).

**Reglas:**

- Si el navegador de Carmen tiene el token que dejó un contacto real con Marcelo (D-001), Datealo habilita
  el formulario de reseña en el perfil de Marcelo.
- Si el navegador no tiene ese token para Marcelo, Datealo no permite publicar una reseña para él —
  el comportamiento exacto de la pantalla (formulario oculto vs. visible pero bloqueado) lo define
  `experiencia.md`.
- Si Carmen ya dejó una reseña vigente para Marcelo y publica otra desde el mismo navegador — sea porque
  cambió de opinión, corrige algo que escribió, o le encargó un segundo trabajo meses después — Datealo
  reemplaza la reseña anterior por la nueva, sin exigir un contacto nuevo entre una y otra ([D-003](#d-003)).
  Nunca acumula dos reseñas del mismo dispositivo para el mismo profesional.
- El rating (1 a 5 estrellas) es obligatorio; el comentario de texto es opcional.
- El formulario incluye un campo "Tu nombre" de texto libre, opcional ([D-002](#d-002)). Si Carmen lo deja
  en blanco, la reseña se publica igual.
- Datealo nunca publica una reseña sin verificar primero que el navegador tiene el token de contacto —
  ni siquiera para el propio equipo de Datealo probando en producción.

**Ejemplo verificable:** dado que Carmen contactó a Marcelo el sábado desde su celular y hoy es lunes,
cuando abre el perfil de Marcelo desde el mismo celular, entonces ve el formulario de reseña habilitado y
puede publicarla con 5 estrellas, un comentario y su nombre.

**No incluye:** reseñar desde un dispositivo distinto al que generó el contacto ([D-001](#d-001), ver
Fuera de alcance), borrar una reseña sin reemplazarla por otra ([D-003](#d-003)), subir fotos junto a la
reseña.

**Experiencia:** vigente ([experiencia.md](./experiencia.md)). **Ingeniería:** pendiente.

<a id="f-002"></a>

### F-002 — Ver las reseñas de un profesional en su perfil

Cuando alguien busca un gasfiter en Ñuñoa y abre el perfil de Marcelo,
quiero leer lo que otras personas dijeron después de contactarlo,
para decidir si lo llamo.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** al menos una reseña publicada
(F-001) — sin eso, el perfil se comporta como misión 05 ya definió para el estado sin reseñas
([CL-003 de producto.md de misión 05](../05-perfil-publico-profesional/producto.md#cl-003)), que esta
misión no repite ni reabre.

**Sustento:** [C-001](./investigacion.md#c-001) de investigación, [D-002](#d-002) de esta misión. **Éxito:**
[M-001](#m-001).

**Reglas:**

- Si el profesional tiene una o más reseñas, el perfil las muestra ordenadas de la más reciente a la más
  antigua, cada una con su nombre (o el reemplazo de D-002 si quedó en blanco), su rating, su comentario
  (si lo tiene) y su fecha relativa ("hace 2 semanas").
- Si el profesional tiene dos o más reseñas, el perfil muestra también el promedio de estrellas arriba de
  la lista.
- Cada reseña muestra el mismo texto que comunica su nivel de garantía en toda la plataforma — "verificada
  por contacto", nunca solo "verificada" a secas, porque lo único que Datealo puede respaldar es que el
  dispositivo que la dejó generó un contacto real con ese profesional (D-001), no la identidad de quien la
  escribió — el nombre que la acompaña (D-002) tampoco cambia eso: es de quien lo escribió, no verificado.
- Datealo nunca muestra un badge de "verificada" en una reseña que no pasó por el filtro de D-001.

**Ejemplo verificable:** dado que Marcelo tiene tres reseñas (Carmen R., 5 estrellas; un cliente de
Datealo, 4 estrellas; Jorge, 5 estrellas), cuando alguien abre su perfil, entonces ve "4,7 de 5" arriba y
las tres reseñas debajo, cada una con su nombre (o el reemplazo genérico) y marcada "verificada por
contacto".

**No incluye:** filtrar u ordenar reseñas por rating, responder a una reseña desde el perfil del
profesional, reportar una reseña.

**Experiencia:** vigente ([experiencia.md](./experiencia.md)). **Ingeniería:** pendiente.

<a id="f-003"></a>

### F-003 — Avisar por correo al profesional cuando le llega una reseña nueva

Cuando a Marcelo le dejan una reseña nueva,
quiero enterarme sin tener que entrar a Datealo,
para poder reaccionar si algo salió mal, o simplemente saber que le fue bien.

**Lado del marketplace:** profesional. **Qué necesita del otro lado:** que exista al menos un buscador
dejando reseñas (F-001) — sin eso, este correo nunca se dispara.

**Sustento:** [C-005](./investigacion.md#c-005) de investigación, brief de la misión
([README](./README.md)). **Éxito:** [M-002](#m-002).

**Reglas:**

- Si se publica una reseña nueva para un profesional, Datealo le envía un correo individual con el
  contenido completo (estrellas y comentario), usando `sendEmail()` (misión 02).
- Se envía siempre, sea una reseña buena o mala — no hay forma de silenciarlo en esta entrega, porque
  afecta la reputación del profesional igual en ambos casos.
- Si `sendEmail()` falla, la reseña queda publicada de todas formas — el correo nunca bloquea ni revierte
  la publicación (mismo criterio que ya usa `sendEmail()` en misión 02).
- Datealo nunca agrupa varias reseñas en un solo correo (sin digest) — cada reseña dispara el suyo.

**Ejemplo verificable:** dado que Carmen publica una reseña de 5 estrellas para Marcelo, cuando la reseña
se guarda, entonces Marcelo recibe un correo con el rating y el comentario dentro de los minutos
siguientes.

**No incluye:** digest agrupado, notificación push, responder la reseña desde el correo.

**Experiencia:** vigente ([experiencia.md](./experiencia.md)). **Ingeniería:** pendiente.

## Casos límite que cruzan funcionalidades

| ID     | Condición concreta                                                                  | Comportamiento esperado                                                                                  | Funcionalidades |
| ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| CL-001 | Un navegador sin ningún token de contacto con ese profesional intenta dejar una reseña | Datealo no publica la reseña — el formulario está oculto o bloqueado, nunca acepta el envío                 | F-001            |
| CL-002 | Carmen contactó a Marcelo desde el celular pero quiere reseñarlo desde el computador    | El token vive solo en el celular; desde el computador, Datealo trata a Carmen como si nunca lo hubiera contactado — limitación conocida de D-001, no un bug | F-001            |
| CL-003 | El mismo navegador ya tiene una reseña vigente para un profesional y publica otra, sin necesitar un contacto nuevo entre medio | La reseña nueva reemplaza a la anterior de inmediato — funciona como editar ([D-003](#d-003)); nunca quedan dos reseñas del mismo dispositivo para el mismo profesional | F-001, F-002 |

## Fuera de alcance

| Capacidad o caso                                                  | Estado     | Razón del recorte                                                                                                 | Condición para reconsiderar                                                             |
| --------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Borrar una reseña sin dejar otra en su lugar                           | postergada | El mecanismo de reemplazo ([D-003](#d-003)) ya cubre corregir o cambiar de opinión sin agregar un flujo de eliminación aparte | Si en la práctica alguien necesita que un profesional quede sin ninguna reseña suya (ej. la publicó por error y no quiere reemplazarla) |
| Responder a una reseña (profesional)                                   | postergada | El README de la misión ya lo nombra como el gancho natural una vez que el correo de aviso (F-003) esté funcionando   | Cuando F-003 esté construido y haya volumen real de reseñas                                    |
| Reseñar desde un dispositivo distinto al que generó el contacto        | postergada | Moverlo a un mecanismo cross-device (OTP, cuenta) tiene el mismo costo de infraestructura que D-001 evitó a propósito | Si el caso de cambio de dispositivo resulta frecuente en los primeros meses (ver CL-002)       |
| Moderación humana de contenido de una reseña real                      | postergada | No hay volumen ni equipo que la sostenga hoy                                                                          | Cuando el volumen de reseñas produzca el primer caso real de abuso de contenido               |

## Señales de éxito

<a id="m-001"></a>

### M-001 — De los contactos reales que ocurren, una parte razonable vuelve como reseña

- **Pregunta:** ¿el filtro de D-001 deja pasar suficientes reseñas reales sin abrirle la puerta a spam?
- **Señal:** de cada 10 contactos registrados por un profesional (`professional_contact_events`, misión
  05), cuántos vuelven como una reseña publicada para ese mismo profesional en las semanas siguientes.
- **Método y umbral:** revisión cualitativa de Patricio en los primeros meses, comparando a mano el
  conteo de contactos contra el de reseñas por profesional — sin volumen todavía para fijar un número.
- **Guardrail:** ningún profesional activo termina con más reseñas publicadas que contactos registrados —
  si eso ocurre, el filtro de D-001 no está funcionando.

<a id="m-002"></a>

### M-002 — El correo de reseña nueva le llega al profesional y lo abre

- **Pregunta:** ¿el correo de aviso (F-003) hace que el profesional se entere y, con el tiempo, vuelva a
  la plataforma?
- **Señal:** tasa de apertura del correo de "nueva reseña" — a diferencia del enlace mágico de misión 04
  (D-001 de esa misión desactiva tracking porque corrompe un enlace de un solo uso), este correo no es de
  autenticación, así que sí puede llevar tracking de apertura de Resend.
- **Método y umbral:** revisión cualitativa, sin umbral numérico todavía por falta de volumen.
- **Guardrail:** el correo nunca se convierte en spam — se hereda el mismo guardrail de `sendEmail()` de
  misión 02 sobre no reventar el flujo cuando el envío falla.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — La reseña se habilita con un token que el navegador guarda al contactar, no con OTP por teléfono ni con cuenta

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
  [C-003](./investigacion.md#c-003), [C-004](./investigacion.md#c-004).
- **Tensión:** una verificación fuerte (OTP por teléfono) cuesta contratar un proveedor de SMS antes de
  tener tracción — el mismo argumento que ya cerró misión 04 para el profesional
  ([D-001 de esa misión](../04-registro-perfil-profesional/producto.md#d-001)). Un formulario
  completamente abierto, sin ningún filtro, expone a profesionales sin defensa al mismo patrón de abuso
  que sufren los negocios chicos en Google Maps ([C-004](./investigacion.md#c-004)). Un token de navegador
  no pide nada a nadie ni cuesta infraestructura, pero es débil si Carmen cambia de dispositivo entre
  contactar y reseñar.
- **Alternativas descartadas:** OTP por SMS/WhatsApp vía Twilio — la dirección que el brief original de
  esta misión proponía a confirmar; se descarta porque repite exactamente el costo de infraestructura que
  misión 04 ya rechazó, sin que exista una razón nueva que lo justifique acá (el problema que resuelve
  reseñas necesita menos identidad persistente que autenticar a un profesional, no más). Código o enlace
  mágico por correo, como el profesional en misión 04 — no aplica: a diferencia del profesional, que
  entrega su correo al registrarse, Datealo nunca tiene el correo del buscador en ningún punto del flujo
  de contacto (D-002 de misión 05), así que no hay a quién enviárselo. Formulario de reseña completamente
  abierto, sin ningún filtro — descartado porque expone a los profesionales al mismo patrón de reseñas
  falsas y extorsión que sufren negocios chicos sin defensa en plataformas sin verificación.
- **Decisión y consecuencia:** cuando ocurre un evento de contacto (F-002 de misión 05), el navegador de
  quien contactó guarda una referencia local a ese profesional. El formulario de reseña de ese profesional
  solo se habilita en un navegador que tenga esa referencia. No identifica a la persona ni impide el abuso
  al cien por ciento, pero eleva el costo de fabricar una reseña falsa sin pedirle nada a nadie ni
  contratar infraestructura nueva — y es coherente con que la reseña se muestre marcada "verificada por
  contacto" (F-002), no "verificada" a secas: lo que Datealo puede respaldar es que ese dispositivo generó
  un contacto real, no quién lo tenía en la mano. El token no expira por tiempo transcurrido ([Q-001](#q-001),
  resuelta): la debilidad real de este mecanismo es de quién generó el contacto, no de cuánto tiempo pasó
  desde entonces, así que una fecha de vencimiento no cierra ningún riesgo — solo corta a gente real que se
  demora en volver a reseñar, que es el caso típico porque una reseña honesta espera a que el trabajo
  termine.
- **Reapertura:** si, ya construido, se observa abuso real que este filtro no frena, si el caso de cambio
  de dispositivo (CL-002) resulta frecuente, si aparece evidencia real de tokens reusados mucho después del
  contacto original (lo que reabriría también Q-001), o si Datealo contrata un proveedor de SMS por otra
  razón de negocio (misma condición de reapertura que D-001 de misión 04), este mecanismo se revisa.

<a id="d-002"></a>

### D-002 — La reseña muestra un nombre de texto libre y opcional, nunca un teléfono ni ningún dato verificado

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** [C-001](./investigacion.md#c-001) de investigación, [D-001](#d-001) de esta misión.
- **Tensión:** una reseña sin ningún nombre arriba se lee vacía o fabricada — justo lo contrario de lo que
  esta misión persigue ("reseñas reales, sin inventadas"). Pero pedir cualquier dato que suene a identidad
  real (el teléfono, por ejemplo) reabre el mismo costo de fricción y de infraestructura que D-001 ya
  evitó, sin que sirva para nada más: como C-001 ya concluye, ningún dato de esta reseña se verifica contra
  nada, así que un teléfono no aporta más garantía real que un nombre escrito a mano.
- **Alternativas descartadas:** reseña completamente anónima, sin ningún campo de nombre — es el diseño
  que tenía esta misión antes de esta decisión; se descarta porque una lista de reseñas sin ningún nombre
  se percibe vacía o fabricada, el problema concreto que motivó esta decisión. Pedir el teléfono del
  buscador (se muestre o no) — descartada por el mismo argumento que cerró D-001: agrega fricción y además
  se percibe raro pedir un teléfono para dejar un comentario, sin que suba el nivel real de garantía,
  porque tampoco se verifica. Nombre obligatorio, sin poder dejarlo en blanco — descartada porque agrega
  una fricción real (un campo más que completar, justo cuando alguien puede preferir no poner su nombre) a
  cambio de nada: el nivel de confianza real no sube por obligarlo, solo baja la tasa de gente que termina
  de publicar su reseña.
- **Decisión y consecuencia:** el formulario de reseña (F-001) incluye un campo de texto libre "Tu nombre",
  opcional. Si Carmen lo deja en blanco, la reseña se publica igual, mostrando "un cliente de Datealo" en
  su lugar (F-002). El nombre no se verifica ni se cruza contra ningún dato — es exactamente el mismo nivel
  de garantía que ya tiene el resto de la reseña por D-001 y C-001: cambia cómo se percibe la reseña, no
  cuánto puede probar Datealo sobre quién la escribió.
- **Reapertura:** si en la práctica la mayoría de las reseñas terminan con el reemplazo genérico (poca
  gente pone su nombre) y eso sigue leyéndose como poco confiable, se revisa si conviene hacerlo obligatorio
  o darle más énfasis en el flujo de `experiencia.md`.

<a id="d-003"></a>

### D-003 — Reemplazar una reseña ya publicada funciona como editarla, no solo como repetir el contacto

- **Estado:** aceptada. **Fecha:** 2026-08-30.
- **Sustento:** [CL-003](#cl-003) de esta misión; [D-001](#d-001) (el token no vence por tiempo).
- **Tensión:** la redacción original de F-001 imaginaba el reemplazo solo para el caso de "un segundo
  trabajo meses después" — pero como D-001 no vence, el mismo dispositivo puede reenviar el formulario en
  cualquier momento después de la primera reseña, con cualquier rating, comentario o nombre distintos, sin
  que haya ocurrido ningún contacto nuevo de por medio. Eso es editar, aunque el mecanismo interno siga
  siendo "borra la anterior e inserta la nueva". La redacción anterior de F-001 y de "Fuera de alcance"
  excluía "editar una reseña ya publicada" como si fuera otra cosa, lo que contradecía a la propia regla de
  reemplazo.
- **Alternativas descartadas:** exigir un contacto nuevo desde la última reseña para poder reemplazarla —
  descartada porque D-001 no guarda cuándo ocurrió cada contacto, solo si existió alguno; construir ese
  historial agrega el mismo costo de infraestructura que D-001 evitó a propósito, para resolver un caso
  (alguien que quiere corregir un error de tipeo o cambiar de opinión) que no representa ningún riesgo de
  abuso nuevo. Dejar "editar" fuera de alcance y bloquear el reemplazo salvo con contacto nuevo — descartada
  por el mismo motivo: le niega a alguien real corregir su propia reseña sin ganar nada a cambio, porque
  nada impedía ese mismo reemplazo hoy de todas formas.
- **Decisión y consecuencia:** el mecanismo de reemplazo de F-001 es, en los hechos, la forma en que Carmen
  edita su reseña — puede cambiar rating, comentario o nombre en cualquier momento posterior a la primera,
  sin necesitar un contacto nuevo, y siempre queda como máximo una reseña vigente por dispositivo y
  profesional. Solo queda fuera de alcance borrar la reseña sin reemplazarla por otra (dejar al profesional
  sin ninguna).
- **Reapertura:** si en producción se observa abuso de este flujo — alguien que cambia su reseña
  reiteradamente de forma maliciosa, por ejemplo para extorsionar a un profesional — se revisa.

## Preguntas

Ninguna pregunta abierta bloquea esta misión — Q-001 quedó resuelta y su respuesta ya vive en
[D-001](#d-001).

| ID    | La duda                                                                         | Estado             | Respuesta, o quién la resuelve                                                                         |
| ----- | ---------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| Q-001 | ¿Por cuánto tiempo después de un contacto sigue habilitado el formulario de reseña? | resuelta 2026-08-29 | Sin vencimiento — Patricio la resolvió junto con D-001: el riesgo real que D-001 acepta no depende de cuánto tiempo pasó desde el contacto, así que una ventana no lo mitiga y sí corta a gente real que se demora en reseñar. |
