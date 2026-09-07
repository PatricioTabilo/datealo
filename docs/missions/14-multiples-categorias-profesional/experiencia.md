# Misión: múltiples categorías por profesional — Experiencia

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-06

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: cada categoría es un bloque propio, tanto al editar el perfil como al verlo

Un profesional agrega categorías igual que hoy edita descripción o precio: un bloque más en la misma
pantalla de perfil, sin modal ni wizard aparte. Quien busca ve esos mismos bloques en el perfil público,
cada uno con su precio y descripción, y el botón de contacto usa la categoría por la que llegó (o la
primera que el profesional declaró, si llegó sin ese contexto). Declarar categorías adicionales queda
fuera del registro inicial — solo se hace editando el perfil ya creado.

- **Funcionalidades cubiertas:** F-001, F-002, F-003.
- **Pendiente bloqueante:** ninguna.

## Vistas

- **V-001 — Editar perfil (profesional)** · móvil / desktop (misma columna angosta en los dos — `perfil.vue`
  ya fuerza `max-w-md` sin importar el ancho de pantalla, decisión previa a esta misión) · resuelve F-001 ·
  flujo UXF-001
  - modo **lista de categorías** — cada categoría declarada como bloque con su precio y descripción; "+
    Agregar categoría" al final, siempre visible
  - modo **agregando categoría** — un bloque nuevo en edición: primero el selector de categoría, después
    precio y descripción
  - modo **confirmando quitar** — bottom sheet con la consecuencia explícita, Cancelar/Quitar
- **V-002 — Resultados de búsqueda** · móvil / desktop · resuelve F-002 · sin flujo nuevo
  - Vista ya construida (misión 10); esta misión no le agrega modos. Un profesional con 2+ categorías
    aparece en cada búsqueda por separado, con el precio de la categoría que corresponde a esa búsqueda —
    cambio de dato, no de vista.
- **V-003 — Perfil público de profesional** · móvil / desktop · resuelve F-003 · flujo UXF-002
  - modo **una categoría** — igual a como se ve hoy, sin cambios (CL-001 producto.md)
  - modo **varias categorías** — la categoría de contexto (o la primera declarada si no hay contexto) se
    ve con el mismo layout de siempre, sin caja nueva (nombre, categoría · comuna, precio, descripción);
    las demás aparecen como una fila compacta (nombre + precio, sin descripción) bajo el título "También
    hace". En móvil esa fila va debajo de la descripción, antes de la sección de reseñas; en desktop vive
    en la barra lateral, junto al CTA (ver [UX-004](#ux-004)). El rating y las reseñas son siempre las del
    profesional completo, iguales en cualquier modo — `reviews` no distingue categoría (ver "Fuera de
    alcance" en `producto.md`)
- **Registro (`registro.vue`, paso "Tu categoría")** · móvil · sin flujo ni modo nuevo — un solo texto de
  ayuda agregado bajo el selector (ver [UX-001](#ux-001)), para que quede claro que la categoría elegida
  acá no es la única que podrá tener.

## Mapa de estados

| Desde                          | Acción                                             | Queda en                       | Qué pasa con el trabajo                                    |
| ------------------------------- | --------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| V-001 · lista de categorías      | Toca "+ Agregar categoría"                            | V-001 · agregando categoría       | Los bloques existentes no cambian                              |
| V-001 · agregando categoría      | Elige categoría, llena precio/descripción (o no) y sale del bloque | V-001 · lista de categorías | Se agrega el bloque nuevo al final de la lista                 |
| V-001 · agregando categoría      | Toca "Cancelar" antes de elegir categoría             | V-001 · lista de categorías       | No se guarda nada, el bloque en blanco desaparece               |
| V-001 · lista de categorías      | Toca "Quitar" en un bloque (con 2+ categorías)        | V-001 · lista de categorías       | Ese bloque desaparece de inmediato, el resto no cambia          |
| V-002 · resultados de "Gasfitería en Ñuñoa" | Toca la card de un profesional multi-categoría | V-003 · perfil (contexto: Gasfitería) | El precio, la descripción y el mensaje de WhatsApp usan Gasfitería |
| V-003 · perfil (cualquier modo)  | Toca "Escribir por WhatsApp" o "Llamar"               | WhatsApp / marcador (fuera de Datealo) | El perfil queda en la misma posición al volver                 |

## UXF-001 — Agregar una categoría al perfil

**Objetivo:** el profesional agrega una categoría que no tenía, con su propio precio y descripción.
**Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** el profesional está en su perfil (V-001), con al menos una categoría ya declarada
(todo profesional tiene una desde el registro).

**Criterio de término:** la nueva categoría aparece como un bloque más en la lista, con su precio y
descripción guardados (o vacíos si no los llenó), y desde ese momento cuenta para las búsquedas de esa
categoría.

**Cómo sabe el usuario dónde está:** cada bloque de categoría muestra su nombre como título; el bloque en
edición se distingue con el mismo borde/fondo resaltado que ya usan hoy los bloques de "Descripción" y
"Precio" al editarse.

### Salidas

| Salida                | Cómo se ejecuta                                                  | Qué queda del trabajo                                |
| ---------------------- | ------------------------------------------------------------------ | -------------------------------------------------------- |
| Termina bien           | Elige categoría y llena precio/descripción (guardado automático al perder el foco de cada campo) | El bloque nuevo queda guardado y visible                 |
| Cancela                | Toca "Cancelar" antes de elegir categoría                           | Nada se guarda, el bloque en blanco desaparece            |
| Abandona sin cerrar    | Cierra la app o navega a otra parte a medio llenar                 | Nada se guarda (no hay borrador); al volver ve la lista como estaba antes de tocar "+ Agregar" |
| Quita una categoría    | Toca "Quitar", confirma en el modal ("¿Quitar Gasfitería de tu perfil? Perderás el precio y la descripción que escribiste.") | El bloque desaparece; si cancela el modal, no cambia nada |

### Secuencia principal

| Paso | Acción                                                              | Respuesta del sistema                                                                 | Información visible                                                                 |
| ---- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| 1    | Toca "+ Agregar categoría" al final de la lista                        | Aparece un bloque nuevo en modo edición, con el selector de categoría enfocado              | El selector solo lista las categorías que le faltan (excluye las ya declaradas)            |
| 2    | Elige una categoría (ej. "Gasfitería")                                  | El bloque muestra el nombre elegido y dos campos: precio y descripción, vacíos              | "Gasfitería" como título del bloque, con el mismo placeholder de ejemplo que ya usa el bloque general de descripción |
| 3    | Llena precio y/o descripción (ambos opcionales) y sale del campo (blur) | Cada campo se guarda al perder el foco, con el mismo loader que usa hoy "Descripción"/"Precio" | Spinner breve junto al campo que se está guardando                                        |
| 4    | Termina de editar (toca fuera del bloque, o pasa a otro)                | El bloque pasa a modo lectura: "Gasfitería · Desde $18.000" y la descripción si la ingresó   | El bloque queda tan compacto como los de "Descripción"/"Precio" existentes                 |

### Variantes y recuperación

| Condición                                              | Qué cambia                                                    | Cómo se entiende                                                        | Cómo se recupera                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Ya declaró todas las categorías activas                    | El botón "+ Agregar categoría" no aparece                          | Se omite en silencio — es un estado normal, no un error                       | No aplica                                                          |
| Falla el guardado (categoría, precio o descripción)        | El bloque conserva su valor anterior                                | "No se pudo guardar, toca para reintentar" bajo el campo (patrón ya existente en descripción/precio) | Tocar el mensaje reintenta el guardado                              |
| Intenta quitar su única categoría restante                 | El botón "Quitar" de esa categoría no aparece                       | Texto breve junto al bloque: "No puedes quitar tu única categoría. Agrega otra antes de quitar esta." | Agregar otra categoría primero habilita quitar la actual            |
| Conexión lenta al guardar                                  | El campo muestra el mismo spinner que hoy usan precio/descripción   | Spinner junto al campo, no bloquea el resto del perfil                        | Mismo reintento que ya tienen los demás campos editables            |

### Decisiones que no deben quedar implícitas

- Elegir una categoría del selector la guarda de inmediato, sin un botón "Confirmar" aparte — mismo patrón
  de guardado inmediato por campo que ya usa el resto del perfil.
- Cancelar antes de elegir categoría no deja un bloque vacío a medio crear: el bloque desaparece.
- Quitar una categoría pide confirmar, con la consecuencia dicha explícitamente: "¿Quitar Gasfitería de
  tu perfil? Perderás el precio y la descripción que escribiste para esta categoría." con botones
  Cancelar/Quitar. No es el mismo caso que quitar una foto de trabajo (`ProfessionalPhotos.vue`, sin
  confirmar): una foto se resube igual de fácil, pero acá se pierde un párrafo redactado a mano. Los dos
  análogos más directos de otros productos — LinkedIn al quitar una habilidad del perfil, Fiverr al
  eliminar un gig — piden confirmar por la misma razón: es contenido propio que cuesta rehacer, no un
  archivo reemplazable. No llega al extremo de "escribe el nombre para confirmar" (como sí amerita borrar
  una cuenta): acá no hay reputación ni reseñas en juego, esas quedan con el profesional completo, no con
  la categoría (ver "Fuera de alcance" en `producto.md`). Salvo que sea la única categoría restante, en
  cuyo caso ni siquiera se ofrece la opción de quitarla. En móvil el modal aparece como bottom sheet (sube
  desde abajo, esquinas superiores redondeadas) — el patrón que Datealo ya tiene decidido para overlays
  en móvil. Aunque `perfil.vue` mantiene su columna angosta (`max-w-md`) en cualquier ancho de pantalla
  (ver la vista V-001 más arriba), el modal de confirmación no hereda ese ancho: en desktop se ve
  centrado en toda la pantalla, con el fondo atenuado cubriendo el viewport completo (no solo la columna),
  esquinas redondeadas en los cuatro lados y sin el tirador de arrastre — el bottom sheet es un patrón
  táctil (deslizar para cerrar) que no tiene sentido con mouse, y un sheet de ancho completo en una
  pantalla de escritorio se vería como una franja larga y vacía. Es el comportamiento por defecto de
  `UModal` de Nuxt UI entre breakpoints, no algo que haya que construir a mano.
- Los botones "Quitar" y "Editar" llevan `aria-label` con el nombre de la categoría ("Quitar Gasfitería",
  "Editar Gasfitería") — el texto visible se queda corto ("Quitar" a secas) cuando hay más de un bloque en
  pantalla y un lector de pantalla los anuncia sin el contexto visual que los separa. Cada uno lleva
  padding suficiente para un área de toque de al menos 24×24px (el texto visible es más chico) y al menos
  8px de separación entre ambos, aunque compartan la misma línea — no solo tamaño de fuente pequeño sin
  margen alrededor.
- Agregar o quitar un bloque de categoría anuncia el cambio con `aria-live="polite"` sobre la lista de
  categorías (ej. "Gasfitería agregada" / "Gasfitería quitada") — sin esto, alguien que usa lector de
  pantalla no se entera de que la lista cambió, porque el bloque aparece o desaparece en silencio.

## UXF-002 — Ver y contactar a un profesional con varias categorías

**Objetivo:** quien busca ve toda la oferta del profesional y lo contacta por la categoría correcta.
**Contrato:** [F-002](./producto.md#f-002), [F-003](./producto.md#f-003).

**Punto de entrada:** llega al perfil desde una card de resultados de una categoría específica (ej.
"Gasfitería en Ñuñoa"), o directo por un link compartido, sin ese contexto.

**Criterio de término:** toca "Escribir por WhatsApp" y el mensaje prellenado menciona la categoría
correcta.

**Cómo sabe el usuario dónde está:** la categoría de contexto se nombra junto al precio y la descripción,
igual que hoy ("Gasfitería · Ñuñoa"); cada categoría secundaria repite su propio nombre en su fila bajo
"También hace", junto a su precio si el profesional lo declaró ([UX-005](#ux-005)), así que no hay
ambigüedad sobre a qué categoría corresponde cada dato aunque no compartan el mismo bloque visual.

### Salidas

| Salida                  | Cómo se ejecuta                     | Qué queda del trabajo                                            |
| ------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| Contacta por WhatsApp    | Toca "Escribir por WhatsApp"           | Se abre WhatsApp con el mensaje prellenado; el perfil sigue en la misma posición al volver |
| Contacta por teléfono    | Toca el ícono de llamada                | Igual: el perfil queda donde estaba al volver                          |
| Vuelve a resultados      | Botón atrás                            | Vuelve a la lista de resultados en la misma posición de scroll (comportamiento ya existente) |

### Secuencia principal

| Paso | Acción                                                            | Respuesta del sistema                                                                                    | Información visible                                                                 |
| ---- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1    | Busca "gasfiter" en Ñuñoa y toca la card de Feña                        | Navega al perfil con el contexto de categoría "Gasfitería" (via query, ej. `?categoria=gasfiteria`)              | —                                                                                          |
| 2    | El perfil carga                                                         | Si Feña tiene una sola categoría, se ve igual que hoy (CL-001). Si tiene varias, la de contexto (Gasfitería) se ve con el mismo layout de siempre — mismo texto, mismo tamaño, sin caja — y las demás aparecen como fila compacta bajo "También hace": en móvil debajo de la descripción, en desktop en la barra lateral junto al CTA | "Gasfitería · Ñuñoa · Desde $18.000 · [descripción]" igual que hoy; "También hace: Electricidad · Desde $20.000" como fila compacta aparte (o solo "Electricidad" si no declaró precio, [UX-005](#ux-005)) |
| 3    | Toca "Escribir por WhatsApp" (barra fija)                               | Se abre WhatsApp con el mensaje prellenado usando la categoría de contexto (Gasfitería)                          | "Hola Feña, vi tu perfil de Gasfitería en Datealo y quería consultarte algo"                |

### Variantes y recuperación

| Condición                                         | Qué cambia                                                          | Cómo se entiende                                             | Cómo se recupera                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Llega sin contexto de categoría (link directo)          | El mensaje de WhatsApp usa la primera categoría que el profesional declaró | Sin indicador especial en pantalla                                  | Puede editar el texto dentro de WhatsApp antes de enviarlo, como cualquier mensaje prellenado |
| Profesional con una sola categoría                      | El perfil se ve exactamente igual que hoy — línea única "Categoría · Comuna" | —                                                                    | No aplica                                                                   |
| Profesional con muchas categorías (5 o más)             | Solo la de contexto sigue siendo bloque completo; el resto son filas compactas de una línea (D-001 producto.md: sin límite, resuelto con jerarquía en vez de truncar — ver [UX-004](#ux-004)) | El scroll de la página crece de a poco (una línea por categoría extra), nunca una pared de bloques idénticos | No aplica                                                                   |
| Categoría secundaria sin precio declarado               | La fila muestra solo el nombre, sin precio ([UX-005](#ux-005))              | —                                                                    | No aplica                                                                   |

### Decisiones que no deben quedar implícitas

- El precio y la descripción que muestra la card de resultados (V-002) son los de la categoría por la que
  se buscó, no los de la primera categoría declarada — nota para `ingenieria.md`: `/api/search` debe
  devolver el precio/descripción de la categoría que hizo match, no un valor genérico del profesional.
- El query param de categoría en la URL del perfil (`?categoria=slug`) solo sirve para elegir qué
  categoría prellena el mensaje de contacto — nunca oculta las otras categorías del profesional, que
  siempre se muestran todas.
- No hay un badge ni ningún otro texto que explique "por qué" el mensaje menciona esa categoría —
  descartado en el diseño (ver [UX-003](#ux-003)). La jerarquía visual ya cumple ese rol sin texto extra:
  la categoría de contexto es el único bloque completo (nombre grande, precio, descripción), así que es
  obvio cuál es "la" categoría de la que trata el perfil en este momento, sin necesitar una explicación
  aparte (ver [UX-004](#ux-004)).

## Estados por superficie

| Estado                                       | Qué se muestra (texto e información real)                                                                | Acción disponible                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| V-001 · con una categoría                        | Igual que hoy: línea "Categoría · Comuna" arriba, bloques de Descripción/Precio compartidos                     | Editar categoría, agregar otra                 |
| V-001 · con varias categorías                    | Un bloque por categoría con su nombre, precio y descripción propios; "+ Agregar categoría" al final              | Editar cada bloque, agregar otra, quitar cualquiera salvo la última |
| V-001 · agregando categoría                      | Bloque nuevo con el selector de categoría enfocado (excluye las ya declaradas)                                  | Elegir categoría, cancelar                     |
| V-001 · error al guardar                         | "No se pudo guardar, toca para reintentar" bajo el campo que falló                                              | Reintentar tocando el mensaje                  |
| V-003 · con una categoría                        | Igual que hoy                                                                                                    | Contactar                                      |
| V-003 · con varias categorías                    | La categoría de contexto se ve con el layout normal de siempre (nombre, categoría · comuna, precio, descripción, sin caja); las demás como fila compacta bajo "También hace" (nombre, + precio si lo declaró, [UX-005](#ux-005)) — en móvil debajo, en desktop en la barra lateral junto al CTA. Filas informativas, no interactivas. Rating y reseñas iguales en cualquier modo | Contactar (con la categoría de contexto)       |
| Registro · paso "Tu categoría"                    | Debajo del selector: "Puedes agregar otras categorías más adelante, desde tu perfil."                            | Elegir categoría, continuar (sin cambios de flujo) |

## Mockups

| Mockup                          | Cubre           | Estado    | Ruta                                                          |
| ---------------------------------- | ----------------- | ---------- | ------------------------------------------------------------------ |
| Editar perfil con categorías        | UXF-001            | exploración | `./design-mockups/perfil-edicion-categorias.html`                   |
| Perfil público con categorías       | UXF-002            | exploración | `./design-mockups/perfil-publico-categorias.html`                   |

## Cobertura

| Funcionalidad | Flujo    | Estados cubiertos                                     | Estado    |
| -------------- | --------- | -------------------------------------------------------- | ---------- |
| F-001          | UXF-001   | lista (1 y 2+ categorías), agregando, error al guardar, sin categorías por agregar | pendiente |
| F-002          | —         | resultados de búsqueda sin cambio de vista (dato distinto por categoría) | pendiente |
| F-003          | UXF-002   | una categoría, varias categorías, sin contexto de categoría | pendiente |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — Declarar categorías adicionales solo se hace editando el perfil, nunca en el registro inicial

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** resuelve [Q-001](./producto.md#q-001) de `producto.md`.
- **Alternativas descartadas:** agregar un selector múltiple al wizard de registro (`registro.vue`) —
  descartada porque el registro es un flujo de 4 pasos pensado para lo mínimo indispensable, y con
  [D-002](./producto.md#d-002)/[D-003](./producto.md#d-003) cada categoría adicional necesita su propio
  precio y descripción: pedir eso en el primer contacto de un profesional con Datealo (que además "tiene
  poca familiaridad con apps", ver contexto de uso de este skill) agrega fricción justo donde el arranque
  en frío del lado profesional ya es difícil.
- **Decisión y consecuencia:** el registro sigue pidiendo una sola categoría, sin tocar la estructura de
  la misión 04 (ya cerrada). Declarar una segunda o tercera categoría es una acción de "editar perfil"
  (V-001), que ya existe como superficie y ya resuelve el patrón de edición campo por campo que esta
  funcionalidad reutiliza. La única adición al registro es una línea de ayuda bajo el selector de
  categoría (`registro.vue`, paso "Tu categoría"), para que nadie termine el registro pensando que esa
  categoría es la única que podrá tener: "Puedes agregar otras categorías más adelante, desde tu perfil."
  Es texto nuevo, no un paso ni un campo nuevo — no cambia el conteo de 4 pasos del wizard.
- **Impacto en producto:** cierra [Q-001](./producto.md#q-001) — actualizar su estado a "resuelta" en
  `producto.md`.

<a id="ux-002"></a>

### UX-002 — Agregar una categoría es un bloque más en el mismo perfil, no un modal ni un wizard aparte

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [F-001](./producto.md#f-001).
- **Alternativas descartadas:** un modal o bottom sheet "Gestionar categorías" separado del scroll
  principal del perfil — descartado porque el perfil ya es una sola pantalla scrolleable y no hay ninguna
  razón real para segmentar las categorías en otra superficie que hay que abrir y cerrar; un wizard de
  pasos igual al del registro (selector → precio → descripción → confirmar, en pantallas separadas) —
  descartado por sobre-construir un flujo de varios pasos para agregar un solo bloque con dos campos,
  cuando el registro lo justifica ahí por tener 4 datos heterogéneos de una sola vez, no por ser el patrón
  correcto para "agregar un dato más" sobre un perfil que ya existe.
- **Decisión y consecuencia:** agregar una categoría reutiliza el mismo patrón de "bloque con borde +
  edición de campo por campo con guardado automático" que ya usan "Descripción" y "Precio" en V-001. No
  agrega pantallas nuevas ni navegación fuera del perfil.
- **Impacto en producto:** ninguno.

<a id="ux-003"></a>

### UX-003 — El mensaje de contacto usa la categoría de la búsqueda que trajo al usuario, sin selector ni aviso visible

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [F-002](./producto.md#f-002), [F-003](./producto.md#f-003), guardrail de CLAUDE.md de no
  agregar pasos al flujo buscar → perfil → contactar.
- **Alternativas descartadas:** un botón de "Escribir por WhatsApp" por cada bloque de categoría (en vez
  de un único CTA fijo) — descartado porque diluye la acción principal con varios botones idénticos
  compitiendo por atención, y cambia el patrón de CTA fijo único que ya existe para la inmensa mayoría de
  perfiles (una sola categoría, CL-001); un selector de categoría dentro de la barra de contacto fija
  ("Contactar por: Gasfitería ▾") — descartado porque agrega un control visible incluso a los perfiles de
  una sola categoría (la mayoría) para resolver un caso donde el default por contexto ya acierta casi
  siempre, y el costo de un default equivocado es bajo (el mensaje es editable en WhatsApp antes de
  enviar); un badge visible explicando "por qué" el mensaje menciona esa categoría — descartado como ruido
  sin problema real detrás (ver [UXF-002](#uxf-002-ver-y-contactar-a-un-profesional-con-varias-categorías)).
- **Decisión y consecuencia:** el perfil recibe la categoría de contexto por query param
  (`?categoria=slug`) desde la card que lo trajo; sin ese contexto, usa la primera categoría que el
  profesional declaró. El CTA de contacto sigue siendo el mismo botón único y fijo de siempre. Esta
  decisión depende de que la categoría de contexto sea visualmente inconfundible (ver
  [UX-004](#ux-004)) — sin esa jerarquía, un badge o selector sí haría falta.
- **Impacto en producto:** ninguno.

<a id="ux-004"></a>

### UX-004 — El perfil público distingue la categoría de contexto con el detalle completo; el resto son filas compactas

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [D-001](./producto.md#d-001) (que delega a esta misión resolver la legibilidad con
  varias categorías), [F-003](./producto.md#f-003).
- **Alternativas descartadas:** todos los bloques iguales y completos, apilados uno tras otro (primera
  versión de este documento) — descartada porque con 5+ categorías (D-001: sin tope) se vuelve una pared
  de bloques idénticos donde nada distingue cuál es relevante para la búsqueda que trajo a la persona;
  truncar a N bloques completos con un "+2 categorías más" que expande el resto (la sugerencia literal de
  D-001) — descartada porque trata todas las categorías como igual de probables de importar, cuando en la
  práctica casi siempre hay una categoría concreta que trajo a la persona hasta acá (la de la búsqueda), y
  esa es la que necesita el detalle completo; mantener la categoría de contexto en una caja con borde,
  tanto en móvil como en desktop (segunda versión de este documento) — descartada porque tanto la
  pantalla de perfil de móvil como la columna principal de desktop ya tienen su propio layout para
  nombre, precio y descripción (el de siempre, CL-001), y ponerle una caja encima solo por tener varias
  categorías le agrega una jerarquía visual nueva a algo que no la necesita.
- **Decisión y consecuencia:** la categoría de contexto (o la primera declarada, sin contexto) se muestra
  con el mismo layout que ya existe para un profesional de una sola categoría — sin caja ni bloque nuevo,
  solo con "Gasfitería" en vez de la categoría única de siempre, en móvil y en desktop por igual. Las
  demás categorías aparecen como una fila de una línea (nombre + precio, sin descripción) bajo "También
  hace": en móvil, debajo de la descripción; en desktop, en la barra lateral, junto al CTA de contacto (no
  en la columna principal). Si la
  persona quiere el detalle de una categoría secundaria, contacta y pregunta, coherente con que el
  contacto es directo y no necesita agotar cada dato en el perfil primero. Esto también resuelve, sin
  badge ni selector, cuál categoría es la del mensaje de contacto ([UX-003](#ux-003)): es visualmente la
  única con el detalle completo.
- **Impacto en producto:** ninguno — es una resolución visual de algo que D-001 ya delegó explícitamente a
  `experiencia.md`.

<a id="ux-005"></a>

### UX-005 — La fila de "También hace" omite el precio si falta, y no es interactiva

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Sustento:** [UX-004](#ux-004) (la fila ya es un resumen, no el detalle); el patrón ya vigente en
  `SearchResultCard.vue:54` y `perfil.vue:124`, que ocultan la línea de precio completa cuando
  `priceFrom` es nulo en vez de mostrar un placeholder; precio y descripción opcionales por categoría
  ([D-003](./producto.md#d-003)).
- **Alternativas descartadas:** un texto tipo "Precio a consultar" cuando falta el precio — descartada
  porque introduce una convención que no existe en ningún otro punto de la app (hoy la línea
  simplemente desaparece cuando no hay dato) y ningún benchmark externo (TaskRabbit, Thumbtack, Fiverr) la
  sustenta; hacer la fila interactiva para recontextualizar el CTA a esa categoría — descartada porque
  ninguna `F-xxx` ni evidencia de `investigacion.md` la pide, agrega una interacción nueva a una fila
  pensada como resumen (UX-004), y el costo de un default equivocado en el mensaje de WhatsApp ya es bajo
  y editable (UX-003).
- **Decisión y consecuencia:** la fila muestra el nombre de la categoría y, si el profesional lo declaró,
  su precio ("Electricidad · Desde $20.000"); sin precio, la fila muestra solo el nombre ("Electricidad"),
  igual que la línea de precio del bloque principal desaparece hoy cuando `priceFrom` es nulo. La fila no
  navega ni cambia la categoría de contexto del CTA — es texto, no un control; el único camino para
  contactar por esa categoría es buscarla directamente.
- **Impacto en producto:** ninguno.

## Preguntas

Ninguna pregunta abierta bloquea el paso a `ingenieria.md`.

| ID      | La duda | Estado | Respuesta, o quién la resuelve |
| ------- | ------- | ------ | ------------------------------- |
| —       | —       | —      | —                                |
