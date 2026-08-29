# Misión: perfil público de profesional — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-08-28

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: una sola pantalla de lectura, con el botón de contacto siempre alcanzable

El perfil es una sola vista (V-001), sin pasos ni pantallas intermedias: foto(s) arriba, datos abajo, y un
botón de contacto fijo que nunca se mueve del fondo de la pantalla mientras se hace scroll. No hay una
versión distinta del layout para un perfil recién publicado sin nada cargado — es la misma pantalla, con
menos contenido, porque ese es el estado de todos los perfiles al lanzamiento (C-004 de investigación) y
tratarlo como un caso especial lo haría sentir peor, no mejor.

Contactar (F-002) no es una pantalla propia: es lo que pasa al tocar cualquiera de los dos botones del
perfil — "Escribir por WhatsApp" o "Llamar" —, ambos construidos desde el mismo número que guarda misión
04, porque Datealo no distingue "WhatsApp" de "teléfono" como dos contactos separados (ver corrección a
[F-002 de producto.md](./producto.md#f-002) hecha durante este trabajo).

- **Funcionalidades cubiertas:** F-001, F-002.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Perfil público de profesional** · móvil / desktop · resuelve [F-001](./producto.md#f-001),
  [F-002](./producto.md#f-002) · flujos UXF-001, UXF-002
  - modo **cargando** — pidiendo los datos del perfil, todavía no se sabe si existe
  - modo **encontrado** — el perfil normal; el contenido varía según qué cargó el profesional (fotos,
    descripción, precio) y hace cuánto existe, pero es la misma pantalla — nunca un modo distinto por eso
  - modo **no encontrado** — el link no corresponde a ningún perfil activo (typo, o el perfil ya no existe)

## Mapa de estados

| Desde     | Acción                                              | Queda en                         | Qué pasa con el trabajo |
| --------- | ------------------------------------------------------ | ----------------------------------- | ---------------------------- |
| cargando  | el servidor responde con un perfil activo               | encontrado                          | ninguno — es la primera carga |
| cargando  | el servidor responde sin ningún perfil (no existe o inactivo) | no encontrado                | ninguno |
| encontrado | toca "Escribir por WhatsApp"                            | encontrado (WhatsApp se abre aparte) | Datealo registra el contacto en paralelo; al volver de WhatsApp, el perfil sigue en el mismo scroll |
| encontrado | toca "Llamar"                                            | encontrado (se abre el marcador aparte) | mismo registro de contacto; al volver, mismo perfil, mismo scroll |
| no encontrado | toca "Buscar profesionales"                          | fuera de V-001 (a resultados cuando exista misión 06, o a la home mientras tanto) | ninguno |

## UXF-001 — Ver el perfil de un profesional

**Objetivo:** que el buscador tenga lo que necesita para decidir si confía en el profesional, sin tener que
preguntarle nada primero. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** hoy, el único origen real es un link compartido directo (o uno probado a mano en
desarrollo) — cuando exista misión 06, también desde una card de resultados. La pantalla no distingue el
origen: el perfil se ve igual venga de donde venga.

**Criterio de término:** no es una acción que "se completa" — es una pantalla de lectura. Su criterio de
término es que el buscador llegó al botón de contacto con todo lo que el profesional cargó a la vista, sin
tener que buscar información en otro lado.

**Cómo sabe el usuario dónde está:** el nombre, la categoría y la comuna quedan siempre visibles apenas
termina de cargar, arriba de todo lo demás — es lo primero que confirma que está en el perfil correcto.

### Divergencia antes de converger

Para resolver el mismo JTBD (decidir sin poder leer ninguna reseña) se generaron tres enfoques
genuinamente distintos, no variantes de layout del mismo enfoque:

- **Enfoque A — hero de foto + botón de contacto fijo abajo:** foto(s) grandes arriba, datos debajo en
  orden de relevancia, barra de contacto que nunca se mueve del fondo de la pantalla. Patrón directo de
  Airbnb y TaskRabbit ([E-003](./investigacion.md#e-003), [E-005](./investigacion.md#e-005)).
- **Enfoque B — ficha compacta tipo agenda de contactos:** todo en una pantalla sin scroll grande, foto
  chica a un costado, datos a la derecha en filas cortas — prioriza velocidad de lectura sobre impacto
  visual.
- **Enfoque C — vista conversacional embebida:** la pantalla se abre directo con un preview tipo chat de
  WhatsApp, con la info del profesional como si fuera su "perfil de contacto", enfatizando el mensaje de
  bienvenida antes que ningún dato.

**Elegido: A.** C-004 de investigación exige que un perfil sin fotos ni descripción "transmita seriedad sin
sentirse abandonado ni falso" — el Enfoque B, comprimido y con foto chica, es exactamente lo que se ve
pobre cuando faltan datos: menos espacio dedicado a lo poco que sí existe lo hace lucir más vacío, no menos.
El Enfoque C simula un chat que no es un WhatsApp real, contradice el guardrail de `CLAUDE.md` de "contacto
directo, sin intermediarios" al insertar una capa de Datealo entre el perfil y la conversación real, y no
tiene behavior estándar que resolver con un componente existente — sería construir algo nuevo sin que
ninguna conclusión de investigación lo pida. El Enfoque A además deja el botón de contacto alcanzable en
todo momento del scroll, sirviendo directo a [C-002](./investigacion.md#c-002) (el contacto es la
herramienta de "tanteo", no solo el cierre de una decisión ya tomada).

### Jerarquía de información

Con foto, nombre, categoría, comuna, descripción, precio y antigüedad compitiendo por la misma pantalla, el
orden es:

1. **Foto(s)** — lo primero que se ve, porque es la señal de confianza más fuerte que Datealo puede
   mostrar sin reseñas ([C-001](./investigacion.md#c-001)).
2. **Nombre + categoría + comuna** — confirma que es el perfil correcto y para qué sirve.
3. **Descripción** (si existe) — el profesional hablando de sí mismo, en su propio lenguaje.
4. **Precio** (si existe) — filtro rápido de presupuesto, sin tener que preguntar.
5. **"En Datealo desde..."** — el único dato de actividad que Datealo puede mostrar sin inventar nada.
6. **Botón de contacto** — no compite por posición en el scroll: vive fijo abajo, fuera del orden anterior.

### Salidas

| Salida                                  | Cómo se ejecuta                 | Qué queda del trabajo |
| ---------------------------------------- | ------------------------------- | -------------------------- |
| Decide contactar                         | toca "Escribir por WhatsApp" o "Llamar" | continúa en UXF-002; el perfil sigue atrás sin cambios |
| Vuelve a resultados o cierra la pestaña  | botón atrás del navegador, o cierra    | nada que perder — es una pantalla de solo lectura |
| El link no corresponde a nadie           | el servidor no encuentra el perfil      | ve el modo "no encontrado" con una salida hacia buscar profesionales |

### Secuencia principal

| Paso | Acción                                                    | Respuesta del sistema                                                                                     | Información visible |
| ---- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1    | Abre el link de un perfil                                   | Datealo pide los datos; si tarda más de 300ms, muestra un skeleton con la forma de la pantalla (bloque de foto, dos líneas de texto) | Solo la forma, ningún dato real todavía |
| 2    | El perfil carga                                              | Se muestra completo: foto(s) en carrusel (si tiene), nombre + categoría + comuna, descripción y precio (si existen), "En Datealo desde <mes y año>", y el botón de contacto fijo abajo | Todo lo que el profesional cargó — nunca un campo que diga "no especificado" cuando algo falta |
| 3    | Se desplaza por las fotos (si hay más de una)                | El carrusel responde al swipe (comportamiento estándar de `UCarousel`, no se especifica interacción propia), con puntos que indican cuántas fotos hay | Posición actual dentro del carrusel |
| 4    | Decide contactar                                              | Continúa en UXF-002                                                                                              | — |

### Variantes y recuperación

| Condición                                              | Qué cambia                                                                          | Cómo se entiende                                                        | Cómo se recupera |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------- |
| Sin ninguna foto ([CL-001](./producto.md#cl-001))            | El espacio de foto muestra un círculo con las iniciales del profesional, no un rectángulo vacío ni una foto de stock | Visualmente distinto a una foto real, para nunca insinuar que es suya           | No aplica — es el estado esperado de todos los perfiles al lanzamiento |
| Sin descripción ni precio ([CL-002](./producto.md#cl-002))   | Esos bloques simplemente no aparecen — el perfil pasa directo de la foto a "En Datealo desde..." | El espacio no queda con un hueco ni un "sin información"                        | No aplica |
| Sin ninguna reseña ([CL-003](./producto.md#cl-003)) — el caso de todos al lanzamiento | No hay sección de reseñas ni contador "0 reseñas"                | "En Datealo desde <mes>" ocupa el lugar donde iría ese dato                     | No aplica |
| El link no corresponde a ningún perfil activo                | Modo no encontrado — ícono, título y explicación, sin foto ni datos                       | "No encontramos este perfil. Puede que ya no esté disponible o que el link esté mal escrito." | Botón "Buscar profesionales" |
| Conexión lenta (>300ms)                                       | Skeleton con la forma de la pantalla real (bloque de foto, líneas de texto)                | El botón de contacto ya aparece en su posición fija aunque el resto siga cargando, para que el buscador sepa que va a estar ahí | Si pasa de 10s, mismo modo "no encontrado" pero con "Esto está tardando más de lo normal" + "Reintentar" |

### Decisiones que no deben quedar implícitas

- El botón "Escribir por WhatsApp" queda fijo abajo (`safe-bottom`) durante todo el scroll, nunca solo al
  final de la página — ver [UX-001](#ux-001).
- "En Datealo desde..." usa mes y año, nunca el día exacto — un dato tan preciso no aporta nada extra y
  puede sentirse como vigilancia sobre el profesional.
- No hay botón de "compartir perfil" ni de "guardar como favorito" — no está en el alcance de F-001, y
  agregarlo solo porque es común en otros perfiles públicos sería expandir el alcance sin sustento.
- El modo sin fotos usa el mismo contenedor de foto (mismo ancho completo, mismo `aspect-ratio`) con el
  círculo de iniciales centrado adentro, nunca un layout distinto y compacto — es la misma pantalla con
  menos contenido, no una composición aparte para el caso vacío (ver [UX-001](#ux-001)).
- Cada foto del carrusel lleva un `alt` descriptivo con el nombre del profesional y su posición (ej. "Foto
  de trabajo de Marcelo Rojas, 1 de 3"), nunca vacío. El contenedor en modo cargando lleva `aria-busy="true"`
  mientras no hay contenido real.
- Los puntos del carrusel llevan un degradado oscuro detrás (`hero-scrim`, ya en el mockup) para garantizar
  contraste sobre cualquier foto real, sin depender de qué tan clara u oscura sea la foto que suba cada
  profesional.
- El ícono de "Llamar" es el ícono `Phone` de `@lucide/vue` (`CLAUDE.md`), nunca un emoji — el mockup ya lo
  representa como SVG en vez de 📞 para no confundir a ingeniería.
- En desktop, el bloque de datos y contacto queda en `position: sticky` dentro de su columna, no fijo a
  toda la pantalla — la columna de fotos suele ser más alta que el bloque de texto, así que "fijo abajo" de
  móvil se traduce a "pegado arriba de su columna mientras se hace scroll" en desktop, no al mismo mecanismo
  literal.

## UXF-002 — Contactar al profesional desde el perfil

**Objetivo:** escribir o llamar al profesional sin salir de una decisión que ya tomó, sin ningún paso de
Datealo en el medio. **Contrato:** [F-002](./producto.md#f-002). Sin divergencia propia: el mecanismo (dos
botones desde el mismo número, sin pantalla intermedia) ya lo fija [D-001](./producto.md#d-001) y
[D-002](./producto.md#d-002) de producto — acá se especifica solo la interacción concreta.

**Punto de entrada:** el buscador está en V-001 modo encontrado, decidido a escribir o llamar (o solo a
tantear cómo responde el profesional, ver [C-002](./investigacion.md#c-002)).

**Criterio de término:** se abrió la app externa (WhatsApp o el marcador del celular) con el número
correcto, y Datealo registró que el contacto ocurrió.

**Cómo sabe el usuario dónde está:** no hay una vista nueva — sigue viendo el mismo perfil detrás. Al
volver de WhatsApp o de la llamada, la pantalla está exactamente donde la dejó, mismo scroll.

### Salidas

| Salida                                              | Cómo se ejecuta                        | Qué queda del trabajo |
| --------------------------------------------------------- | ------------------------------------------ | -------------------------- |
| Termina bien                                              | toca "Escribir por WhatsApp" o "Llamar"     | se abre la app externa; el perfil queda atrás sin cambios, listo para cuando vuelva |
| Se arrepiente antes de mandar el mensaje en WhatsApp       | cierra WhatsApp sin enviar nada             | Datealo ya registró el contacto — contó el toque del botón, no si el mensaje se envió; vuelve al perfil intacto |
| El registro del contacto falla en el servidor              | seguía queriendo contactar de todas formas  | WhatsApp o la llamada se abren igual, sin que el buscador note nada ([M-002](./producto.md#m-002)) |

### Secuencia principal

| Paso | Acción                                    | Respuesta del sistema                                                                                       | Información visible |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 1    | Toca "Escribir por WhatsApp"                 | Datealo dispara en paralelo el registro del contacto (sin esperar la respuesta) y abre `wa.me/<número>` con un mensaje pre-armado | "Hola Marcelo, vi tu perfil de Electricidad en Datealo y quería consultarte algo" — para que el profesional sepa de dónde vino sin que el buscador tenga que explicarlo |
| 2    | (alternativa) Toca "Llamar"                  | Mismo registro de contacto en paralelo, y se abre el marcador del celular con el número ya cargado             | El número visible en el marcador antes de llamar |
| 3    | Vuelve a Datealo (cierra WhatsApp o cuelga)  | El perfil sigue exactamente donde lo dejó                                                                       | Nada cambia visualmente — no hay un mensaje de "gracias por contactar" |

### Variantes y recuperación

| Condición                                                     | Qué cambia                                                                              | Cómo se entiende                                                | Cómo se recupera |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------- |
| El registro del contacto falla (servidor caído)                       | Nada visible cambia para el buscador — WhatsApp o la llamada se abren igual ([M-002](./producto.md#m-002)) | No hay ningún indicador de error — el buscador nunca debe notar que algo falló acá | No aplica — es responsabilidad interna de Datealo |
| El celular no tiene WhatsApp instalado ([CL-004](./producto.md#cl-004)) | `wa.me` abre la tienda de aplicaciones o WhatsApp Web, según el dispositivo — comportamiento estándar del enlace, Datealo no lo controla | El botón "Llamar" ya estaba visible al lado desde antes, como alternativa siempre disponible | Toca "Llamar" en cambio |
| Toca "Escribir por WhatsApp" dos veces seguidas                       | Se abre WhatsApp una o dos veces, según el sistema operativo — no es un error que Datealo prevenga | No aplica un mensaje especial                                             | No aplica — no hay ningún estado roto que recuperar |

### Decisiones que no deben quedar implícitas

- El mensaje pre-armado de WhatsApp es el único "formulario" que existe en todo el flujo — texto libre que
  el buscador puede borrar y reescribir antes de enviar, nunca un campo que Datealo controla o revisa.
- El registro del contacto se dispara sin esperar a que `wa.me` o `tel:` terminen de abrir — en paralelo,
  no en secuencia — porque cualquier demora ahí sería una demora real para abrir WhatsApp, y
  [D-002](./producto.md#d-002) ya establece que el registro nunca puede retrasar el contacto real.
- No hay ninguna confirmación visual de "contacto registrado" en pantalla — el buscador nunca necesita
  saber que Datealo guardó algo; su experiencia completa es "toqué el botón y se abrió WhatsApp".

## Estados por superficie

| Estado                                                    | Qué se muestra (texto e información real)                                                                                          | Acción disponible |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| V-001 cargando                                                    | Skeleton con la forma de la pantalla: bloque de foto y dos líneas de texto                                                                     | Ninguna |
| V-001 encontrado, perfil completo                                 | "Marcelo Rojas · Electricidad · Ñuñoa", carrusel con 3 fotos, "Electricista hace 8 años, atiendo Ñuñoa y Providencia", "Desde $15.000", "En Datealo desde julio de 2026" | "Escribir por WhatsApp" (fijo abajo) + "Llamar" al lado |
| V-001 encontrado, perfil recién publicado (CL-001, CL-002, CL-003 — el caso de lanzamiento) | "Héctor Silva · Electricidad · Ñuñoa", círculo con iniciales "HS" en vez de foto, sin descripción ni precio, "En Datealo desde agosto de 2026" | "Escribir por WhatsApp" (fijo abajo) + "Llamar" — igual de alcanzable que en el perfil completo |
| V-001 no encontrado                                                | "No encontramos este perfil. Puede que ya no esté disponible o que el link esté mal escrito."                                                  | "Buscar profesionales" |
| V-001 tardando (>10s)                                              | "Esto está tardando más de lo normal."                                                                                                          | "Reintentar" |

## Mockups

| Mockup          | Cubre              | Estado       | Ruta |
| ---------------- | -------------------- | -------------- | ------ |
| perfil-publico   | UXF-001, UXF-002 (V-001) | validado | `./design-mockups/perfil-publico.html` |

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                                    | Estado    |
| ------------- | ------- | ----------------------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | cargando, completo, recién publicado (CL-001, CL-002, CL-003), no encontrado, tardando       | borrador |
| F-002         | UXF-002 | escribir por WhatsApp, llamar, registro en paralelo, sin WhatsApp instalado (CL-004)         | borrador |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El perfil usa un hero de foto con el botón de contacto fijo abajo, no una ficha compacta ni un chat embebido

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** [C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004) de investigación;
  [E-003](./investigacion.md#e-003), [E-005](./investigacion.md#e-005) (Airbnb, TaskRabbit).
- **Alternativas descartadas:** ver "Divergencia antes de converger" de UXF-001 — ficha compacta tipo
  agenda de contactos (se ve pobre cuando faltan datos, exactamente lo que C-004 pide evitar) y vista
  conversacional embebida tipo chat (simula un WhatsApp que no es real, contradice el guardrail de
  "contacto directo, sin intermediarios" de `CLAUDE.md`).
- **Decisión y consecuencia:** layout definido en la Secuencia principal de UXF-001 — foto(s) arriba, datos
  en orden de relevancia debajo, botón de contacto en una barra fija inferior durante todo el scroll. La
  evaluación heurística de esta misión intentó tumbar esta decisión señalando que, en el caso sin fotos
  (el 100% de los perfiles al lanzamiento), el mockup inicial colapsaba a una composición distinta —sin la
  banda de foto, centrada— que es justo lo que descartó al Enfoque B ("se ve pobre cuando faltan datos").
  El argumento no tumbó la elección de A sobre B o C, pero sí exigió un ajuste: el modo sin fotos conserva
  el mismo contenedor de foto (mismo ancho, mismo `aspect-ratio`) con el círculo de iniciales centrado
  adentro, en vez de una composición aparte — ya corregido en el mockup y en "Decisiones que no deben
  quedar implícitas" de UXF-001.
- **Impacto en producto:** ninguno.

<a id="ux-002"></a>

### UX-002 — El botón de contacto ofrece WhatsApp y Llamar simultáneos, nunca uno solo ni una elección previa

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** hallazgo de esta misma sesión de diseño — `professionals.contact` (misión 04) guarda un
  solo número de teléfono, no un WhatsApp y un teléfono separados.
- **Alternativas descartadas:** mostrar solo "Escribir por WhatsApp" como único botón (más simple
  visualmente) — se descarta porque deja sin alternativa a quien no tiene WhatsApp instalado, ocultando un
  dato (el mismo número sirve para llamar) que Datealo ya tiene gratis. Preguntar "¿cómo prefieres
  contactarlo?" con un selector antes de mostrar el botón — se descarta porque agrega un paso al flujo core
  que `CLAUDE.md` protege, por una decisión que de todas formas termina abriendo el mismo número.
- **Decisión y consecuencia:** dos botones siempre visibles y simultáneos — "Escribir por WhatsApp" como
  principal (más grande, primero) y "Llamar" como secundario (ícono, al lado) — ambos construidos desde el
  mismo `contact`.
- **Impacto en producto:** sí — [F-002 de producto.md](./producto.md#f-002) se corrigió en esta misma
  sesión: ya no dice "si eligió WhatsApp... o teléfono" (esa elección no existe en el dato), dice que ambos
  botones salen del mismo número.

## Preguntas

Ninguna bloquea F-001 ni F-002 tal como quedan definidas acá. La única pregunta pendiente de esta misión
([Q-001](./producto.md#q-001), cómo misión 07 va a atar una reseña a un contacto real) es de `producto.md`,
no una duda de esta vista — el perfil y el botón de contacto funcionan igual sin que esté resuelta.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de experiencia |
