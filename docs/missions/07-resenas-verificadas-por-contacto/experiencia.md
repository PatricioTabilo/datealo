# Misión: reseñas verificadas por contacto — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-08-30

**Última actualización:** 2026-08-30

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: la reseña vive dentro del mismo perfil, sin pantalla propia

Esta misión no crea ninguna vista nueva — extiende **V-001**, el perfil público que misión 05 ya definió y
cerró. Todo lo que agrega ocurre sobre esa misma pantalla: un resumen de rating junto al nombre, una
sección de reseñas entre el precio y "En Datealo desde", y un formulario que se abre como bottom sheet
sobre el perfil, nunca como una página aparte. Nada de lo que misión 05 ya decidió (jerarquía de fotos,
botón de contacto fijo abajo, los dos botones WhatsApp/Llamar) cambia — se audita y se hereda sin tocarlo.

La pieza que sí es nueva de verdad es que la interfaz nunca le habla al buscador del mecanismo de
verificación (D-001 de producto.md): no hay ningún mensaje de "necesitas haber contactado para reseñar".
Quien no tiene el token simplemente no ve ninguna forma de dejar una reseña — ni un botón bloqueado, ni una
explicación. Es la misma filosofía que ya usa el registro de contacto de misión 05 ("el buscador nunca
necesita saber que Datealo guardó algo"), aplicada acá: el filtro de D-001 es invisible, no un obstáculo
visible que alguien pueda estudiar para intentar sortearlo.

- **Funcionalidades cubiertas:** F-001, F-002, F-003.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Perfil público de profesional** (vista de misión 05, extendida acá) · móvil / desktop ·
  resuelve [F-001](./producto.md#f-001), [F-002](./producto.md#f-002) · flujos UXF-001, UXF-002
  - modo **encontrado** (de misión 05, sin cambios de fondo) — ahora su contenido puede incluir, además de
    lo que ya definía misión 05, un resumen de rating y una sección de reseñas; ninguna de las dos cosas
    convierte "encontrado" en un modo distinto, igual que un perfil con o sin fotos sigue siendo el mismo
    modo (criterio ya fijado por misión 05)
  - modo **reseñando** (nuevo) — un bottom sheet abierto sobre el perfil, con el formulario de reseña
    activo; el perfil de atrás no se desmonta, solo queda tapado

No hay una vista nueva para "recibir el correo de reseña nueva" (F-003) — ese contenido se documenta en
[UXF-003](#uxf-003) como el contenido del correo mismo, no como una pantalla de Datealo.

## Mapa de estados

| Desde                              | Acción                                              | Queda en                           | Qué pasa con el trabajo |
| ---------------------------------------- | -------------------------------------------------------- | --------------------------------------- | ------------------------------ |
| encontrado, con token                     | toca "Dejar una reseña"                                   | reseñando (formulario vacío)             | ninguno todavía |
| encontrado, con token y reseña ya publicada | toca "Editar tu reseña"                                 | reseñando (formulario prellenado)        | se cargan sus datos actuales |
| reseñando                                 | toca "Publicar reseña"                                    | encontrado, con la reseña arriba de la lista y un toast | la reseña queda guardada; si reemplazaba una anterior, esa desaparece de la lista |
| reseñando                                 | toca cerrar (X), o el backdrop                            | encontrado, sin cambios                  | se descarta todo lo tecleado, no se guarda ni a medias |
| reseñando                                 | falla el envío (red, servidor)                            | reseñando, con el formulario intacto y un error | nada se pierde — puede reintentar sin volver a escribir |

## UXF-001 — Dejar una reseña de un profesional

**Objetivo:** que quien ya contactó a un profesional pueda contarle a otros cómo le fue, sin crear cuenta
ni recordar nada del contacto original. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** el buscador está en V-001, modo encontrado, en un perfil con el que su navegador
generó un contacto real en algún momento (D-001 de producto.md) — sea porque acaba de tocar "Escribir por
WhatsApp"/"Llamar" en esta misma visita, o porque volvió semanas después, como en el ejemplo de
[Q-001 de producto.md](./producto.md#q-001).

**Criterio de término:** la reseña queda publicada y visible en la sección de reseñas del mismo perfil, sin
recargar la página ni navegar a ningún otro lado.

**Cómo sabe el usuario dónde está:** el título del sheet ("Dejar una reseña" o "Editar tu reseña") y la
línea "Para <nombre del profesional> · <categoría>" debajo, siempre visibles arriba del formulario mientras
está abierto.

### Divergencia antes de converger

Para resolver el mismo JTBD (contarle a otros cómo le fue con un profesional, sin cuenta) se generaron tres
enfoques genuinamente distintos:

- **Enfoque A — CTA oculta hasta que hay token, formulario en bottom sheet:** nadie ve una forma de
  reseñar hasta que su navegador tiene el token de D-001; al tocar "Dejar una reseña", un bottom sheet se
  abre sobre el perfil con el formulario.
- **Enfoque B — CTA siempre visible junto al botón de contacto fijo, deshabilitada sin token:** un tercer
  botón ("Reseñar") vive en la misma barra fija que ya tienen "Escribir por WhatsApp" y "Llamar"
  (UX-002 de misión 05), atenuado y con un mensaje ("Contacta primero para poder reseñar") si no hay token.
- **Enfoque C — formulario inline, expandido directamente en el scroll de la sección de reseñas:** sin
  sheet ni modal; tocar "Dejar una reseña" expande el formulario ahí mismo, entre la card y la lista, como
  un comentario de blog.

**Elegido: A.** El Enfoque B mete un tercer elemento en la barra de contacto que UX-001 y UX-002 de misión
05 dejaron deliberadamente con solo dos botones — invadir ese espacio, ya protegido por una decisión
vigente, necesitaría una razón nueva que no existe acá, y el mensaje "Contacta primero para poder reseñar"
le explicaría el mecanismo de D-001 a cualquiera que lo vea, exactamente lo que la Decisión de experiencia
de este documento evita a propósito. El Enfoque C funciona, pero un formulario que vive expandido en medio
del scroll se pierde más fácil a medio llenar (basta con seguir bajando la página) y no tiene una salida
tan clara como "cerrar el sheet" — el usuario no sabe si scrollear lejos cuenta como cancelar o no. El
Enfoque A además ya es un patrón decidido para Datealo ("Bottom sheets en móvil" en Patrones de interacción
ya decididos del skill `discovery-ux`), así que no introduce nada nuevo que ingeniería tenga que resolver
desde cero.

### Salidas

| Salida                       | Cómo se ejecuta                              | Qué queda del trabajo |
| --------------------------------- | -------------------------------------------------- | -------------------------- |
| Publica la reseña                 | toca "Publicar reseña" con al menos el rating puesto | la reseña queda visible arriba de la lista, con un toast de confirmación |
| Cierra sin publicar                | toca la X, o el backdrop detrás del sheet           | nada se guarda — ni el rating, ni el texto tecleado |
| El envío falla                    | error de red o del servidor al tocar "Publicar"     | el formulario sigue abierto con todo lo tecleado intacto, listo para reintentar |
| Sale de Datealo y vuelve           | cambia de app (por ejemplo, a WhatsApp para revisar la conversación con el profesional antes de escribir el comentario) y regresa a la pestaña | si el navegador mantuvo la pestaña viva, el sheet sigue abierto con todo lo tecleado; si el sistema la descargó por falta de memoria, vuelve al perfil sin el sheet y sin lo tecleado — limitación conocida, sin borrador guardado en esta entrega |

### Secuencia principal

| Paso | Acción                                                         | Respuesta del sistema                                                                                             | Información visible |
| ---- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1    | Toca "Dejar una reseña" en la card de la sección de reseñas          | Se abre el bottom sheet sobre el perfil, con transición de 200ms; el perfil de atrás queda tapado pero no se descarga | Título "Dejar una reseña", "Para Marcelo Rojas · Electricidad", 5 estrellas sin marcar |
| 2    | Toca una estrella (objetivo táctil de 44×44px cada una)              | Se marcan esa estrella y todas las anteriores; el botón "Publicar reseña" pasa de atenuado a activo en cuanto hay al menos 1 estrella | El número de estrellas marcadas |
| 3    | (opcional) Escribe un comentario                                     | El contador bajo el campo sube en tiempo real, hasta el máximo de 500 caracteres                                    | "<n>/500" |
| 4    | (opcional) Escribe su nombre                                         | Se guarda tal cual lo escribe, sin validación de formato                                                            | El texto tecleado |
| 5    | Toca "Publicar reseña"                                                | El botón muestra un spinner breve mientras se envía; si el servidor confirma, el sheet se cierra, la reseña aparece arriba de la lista y un toast en `bottom-right` confirma "Reseña publicada" por 5 segundos. Si falla, ver Variantes y recuperación — el sheet no llega a cerrarse | La reseña nueva, con su nombre (o el reemplazo si quedó en blanco), estrellas, comentario y "recién" |

### Variantes y recuperación

| Condición                                                        | Qué cambia                                                                              | Cómo se entiende                                                    | Cómo se recupera |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------- |
| Sin token para este profesional ([CL-001](./producto.md#cl-001))          | La card "¿Cómo te fue?" no existe en la sección de reseñas — no hay ningún botón que tocar         | No hay ningún indicador — el buscador nunca ve algo que no puede usar          | No aplica — es el comportamiento esperado |
| Cambió de dispositivo desde que contactó ([CL-002](./producto.md#cl-002)) | Mismo que sin token: la card no aparece en el dispositivo nuevo                                    | Ninguno — Datealo no distingue "nunca contactó" de "contactó desde otro aparato" | No aplica — limitación conocida de D-001 |
| Ya tiene una reseña publicada para este profesional ([CL-003](./producto.md#cl-003)) | La card dice "Editar tu reseña" en vez de "¿Cómo te fue con Marcelo?", y el sheet abre prellenado con su rating, comentario y nombre actuales | El título del sheet cambia a "Editar tu reseña"                              | Puede tocar "Publicar reseña" de nuevo sin cambiar nada, o modificar lo que quiera antes |
| Intenta publicar sin ninguna estrella marcada                             | El botón "Publicar reseña" permanece atenuado y no responde al toque                               | El rating es el único campo con un asterisco visual junto a su pregunta        | Marca al menos una estrella |
| El envío falla (red o servidor)                                           | El sheet no se cierra; aparece un mensaje breve sobre el botón                                     | "No pudimos publicar tu reseña. Inténtalo de nuevo."                          | Toca "Publicar reseña" de nuevo — todo lo tecleado sigue ahí |

### Decisiones que no deben quedar implícitas

- El botón "Publicar reseña" solo se activa con al menos 1 estrella marcada — comentario y nombre son
  siempre opcionales, consistente con las reglas de F-001 de `producto.md`.
- El comentario tiene un máximo de 500 caracteres, con contador visible desde el primer carácter escrito —
  no se trunca en silencio.
- Cerrar el sheet (X o backdrop) nunca guarda nada, ni siquiera el rating ya marcado — es una decisión de
  todo o nada, coherente con que publicar sea la única acción que persiste algo.
- El mensaje de error de envío nunca menciona el token ni la verificación — el mismo texto genérico cubre
  una falla de red y una falla del filtro de D-001, para no convertir el mensaje de error en un mapa de
  cómo funciona el mecanismo.
- El toast usa el patrón universal de Datealo ("Patrones de interacción que ya están decididos" del skill
  `discovery-ux`): posición `bottom-right` en mobile y desktop por igual, 5000ms (el default de Nuxt UI,
  sin sobreescribir), botón de cerrar, y `aria-live="polite"` para que un lector de pantalla lo lea sin
  interrumpir lo que el usuario estaba haciendo.
- Las 5 estrellas forman un control agrupado (`role="radiogroup"`, un `aria-label` de "1 estrella" a "5
  estrellas" por opción), operable por teclado con las flechas para moverse y espacio o enter para marcar —
  no son solo íconos clicables sin semántica.
- Al abrirse el sheet, el foco se mueve al título ("Dejar una reseña" o "Editar tu reseña"); al cerrarse (X,
  backdrop, o tras publicar), el foco vuelve al botón que abrió el sheet — nunca queda flotando sobre el
  perfil tapado.
- Si el buscador cambia de app (por ejemplo, a WhatsApp para revisar la conversación con el profesional
  antes de escribir el comentario) y la pestaña de Datealo sigue viva, el sheet lo espera exactamente como
  lo dejó al volver. Si el sistema operativo descargó la pestaña por memoria, vuelve al perfil sin el sheet
  y sin lo tecleado — riesgo aceptado en esta entrega, sin autoguardado de borrador.

<a id="uxf-002"></a>

## UXF-002 — Leer las reseñas de un profesional en su perfil

**Objetivo:** que cualquiera que abre un perfil pueda evaluar al profesional con lo que dijeron otros que
ya lo contactaron, sin salir de la pantalla que ya estaba leyendo. **Contrato:**
[F-002](./producto.md#f-002). Sin divergencia propia — es una extensión de contenido sobre UXF-001 de
misión 05 (ver el perfil), no un flujo con decisiones de interacción nuevas; el único punto de diseño
propio es dónde entra el resumen de rating y la sección completa en la jerarquía ya fijada por misión 05,
resuelto en [UX-002](#ux-002).

**Punto de entrada:** el buscador ya está en V-001, modo encontrado — no hay una acción separada para
"entrar" a leer reseñas, es parte del mismo scroll del perfil.

**Criterio de término:** no es una acción que se completa — es contenido de lectura, igual que el resto del
perfil. Su criterio de término es que la información esté ahí cuando el buscador llega a esa parte del
scroll, sin tener que tocar nada para revelarla.

**Cómo sabe el usuario dónde está:** el título "Reseñas" encabeza la sección, igual que cualquier otro
bloque del perfil.

### Salidas

No aplica — es contenido de lectura dentro de V-001; las salidas son las mismas de UXF-001 de misión 05
(contactar, o irse de la pantalla).

### Secuencia principal

| Paso | Acción                                        | Respuesta del sistema                                                                                          | Información visible |
| ---- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1    | Hace scroll hasta después del precio                 | Ve el resumen de rating ya visible desde arriba (junto al nombre) y, más abajo, la sección "Reseñas" completa      | Rating promedio, número de reseñas, y cada reseña con nombre, estrellas, comentario, fecha relativa y su marca |
| 2    | (si tiene token) ve la card para dejar la suya arriba de la lista | Nada cambia todavía — es solo contenido, ver UXF-001 para la interacción                              | "¿Cómo te fue con <nombre>?" o "Editar tu reseña" |

### Variantes y recuperación

| Condición                                                   | Qué cambia                                                                                       | Cómo se entiende                                                | Cómo se recupera |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| Sin ninguna reseña, sin token ([CL-003](../05-perfil-publico-profesional/producto.md#cl-003) de misión 05, sin cambios) | La sección "Reseñas" no aparece — mismo comportamiento que misión 05 ya definió para este caso            | "En Datealo desde..." ocupa el lugar donde iría, igual que hoy             | No aplica |
| Sin ninguna reseña, con token                                       | La sección "Reseñas" aparece solo con la card "Sé el primero en contarle a otros cómo te fue con <nombre>" | El texto deja claro que sería la primera, no un error ni un estado vacío genérico | Toca "Dejar una reseña" (UXF-001) |
| Con reseñas, sin token                                              | Aparece el resumen y la lista completa, sin ninguna card de "dejar la tuya"                                | No hay ningún indicador de por qué falta la card — invisible a propósito (ver Decisión de experiencia) | No aplica |
| Una reseña sin comentario (solo rating)                             | La card muestra nombre, estrellas, fecha y marca, sin ningún espacio vacío donde iría el comentario         | El bloque de comentario simplemente no existe para esa card                | No aplica |

### Decisiones que no deben quedar implícitas

- El promedio se calcula sobre todas las reseñas visibles del profesional y se redondea a un decimal
  ("4,7"), nunca a un entero — un promedio entero pierde precisión justo cuando hay pocas reseñas, que es
  el caso típico al lanzamiento.
- Las reseñas se listan de la más reciente a la más antigua, sin paginación ni "ver más" en esta entrega —
  con la oferta y el volumen que Datealo va a tener el primer año, ningún perfil va a acumular suficientes
  reseñas para que la lista sea incómoda de leer completa.
- La marca "verificada por contacto" nunca se acorta a solo "verificada" en ningún lugar de la interfaz,
  ver [UX-004](#ux-004).
- Dos o más reseñas del mismo profesional sin nombre, sin comentario y con fechas cercanas pueden verse
  indistinguibles entre sí — un riesgo real de que se lean como fabricadas o duplicadas, el efecto contrario
  al que esta misión persigue. Es un riesgo conocido de [D-002 de producto.md](./producto.md#d-002) (nombre
  opcional): no hay mitigación en esta entrega porque inventar un diferenciador artificial (ej. "reseña
  #2") crearía una distinción que no existe en la realidad. **Reapertura:** si en la práctica varios
  perfiles acumulan varias reseñas genéricas seguidas, se revisa junto con la reapertura de D-002.

<a id="uxf-003"></a>

## UXF-003 — El profesional recibe el aviso de una reseña nueva por correo

**Objetivo:** que el profesional se entere de una reseña nueva sin tener que revisar Datealo por su
cuenta. **Contrato:** [F-003](./producto.md#f-003). Sin divergencia propia — el canal (correo individual,
vía `sendEmail()`) ya lo fija [C-005 de investigacion.md](./investigacion.md#c-005); acá se especifica solo
el contenido.

**Punto de entrada:** una reseña se publica (fin de UXF-001); no hay ninguna acción del profesional que lo
dispare.

**Criterio de término:** el correo llega a la casilla del profesional con el contenido completo de la
reseña, sin que tenga que abrir Datealo para leerlo.

**Cómo sabe el usuario dónde está:** no aplica — es un correo, no una pantalla de Datealo.

### Contenido del correo

| Elemento | Contenido |
| -------- | --------- |
| Asunto   | "Marcelo, te llegó una reseña nueva" — siempre igual, sin adelantar el rating |
| Remitente | El mismo remitente que ya usa `sendEmail()` (misión 02) |
| Cuerpo   | "Carmen R. te dejó una reseña en Datealo:" seguido de las estrellas y el comentario completo, tal cual se publicó — sin recortar ni resumir |
| Si no dejó nombre | "Te llegó una reseña de un cliente de Datealo:" — mismo reemplazo que ve cualquier buscador en el perfil |
| Si no dejó comentario | El correo muestra solo las estrellas, sin una línea vacía donde iría el comentario |
| Cierre   | Link directo al perfil público del profesional, para que pueda ver la reseña en contexto si quiere |

### Decisiones que no deben quedar implícitas

- El asunto nunca adelanta el rating (ni en número ni en estrellas de emoji): una reseña de 1 estrella con
  un solo "⭐" suelto en el asunto se leería duro antes de que el profesional tenga cualquier contexto —
  justo lo contrario de lo que F-003 busca ("poder reaccionar", no sentirse golpeado antes de abrir el
  correo). El mismo asunto sirve para una reseña de 5 estrellas y una de 1, sin distinción.
- El correo no tiene ningún botón de "responder la reseña" ni de "reportarla" — ninguna de las dos existe
  todavía (ver Fuera de alcance de `producto.md`).
- Si `sendEmail()` falla, no hay ningún reintento visible ni aviso al buscador — la reseña ya está
  publicada de todas formas (regla de F-003 de `producto.md`); el fallo es interno.

## Estados por superficie

| Estado                                          | Qué se muestra (texto e información real)                                                                     | Acción disponible |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| V-001, con reseñas y token                              | "Marcelo Rojas · Electricidad · Ñuñoa", "★ 4,7 · 12 reseñas", card "¿Cómo te fue con Marcelo?", lista de reseñas con nombre, estrellas, comentario, fecha y "verificada por contacto" cada una | "Dejar una reseña" + la lista para leer |
| V-001, con reseñas, sin token                           | Igual que arriba, sin la card de dejar reseña                                                                          | Solo leer |
| V-001, sin reseñas, con token                           | "Sé el primero en contarle a otros cómo te fue con Héctor" en vez de la lista                                          | "Dejar una reseña" |
| V-001, sin reseñas, sin token                           | Ninguna sección de reseñas — igual que misión 05 ya definía antes de esta misión                                       | Ninguna |
| V-001, reseñando (nueva)                                | Sheet con "Dejar una reseña", "Para Marcelo Rojas · Electricidad", 5 estrellas vacías, comentario y nombre en blanco   | "Publicar reseña" (atenuado hasta marcar una estrella) |
| V-001, reseñando (editando)                             | Sheet con "Editar tu reseña", prellenado con rating, comentario y nombre ya guardados                                  | "Publicar reseña" |
| V-001, reseñando, error de envío                        | "No pudimos publicar tu reseña. Inténtalo de nuevo." sobre el botón, formulario intacto                               | "Publicar reseña" (reintentar) |
| V-001, justo después de publicar                        | La reseña nueva arriba de la lista, "recién" como fecha, toast "Reseña publicada" en `bottom-right` por 5 segundos      | Ninguna — es confirmación |

## Mockups

| Mockup           | Cubre                        | Estado      | Ruta |
| ----------------- | ------------------------------- | -------------- | ------ |
| perfil-resenas     | UXF-001, UXF-002 (V-001, extendida) | validado    | `./design-mockups/perfil-resenas.html` |

UXF-003 (el correo) no tiene mockup en `design-mockups/` porque no es una pantalla de Datealo — su
contenido completo está especificado como texto en la sección de UXF-003 arriba.

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                                                      | Estado    |
| ------------- | ------- | ------------------------------------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | vacío, editando (CL-003), sin token (CL-001, CL-002), sin estrella marcada, error de envío, éxito         | vigente |
| F-002         | UXF-002 | con reseñas + token, con reseñas sin token, sin reseñas + token, sin reseñas sin token (heredado de misión 05) | vigente |
| F-003         | UXF-003 | contenido con nombre, contenido sin nombre, contenido sin comentario, fallo de envío                       | vigente |

## Secciones bajo demanda

### Modelo mental y lenguaje

"Verificada por contacto" es el único concepto de esta misión con riesgo real de confusión — puede leerse
como "Datealo confirmó que esta persona es quien dice ser". No es eso (C-001 de `investigacion.md`), así
que la interfaz nunca lo deja como una afirmación suelta sin poder explicarse:

- La marca lleva siempre las tres palabras completas, "verificada por contacto" — nunca solo "verificada",
  en ningún lugar (badge, `aria-label`, el asunto del correo si algún día lo menciona).
- No hay tooltip ni ícono de información adicional sobre la marca en esta entrega — agregar una explicación
  aparte solo para una frase de tres palabras sería resolver con UI algo que ya intenta resolver el copy.
  **Riesgo aceptado:** esa lectura no está probada con usuarios reales — Datealo sigue sin ellos, así que
  "ya se explica sola" es una hipótesis, no un hecho verificado. **Reapertura:** en las primeras entrevistas
  post-lanzamiento (skill `mom-test`) preguntar explícitamente si alguien interpretó la marca como que
  Datealo verificó la identidad de quien escribió; o si un profesional escribe preguntando qué significa —
  cualquiera de las dos señales reabre esto como UX-xxx, sin esperar a un volumen que hoy no existe.

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — La opción de dejar una reseña es invisible para quien no tiene el token, nunca un botón bloqueado con explicación

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** [D-001](./producto.md#d-001) de producto; [C-001](./investigacion.md#c-001) de
  investigación.
- **Alternativas descartadas:** ver "Divergencia antes de converger" de UXF-001 — CTA siempre visible junto
  al botón de contacto, deshabilitada sin token (invade el espacio que UX-001/UX-002 de misión 05 ya
  protegieron para solo dos botones, y el mensaje de "contacta primero" documenta el mecanismo de
  verificación exactamente para quien más interesado está en sortearlo) y formulario inline en el scroll
  (más fácil de abandonar a medias, sin una salida tan clara como cerrar un sheet).
- **Decisión y consecuencia:** la sección de reseñas solo incluye la card de "dejar la tuya" cuando el
  navegador tiene el token de D-001 para ese profesional — nunca un botón visible pero inactivo.
- **Impacto en producto:** ninguno — es una decisión de cómo se ve, no cambia ninguna regla de F-001.
- **Riesgo aceptado:** alguien que sí contactó de verdad pero cambió de dispositivo desde entonces
  ([CL-002](./producto.md#cl-002)) tampoco ve ninguna señal de que la opción de reseñar existe — la
  invisibilidad total protege contra quien nunca contactó, pero no distingue ese caso de alguien que sí lo
  hizo, y ese costo juega en contra de [M-001](./producto.md#m-001) (cuántos contactos reales vuelven como
  reseña). Se acepta porque cualquier señal intermedia ("parece que contactaste desde otro dispositivo")
  seguiría exponiendo que existe un mecanismo, y hoy no hay volumen real para saber si el caso es frecuente.
  **Reapertura:** si el seguimiento de M-001 muestra una proporción de contactos-a-reseñas más baja de lo
  esperado y el cambio de dispositivo resulta ser una causa frecuente, se revisa una señal mínima que no
  revele el mecanismo de D-001.

<a id="ux-002"></a>

### UX-002 — El resumen de rating sube junto al nombre; la sección de reseñas entra entre el precio y "En Datealo desde"

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** [C-001](./investigacion.md#c-001) de investigación (fotos y reseñas son las señales de
  confianza más fuertes que Datealo puede mostrar); jerarquía de información ya fijada por UXF-001 de
  misión 05.
- **Alternativas descartadas:** dejar todo el contenido de reseñas junto, sin adelantar ningún resumen
  arriba — se descarta porque esconde la señal de confianza más fuerte hasta el fondo del scroll, perdiendo
  su efecto justo en el momento en que el buscador recién está formándose una impresión del profesional.
  Reemplazar "En Datealo desde..." por el resumen de rating en su misma posición — se descarta porque ambos
  datos son útiles y no hace falta sacrificar uno por el otro; conviven en dos lugares distintos del mismo
  perfil.
- **Decisión y consecuencia:** la jerarquía de misión 05 (foto → nombre/categoría/comuna → descripción →
  precio → "En Datealo desde" → contacto) queda extendida así: el resumen de rating se agrega en la línea
  siguiente a nombre/categoría/comuna (no la reemplaza), y la sección completa de reseñas se inserta entre
  precio y "En Datealo desde".
- **Impacto en producto:** ninguno.

<a id="ux-003"></a>

### UX-003 — El formulario de reseña es un bottom sheet sobre el perfil, no una página ni un modal de pantalla completa

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** "Patrones de interacción que ya están decididos" del skill `discovery-ux` (bottom sheets en
  móvil); ver "Divergencia antes de converger" de UXF-001.
- **Alternativas descartadas:** ver UXF-001 — formulario inline expandido en el scroll (más fácil de
  perder a medio llenar) y una página nueva dedicada (rompería la Decisión de experiencia de esta misión de
  no crear ninguna vista nueva, sin ninguna razón que lo justifique: tres campos no necesitan su propia URL).
- **Decisión y consecuencia:** el sheet cubre parcialmente el perfil (el hero de foto queda visible arriba,
  recortado), con backdrop semitransparente y `border-radius` solo en las esquinas superiores — layout
  exacto en el mockup.
- **Impacto en producto:** ninguno.

<a id="ux-004"></a>

### UX-004 — "Verificada por contacto" nunca se abrevia, en ningún texto de la interfaz

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Sustento:** [C-001](./investigacion.md#c-001) de investigación — Datealo solo puede respaldar que hubo
  un contacto real, no la identidad de quien reseñó.
- **Alternativas descartadas:** usar solo "verificada" por espacio (la card es angosta en móvil) — se
  descarta porque es exactamente la lectura equivocada que C-001 identificó como riesgo: sonaría a que
  Datealo verificó a la persona, no el contacto.
- **Decisión y consecuencia:** el badge siempre lleva el texto completo "verificada por contacto", incluso
  si eso obliga a que ocupe dos líneas en pantallas angostas — nunca se trunca ni se reemplaza por un ícono
  solo.
- **Impacto en producto:** ninguno — ya era la redacción de [F-002 de producto.md](./producto.md#f-002);
  esta decisión solo fija que la interfaz nunca la abrevia.

## Preguntas

Ninguna pregunta abierta bloquea esta misión.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de experiencia |
