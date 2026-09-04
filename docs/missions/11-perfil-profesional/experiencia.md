# Misión 11: vista de detalle de perfil de profesional — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-09-04

**Última actualización:** 2026-09-04

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: la identidad y el precio se pegan a la galería, el sidebar queda solo para contacto, y las reseñas pasan a ser su propia sección

V-001 (la misma vista de `/profesionales/[id]`, sin ruta nueva) reorganiza su contenido: en desktop, la
columna principal (junto a la galería) pasa a llevar nombre, categoría, comuna, precio y descripción; el
sidebar que hoy mezcla todo eso queda acotado a una identidad breve (avatar + nombre), rating, el bloque de
contacto y "en Datealo desde" — sticky durante toda la columna, reseñas incluidas: el sidebar sigue a la
vista mientras se lee la descripción y las reseñas, y se despega solo justo antes del footer, sin buffer
manual (mismo patrón que Airbnb, [E-005](./investigacion.md#e-005)). En mobile, el orden de scroll cambia —
identidad y precio se leen justo debajo de la foto, antes de la descripción — y las reseñas se mueven
después de la descripción, dejando de competir con el bloque de contacto por la misma columna; el botón de
contacto en sí no es un paso del scroll, es un overlay fijo al fondo de la pantalla, visible desde que se
abre la vista. El CTA fijo de mobile deja de depender del buffer genérico que el layout `general.vue`
reserva para el footer (`pb-24`, pensado para el buscador de la misión 09): esta vista reserva su propio
espacio, así el footer y el botón de contacto nunca se solapan.

- **Funcionalidades cubiertas:** F-001.
- **Pendiente bloqueante:** ninguna. La evaluación heurística en agente separado dejó 3 hallazgos
  bloqueantes (dónde vive "en Datealo desde", el layout de reseñas cuando hay varias, un token de color
  que habría regresionado el contraste actual) — los tres se investigaron y resolvieron antes de este
  estado (ver "Decisiones de experiencia"). Una revisión posterior del dueño de producto sobre el mockup
  agregó el nombre junto al avatar del sidebar (UX-001) y el mecanismo de sticky durante las reseñas
  (UX-005) — ver sus secciones para el sustento.

## Vistas

- **V-001 — Perfil de profesional** · móvil / desktop · resuelve [F-001](./producto.md#f-001) · flujo
  UXF-001
  - modo **cargando** — skeleton actualizado a la nueva forma (bloque de galería + bloque de
    identidad+precio agrupado, en vez de líneas sueltas)
  - modo **tardando** (>10s) — sin cambios respecto a la implementación actual (misión 05)
  - modo **no encontrado** — sin cambios respecto a la implementación actual (misión 05)
  - modo **encontrado** — el que rediseña esta misión: identidad+precio bajo la galería, sidebar acotado
    a contacto (desktop), reseñas como sección propia, CTA que nunca se tapa

## Mapa de estados

| Desde     | Acción                              | Queda en    | Qué pasa con el trabajo                              |
| --------- | -------------------------------------- | ----------- | --------------------------------------------------------- |
| cargando  | responde antes de 10s con datos        | encontrado  | —                                                           |
| cargando  | pasan 10s sin respuesta                | tardando    | —                                                           |
| cualquiera | la API responde 404                   | no encontrado | —                                                         |
| tardando  | toca "Reintentar" y responde con datos | encontrado  | —                                                           |
| tardando  | toca "Reintentar" y sigue sin responder | tardando   | —                                                           |
| encontrado | desliza el carrusel o toca una miniatura | encontrado | la foto activa cambia; el resto de la pantalla no se mueve |
| encontrado | toca "Dejar una reseña"               | encontrado (sheet abierto) | al publicar, la reseña nueva aparece arriba de la lista, sin recargar la página |
| encontrado | toca "Escribir por WhatsApp" o el teléfono | sale de la app (WhatsApp/marcador) | al volver con el botón atrás del navegador, la página sigue en la misma posición de scroll |

## UXF-001 — Evaluar a un profesional y contactarlo

**Objetivo:** que alguien que llegó desde los resultados de búsqueda confirme en segundos si el
profesional le sirve y lo contacte sin dudar. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** llega a `/profesionales/[id]` desde una card de `/buscar` (o un link directo) — sin
haber leído nada más sobre el profesional que lo que la card ya mostraba (foto, nombre, comuna, rating,
precio).

**Criterio de término:** toca "Escribir por WhatsApp" o el botón de llamar — la vista no tiene otra acción
que constituya "terminar bien" (no hay un formulario que enviar ni una compra que confirmar).

**Cómo sabe el usuario dónde está:** el header general (misión 09, sin cambios) más el título de la
pestaña (`{nombre} · {categoría} en {comuna}`, ya implementado). Esta vista no tiene submodos navegables
(rutas) que confundir — es una sola pantalla que crece con el scroll. El "sheet abierto" que aparece en el
Mapa de estados es una capa transitoria sobre el modo encontrado (se abre y cierra sin navegar), no un modo
ni una vista nueva.

### Divergencia antes de converger

Para reorganizar la información (JTBD: confiar rápido, sin depender de que alguien más lo valide — ver
`producto.md`) se generaron tres enfoques, dentro de la restricción ya aceptada en `producto.md` de
conservar el layout de dos columnas en desktop (no reemplazarlo):

- **Enfoque A — identidad y precio bajo la galería, sidebar acotado a contacto.** En desktop, nombre,
  categoría, comuna, precio y descripción viven en la columna de la galería (55%); el sidebar (45%,
  sticky) lleva un resumen de rating, el bloque de contacto y "en Datealo desde". En mobile, el orden de
  scroll es foto → identidad+precio → descripción → reseñas — el botón de contacto no es un paso de este
  orden, es un overlay fijo al fondo de la pantalla, visible desde que se abre la vista. Las reseñas bajan
  a una sección de ancho completo, fuera de ambas columnas.
- **Enfoque B — cambio mínimo: mismo sidebar de hoy, solo sacar las reseñas.** El sidebar sigue
  concentrando avatar, nombre, categoría, rating, descripción, precio y CTA; lo único que se mueve es el
  bloque de reseñas, a una sección propia debajo. Es el cambio con menos superficie, pero dentro del
  sidebar la identidad, el precio y el contacto siguen compitiendo por el mismo espacio angosto — el
  "desorden" que motivó la misión ([C-001](./investigacion.md#c-001)) sobrevive ahí adentro.
- **Enfoque C — overlay de identidad sobre la foto** (estilo tienda online: nombre y categoría
  superpuestos en la esquina inferior de la galería, con un degradado para legibilidad). Libera aún más
  espacio vertical que A, pero las fotos de trabajo de un profesional (herramientas, tableros, cañerías)
  no tienen el control de composición de una foto de producto — un degradado fijo puede quedar ilegible
  sobre una foto clara, y ninguna evidencia de `investigacion.md` pidió este patrón específico (ninguna de
  las dos referencias del dueño de producto lo usa).

**Elegido: A.** Resuelve las tres conclusiones de investigación a la vez
([C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-003](./investigacion.md#c-003)) y es lo que `producto.md` ya definió literalmente en las reglas de
[F-001](./producto.md#f-001) ("nombre, categoría, comuna y precio... se agrupan junto a la galería... no
dentro de la tarjeta de contacto"). B se descarta porque dejaría sin resolver el motivo original de la
misión. C se descarta por riesgo de legibilidad sin control de contenido (fotos de trabajo variables, no
fotos de producto curadas) y por no tener sustento en ninguna referencia aportada.

### Salidas

| Salida                                  | Cómo se ejecuta                          | Qué queda del trabajo                                          |
| ---------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Contacta por WhatsApp o teléfono (bien)  | Toca el CTA correspondiente                | Se registra el contacto (`sendBeacon`, ya implementado); la página sigue intacta si vuelve |
| Deja o cierra la hoja de reseña          | Publica, o cierra sin publicar             | Si publicó, la reseña aparece arriba de la lista sin recargar; si cerró sin publicar, nada cambia |
| Navega a otra parte (buscar, otro perfil) | Toca el header o un link                   | No hay nada que perder — es una vista de solo lectura              |
| Cierra la pestaña o vuelve atrás         | Gesto del navegador                         | Nada que perder                                                    |

### Secuencia principal

| Paso | Acción                                                        | Respuesta del sistema                                                                                     | Información visible |
| ---- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1    | Llega a `/profesionales/[id]`                                  | Si tarda más de 300ms, ve el skeleton con la forma nueva (galería + bloque de identidad agrupado)                | Ninguna real todavía, solo la forma |
| 2    | El servidor responde con los datos del profesional              | Ve la foto, y debajo (mobile) o al lado (desktop) el nombre, categoría, comuna y precio agrupados; el CTA ya visible | Foto, nombre, categoría, comuna, precio, botón de contacto |
| 3    | Sigue bajando (mobile) o mira la columna completa (desktop)     | Ve la descripción que el profesional escribió                                                                    | Descripción |
| 4    | Sigue bajando / mirando                                         | Ve la sección de reseñas, como bloque propio — con reseñas reales o la invitación a dejar la primera             | Reseñas o invitación a dejar la primera |
| 5    | Decide contactar                                                 | Toca "Escribir por WhatsApp" (siempre visible, nunca tapado) — se abre WhatsApp con el mensaje pre-armado        | — |

### Variantes y recuperación

| Condición                                            | Qué cambia                                                                 | Cómo se entiende                                        | Cómo se recupera |
| ------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------- |
| Sin fotos ([CL-001](./producto.md#cl-001))               | El espacio de la galería muestra el avatar o las iniciales, mismo tamaño de bloque | El espacio ocupa lo mismo que una foto, no queda un hueco     | Ninguna — es el estado real del perfil |
| Sin precio orientativo ([CL-002](./producto.md#cl-002))  | La línea de precio no aparece                                                    | El resto del bloque de identidad queda igual                 | Ninguna — es el estado real |
| Sin reseñas ([CL-003](./producto.md#cl-003))             | La sección de reseñas muestra la invitación a dejar la primera                    | Mismo lugar donde irían reseñas reales, mismo ancho de bloque | Puede dejar la primera reseña ahí mismo |
| Descripción muy larga o muy corta ([CL-004](./producto.md#cl-004)) | El bloque de identidad crece o se achica con el texto real            | Sin alto fijo — no corta ni deja espacio vacío                | — |
| Conexión lenta (>300ms)                                  | Skeleton con la forma nueva                                                       | Igual al resto de Datealo                                    | Si pasa de 10s, modo tardando ("Reintentar") |

### Decisiones que no deben quedar implícitas

- El skeleton de carga tiene que reflejar el bloque agrupado (galería + identidad + precio) en vez de
  líneas sueltas del layout viejo — si no, la carga "salta" de una forma a otra cuando llegan los datos.
- El CTA de mobile reserva su propio espacio, independiente del `pb-24` que `general.vue` agrega al
  footer general — ese buffer se pensó para el buscador de la misión 09, no para esta barra
  ([D-003](./producto.md#d-003) de producto.md). El requisito de experiencia es el comportamiento (nunca
  tapado, en cualquier tamaño de pantalla y cualquier largo de contenido de la barra); el mecanismo exacto
  (un buffer propio más generoso, medir el alto real de la barra, u otro) es decisión de `ingenieria.md`.
  Que el CTA tape momentáneamente contenido mientras se scrollea (la foto, la descripción, una reseña) es
  esperado y no es el bug — cualquier barra fija hace eso. Lo que "nunca tapado" prohíbe es que, en reposo
  (scroll agotado), el CTA quede sobre contenido real del footer en vez de sobre el colchón vacío que este
  reserva para ese propósito.
- En desktop, el sidebar sticky (galería + identidad + sidebar, ahora en `grid-row: span 2`) sigue activo
  durante toda la lectura de la descripción y las reseñas, no solo durante la fila superior — ver
  [UX-005](#ux-005) para el mecanismo exacto (CSS Grid, sin JS ni buffer manual).
- La sección de reseñas de ancho completo en desktop usa el mismo ancho máximo que el resto de la página
  (`max-w-5xl`, sin ensancharlo) — no es un cambio de layout de página, solo de dónde vive el bloque
  dentro de ese ancho.
- El resumen de rating en el sidebar de desktop (ícono `Star` + promedio + cantidad) reusa el mismo
  formato que ya existe hoy — no se inventa una segunda forma de mostrar rating en la misma pantalla. El
  nombre que va junto al avatar del sidebar (UX-001) es el mismo dato que ya aparece bajo la galería, no
  un segundo nombre editable ni una fuente de verdad distinta — es una repetición visual, no un campo
  nuevo.
- El breakpoint sigue siendo `lg` (1024px), el mismo que ya usa `[id].vue` — esta misión no agrega un
  breakpoint intermedio.
- Ningún ícono nuevo es un emoji — se mantiene `@lucide/vue` (`MessageCircle`, `Phone`, `Star`), igual que
  hoy.
- Las miniaturas del carrusel llevan alt descriptivo del contenido y la acción ("Ver foto 2: cableado
  nuevo instalado"), no un rótulo genérico de posición ("Miniatura 2") — son controles interactivos que
  cambian la foto activa, no imágenes decorativas (hallazgo de la evaluación heurística contra
  `web-design-guidelines`).
- "En Datealo desde…" vive junto al bloque de contacto: dentro del `sidebar-card` en desktop (debajo del
  CTA), y en mobile después de la sección de reseñas — no es un dato de identidad (no va junto a
  nombre/categoría/precio), es contexto que acompaña la decisión de contactar (ver UX-003, agregada tras
  la evaluación heurística: el primer borrador de este documento no decía dónde vivía, solo el mockup lo
  mostraba).
- El texto "En Datealo desde…" usa el mismo tono que hoy (`text-muted`, ~4.6:1 de contraste), no un tono
  más claro — un token más claro (`text-dimmed`, ~2.6:1) regresionaría el contraste que el texto ya
  cumple en producción (ver UX-004).
- La técnica del mockup para simular el CTA fijo (`position: absolute` dentro de un frame recortado) es
  solo para mostrar dos momentos de scroll en una imagen estática — el mecanismo real sigue siendo
  `position: fixed` respecto al viewport, ya implementado hoy en `[id].vue`.

## Estados por superficie

| Estado                                   | Qué se muestra (texto e información real)                                                                 | Acción disponible |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------- |
| cargando                                       | Skeleton: bloque de foto (`aspect-4/3`) + bloque de identidad agrupado debajo, forma nueva                          | Ninguna |
| encontrado, con foto/precio/reseñas            | "Patricio Tabilo" · "Electricidad · Puerto Varas" · ★ "4,8 · 12 reseñas" · "Desde $15.000" · descripción · 2 reseñas en grid (desktop) o lista (mobile) · "En Datealo desde agosto de 2026" · CTA | Contactar, ver fotos, dejar reseña |
| encontrado, sin foto/precio/reseñas (CL-001 a CL-003) | "Héctor Silva" · avatar de iniciales · "Gasfitería · Ñuñoa" · sin línea de precio · "Sé el primero en contarle a otros cómo te fue con Héctor Silva" + botón "Dejar una reseña" · "En Datealo desde agosto de 2026" | Contactar, dejar la primera reseña |
| tardando (>10s)                                | Sin cambios: "Esto está tardando más de lo normal" + "Reintentar"                                                  | Reintentar |
| no encontrado                                  | Sin cambios: "No encontramos este perfil" + "Buscar profesionales"                                                 | Volver a buscar |

## Mockups

| Mockup                | Cubre    | Estado                                                                                 | Ruta |
| ---------------------- | -------- | --------------------------------------------------------------------------------------- | ------ |
| perfil-profesional     | UXF-001 (V-001) | validado — 7 frames (cargando, encontrado arriba, descripción+reseñas, fondo de página con footer+CTA, caso límite combinado mobile, desktop, caso límite combinado desktop), 2 rondas de evaluación heurística en agente separado (ronda 1: grid de 2 columnas para reseñas múltiples, contraste de "en Datealo desde", touch target del botón "Dejar una reseña", `aria-hidden` en íconos decorativos; ronda 2, con verificación empírica en Chrome real: ancho real de card de reseña corregido en UX-002, descripción del mecanismo de grid corregida en UX-005, alt descriptivo en miniaturas), 2 rondas de revisión directa del dueño de producto (nombre junto al avatar del sidebar, UX-001; sidebar sticky durante las reseñas vía CSS Grid, UX-005) | `./design-mockups/perfil-profesional.html` |

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                                 | Estado    |
| ------------- | ------- | ---------------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | con todo, sin fotos (CL-001), sin precio (CL-002), sin reseñas (CL-003), cargando, tardando (heredado), no encontrado (heredado) | vigente |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — Identidad y precio se agrupan bajo la galería; el sidebar de desktop queda acotado a rating breve + contacto

- **Estado:** aceptada. **Fecha:** 2026-09-03.
- **Sustento:** ver "Divergencia antes de converger" de UXF-001; [C-001](./investigacion.md#c-001),
  [C-002](./investigacion.md#c-002) de investigación; reglas de [F-001](./producto.md#f-001).
- **Alternativas descartadas:** cambio mínimo dejando todo en el sidebar salvo reseñas (no resuelve el
  desorden que motivó la misión); overlay de identidad sobre la foto (riesgo de legibilidad sin control de
  contenido de las fotos, sin sustento en las referencias) — detalle en "Divergencia antes de converger".
- **Decisión y consecuencia:** en desktop, la columna de la galería lleva identidad+precio+descripción; el
  sidebar sticky queda con rating breve + CTA. En mobile, el orden de scroll pasa a ser
  foto → identidad+precio → descripción → reseñas; el CTA es un overlay fijo, no un paso de ese orden.
- **Impacto en producto:** ninguno — es la aplicación literal de las reglas de F-001.

**Revisión (2026-09-03):** la evaluación heurística en agente separado no logró tumbar esta decisión —
intentó cuestionar el sidebar de 45% por verse desproporcionadamente corto junto a la columna de 55%, pero
confirmó que es el mismo patrón que la propia referencia de Airbnb citada en
[E-005](./investigacion.md#e-005) (columna larga + tarjeta lateral corta y sticky), así que sobrevive. Sí
encontró que nadie había verificado ese sidebar en su versión más vacía (sin rating, [CL-003](./producto.md#cl-003))
en desktop — se agregó un séptimo frame al mockup para confirmarlo, sin cambiar la decisión.

**Revisión (2026-09-04):** el dueño de producto observó que el avatar del sidebar quedaba sin nombre al
lado — solo rating y CTA. Se agrega "Patricio Tabilo" junto al avatar, arriba del rating (jerarquía
avatar → nombre → rating, el mismo orden que usan las tarjetas de contacto en general). El motivo de fondo
es propio de Datealo, no solo estético: como el sidebar es sticky (ver [UX-005](#ux-005)), es el único
bloque que sigue en pantalla una vez que el scroll deja atrás el encabezado bajo la galería — sin el
nombre ahí, en ese momento el usuario ve un círculo con iniciales sin poder confirmar a quién está por
contactar. Se aplicó en ambos frames de desktop del mockup, incluida la versión sin rating
([CL-003](./producto.md#cl-003)), donde el nombre queda directo sobre el CTA.

<a id="ux-002"></a>

### UX-002 — Las reseñas viven en una sección de ancho completo, fuera de ambas columnas

- **Estado:** aceptada. **Fecha:** 2026-09-03.
- **Sustento:** [C-003](./investigacion.md#c-003) de investigación; [D-002](./producto.md#d-002) de
  producto.md.
- **Alternativas descartadas:** dejar las reseñas dentro de la columna de identidad, debajo del CTA —
  descartado porque en desktop esa columna mide 55% de ancho, angosto para reseñas con texto largo, y en
  mobile no cambia nada respecto del problema original (siguen compitiendo por el mismo espacio que el
  precio).
- **Decisión y consecuencia:** la sección de reseñas ocupa el ancho completo de la página (mismo
  `max-w-5xl`), debajo de la galería+identidad y del sidebar, en ambos tamaños de pantalla. En desktop, las
  reseñas se muestran en un grid de 2 columnas (cada card ronda 21.5rem de ancho real, medido sobre el
  mockup renderizado — no una sola card angosta flotando en el ancho completo). En mobile siguen apiladas
  en una columna, como hoy.
- **Impacto en producto:** ninguno.

**Revisión (2026-09-03):** la evaluación heurística intentó tumbar esta decisión con el ejemplo verificable
de `producto.md` (12 reseñas): el mockup original solo maqueaba una card de `max-width: 32rem` dentro de un
contenedor de 1024px, dejando la mitad del ancho en blanco y sin decir qué pasa con la reseña 2 en
adelante — la "sección de ancho completo" era retórica si el contenido real no la usaba. La decisión de
"sección propia, fuera de ambas columnas" sobrevive (angostar el texto de cada reseña es correcto para
legibilidad), pero se corrigió agregando el grid de 2 columnas, ya reflejado arriba y en el mockup.

**Revisión (2026-09-04):** una evaluación heurística en agente separado midió el grid ya renderizado en
Chrome (no el CSS a simple vista) y encontró que la cita anterior era falsa contra su propia
implementación: el grid mide 704px reales sobre un contenedor de 1024px, y cada card **344px (21.5rem)**,
no los "~32rem, dentro del rango de 65-75 caracteres" que decía la redacción original — con la tipografía
real (`13px DM Sans`), eso rinde ~50 caracteres por línea. La decisión sobrevive: 50 caracteres sigue
dentro de rangos tipográficos aceptados para texto corto como una reseña (Bringhurst cita 45-75 como rango
utilizable, no solo 65-75 como ideal), así que no se cambió el layout — se corrigió la cifra citada arriba
para que describa lo que el mockup realmente hace.

<a id="ux-003"></a>

### UX-003 — "En Datealo desde…" vive junto al bloque de contacto, no junto a la identidad

- **Estado:** aceptada. **Fecha:** 2026-09-03.
- **Sustento:** hallazgo de la evaluación heurística en agente separado — el primer borrador de este
  documento no decía dónde vivía este dato; solo el mockup lo mostraba (dentro del sidebar en desktop, al
  final en mobile), invisible para quien leyera la prosa.
- **Alternativas descartadas:** agruparlo con nombre/categoría/precio bajo la galería — descartado porque
  no es un dato de identidad del profesional, es contexto de confianza que acompaña la decisión de
  contactar (cuánto tiempo lleva en la plataforma), más cercano al bloque de contacto que al de identidad.
- **Decisión y consecuencia:** el dato vive dentro del `sidebar-card` en desktop (debajo del CTA) y después
  de la sección de reseñas en mobile — mismo lugar que ya lo tenía el mockup, ahora explícito en el
  documento.
- **Impacto en producto:** ninguno.

<a id="ux-004"></a>

### UX-004 — El texto "En Datealo desde…" no cambia de tono respecto de hoy

- **Estado:** aceptada. **Fecha:** 2026-09-03.
- **Sustento:** hallazgo de la evaluación heurística — el mockup usaba `--ui-text-dimmed` (~2,6:1 de
  contraste) donde la producción actual usa `text-datealo-muted`/`#6b7280` (~4,6:1, sobre el mínimo AA de
  4.5:1 para texto normal).
- **Alternativas descartadas:** ninguna real — no había una razón de diseño para aclarar este texto, fue un
  token elegido sin verificar contra el actual.
- **Decisión y consecuencia:** el texto mantiene el mismo tono que hoy (`text-muted` semántico, equivalente
  a `text-datealo-muted`); ingeniería no debe copiar `--ui-text-dimmed` del mockup para este dato.
- **Impacto en producto:** ninguno.

<a id="ux-005"></a>

### UX-005 — El sidebar de desktop sigue sticky durante toda la columna de contenido, reseñas incluidas

- **Estado:** aceptada. **Fecha:** 2026-09-04.
- **Sustento:** [C-004](./investigacion.md#c-004) e ideal de `investigacion.md` ("una tarjeta de contacto
  que se queda fija en pantalla mientras se hace scroll por la descripción **y las reseñas**"), sustentado
  en [E-005](./investigacion.md#e-005) (Airbnb: el sidebar de reserva sigue visible durante toda la
  descripción y las reseñas, se despega solo antes del footer).
- **Alternativas descartadas:** dejar el sidebar sticky solo mientras dura la fila superior (galería +
  identidad + descripción), como quedó en la primera versión del mockup — se descarta porque, al ser las
  reseñas una sección de ancho completo fuera de esa fila ([UX-002](#ux-002)), el sidebar se despega apenas
  termina la descripción y el CTA queda fuera de vista durante toda la lectura de reseñas, contradiciendo
  el ideal ("CTA accesible en cualquier momento del scroll, en cualquier tamaño de pantalla"). Una barra
  de contacto delgada que reaparece al perder de vista el sidebar — se descarta por agregar un elemento de
  interfaz nuevo que la vista no tiene hoy, para resolver algo que CSS puro ya resuelve sin él.
- **Decisión y consecuencia:** el contenedor de dos columnas pasa de `flex` a **CSS Grid**
  (`grid-template-columns: 55fr 45fr`). El sidebar ocupa `grid-row: span 2` + `align-self: start` (el
  `align-self` es necesario: un ítem de grid se estira por default a la altura de su fila, y un `sticky`
  estirado no tiene margen para "pegarse" a nada). La sección de reseñas, con `grid-column: 1 / -1`, cae en
  una fila nueva del mismo grid por auto-placement — no la fila 2 (esa columna ya está ocupada por el
  sidebar, que abarca las filas 1 y 2), sino la fila 3 implícita que el navegador crea solo — sin perder lo
  que ya definió [UX-002](#ux-002). Con esto, el sidebar sigue sticky mientras se lee la descripción y las
  reseñas, y se despega solo, de forma automática, al terminar el grid — sin buffer manual ni JS, porque el
  footer general vive fuera de ese contenedor. Es distinto al mecanismo de mobile ([D-003](./producto.md#d-003)),
  que sí necesita reservar espacio a mano porque ahí el CTA es `fixed` al viewport, no `sticky` a un
  contenedor.
- **Advertencia para ingeniería:** no fijar `grid-template-rows` explícito pensando que "faltan filas" —
  el auto-placement ya resuelve esto solo, y forzar un valor explícito puede romper el sticky. Comportamiento
  verificado con scroll real en Chrome (no solo lectura del CSS): el sidebar permanece `sticky` durante toda
  la lectura de reseñas y se despega recién cerca del footer, tal como promete esta decisión.
- **Impacto en producto:** ninguno — es la aplicación literal de la capacidad "CTA de contacto siempre
  accesible y nunca tapado" que `investigacion.md` ya listaba para "cualquier tamaño de pantalla".

## Preguntas

Ninguna bloquea UXF-001 tal como queda definido acá — el mecanismo exacto del CTA fijo (ver "Decisiones
que no deben quedar implícitas") es una decisión de ingeniería, no una duda de experiencia.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de experiencia |
