# Misión: layout general (navbar, footer, TOS) — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-03

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

<!--
Fuente de verdad para flujos, estados, contenido e interacción. No redefine reglas de producto: si el
diseño descubre una regla nueva o invalida una, abre o actualiza una decisión en producto.md.
-->

## Decisión de experiencia: la navegación se resuelve con 3 flujos cruzados, no con vistas nuevas

El header, el buscador compacto y el footer no son destinos propios — envuelven vistas que pertenecen a
otras misiones (la landing, `/buscar`, el perfil público). Por eso esta experiencia no crea vistas nuevas
para ellos: los documenta como flujos que cruzan cualquier pantalla (UXF-001 a UXF-003) y como una tabla de
estados por superficie. Las únicas vistas nuevas de verdad son las dos páginas legales, que sí son
destinos.

El modelo de interacción (acordeón a pantalla completa en mobile, panel flotante en desktop, patrón de
profundidad para el header) ya se validó con el dueño de producto contra capturas reales de Airbnb durante
`producto.md` — la divergencia real (campos inline vs. acordeón vs. secuencial; logo siempre visible vs.
flecha que lo reemplaza; sesión invisible vs. con menú completo) ya ocurrió ahí, con alternativas
descartadas y su porqué (ver D-001, D-005, D-006, D-007 de `producto.md`). Esta experiencia no repite esa
exploración — la traduce a secuencias verificables.

- **Funcionalidades cubiertas:** F-001, F-002, F-003, F-004.
- **Pendiente bloqueante:** ninguna.

Este documento pasó por una evaluación heurística en un agente sin memoria de su redacción (`ui-ux-pro-max`,
`web-design-guidelines`, `frontend-design`, `ux-writing`, todos invocados de verdad). Encontró dos
hallazgos de enfoque, ambos resueltos: el footer no tenía dos diseños distintos como pedía la versión
original de [D-002](./producto.md#d-002) — se revisó esa decisión, ver [UX-004](#ux-004); y el header
"solo flecha" del perfil no orientaba a quien entra sin haber visto Datealo antes — se agregó el texto
"Volver", ver [UX-003](#ux-003). Los hallazgos de ejecución (íconos con emoji, contraste, touch targets,
placeholders, foco de teclado, un em dash colado en el copy real de Términos/Privacidad) también se
corrigieron en los mockups y en `contenido/`.

## Vistas

- **V-001 — Términos y Condiciones** · móvil / desktop · resuelve F-004 · sin flujo crítico propio (página
  de lectura)
  - modo **único** — contenido estático, el texto ya aprobado en
    [`contenido/terminos-y-condiciones.md`](./contenido/terminos-y-condiciones.md)
- **V-002 — Política de Privacidad** · móvil / desktop · resuelve F-004 · sin flujo crítico propio
  - modo **único** — contenido estático, el texto ya aprobado en
    [`contenido/politica-privacidad.md`](./contenido/politica-privacidad.md)

El header, el buscador compacto y el footer modifican vistas de otras misiones (landing, `/buscar`,
perfil público) — no se listan acá como vistas nuevas. Su comportamiento vive en los flujos de abajo y en
"Estados por superficie".

## Mapa de estados

| Desde                         | Acción                                      | Queda en                        | Qué pasa con el trabajo |
| ------------------------------ | -------------------------------------------- | -------------------------------- | ------------------------- |
| header landing (antes de scroll) | hace scroll pasado el hero                | header landing (tras scroll)     | ninguno pendiente |
| header landing (tras scroll)  | scroll hacia arriba, vuelve a ver el hero    | header landing (antes de scroll) | ninguno pendiente |
| cualquier header con buscador | toca el buscador compacto                    | panel abierto · categoría        | ninguno |
| panel abierto · categoría     | toca una categoría                           | panel abierto · comuna           | categoría queda elegida |
| panel abierto · comuna        | toca una comuna (escrita o de la lista de frecuentes) | cerrado, navega a `/buscar` | búsqueda se ejecuta con ambos filtros |
| panel abierto (cualquier campo) | toca cerrar (X) o fuera del panel (desktop) | cerrado, sin navegar             | conserva lo que ya estaba elegido antes de abrir; descarta lo tocado en esta apertura si no se confirmó |
| header `/buscar` (flecha)     | toca la flecha                               | landing, antes de scroll         | los filtros elegidos no se conservan — es un nivel más arriba |
| header perfil (flecha)        | toca la flecha                               | `/buscar`, con el resumen previo | categoría y comuna elegidas antes de entrar al perfil se conservan |

## UXF-001 — Buscar desde cualquier pantalla

**Objetivo:** encontrar profesionales de una categoría en una comuna, desde cualquier pantalla, sin pelear
con el teclado en mobile. **Contrato:** [F-002](./producto.md#f-002).

**Punto de entrada:** cualquier pantalla fuera de la landing-antes-de-scroll (el header muestra el
buscador compacto o su resumen); o la landing tras hacer scroll pasado el hero.

**Criterio de término:** llega a `/buscar` con categoría (y comuna, si la eligió) aplicada, viendo
resultados o el estado vacío correspondiente.

**Cómo sabe el usuario dónde está:** el buscador compacto cerrado muestra la categoría/comuna ya elegidas
como resumen; dentro del panel abierto, el campo activo aparece expandido y resaltado, con su propia lista
de opciones (categorías, o comunas frecuentes) inmediatamente debajo — nunca con el otro campo interpuesto
entre el campo activo y su lista. El campo ya resuelto queda colapsado arriba, como resumen; el que todavía
no corresponde llenar queda colapsado más abajo, después de la lista.

### Salidas

| Salida                        | Cómo se ejecuta                                          | Qué queda del trabajo |
| ------------------------------- | ----------------------------------------------------------- | ------------------------ |
| Busca con categoría y comuna   | toca una comuna (escrita o de la lista de frecuentes) tras elegir categoría | navega a `/buscar` con ambos filtros aplicados |
| Cierra sin buscar              | toca la X (mobile) o hace click fuera del panel (desktop) | nada se pierde — lo que se haya elegido (recién o de antes) sigue en el resumen ([UX-002](#ux-002)) |

### Secuencia principal

| Paso | Acción                                              | Respuesta del sistema                                                        | Información visible |
| ---- | ------------------------------------------------------ | -------------------------------------------------------------------------------- | ---------------------- |
| 1    | Toca el buscador compacto (botón en mobile, campo en desktop) | Se abre el panel — hoja completa en mobile, panel flotante debajo en desktop | Título "¿Qué necesitas?" (mobile); campo "Categoría" expandido primero |
| 2    | Ve la lista de categorías                            | —                                                                                | Eyebrow "Categorías" + las 8 categorías como filas tocables, con su ícono |
| 3    | Toca una categoría                                    | El campo categoría queda con esa selección; el campo "Comuna" se expande automáticamente | Título "¿Dónde?" (mobile); comuna: buscador de texto + lista corta de comunas frecuentes |
| 4    | Escribe para filtrar (opcional) y toca una comuna — de las frecuentes o de los resultados filtrados | El campo comuna queda con esa selección y navega directo a `/buscar` con ambos filtros — igual que categoría, sin pedir un tap aparte | Resultados, o el estado vacío correspondiente |

### Variantes y recuperación

| Condición                                              | Qué cambia                                       | Cómo se entiende                                                          | Cómo se recupera |
| --------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------- |
| Categoría elegida, comuna todavía vacía                 | El botón "Buscar" permanece deshabilitado — `/api/search` exige ambas ([C-016](./investigacion.md#c-016)) | El botón se ve atenuado/sin resaltar, no clickeable | Elige una comuna (escrita o de la lista de frecuentes) — el mismo tap confirma y navega, sin paso aparte |
| Ya había categoría/comuna elegidas (viene de `/buscar`) | El panel abre con esos valores ya cargados, no vacío | Los campos muestran el valor ya elegido, no un placeholder                   | Puede cambiarlos igual que si empezara de cero |
| Cambia de categoría con una comuna ya elegida            | El campo comuna se mantiene, pero su valor previo no queda resaltado en la lista | El botón "Buscar" ya está habilitado apenas se elige la nueva categoría | Toca "Buscar" para confirmar esa misma comuna sin tener que volver a encontrarla en la lista |

### Decisiones que no deben quedar implícitas

- Cerrar el panel sin confirmar no borra una selección previa que ya existía antes de abrirlo — solo
  descarta lo tocado en esa apertura.
- El botón "Buscar" en mobile queda fijo abajo (zona de pulgar) durante todo el flujo. Elegir una comuna
  ya navega directo — el botón queda como respaldo manual para cuando se cambia de categoría y se quiere
  conservar la comuna que ya estaba elegida, sin tener que volver a tocarla en la lista.
- Cuando el teclado virtual está abierto (campo de texto de comuna enfocado), el botón "Buscar" fijo tiene
  que seguir visible por encima del teclado, no quedar tapado detrás — es el momento en que más se necesita
  (justo después de escribir la comuna). Una evaluación heurística lo marcó como un caso no cubierto; la
  forma concreta de lograrlo (unidades de viewport dinámicas, ajustar el layout al abrir el teclado) es
  detalle de implementación para `ingenieria.md`, no de esta capa.
- Nunca conviven el buscador editable y su resumen compacto en la misma pantalla (ya fijado en
  [F-002](./producto.md#f-002)).

## UXF-002 — Volver desde una pantalla profunda

**Objetivo:** volver a donde estaba (resultados o landing) sin perder lo que ya había elegido.
**Contrato:** [F-001](./producto.md#f-001).

**Punto de entrada:** cualquier página que muestre flecha atrás en vez de logo (`/buscar`,
`/profesionales/[id]`, `/profesional/*`).

**Criterio de término:** llega a la pantalla anterior con el estado (filtros) conservado cuando
corresponde.

**Cómo sabe el usuario dónde está:** el botón de volver está en la misma posición (arriba a la izquierda)
en toda pantalla que lo tiene. En desktop lleva ícono + el texto "Volver" (hay espacio); en mobile es solo
el ícono — con dos íconos posibles (volver y avatar) más el buscador, 390px no alcanza para texto también.
En `/buscar`, el resumen de búsqueda junto al botón confirma qué está viendo, en ambos tamaños.

### Salidas

| Salida                                          | Cómo se ejecuta                          | Qué queda del trabajo |
| --------------------------------------------------- | -------------------------------------------- | ------------------------ |
| Vuelve desde el perfil a resultados             | toca el botón de volver en `/profesionales/[id]` | `/buscar` con los mismos filtros que tenía antes de entrar al perfil |
| Vuelve desde `/buscar` a la landing             | toca el botón de volver en `/buscar`      | landing en su estado inicial (arriba) — los filtros no se conservan, es un nivel más arriba |
| Usa el botón atrás del navegador en vez del botón de volver | gesto del navegador, no de la app | mismo resultado — la URL ya refleja los filtros (misión 06) |

### Secuencia principal

| Paso | Acción                                       | Respuesta del sistema      | Información visible |
| ---- | ------------------------------------------------ | ------------------------------ | ---------------------- |
| 1    | Está en `/profesionales/[id]`, toca el botón de volver | Navega a `/buscar`   | Los resultados que tenía antes de entrar al perfil |

### Variantes y recuperación

| Condición                                             | Qué cambia                     | Cómo se entiende                        | Cómo se recupera |
| ---------------------------------------------------------| --------------------------------- | ------------------------------------------- | ------------------- |
| Llegó al perfil por un link directo, sin pasar por `/buscar` | El botón "Volver" igual existe y funciona | Vuelve a `/buscar` sin filtros — no había ninguno previo | Puede buscar desde ahí normalmente |

### Decisiones que no deben quedar implícitas

- El botón "Volver" nunca desaparece ni queda deshabilitado, incluso en estados de carga lenta o error
  ([CL-001 de producto.md](./producto.md#f-001)).
- El botón "Volver" siempre lleva un `aria-label`, tenga o no texto visible — una evaluación heurística
  encontró que un ícono sin nombre accesible no cumple el mínimo para lectores de pantalla, y eso no
  depende de si el texto se ve o no (revisión en [UX-003](#ux-003) tras el pedido del dueño de producto de
  ir a íconos puros en mobile). El texto del `aria-label` describe el destino real, no una fórmula fija:
  "Volver al inicio" en `/buscar` (vuelve a la landing, un nivel más arriba — no a una búsqueda previa) y
  "Volver a la búsqueda" en el perfil (sí vuelve a `/buscar` con el resumen previo). Una evaluación
  heurística encontró que la versión anterior usaba "Volver a la búsqueda anterior" también en `/buscar`,
  describiendo un destino que ese botón no tiene.
  Todo elemento interactivo del header y del buscador compacto lleva un estado de foco visible
  (`:focus-visible`) para navegación por teclado — no solo `:hover`/`:active`.

## UXF-003 — Reconocer sesión de profesional en el header

**Objetivo:** un profesional con sesión activa ve un acceso directo a su perfil; sin sesión, ve la
invitación a registrarse solo donde corresponde (landing y footer), no repetida en cada header.
**Contrato:** [F-001](./producto.md#f-001), [D-005](./producto.md#d-005).

**Punto de entrada:** cualquier página con header (general o `LandingNavbar`).

**Criterio de término:** en la landing, el link de la derecha dice "Publícate" (sin sesión) o "Mi perfil"
(con sesión), nunca ambos. En el header general (`/buscar`, perfil, `/profesional/*`), sin sesión no hay
nada a la derecha; con sesión aparece el avatar del profesional.

**Cómo sabe el usuario dónde está:** en la landing, el texto del link. En el header general, la presencia
o ausencia del avatar — no hay otro estado visual permanente para esto.

### Salidas

| Salida                              | Cómo se ejecuta                    | Qué queda del trabajo |
| ---------------------------------------| -------------------------------------- | ------------------------ |
| Toca el avatar con sesión activa     | navega a `/profesional/perfil`       | — |
| Toca "Publícate" sin sesión (landing o footer) | navega a `/profesional/registro` | — |

### Secuencia principal

| Paso | Acción                                    | Respuesta del sistema                                          | Información visible |
| ---- | ---------------------------------------------| -------------------------------------------------------------------- | ---------------------- |
| 1    | Carga cualquier página con header          | Mientras se resuelve si hay sesión, el header muestra el estado sin sesión (landing: "Publícate"; general: nada a la derecha) | — |
| 2    | La verificación de sesión resuelve (activa) | Aparece "Mi perfil" (landing) o el avatar (header general), sin parpadeo perceptible | — |

### Variantes y recuperación

| Condición                          | Qué cambia                                       | Cómo se entiende          | Cómo se recupera |
| --------------------------------------| ----------------------------------------------------| ------------------------------ | ------------------- |
| La sesión expira mientras navega   | El próximo header que se pinte vuelve al estado sin sesión | El avatar desaparece (header general) o el texto cambia a "Publícate" (landing) | Si toca el avatar/"Mi perfil" justo cuando expiró, el middleware existente lo manda a `/profesional/ingresar` (ya resuelto en misión 04) |

### Decisiones que no deben quedar implícitas

- Nunca se muestra el estado "con sesión" antes de confirmarlo — el default mientras carga es siempre "sin
  sesión" ([CL-003 de producto.md](./producto.md#f-001)).
- Fuera de la landing, sin sesión, el header general no muestra ningún acceso al lado profesional — ni
  ícono ni texto. Es una revisión sobre la primera versión de esta misión (que sí mostraba "Publícate" en
  todo header) — ver [UX-003](#ux-003).

## Estados por superficie

| Superficie                     | Mobile (390px)                                                        | Desktop |
| --------------------------------- | -------------------------------------------------------------------------| --------- |
| Landing, antes de scroll        | Logo · Categorías (ancla) · Publícate/Mi perfil — sin buscador (vive en el hero) | Igual |
| Landing, tras scroll             | + buscador compacto (botón de ancho completo) aparece                  | + buscador compacto inline aparece junto al resto |
| `/buscar`, sin sesión            | Volver (solo ícono) · resumen de búsqueda ("Gasfitería en Ñuñoa") ocupa el resto — sin nada a la derecha | Volver (ícono + "Volver") a la izquierda · buscador centrado respecto al ancho del header · nada a la derecha |
| `/buscar`, con sesión            | + avatar del profesional a la derecha                                  | + avatar del profesional a la derecha, buscador se sigue centrando respecto al ancho total |
| Perfil público, sin sesión       | Solo Volver (ícono)                                                      | Solo Volver (ícono + texto), a la izquierda |
| Perfil público, con sesión       | Volver (ícono) a la izquierda + avatar a la derecha                     | Volver (ícono + texto) a la izquierda + avatar a la derecha |
| Footer (toda página, mismo diseño en landing y resto — [D-002 revisada](./producto.md#d-002)) | Fondo índigo primario de Datealo. Marca, "Buscar profesionales", Publícate/Mi perfil, contacto (texto), Términos/Privacidad — apilado en una columna | Mismo contenido y color, en fila |
| Panel de sugerencias (categoría) | Hoja a pantalla completa: 8 categorías como filas con ícono            | Panel flotante bajo el campo, mismo contenido |
| Panel de sugerencias (comuna)    | Hoja a pantalla completa: buscador de texto + lista corta de comunas frecuentes | Panel flotante bajo el campo, mismo contenido |

## Mockups

| Mockup                     | Cubre                     | Estado     | Ruta |
| ------------------------------ | ---------------------------- | ------------ | ------ |
| Header y buscador — mobile   | UXF-001, UXF-002, UXF-003, F-001, F-002 — incluye frames de sesión activa y "sin resultados" (CL-002) | validado | `./design-mockups/header-buscador-mobile.html` |
| Header y buscador — desktop  | UXF-001, UXF-002, UXF-003, F-001, F-002 — mismos frames que mobile | validado | `./design-mockups/header-buscador-desktop.html` |
| Footer (diseño único, compartido) | F-003                   | validado   | `./design-mockups/footer.html` |
| Términos y Privacidad        | F-004, V-001, V-002          | validado   | `./design-mockups/terminos-privacidad.html` |

## Cobertura

| Funcionalidad | Flujo             | Estados cubiertos                                    | Estado |
| --------------- | -------------------- | -------------------------------------------------------- | -------- |
| F-001           | UXF-002, UXF-003    | landing, `/buscar`, perfil, sin sesión, con sesión, carga, sin resultados (CL-002) | listo |
| F-002           | UXF-001              | cerrado, categoría abierta, comuna abierta, sin resultados (CL-002) | listo |
| F-003           | —                     | mobile apilado, desktop en fila, mismo diseño en landing y resto ([D-002](./producto.md#d-002)) | listo |
| F-004           | —                     | contenido único (páginas de lectura)                       | listo |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — El buscador compacto abre siempre en el campo categoría primero, nunca en comuna

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [F-002](./producto.md#f-002).
- **Alternativas descartadas:** dejar que el usuario elija con qué campo empezar — se descarta porque
  agrega una decisión extra al camino crítico sin beneficio; sugerir comunas filtradas por la categoría ya
  elegida — se descarta porque ninguna regla de F-002 define ese filtrado (la sugerencia de comuna son las
  comunas frecuentes en general, no relacionadas a la categoría), y documentarlo como si existiera sería
  describir un comportamiento que no está especificado.
- **Decisión y consecuencia:** UXF-001 siempre secuencia categoría → comuna, porque casi siempre se piensa
  primero en "qué necesito" (categoría) que en "dónde" (comuna es casi siempre la propia) — no porque la
  comuna dependa de la categoría. Si el usuario ya tenía categoría elegida (viene de `/buscar`), el panel
  abre directo en comuna en su lugar — ver variantes.
- **Impacto en producto:** ninguno, es una decisión de secuencia dentro de F-002 ya aprobada.
- **Revisión (2026-09-02):** la redacción original de esta decisión daba una razón ("sugerir comunas no
  tiene con qué filtrar la relevancia") que implicaba un filtrado por categoría que ningún otro lugar del
  documento especifica — una evaluación heurística lo marcó como una afirmación no respaldada. Se corrigió
  a la razón real, que ya estaba en el mismo párrafo.

<a id="ux-002"></a>

### UX-002 — Cerrar el buscador sin confirmar nunca borra una selección, elegida ahora o antes de abrirlo

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** hallazgo propio al escribir UXF-001 — el gate de experiencia pide que ninguna salida
  pierda trabajo sin avisar.
- **Alternativas descartadas:** limpiar todo al cerrar sin confirmar — se descarta porque castiga a
  alguien que solo quería revisar o ajustar un filtro y se arrepiente a mitad de camino, perdiendo el
  filtro que sí tenía bien puesto. Revertir solo lo tocado en la apertura actual, conservando lo que ya
  existía antes de abrir (versión original de esta decisión) — se descarta en la revisión de abajo.
- **Decisión y consecuencia:** cerrar el panel (click afuera, la X) nunca descarta nada — lo que se haya
  elegido, elegido queda, se haya tocado recién o ya viniera de antes. Elegir comuna sí navega
  ([revisión 2026-09-03](#ux-002-revision-2026-09-03) más abajo); cerrar sin llegar a elegirla es lo único
  que solo cierra.
- **Revisión (2026-09-02):** la versión original solo protegía una selección previa a abrir el panel,
  revirtiendo cualquier cambio hecho en esa apertura si se cerraba sin confirmar. Probado en un dispositivo
  real, esto se sintió como perder trabajo: elegir una categoría y cerrar sin querer (o sin haber llegado
  a elegir comuna todavía) borraba la categoría recién elegida — exactamente el caso que el sustento de
  esta misma decisión dice que hay que evitar. Se simplificó a "nunca se pierde nada al cerrar", sin
  distinguir cuándo se eligió.
- <a id="ux-002-revision-2026-09-03"></a>**Revisión (2026-09-03):**
  la redacción de arriba ("Confirmar con 'Buscar' es la única acción que navega") quedó inconsistente con
  el propio [Mapa de estados](#mapa-de-estados) de este documento, que ya decía que tocar una comuna cierra
  el panel y navega — nadie reconcilió las dos partes cuando se escribió esta decisión. Probado en un
  dispositivo real: exigir un tap en "Buscar" además de elegir la comuna se sintió como un paso de más,
  justo porque elegir categoría (la misma clase de interacción — tocar una fila de una lista corta) ya
  avanza sola, sin pedirlo. Se corrigió para que elegir comuna navegue directo, igual que categoría, y el
  Mapa de estados quedó como la versión correcta. El botón "Buscar" se mantiene como respaldo manual, para
  cuando se cambia de categoría pero se quiere conservar la comuna ya elegida sin tener que volver a
  encontrarla en la lista.
- **Impacto en producto:** ninguno — es un detalle de estado que no cambia ninguna regla de F-002.

<a id="ux-003"></a>

### UX-003 — El botón de volver lleva ícono y texto "Volver" en desktop; solo ícono en mobile

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** hallazgo de enfoque de una evaluación heurística (agente sin memoria de esta conversación,
  con `ui-ux-pro-max` y `web-design-guidelines`) sobre la primera versión de UXF-002.
- **Alternativas descartadas:** flecha sola con `aria-label` en todo tamaño (resuelve el lector de
  pantalla, no la orientación visual — el propio ejemplo verificable de [F-001](./producto.md#f-001) elige
  como caso principal a alguien que entra en frío por WhatsApp, sin contexto previo para interpretar un
  ícono suelto); texto "Volver" en todo tamaño, incluido mobile (versión original de esta decisión) — se
  descarta en la revisión de abajo; volver a mostrar el isotipo junto al botón en `/buscar` y el perfil —
  se descarta porque reabriría [C-011](./investigacion.md#c-011) (el logo se reserva para la landing).
- **Decisión y consecuencia:** en desktop, el botón lleva ícono + la palabra "Volver" — hay espacio y
  resuelve la orientación visual y el nombre accesible al mismo tiempo. En mobile, solo el ícono, con
  `aria-label` — 390px con el buscador y, cuando hay sesión, el avatar, no deja espacio para texto también
  sin apretar la fila.
- **Revisión (2026-09-02):** la versión original pedía texto "Volver" en todo tamaño. El dueño de producto
  pidió íconos puros en mobile por espacio, aceptando el trade-off de perder la orientación visual (no
  solo accesible) que el texto daba a quien entra en frío — la decisión informada prioriza el espacio.
- **Revisión 2 (2026-09-02):** una segunda evaluación heurística objetó aplicar "solo ícono en mobile" por
  igual a `/buscar` y al perfil, porque la restricción de espacio que lo justifica (buscador + avatar +
  volver compitiendo en la fila) solo existe en `/buscar` — el perfil no tiene buscador ni logo, así que
  ahí sobra espacio para el texto, y es justo la superficie del caso de entrada fría por WhatsApp. El dueño
  de producto pesó esto contra la consistencia de un solo patrón de header mobile y prefirió mantener
  ícono solo en toda superficie, sin excepción por página. Se sostiene porque el `aria-label` ya resuelve
  el nombre accesible independiente del texto visible, y una flecha sola arriba a la izquierda es una
  convención casi universal (gesto nativo, botón atrás del navegador) que no depende de texto para
  entenderse, incluso sin contexto previo.
- **Impacto en producto:** ninguno — es un detalle de contenido/accesibilidad dentro de F-001, no cambia
  su regla.

<a id="ux-005"></a>

### UX-005 — El header general usa un layout de 3 zonas (volver | buscador centrado | avatar); sin sesión, la zona derecha queda vacía fuera de la landing

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** el dueño de producto revisó el mockup de desktop y notó que el buscador quedaba pegado a
  la izquierda junto al botón de volver, en vez de centrado en el header.
- **Alternativas descartadas:** buscador agrupado a la izquierda junto al botón de volver (versión
  original de los mockups) — se descarta, es lo que generó el hallazgo; mostrar "Publícate" en el header
  general cuando no hay sesión (para llenar la zona derecha siempre) — se descarta porque en mobile no cabe
  sin apretar la fila, y el CTA de registro ya vive en la landing y el footer — repetirlo en cada header no
  suma, solo compite por espacio.
- **Decisión y consecuencia:** en desktop, el header general usa tres zonas de ancho proporcional (volver
  a la izquierda, buscador centrado en medio, avatar a la derecha) para que el buscador quede realmente
  centrado respecto al ancho total, no respecto al espacio libre junto al botón de volver. En mobile, sin
  esa necesidad de centrado (el buscador ya ocupa el espacio disponible entre los íconos de los extremos),
  el layout es simplemente volver + buscador + avatar (si hay sesión) en fila. Ver [D-005 revisada en
  producto.md](./producto.md#d-005).
- **Impacto en producto:** sí — [D-005](./producto.md#d-005) se revisó: el header general ya no muestra
  "Mi perfil"/"Publícate" como texto, muestra el avatar del profesional con sesión y nada sin sesión.

<a id="ux-004"></a>

### UX-004 — El footer usa un solo diseño visual, compartido entre la landing y el resto de la app

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** hallazgo de enfoque de la misma evaluación heurística — el mockup de footer solo tenía un
  diseño, mientras [D-002](./producto.md#d-002) (versión original) pedía dos diseños distintos.
- **Alternativas descartadas:** construir un segundo diseño de footer solo para cumplir la letra de la
  decisión original — se descarta porque el dueño de producto, consultado directamente, prefiere que se
  vean iguales; mantener el gris oscuro neutro que tenía el footer antes de esta misión — se descarta
  porque no usa ningún color distintivo de Datealo, cualquier sitio podría tener ese footer.
- **Decisión y consecuencia:** el footer usa el índigo primario de Datealo como fondo (el mismo color del
  header sólido y del hero), con el turquesa como acento — ver mockup. Esto generó una revisión de
  [D-002 en producto.md](./producto.md#d-002).
- **Impacto en producto:** sí — [D-002](./producto.md#d-002) se revisó para reflejar que header y footer
  ya no comparten el mismo criterio de "diseño propio por superficie".

## Preguntas

Ninguna abierta — no queda nada bloqueando `ingenieria.md`.
