# Misión 15: múltiples comunas por profesional — Experiencia

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-07

**Última actualización:** 2026-09-07

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: un profesional marca sus comunas en un sheet que no cierra hasta confirmar, y esa lista completa se ve tal cual en su perfil público

Un solo componente nuevo — un bottom sheet con lista de comunas y checkboxes — resuelve las dos entradas
del flujo (registro y edición de perfil). El profesional marca todas las comunas donde atiende sin que la
lista se cierre en cada toque, ve un contador permanente de cuántas lleva marcadas, y confirma con "Listo".
Esa misma lista completa, sin resumir ni truncar, es lo que ve cualquiera que visite su perfil público — la
card de resultados de búsqueda no cambia, porque nunca mostró más de una comuna: sigue mostrando solo la
que produjo la coincidencia de esa búsqueda puntual.

- **Funcionalidades cubiertas:** F-001.
- **Pendiente bloqueante:** ninguna. La evaluación heurística en contexto separado que exige el Carril Full
  Spec (`ui-ux-pro-max`, `web-design-guidelines`, `frontend-design`) ya corrió — sin hallazgos de enfoque,
  con tres hallazgos de ejecución (altura táctil del botón "Listo", `aria-live` del contador, retorno de
  foco al cerrar) ya incorporados arriba. El barrido de copy contra `ux-writing` también corrió, con dos
  ajustes aplicados (el buscador del sheet reusa el placeholder de `ComunaSelect`; el contador del pie
  concuerda en número). La verificación de volumen alto de comunas que quedaba pendiente en Cobertura ya se
  hizo con un caso sintético (Camila Reyes, 6 comunas) y encontró una inconsistencia real que corrigió
  UX-004: el perfil público no trunca, pero el campo compacto de registro y la fila de perfil sí, con
  elipsis, porque son controles de una sola línea.

## Vistas

- **V-001 — Selector de comunas** · móvil + desktop · resuelve F-001 · flujos UXF-001 · nuevo componente
  - modo **lista** — catálogo completo de comunas activas, orden alfabético, cada fila con checkbox; las
    ya marcadas llegan premarcadas
  - modo **buscando** — el usuario escribió en el campo de búsqueda del sheet; la lista se filtra en vivo,
    sin perder las marcas que quedan fuera del filtro
  - modo **sin resultados** — el término no matchea ninguna comuna del catálogo
  - modo **cargando** — el catálogo de comunas todavía no llegó
  - modo **error** — la carga del catálogo falló

- **V-002 — Registro de profesional** (existente, `app/pages/profesional/registro.vue`) · móvil ·
  resuelve F-001 · flujos UXF-001 · el campo "Tu comuna" pasa a "Tus comunas" y abre V-001 en vez de un
  select de valor único
  - modo **campo vacío** — ninguna comuna marcada todavía (estado inicial de un registro nuevo)
  - modo **campo con selección** — una o más comunas marcadas, listadas en el propio campo en una sola
    línea; si no caben todas, el texto trunca con elipsis (ver UX-004)

- **V-003 — Perfil editable** (existente, `app/pages/profesional/perfil.vue`) · móvil · resuelve F-001 ·
  flujos UXF-001 · la fila "Comuna" pasa a "Comunas" y abre V-001 en vez del slot de edición en línea que
  usan hoy Nombre, Categoría y Contacto
  - modo **fila con selección** — siempre tiene al menos una comuna (D-003 garantiza que ningún
    profesional migrado llega en cero); no existe un modo "vacía" para esta vista. Igual que en registro,
    el valor trunca con elipsis en una sola línea si no caben todas las comunas (ver UX-004)

- **V-004 — Perfil público de profesional** (existente, `app/pages/profesionales/[id].vue`) · móvil +
  desktop · resuelve F-001 · sin flujo ni modo nuevo — cambia el contenido del subtítulo y del título SEO,
  ver UX-004

- **V-005 — Card de resultados de búsqueda** (existente, `app/components/search/SearchResultCard.vue`) ·
  móvil + desktop · resuelve F-001 · sin flujo ni modo nuevo — confirma que el contenido no cambia, ver
  UX-005

## Mapa de estados

| Desde                                             | Acción                                          | Queda en                                          | Qué pasa con el trabajo                                                                 |
| -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| V-002 campo vacío, o V-002/V-003 con selección     | toca el campo o la fila                          | V-001 modo lista                                    | lo ya marcado llega premarcado y visible sin scrollear                                    |
| V-001 modo lista                                   | escribe en el buscador del sheet                 | V-001 modo buscando (o sin resultados)              | lo marcado se conserva aunque el ítem salga del filtro                                    |
| V-001 modo buscando                                | borra el término de búsqueda                     | V-001 modo lista                                    | vuelve a mostrar el catálogo completo, sin perder marcas                                  |
| V-001 (lista o buscando)                           | toca una fila (marca o desmarca)                 | mismo modo                                          | el contador del pie se actualiza al instante; nada se guarda todavía                      |
| V-001                                               | toca "Listo" con 1+ comunas marcadas             | V-002 campo con selección / V-003 fila con selección | registro: la selección queda en el estado local del formulario. Perfil: dispara el guardado inmediato del campo |
| V-001                                               | cierra el sheet sin tocar "Listo" (toca fuera, swipe, Esc) | V-002 / V-003, exactamente como estaban antes de abrir | se descarta cualquier marca o desmarca hecha en esta apertura                             |
| V-001 modo error                                    | toca "Reintentar"                                | V-001 modo cargando → lista                          | —                                                                                          |

## UXF-001 — Declarar o editar las comunas donde atiendo

**Objetivo:** el profesional marca todas las comunas donde atiende, sea al completar su registro por
primera vez o al editar un perfil ya publicado. **Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** dos entradas distintas al mismo selector (V-001) — el campo "Tus comunas" del
formulario de registro (V-002), antes de publicar el perfil; o la fila "Comunas" del perfil editable
(V-003), en cualquier momento después de publicado.

**Criterio de término:** el sheet se cierra con "Listo" y el campo o la fila muestra el listado de comunas
marcadas, en el mismo orden alfabético del catálogo, unidas con coma y "y" antes de la última — en una sola
línea, truncado con elipsis si no caben todas (ver UX-004).

**Cómo sabe el usuario dónde está:** el pie fijo del sheet siempre muestra cuántas comunas lleva marcadas
("3 comunas marcadas") — visible sin scrollear la lista, en todos los modos salvo carga y error.

### Salidas

| Salida                | Cómo se ejecuta                                | Qué queda del trabajo                                                              |
| ---------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Confirma               | toca "Listo" (habilitado desde 1 comuna marcada) | registro: selección local, se envía junto al resto al publicar. Perfil: se guarda de inmediato |
| Descarta                | toca fuera del sheet, swipe hacia abajo, o Esc   | nada, ni a medias — vuelve exactamente a lo que había antes de abrir el sheet          |

### Secuencia principal

| Paso | Acción                                                  | Respuesta del sistema                                                                                                        | Información visible                                                     |
| ---- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 1    | Toca el campo "Tus comunas" (registro) o la fila "Comunas" (perfil) | Se abre el sheet desde abajo con el catálogo completo en orden alfabético; las comunas ya marcadas llegan con el checkbox activado | Título "Tus comunas", buscador, lista de comunas, pie con el contador       |
| 2    | Escribe en el buscador (ej. "frut")                      | La lista se filtra en vivo                                                                                                        | Solo las comunas cuyo nombre contiene el término                            |
| 3    | Toca una comuna sin marcar                                | El checkbox se marca; el contador del pie sube en uno                                                                              | El checkbox pasa a marcado, el sheet sigue abierto                          |
| 4    | Toca una comuna ya marcada                                | El checkbox se desmarca; el contador baja en uno                                                                                    | Si el conteo llega a cero, "Listo" se deshabilita (ver Variantes)            |
| 5    | Toca "Listo"                                              | El sheet se cierra; el campo o la fila muestra el listado actualizado                                                              | Ej. "Llanquihue, Frutillar y Puerto Varas" en el campo o la fila             |

### Variantes y recuperación

| Condición                                        | Qué cambia                                             | Cómo se entiende                                                        | Cómo se recupera                                              |
| -------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Cero comunas marcadas                              | "Listo" queda deshabilitado                                | "Marca al menos una comuna" bajo el pie, mismo tratamiento que el aviso de registro ("Completa los 4 campos para continuar") | Marca cualquier comuna para habilitar "Listo"                       |
| El término de búsqueda no matchea ninguna comuna   | La lista se vacía                                          | 'No encontramos "frut"' (mismo texto que ya usa `CatalogSelect`)             | Borra o corrige el término                                          |
| El catálogo todavía no cargó                       | Skeleton de 3 filas en vez de la lista                     | Igual al skeleton que ya usa `CatalogSelect`                                 | —                                                                    |
| La carga del catálogo falló                        | El sheet muestra el error en vez de la lista               | "No pudimos cargar las comunas." + botón "Reintentar"                        | Toca "Reintentar"                                                    |
| En perfil, el guardado falla tras confirmar        | La fila vuelve a mostrar el listado anterior al intento     | "No se pudo guardar, toca para reintentar" bajo la fila, igual que las otras filas del perfil | Toca la fila de nuevo: reabre el sheet con la selección que había intentado guardar |

### Decisiones que no deben quedar implícitas

- Cerrar el sheet sin tocar "Listo" siempre descarta los cambios de esa apertura (marcas y desmarcas por
  igual) — nunca autoguarda.
- En perfil, confirmar "Listo" dispara el guardado igual que cualquier otro campo de `ProfessionalCatalogRow`:
  optimista, con el mismo texto de error y reintento si falla.
- En registro, confirmar "Listo" no dispara ninguna llamada al servidor — la selección viaja junto con el
  resto del formulario recién al tocar "Publicar mi perfil".
- Un profesional migrado por D-003 ve su comuna actual ya marcada la primera vez que abre el sheet — nunca
  arranca en cero para alguien que ya tenía una comuna antes de esta entrega.
- El botón "Listo" y cada fila de comuna miden al menos 44×44px de área táctil, el mínimo que ya sigue el
  resto de la app (ver "Patrones de interacción que ya están decididos" del skill `discovery-ux`) — el
  mockup usa `py-2.5` como aproximación visual, pero la implementación debe verificar el alto real contra
  ese mínimo, no copiar el padding tal cual.
- El contador del pie ("3 comunas marcadas") y el aviso "Marca al menos una comuna" son contenido dinámico
  que cambia sin recargar la pantalla: ambos llevan `aria-live="polite"`, igual que ya lo exige el patrón de
  errores de campo de `discovery-ux` para el resto del perfil.
- Al cerrar el sheet (con "Listo" o descartando), el foco vuelve al campo o la fila que lo abrió — nunca se
  queda huérfano en un elemento ya desmontado.
- El buscador dentro del sheet reusa el placeholder que ya usa `ComunaSelect` en toda la app ("¿Qué comuna
  buscas?"), en vez de un texto nuevo — es la misma acción de buscar una comuna, así que lleva el mismo
  texto.
- El contador del pie concuerda en número: "1 comuna marcada" en singular, "3 comunas marcadas" en plural —
  el caso de una sola comuna marcada no es un borde raro, es el estado más común al empezar a declarar.
- CL-001 (marcar la misma comuna dos veces) queda resuelto por cómo está armada la lista, no por una regla
  aparte: cada comuna es un único checkbox, así que no existe una acción que la marque "dos veces" — tocarla
  de nuevo la desmarca. No hace falta un flujo especial para este caso límite.

## Estados por superficie

**V-001 — sheet**

| Estado                            | Qué se muestra                                             | Acción disponible          |
| ----------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| lista (inicial)                     | catálogo completo, orden alfabético, ya marcadas con check     | buscar, marcar o desmarcar, Listo |
| sin resultados de búsqueda          | 'No encontramos "{término}"'                                    | borrar el término               |
| cargando                            | 3 líneas skeleton, igual al patrón ya usado en `CatalogSelect` | ninguna                         |
| error                                | "No pudimos cargar las comunas." + botón "Reintentar"          | Reintentar                      |

**V-004 — perfil público, subtítulo**

| Estado                | Qué se muestra                                                                 | Acción disponible |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| con comunas declaradas  | "{categoría} · {comuna1}, {comuna2} y {comuna3}" — todas, orden alfabético, sin truncar | ninguna, es contenido   |
| con muchas comunas declaradas | mismo formato, sin truncar, en varias líneas — verificado con el caso sintético de Camila Reyes (6 comunas de Santiago Oriente, ~65 caracteres de listado): ocupa dos líneas dentro del `<p>` existente, sin romper el layout a 390px | ninguna, es contenido |

**V-002/V-003 — campo de registro y fila de perfil**

| Estado                | Qué se muestra                                                                 | Acción disponible |
| ----------------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| con pocas comunas       | listado completo en una sola línea (ej. "Llanquihue, Frutillar y Puerto Varas")     | tocar para reabrir el sheet |
| con muchas comunas      | listado truncado con elipsis en una sola línea (ej. "La Reina, Las Condes, Lo Barnechea…") — el caso de Camila con sus 6 comunas no cabe entero; tocar el campo reabre el sheet con las 6 ya marcadas | tocar para reabrir el sheet |

**V-005 — card de resultados**

| Estado                    | Qué se muestra                                                                     | Acción disponible |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---------------------- |
| coincidencia exacta          | la comuna buscada, texto normal — sin cambio respecto de hoy                             | ninguna, es contenido   |
| coincidencia por vecina      | la comuna declarada del profesional que produjo el match, en negrita — sin cambio respecto de hoy | ninguna, es contenido   |

## Mockups

| Mockup             | Cubre            | Estado      | Ruta                                        |
| -------------------- | ------------------ | ------------- | ---------------------------------------------- |
| selector-comunas    | UXF-001, V-001    | validado     | `./design-mockups/selector-comunas.html`       |
| registro-perfil     | UXF-001, V-002, V-003 | validado    | `./design-mockups/registro-perfil.html`        |
| perfil-publico      | UX-004, V-004     | validado     | `./design-mockups/perfil-publico.html`         |
| card-resultados     | UX-005, V-005     | validado     | `./design-mockups/card-resultados.html`        |

## Cobertura

| Funcionalidad | Flujo    | Estados cubiertos                                             | Estado    |
| ------------- | -------- | ---------------------------------------------------------------- | --------- |
| F-001         | UXF-001  | principal, sin resultados de búsqueda, carga, error, cero marcadas, volumen alto de comunas (verificado con el caso sintético de Camila Reyes: V-004 en dos líneas sin truncar, V-002/V-003 truncado con elipsis) | pendiente |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El selector múltiple se construye como bottom sheet con lista de checkboxes propia, no como el combobox `multiple` de Nuxt UI

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** F-001, y el comentario en `app/components/CatalogSelect.vue:1-9`, que documenta que
  `UInputMenu` (el combobox de Nuxt UI) falló en pruebas reales de browser al combinar items controlados
  con la selección interna de Reka UI.
- **Alternativas descartadas:** `USelectMenu` con `multiple: true` — se descarta porque, revisando
  `node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue`, su modo múltiple sigue construido sobre
  los mismos primitivos de Reka UI (`ComboboxRoot`/`ComboboxInput`/`ComboboxItem`) que ya causaron el bug
  documentado en `CatalogSelect` — adoptarlo arriesgaría repetir el mismo problema en un flujo más crítico
  (declarar dónde trabaja un profesional). Extender el propio `ComunaSelect` (campo de texto + lista
  flotante) a modo múltiple sin cerrar al elegir — se descarta porque un dropdown flotante con checkboxes
  sobre un catálogo de 346 filas es difícil de operar con una mano en 390px sin tapar el resto del
  formulario, y compite mal con el teclado abierto.
- **Decisión y consecuencia:** el selector se construye sobre `UDrawer` (primitivo distinto, sobre
  vaul-vue, sin relación con los combobox de Reka UI) con una lista de checkboxes hecha a mano, reusando el
  mismo patrón de filtro por texto ya probado en `CatalogSelect` (`searchTerm` + `normalize` +
  `matchesSearch`) pero sin el `<input>` de combobox — solo un campo de búsqueda simple. Habilita reusar
  código ya validado en producción; limita: es un componente nuevo, no una extensión directa de
  `ComunaSelect`.
- **Impacto en producto:** ninguno.

<a id="ux-002"></a>

### UX-002 — El pie del sheet siempre muestra el conteo de comunas marcadas, y "Listo" se deshabilita en cero

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** [CL-004](./producto.md#f-001) — no se puede quedar sin ninguna comuna declarada.
- **Alternativas descartadas:** permitir confirmar con cero marcadas y mostrar el error de guardado
  después (reactivo) — se descarta porque el registro ya bloquea el submit con un aviso visible en vez de
  dejar fallar un guardado evitable ("Completa los 4 campos para continuar"), y repetir ese patrón es más
  consistente que introducir un error nuevo para el mismo caso.
- **Decisión y consecuencia:** "Listo" queda deshabilitado mientras el conteo sea cero, con el texto "Marca
  al menos una comuna" debajo, mismo tratamiento visual que el aviso de registro. Evita que CL-004 dependa
  de un guardado fallido para hacerse visible.
- **Impacto en producto:** ninguno, es la misma regla de CL-004 aplicada de forma preventiva en vez de
  reactiva.

<a id="ux-003"></a>

### UX-003 — Dentro del sheet, la selección previa se conserva marcada aunque el filtro de búsqueda la oculte

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** F-001 — declarar una comuna nueva no debería perder una ya marcada por estar buscando otra.
- **Alternativas descartadas:** limpiar la búsqueda automáticamente al marcar una opción, como hace
  `CatalogSelect` en modo único (que cierra y resetea) — se descarta porque en single-select cerrar tiene
  sentido (la tarea terminó), pero en multi-select cerrar el sheet en la primera marca contradice el
  propósito de dejarlo abierto para seguir eligiendo.
- **Decisión y consecuencia:** el estado de selección vive independiente del término de búsqueda —
  filtrar nunca desmarca nada, solo cambia qué filas son visibles.
- **Impacto en producto:** ninguno.

<a id="ux-004"></a>

### UX-004 — El perfil público y el título SEO listan todas las comunas sin truncar; el campo compacto de registro y perfil sí trunca, porque es un control de una línea

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** [D-002](./producto.md#d-002) (sin tope numérico) y [D-001](./producto.md#d-001) (sin
  jerarquía entre comunas). Verificación con datos sintéticos: Camila Reyes, electricista de Santiago
  Oriente con 6 comunas (La Reina, Las Condes, Lo Barnechea, Ñuñoa, Providencia y Vitacura) — el caso de
  volumen alto que la fila pendiente de Cobertura pedía confirmar.
- **Alternativas descartadas (para el perfil público y el título SEO):** truncar a las primeras 2 con "y N
  más" expandible — se descarta porque el subtítulo del perfil público (`app/pages/profesionales/[id].vue:74`)
  ya no trunca hoy (sin `class="truncate"`, deja que el texto haga wrap), y con el caso de Camila (~65
  caracteres solo de comunas) el texto ocupa dos líneas dentro del mismo `<p>` sin romper el layout — agregar
  una mecánica de expandir/colapsar sería una pieza de interacción nueva que la verificación con datos
  sintéticos no encontró necesaria. Mostrar solo el conteo ("Atiende en 6 comunas") con el detalle en otra
  parte del perfil — se descarta porque esconde justo el dato que alguien evaluando cobertura necesita ver
  de inmediato.
- **Decisión y consecuencia (perfil público y título SEO):** el subtítulo del perfil público y el `<title>`
  listan todas las comunas activas declaradas, en el mismo orden alfabético que ya usa el catálogo
  (`server/utils/comunas.ts`, `orderBy(asc(comunas.nombre))`), unidas con coma y "y" antes de la última (o
  "e" si la última empieza con "i"/"hi", regla del español que `Intl.ListFormat('es-CL', { type:
  'conjunction' })` ya resuelve sin reglas a mano) — sin truncar, porque ambos son texto en prosa sin límite
  de una línea.
- **Decisión y consecuencia (campo de registro y fila de perfil):** acá el criterio es distinto, y la
  verificación con el caso de Camila mostró por qué: el campo "Tus comunas" y la fila "Comunas" son
  controles compactos de una sola línea, con el mismo alto que el resto de los campos del formulario
  (`Tu nombre`, `Tu categoría`, `Tu contacto`) — dejar que crezcan en alto para no truncar rompería esa
  consistencia visual, y el listado completo de 6 comunas de Camila no cabe en una línea. Estos dos lugares
  sí truncan, con `text-overflow: ellipsis` en una sola línea, igual que cualquier `<select>` nativo con una
  opción larga. No es una regresión respecto de "sin truncar": tocar el campo o la fila siempre reabre el
  sheet con la selección completa ya marcada, así que nada se pierde, solo se resume en el lugar donde
  resumir no cuesta nada.
- **Impacto en producto:** ninguno.
- **Reapertura:** si aparece evidencia de que el corte por elipsis en el campo compacto confunde a
  profesionales sobre qué llevan marcado (por ejemplo, si abandonan el formulario creyendo que guardaron
  menos comunas de las que realmente marcaron).

<a id="ux-005"></a>

### UX-005 — La card de resultados y el `matchType` no cambian: siguen mostrando solo la comuna que produjo la coincidencia

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** F-001 ("No incluye") y [CL-003](./producto.md#f-001) — el fallback de comunas vecinas
  sigue operando igual.
- **Alternativas descartadas:** mostrar todas las comunas declaradas en la card — es la capacidad que
  `producto.md` deja explícitamente postergada por sobrecargar la card (ver su sección "Fuera de alcance");
  no se retoma acá porque nada de esta misión exige mostrar más de una comuna en un resultado que ya
  responde a una comuna concreta buscada.
- **Decisión y consecuencia:** `SearchResultProfessional.comunaNombre` sigue siendo un único string, no una
  lista — la comuna buscada si la coincidencia fue exacta, o la comuna declarada del profesional que
  resultó vecina de la buscada si fue ese el camino, exactamente el mismo dato que muestra hoy.
  `SearchResultCard.vue` no cambia. Lo que sí cambia es cómo `server/utils/search.ts` resuelve ese valor:
  hoy lo lee de una columna única (`professionals.comunaCodigo`); con la relación profesional↔comuna,
  tiene que resolver cuál de las comunas declaradas fue la que produjo el match — el cómo es de
  `ingenieria.md`, esta decisión solo fija qué debe verse.
- **Impacto en producto:** ninguno — confirma la nota "No incluye" de F-001.
- **Reapertura:** si `producto.md` decide en el futuro que la card sí debe reflejar más de una comuna.

<a id="ux-006"></a>

### UX-006 — El sheet reemplaza la edición en línea que usa hoy `ProfessionalCatalogRow` para la fila "Comunas"

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Sustento:** F-001 aplicado a V-003 (perfil editable).
- **Alternativas descartadas:** mantener el slot `#select` en línea (`w-40`) que usan Nombre, Categoría y
  Contacto hoy — se descarta porque ese ancho fijo alcanza para un valor único, no para un catálogo
  filtrable con selección múltiple y su propio pie de confirmación.
- **Decisión y consecuencia:** tocar la fila "Comunas" abre el mismo sheet que en registro, en vez de
  intercambiar a un slot en línea. El resto de las filas (Nombre, Categoría, Contacto) no cambia.
- **Impacto en producto:** ninguno.

## Preguntas

No queda ninguna pregunta abierta que bloquee el diseño. La evaluación heurística del Carril Full Spec y el
barrido de copy contra `ux-writing` ya corrieron (ver "Decisión de experiencia" arriba); sus hallazgos de
ejecución quedaron incorporados en el propio documento.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | —                                |
