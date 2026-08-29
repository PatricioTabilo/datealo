# Misión: perfil público de profesional — Producto

**Estado:** vigente — aprobado por Patricio el 2026-08-28

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: cualquiera puede ver el perfil de un profesional y escribirle directo, sin reseñas ni verificación todavía

**Resultado:** cualquier persona que abre el link de un profesional —desde el buscador de misión 06, o
compartido directo— ve su perfil completo (fotos, descripción, precio, categoría, comuna, contacto) y puede
escribirle por WhatsApp o llamarlo sin pasar por ningún formulario de Datealo. Ese contacto queda
registrado, sea el perfil nuevo y vacío o ya tenga meses de actividad.

**Recorte respecto del ideal:** el ideal ([investigacion.md](./investigacion.md)) incluye reseñas visibles
y variar la confianza según cuánta actividad acumuló el perfil. Acá se recorta a lo que existe hoy: sin
reseñas, porque misión 07 todavía no se construye, y sin ningún indicador de actividad inventado
([C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004)). El perfil se apoya solo en lo que
el profesional cargó de verdad.

**Restricciones aceptadas:** sin badge de "verificado" de ningún tipo — no hay mecanismo real detrás
([C-003](./investigacion.md#c-003), ver Fuera de alcance); sin identificar a la persona que contacta, más
allá de que el contacto ocurrió ([D-002](#d-002), deja abierta [Q-001](#q-001) para misión 07); sin
analítica de conversión instrumentada — M-001 y M-002 quedan cualitativas hasta que exista.

## Funcionalidades

| ID    | Funcionalidad                                                        | Lado     | Sustento               | Éxito |
| ----- | ---------------------------------------------------------------------- | -------- | ----------------------- | ----- |
| F-001 | Ver el perfil completo de un profesional, con o sin actividad acumulada | buscador | C-001, C-004, D-001 | M-001 |
| F-002 | Contactar al profesional directo desde el perfil, y que quede registrado | ambos    | C-002, D-001, D-002     | M-002 |

<a id="f-001"></a>

### F-001 — Ver el perfil completo de un profesional, con o sin actividad acumulada

Cuando la señora Carmen encuentra a Marcelo en los resultados de búsqueda y necesita decidir si confía en
él antes de escribirle,
quiero ver todo lo que Marcelo cargó de su trabajo — fotos, descripción, precio —,
para decidir sin tener que preguntarle nada primero.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** que exista al menos un perfil activo
(misión 04) — funciona exactamente igual con 0 o con 20 fotos, con o sin reseñas cuando misión 07 exista.

**Sustento:** [C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004), [D-001](#d-001).
**Éxito:** [M-001](#m-001).

**Reglas:**

- Cualquiera puede abrir el perfil sin iniciar sesión ni tener cuenta de buscador ([D-001](#d-001)).
- Si el profesional no subió ninguna foto, el perfil se muestra igual, sin ninguna foto de stock que
  sugiera que es suya ([CL-001](#cl-001)).
- Si no definió descripción o precio, esos campos simplemente no aparecen — el perfil no muestra un espacio
  vacío ni un "sin información" ([CL-002](#cl-002)).
- Si el profesional no tiene ninguna reseña todavía — el caso de todos al lanzamiento —, el perfil no
  muestra un contador de "0 reseñas" ni ningún indicador que sugiera abandono. En su lugar muestra desde
  cuándo existe el perfil (ej. "En Datealo desde agosto de 2026") — es la única señal de actividad que
  Datealo puede mostrar sin inventar nada mientras no hay reseñas ([CL-003](#cl-003),
  [C-001](./investigacion.md#c-001)).
- Datealo nunca muestra en el perfil un badge, texto o ícono de "verificado" — no existe ese mecanismo hoy
  ([C-003 de investigación](./investigacion.md#c-003), ver Fuera de alcance).
- Datealo nunca muestra contadores de "vistas" o "veces contactado" — sin volumen real, ese número casi
  siempre sería 0 o 1 y perjudicaría más de lo que informaría ([C-001](./investigacion.md#c-001)).

**Ejemplo verificable:** dado el perfil de Marcelo (categoría Electricidad, comuna Ñuñoa, 3 fotos, "Desde
$15.000", activo desde julio de 2026, sin reseñas), cuando la señora Carmen abre su link, entonces ve su
nombre, categoría, comuna, las 3 fotos, la descripción, el precio, "En Datealo desde julio de 2026" y el
botón de contacto — sin ningún badge de verificado, sin contador de reseñas ni de vistas.

**No incluye:** reseñas (misión 07), badge de verificado (ver Fuera de alcance), cualquier indicador de
actividad que Datealo no pueda respaldar con un dato real.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

<a id="f-002"></a>

### F-002 — Contactar al profesional directo desde el perfil, y que quede registrado

Cuando la señora Carmen ya decidió a quién llamar, o solo quiere tantear cómo responde Marcelo antes de
decidirse del todo,
quiero tocar un botón y escribirle por WhatsApp o llamarlo sin llenar ningún formulario,
para resolver su problema esa misma noche.

**Lado del marketplace:** ambos — el buscador inicia el contacto, el profesional lo recibe; es la razón de
ser del perfil para los dos. **Qué necesita del otro lado:** nada adicional — funciona con cualquier
profesional que tenga contacto cargado (obligatorio desde el registro, misión 04 F-001).

**Sustento:** [C-002](./investigacion.md#c-002), [D-001](#d-001), [D-002](#d-002). **Éxito:**
[M-002](#m-002).

**Reglas:**

- Datealo guarda un solo número de contacto por profesional (misión 04, `professionals.contact`), no un
  WhatsApp y un teléfono separados — así que el perfil ofrece los dos botones a partir de ese mismo número:
  "Escribir por WhatsApp" (principal) y "Llamar" (secundario). Nunca un formulario ni una pantalla
  intermedia de Datealo ([D-001](#d-001)).
- Cada vez que se toca el botón, Datealo registra que ocurrió un contacto en ese perfil, con la fecha —
  sin pedirle nada al buscador ni exigirle una cuenta ([D-002](#d-002)).
- Si el registro del contacto falla por cualquier razón, Datealo igual abre WhatsApp o la llamada — el
  registro nunca bloquea ni demora el contacto real.
- Si el profesional cambió su número de contacto después de que alguien guardó el enlace del perfil, el
  botón siempre usa el contacto vigente, nunca uno desactualizado ([CL-005](#cl-005)).

**Ejemplo verificable:** dado el perfil de Marcelo con contacto +56 9 1234 5678, cuando la señora Carmen
toca "Escribir por WhatsApp", entonces se abre una conversación de WhatsApp con ese número, y Datealo
guarda un registro de que hubo un contacto en el perfil de Marcelo a esa hora. Si en cambio toca "Llamar",
el mismo registro ocurre y se inicia una llamada al mismo número.

**No incluye:** identificar quién generó el contacto ([Q-001](#q-001), lo resuelve misión 07), ningún chat
interno de Datealo, ninguna confirmación de que el trabajo se concretó.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

## Casos límite que cruzan funcionalidades

<a id="cl-001"></a>

| ID     | Condición concreta                                                         | Comportamiento esperado                                                                                     | Funcionalidades |
| ------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- |
| CL-001 | Un perfil activo no tiene ninguna foto subida                                | Se muestra igual, con un espacio vacío o genérico — nunca una foto de stock que insinúe que es del profesional | F-001            |
| CL-002 | Un perfil activo no tiene descripción ni precio definido                     | Se muestra igual, sin esos campos — nunca un "sin información" ni un hueco visual roto                        | F-001            |
| CL-003 | Un perfil activo no tiene ninguna reseña (todos los perfiles al lanzamiento) | Se muestra igual, sin un contador de "0 reseñas" ni ningún texto que sugiera abandono                          | F-001            |
| CL-004 | El buscador toca "Escribir por WhatsApp" pero no tiene la app instalada     | El botón "Llamar" con el mismo número ya estaba visible desde antes, como alternativa siempre disponible — no aparece recién en ese momento | F-002            |
| CL-005 | El profesional cambió su número de contacto después de que alguien guardó el enlace del perfil | El botón de contacto siempre usa el número vigente en la base, nunca uno cacheado en la página          | F-002            |

## Fuera de alcance

| Capacidad o caso                                                        | Estado     | Razón del recorte                                                                                   | Condición para reconsiderar |
| --------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Badge de "verificado"                                                    | postergada | Sin mecanismo real de verificación al lanzamiento; mostrarlo sin respaldo es peor que no tenerlo ([C-003](./investigacion.md#c-003)). La landing hoy promete "profesionales verificados" sin que exista ese mecanismo — esta misión no corrige ese copy ni construye un badge vacío para calzar con él; queda como inconsistencia identificada, a resolver aparte | Cuando exista un mecanismo real, aunque sea parcial (ej. cruzar contra el registro SEC para electricidad/gas, [E-008](./investigacion.md#e-008)) |
| Reseñas visibles en el perfil                                            | postergada | Depende de misión 07, que todavía no se construye                                                          | Cuando misión 07 esté lista para construir |
| Contador público de "vistas" o "veces contactado"                       | descartada | Sin volumen real, el número sería casi siempre 0 o 1 y perjudicaría a los perfiles nuevos en vez de ayudarlos ([C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004)) | Cuando exista volumen suficiente para que el número informe en vez de estigmatizar |
| Identificar a la persona exacta que generó un contacto                  | postergada | Contactar no exige ninguna cuenta ([D-001](#d-001), [D-002](#d-002)); resolverlo es problema de misión 07 | Cuando misión 07 defina su mecanismo de verificación de reseña ([Q-001](#q-001)) |
| Analítica instrumentada de conversión a contacto (M-001, M-002)         | postergada | No existe todavía infraestructura de analítica en el proyecto                                              | Cuando esa infraestructura exista, fuera del alcance técnico de esta misión |

## Señales de éxito

<a id="m-001"></a>

### M-001 — El perfil transmite confianza suficiente para generar un contacto, incluso sin reseñas

- **Pregunta:** ¿de los buscadores que abren un perfil sin ninguna reseña, una parte igual toca el botón de
  contacto, o todos rebotan?
- **Señal (qué observaríamos si funciona):** de cada 10 buscadores que abren un perfil, al menos 3 tocan el
  botón de WhatsApp o teléfono.
- **Método y umbral:** sin instrumentación de analítica todavía — se resuelve cuando exista (fuera del
  alcance técnico de esta misión). Mientras tanto, revisión cualitativa de Patricio sobre los primeros
  perfiles reales.
- **Guardrail:** ningún perfil sin fotos, descripción o reseñas queda oculto o penalizado en su posición
  por eso — CL-001 a CL-003 son la garantía de esto, no solo la intención.

<a id="m-002"></a>

### M-002 — El evento de contacto queda registrado de forma confiable para sostener misión 07

- **Pregunta:** ¿el click en WhatsApp o teléfono se registra siempre, o hay casos donde se pierde — por
  ejemplo, si el buscador cierra la app antes de que el registro termine?
- **Señal:** cada click en el botón de contacto genera exactamente un registro en la base, ninguno
  duplicado ni perdido.
- **Método y umbral:** prueba directa en desarrollo antes de cerrar el issue de ingeniería correspondiente
  — no es una revisión cualitativa, es verificable con datos.
- **Guardrail:** el registro del contacto nunca bloquea ni demora la apertura de WhatsApp o la llamada — si
  el registro falla, el contacto real igual ocurre.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — El perfil público, incluido el contacto, es visible para cualquiera sin necesitar cuenta ni sesión

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** guardrail de `CLAUDE.md` ("el contacto es directo y sin intermediación") y [D-004 de misión
  04](../04-registro-perfil-profesional/producto.md#d-004) (Datealo nunca se pone en medio del contacto).
- **Tensión:** mostrar el contacto libre es fiel al flujo core (buscar → perfil → contactar, sin pasos
  extra) y evita que Datealo intermedie; pero exponer un número de WhatsApp o teléfono sin ningún filtro
  invita a spam hacia el profesional, y el competidor más grande del rubro (Thumbtack) exige justamente
  "pedir cotización" antes de revelar el contacto para filtrar eso.
- **Alternativas descartadas:** exigir que el buscador cree una cuenta ligera antes de ver el contacto — se
  descarta porque agrega un paso al flujo que `CLAUDE.md` declara sagrado, y ninguna misión ha definido
  todavía un mecanismo de cuenta para el buscador. Exigir "solicitar cotización" antes de revelar el
  contacto (patrón Thumbtack) — se descarta porque reintroduce a Datealo como intermediario del contacto,
  contradice directamente D-004 de misión 04.
- **Decisión y consecuencia:** el número de WhatsApp o teléfono del profesional es visible en su perfil
  público para cualquiera, sin iniciar sesión ni completar ningún paso previo — igual que el resto del
  perfil. El riesgo de spam hacia el profesional se acepta como costo de este guardrail, no se mitiga en
  esta misión.
- **Reapertura:** si el spam hacia profesionales resulta ser un problema real (no solo teórico) una vez
  haya tráfico, reconsiderar un filtro liviano que no agregue una cuenta (ej. un captcha antes del click).

<a id="d-002"></a>

### D-002 — El evento de contacto que registra Datealo es "se tocó el botón de contacto en este perfil", sin capturar quién lo tocó

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** [C-002](./investigacion.md#c-002), [D-001](#d-001) (contactar no exige cuenta).
- **Tensión:** misión 07 necesita saber qué contacto corresponde a qué reseña para que una reseña sea
  "verificada por contacto" y no un formulario abierto; pero capturar la identidad de quien contacta
  exigiría pedirle algo al buscador antes de escribir por WhatsApp, un paso extra que D-001 ya descartó por
  el mismo motivo.
- **Alternativas descartadas:** pedir el teléfono del buscador antes de abrir WhatsApp, para poder cruzarlo
  después con la reseña — se descarta acá porque agrega fricción al paso que este proyecto más protege
  (contactar), y el brief de misión 07 ya apunta a resolver la identidad del lado de la reseña (OTP por
  teléfono al momento de reseñar), no del lado del contacto.
- **Decisión y consecuencia:** Datealo guarda que un contacto ocurrió en el perfil de un profesional
  determinado, con su fecha — nada que identifique a la persona que lo generó. Cómo esa reseña futura se
  ata a un contacto real sin esa identidad es un problema que resuelve misión 07 con su propio mecanismo,
  no esta misión.
- **Reapertura:** si misión 07, al diseñar su verificación, concluye que necesita datos adicionales del
  momento del contacto (más allá de perfil + fecha), esta decisión se revisa junto con esa misión.

## Preguntas

Ninguna bloquea F-001 o F-002 tal como están definidas acá — Q-001 es sobre cómo misión 07 va a atar una
reseña a un contacto real, no sobre si el perfil o el botón de contacto funcionan.

| ID    | La duda                                                                      | Estado  | Respuesta, o quién la resuelve |
| ----- | ------------------------------------------------------------------------------- | ------- | ------------------------------------ |
| Q-001 | ¿Cómo identifica Datealo, sin pedirle cuenta a nadie, que la persona que deja una reseña es la misma que generó un contacto real? | abierta | Se resuelve en `producto.md` de misión 07, cuando esa misión se trabaje — su brief ya apunta a explorar OTP por teléfono al momento de reseñar, no decisión cerrada |

<a id="q-001"></a>

### Q-001 — ¿Cómo se ata una reseña futura a un contacto real sin pedirle cuenta a nadie?

- **La duda, con un ejemplo:** la señora Carmen contacta a Marcelo por WhatsApp desde su perfil (F-002).
  Semanas después, cuando exista misión 07, quiere dejarle una reseña. El registro de F-002 solo sabe que
  "hubo un contacto en el perfil de Marcelo el sábado a las 22:14" — no sabe que fue Carmen. ¿Cómo evita
  Datealo que cualquiera diga "yo lo contacté" y deje una reseña falsa?
- **Afecta a:** [D-002](#d-002), y por completo al diseño de misión 07.
- **Cómo se resolverá:** producto de misión 07 — el brief de esa misión ya explora verificar por teléfono
  (OTP puntual) al momento de dejar la reseña, en vez de exigirle cuenta al buscador desde antes.
- **¿Bloquea algo?:** no bloquea esta misión — F-002 registra el contacto igual, sin esa identidad. Sí
  bloquea que misión 07 pueda cerrar su propio producto.md sin responderla.
