# Misión: vista de resultados de búsqueda — Experiencia

**Estado:** vigente — aprobado por Patricio el 2026-09-02

**Última actualización:** 2026-09-02

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión de experiencia: la card pasa de fila horizontal a card vertical foto-arriba, reusando el slot que ya existe en el perfil público

V-001 (la misma vista de resultados de la misión 06, sin vista nueva) cambia su card de una fila
horizontal (avatar chico + texto) a una card vertical: una foto arriba con el mismo slot `aspect-4/3` que
`ProfessionalPublicPhotos.vue` ya usa en el perfil (misión 05), y debajo el nombre, la comuna, el rating
(si existe), el precio y la antigüedad. Cuando el profesional no subió fotos de trabajo, ese mismo slot
muestra su avatar centrado sobre un fondo con tinte de `--ui-primary` — mismo mecanismo que el ring de
foco de los selectores, no el gris genérico que usa el perfil. La página gana un contenedor con ancho
máximo `max-w-6xl` (más ancho que el perfil, porque acá es un grid de fotos, no una columna de texto) para
que el filtro y el grid de resultados no se estiren vacíos ni se queden angostos en desktop.

- **Funcionalidades cubiertas:** F-001, F-002.
- **Pendiente bloqueante:** ninguna. La evaluación heurística en agente separado dejó 2 hallazgos de
  enfoque (ancho de página, peso visual del fallback) — se investigaron prácticas de grids de listados y
  de placeholders de imagen (ver UX-001 y UX-002) y se resolvieron ambos antes de este estado.

## Vistas

- **V-001 — Resultados de búsqueda** · móvil / desktop · resuelve [F-001](./producto.md#f-001),
  [F-002](./producto.md#f-002) · flujo UXF-001 (mismos modos que en la misión 06 — esta misión no agrega
  ni quita modos, cambia el contenido de la card dentro de "con resultados" y "comunas vecinas", y el
  layout de la página completa)
  - modo **eligiendo** — sin cambios respecto a la misión 06
  - modo **cargando** — el skeleton se actualiza a la forma de la nueva card (ver "Decisiones que no deben
    quedar implícitas")
  - modo **con resultados** — la card ahora es vertical, con foto/avatar, rating si existe, precio y
    antigüedad
  - modo **comunas vecinas** — misma card enriquecida; conserva el tratamiento en negrita de la comuna
  - modo **sin resultados** — sin cambios respecto a la misión 06

## Mapa de estados

Sin cambios respecto al de la misión 06 — esta misión no agrega transiciones nuevas, solo cambia qué se ve
dentro de los modos "con resultados" y "comunas vecinas". Ver
[el mapa de estados de la misión 06](../06-busqueda-resultados/experiencia.md#mapa-de-estados).

## UXF-001 — Ver un resultado completo, con o sin foto de trabajo

**Objetivo:** que cualquier resultado —tenga 1 o varios— se vea como un profesional real y no como un
renglón vacío. **Contrato:** [F-001](./producto.md#f-001), [F-002](./producto.md#f-002).

Este flujo extiende UXF-001 de la misión 06 (mismo punto de entrada, mismo criterio de término, mismo
"cómo sabe el usuario dónde está" — los selectores sticky no cambiaron). Lo que sigue documenta solo lo
que esta misión modifica: la forma de la card y el layout de la página.

### Divergencia antes de converger

Para la card enriquecida (JTBD de F-001: reconocer al profesional sin abrir su perfil) se generaron tres
enfoques:

- **Enfoque A — fila horizontal ampliada:** mantener el layout actual (avatar/foto a la izquierda, texto a
  la derecha) pero agrandando la foto y agregando la línea de rating. Cambia poco código, pero la foto
  queda chica (un círculo o cuadrado de ~64px) — exactamente el problema que motivó la misión: la
  información sigue compitiendo por poco espacio y el resultado se sigue viendo austero.
- **Enfoque B — card vertical foto-arriba, estilo Airbnb (referencia original del dueño de producto):**
  foto en la parte superior con ancho completo de la card (`aspect-4/3`), contenido debajo. Foto y rating
  tienen el protagonismo que la investigación pidió (C-002: la card individual debe cargar el peso
  visual).
- **Enfoque C — híbrido, foto cuadrada mediana a la izquierda:** una foto de ~112px (más grande que hoy,
  más chica que B) con el texto a la derecha, sin pasar a vertical completo. Preserva más densidad por
  pantalla en mobile, pero no reusa ningún patrón visual existente de Datealo — sería un tercer tratamiento
  de foto distinto al de la landing (carrusel) y al del perfil (`aspect-4/3`).

**Elegido: B.** Es literalmente la referencia que trajo el dueño de producto a esta misión, y es el único
que reusa un patrón ya construido: `ProfessionalPublicPhotos.vue` (perfil público, misión 05) ya resuelve
el slot `aspect-4/3` con su fallback a avatar sobre `bg-datealo-surface` — B copia ese mismo componente
visual en vez de inventar un tercero, lo que además reduce el trabajo de ingeniería (mismo patrón, no una
variante nueva). C se descarta por eso mismo: agregaría un tamaño de foto que no existe en ningún otro
lugar del producto. A se descarta porque no resuelve el problema que originó la misión — dejaría la card
"un poco más grande", no "sólida".

**Costo aceptado de B:** en mobile, cada card ocupa más alto que hoy (una foto `aspect-4/3` a ancho
completo empuja bastante el contenido hacia abajo). Con el volumen actual (1-3 resultados típicos, C-002 de
investigación), el costo de scroll es bajo. Si Datealo escala a docenas de resultados por búsqueda, esto
se reevalúa — es exactamente la restricción de arranque en frío del skill `cold-start-problem`, no una
sorpresa que aparece después.

### Jerarquía de información

Con foto/avatar, nombre, comuna, rating, precio y antigüedad compitiendo por la misma card, el orden es:

1. **Foto de trabajo, o avatar si no subió ninguna** — ocupa toda la parte superior de la card
   (`aspect-4/3`), primera señal, igual criterio que el perfil (misión 05).
2. **Nombre** — quién es.
3. **Comuna** — confirma dónde trabaja. En modo comunas vecinas, va en negrita, mismo criterio que la
   misión 06 (avisa que no es la comuna exacta).
4. **Rating y cantidad de reseñas**, solo si `reviewCount > 0` — mismo formato que el perfil público:
   ícono de estrella, promedio con coma decimal, "· N reseñas". Si no tiene reseñas todavía, esta línea no
   existe — no hay "Sin reseñas" ni "0,0", eso leería como una carencia en vez de simplemente omitir un
   dato que no existe.
5. **Precio** ("Desde $X", si existe).
6. **"En Datealo desde..."** — igual que hoy, la única señal de actividad que no se inventa.

### Salidas

Sin cambios respecto a la misión 06 — la card sigue siendo un solo link al perfil; no se agregan
interacciones dentro de la card (nada de carrusel ni de swipe, eso queda para el perfil completo).

### Secuencia principal

| Paso | Acción                                                                | Respuesta del sistema                                                                                                              | Información visible |
| ---- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1    | Llega a V-001 (sin cambios respecto a la misión 06)                      | Ve los selectores dentro de un contenedor con ancho máximo (`max-w-6xl`), ya no de borde a borde en desktop                                | — |
| 2    | Elige o confirma categoría y comuna                                      | Si tarda más de 300ms, ve un skeleton con la forma de la nueva card vertical (bloque `aspect-4/3` + 3 líneas de texto)                     | Ninguna dato real todavía, solo la forma |
| 3    | El servidor responde con resultados en la comuna exacta                  | Ve el contador de resultados y la lista/grid: cada card con foto o avatar arriba, nombre, comuna, rating si existe, precio, antigüedad     | Foto o avatar, nombre, comuna, rating (si existe), precio si existe, antigüedad |
| 3b   | (alternativa) Solo hay resultados en comunas vecinas                     | Igual que la misión 06 (aviso + sección "Cerca de \<comuna\>"), con la misma card enriquecida y la comuna en negrita                        | Mismo contenido que 3, comuna nunca es la exacta |
| 3c   | (alternativa) No hay nada en la comuna ni sus vecinas                    | Sin cambios respecto a la misión 06                                                                                                        | — |
| 4    | Toca una card                                                             | Navega al perfil del profesional — sin cambios                                                                                             | — |

### Variantes y recuperación

| Condición                                                                 | Qué cambia                                                                        | Cómo se entiende                                                              | Cómo se recupera |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------- |
| Profesional sin fotos de trabajo ni reseñas ([CL-001](./producto.md#cl-001))    | El slot de foto muestra su avatar centrado sobre un fondo con tinte de `--ui-primary`; no hay línea de rating | El slot tiene el mismo tamaño y posición que una card con foto, y el tinte de marca lo distingue de un hueco de contenido faltante | Ninguna — es el estado real de ese perfil |
| Profesional con reseñas pero sin precio publicado ([CL-004](./producto.md#cl-004)) | La línea de precio se omite; el resto de la card (foto/avatar, nombre, comuna, rating, antigüedad) queda igual | `priceFrom` ya es opcional en F-001 — omitir la línea es el mismo criterio que ya usaba la card horizontal de la misión 06 | Ninguna — es el estado real de ese perfil |
| 1 solo resultado en desktop ancho ([CL-002](./producto.md#cl-002))              | La card queda centrada dentro del contenedor `max-w-6xl` (ver "Decisiones que no deben quedar implícitas" — grid `auto-fit`), sin estirarse para ocupar el resto del ancho | No queda pegada en una esquina con espacio vacío al lado — el espacio sobrante se reparte como margen simétrico | Ninguna — es el resultado real |
| Modo comunas vecinas ([CL-003](./producto.md#cl-003))                           | Mismo tratamiento en negrita de la comuna que la misión 06, ahora dentro de la card enriquecida | El peso visual de la comuna, no solo el texto, avisa que no es la comuna exacta        | Cambia de comuna, o contacta a uno de comuna vecina |
| Conexión lenta (>300ms)                                                        | Skeleton con la forma de la nueva card (bloque `aspect-4/3` + 3 líneas)               | Igual al resto de Datealo                                                            | Si pasa de 10s, mensaje "Esto está tardando más de lo normal" + "Reintentar" |

### Decisiones que no deben quedar implícitas

- El skeleton de carga (`SearchResultCard` en estado `pending`) tiene que actualizarse a la forma nueva —
  un bloque `aspect-4/3` animado arriba, 3 líneas de texto abajo — para que la carga no "salte" de un
  layout viejo a uno nuevo cuando llegan los datos.
- El contenedor `max-w-6xl` se aplica tanto al filtro sticky como al área de resultados — los dos
  comparten el mismo ancho y los mismos márgenes, para que no se vean desalineados entre sí. Esto es una
  medida de layout de página (F-002), no un cambio al comportamiento del buscador — los campos de
  categoría y comuna siguen siendo los mismos componentes, sin tocar `CategoriaSelect` ni `ComunaSelect`.
- El grid de desktop usa columnas `auto-fit` (`minmax(280px, 380px)`) con `justify-content: center`, no
  `grid-cols-3` fijo. Con 3 resultados el efecto es el mismo (3 columnas llenando el ancho); con 1 o 2, las
  columnas sin contenido colapsan y la fila parcial queda centrada en vez de pegada a la izquierda con
  espacio vacío al lado — sin este cambio, un ancho máximo de página por sí solo no evita que una card
  sola se vea perdida en una esquina (encontrado en la evaluación heurística de este documento).
- `align-items: stretch` (default de CSS Grid) iguala el alto de todas las cards de una fila — pero el
  contenedor de texto de la card (`result-body` en el mockup) necesita `flex: 1` para que ese alto extra
  llegue hasta el `margin-top: auto` que empuja "En Datealo desde..." hacia abajo. Sin ese `flex: 1`, el
  borde de la card se estira parejo pero el texto interno no, y las cards de una misma fila quedan con la
  antigüedad a alturas distintas (encontrado en la evaluación heurística).
- La card es un link real (`<NuxtLink>`, ya lo es hoy en `SearchResultCard.vue`), con estado de foco
  visible (anillo de `--ui-primary`) y de hover (sombra + borde más marcado) — no solo un contenedor con
  click. Esto ya lo cumple el componente actual; esta misión no lo cambia, solo lo hereda.
- Cada foto de trabajo carga con `loading="lazy"` — es el guardrail de [M-001](./producto.md#m-001) de
  producto.md (el tiempo de carga de `/buscar` no debe empeorar), y quedaba sin nombrar en este documento
  hasta la evaluación heurística.
- El `alt` de la foto de trabajo va vacío (`alt=""`, imagen decorativa) — el nombre del profesional ya es
  visible como texto una línea más abajo; repetirlo en el `alt` hace que un lector de pantalla lo anuncie
  dos veces seguidas al entrar a la card.
- El breakpoint que separa mobile (1 columna) de desktop (grid) es `lg` (1024px) — el mismo que ya define
  `app/pages/buscar/index.vue` desde la misión 06 (`lg:grid lg:grid-cols-3`). Esta misión no agrega un
  breakpoint intermedio para tablet/laptop angosto: hereda el mismo corte binario de la misión 06.
- Ningún ícono de esta vista es un emoji — el ícono de rating es `Star` de `@lucide/vue`
  (`fill-amber-400 text-amber-400`), el mismo que ya usa el perfil público.
- En mobile, la vista sigue siendo una columna (sin pasar a grid de 2 columnas) — mismo criterio que la
  misión 06, sin abrir una decisión nueva de densidad mobile que nadie pidió.

## Estados por superficie

| Estado                                          | Qué se muestra (texto e información real)                                                                                                          | Acción disponible |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| cargando                                             | Skeletons con forma de card vertical (bloque `aspect-4/3` + 3 líneas)                                                                                     | Ninguna |
| con resultados, con foto y reseñas                   | "2 resultados" + card: foto de trabajo, "Marcela Fuentes", "Ñuñoa", ★ "4,8 · 12 reseñas", "Desde $15.000", "En Datealo desde julio de 2026"               | Tocar la card |
| con resultados, sin foto ni reseñas (CL-001)         | Card con avatar de iniciales sobre fondo `bg-datealo-surface` en el mismo slot, sin línea de rating: "Héctor Silva", "Ñuñoa", "Desde $12.000", "En Datealo desde agosto de 2026" | Tocar la card |
| con resultados, con reseñas y sin precio             | Card con foto/avatar y rating, sin línea de precio: "Héctor Silva", "Ñuñoa", ★ "4,6 · 3 reseñas", "En Datealo desde agosto de 2026"                       | Tocar la card |
| con resultados, un solo resultado (CL-002)           | "1 resultado" + una sola card centrada dentro del contenedor `max-w-6xl`, sin estirarse                                                                   | Tocar la card |
| comunas vecinas                                      | Mismo aviso y sección de la misión 06, con la card enriquecida y la comuna "La Florida" en negrita                                                        | Tocar una card, o cambiar comuna |

## Mockups

| Mockup                | Cubre           | Estado  | Ruta |
| ------------------------ | ------------------ | --------- | ------ |
| resultados-busqueda   | UXF-001 (V-001)    | validado — 5 frames, 2 rondas de evaluación heurística en agente separado (grid `auto-fit`/`justify-content`, `flex: 1` en el body de la card, card como link con foco/hover, `loading="lazy"`, `alt` sin redundancia, frame mobile sin recortar, avatar del fallback alineado a `ProfessionalPublicPhotos.vue`) | `./design-mockups/resultados-busqueda.html` |

## Cobertura

| Funcionalidad | Flujo   | Estados cubiertos                                                                 | Estado    |
| ------------- | ------- | -------------------------------------------------------------------------------- | --------- |
| F-001         | UXF-001 | con foto y reseñas, sin foto ni reseñas (CL-001), con reseñas sin precio (CL-004), cargando | en revisión |
| F-002         | UXF-001 | un solo resultado (CL-002), comunas vecinas (CL-003)                              | en revisión |

## Decisiones de experiencia

<a id="ux-001"></a>

### UX-001 — La card pasa de fila horizontal a card vertical foto-arriba, reusando el slot `aspect-4/3` del perfil

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** ver "Divergencia antes de converger" de UXF-001; [C-002](./investigacion.md#c-002) y
  [C-003](./investigacion.md#c-003) de investigación.
- **Alternativas descartadas:** fila horizontal ampliada (no resuelve el problema que originó la misión) e
  híbrido con foto cuadrada mediana (agrega un tercer tratamiento visual de foto sin reusar nada existente)
  — ver "Divergencia antes de converger" arriba.
- **Decisión y consecuencia:** la card usa el mismo componente visual que `ProfessionalPublicPhotos.vue`
  (perfil público) para su slot de imagen — foto real o avatar. Esto además simplifica ingeniería: no hay
  un segundo tratamiento de "sin foto" que mantener.
- **Impacto en producto:** ninguno — D-002 de `producto.md` ya definía el slot fijo con fallback a avatar;
  esta decisión solo fija cuál es visualmente (el mismo del perfil).

**Revisión (2026-09-02):** la evaluación heurística en agente separado cuestionó el fallback en sí — con
foto y sin foto, las cards miden lo mismo, pero el gris plano de `bg-datealo-surface` (heredado tal cual
del perfil) pierde peso visual junto a una foto real, justo en el caso que producto.md marca como "el más
común hoy" (CL-001). Se investigaron patrones de placeholder de imagen en e-commerce
([Shopify Placeholder Images Guide](https://ailee.ai/guides/shopify-placeholder-images)): la práctica es
usar color de marca en vez de gris genérico ("match your brand with brand colors and style" en vez de un
"gray box" que se lee como contenido faltante). El fallback cambia a un fondo con tinte de `--ui-primary`
(`color-mix(in oklab, var(--ui-primary) 10%, var(--ui-bg))` — la misma técnica de `color-mix()` que el
mockup ya usa para su propio ring de foco, aunque `.select-field` es una clase del mockup, no de
`app/`; no hay ningún componente real con este tratamiento hoy, es una decisión nueva) y el avatar pasa de
los 3rem (`h-12 w-12`) que usa hoy `SearchResultCard.vue` a 5.5rem
(`h-22 w-22`, `text-2xl`) — el mismo tamaño que `ProfessionalPublicPhotos.vue` usa en el perfil, no un
valor propio. Una segunda evaluación heurística (sobre el mockup ya corregido) verificó el contraste del
tinte con la fórmula real de WCAG (11,5:1, muy por encima del mínimo AA de 4.5:1) y confirmó con un render
real que se percibe como decisión de marca, no como gris apenas azulado; también corrigió que la primera
versión usaba 5rem, un tercer número que no coincidía ni con el baseline real ni con el del perfil citado
como fuente. Con esto la decisión queda cerrada.

<a id="ux-002"></a>

### UX-002 — El ancho máximo de la página es `max-w-6xl`

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** [C-001](./investigacion.md#c-001) de investigación (contenedor sin ancho máximo);
  práctica de grids de listados tipo Airbnb: anchos de contenedor de 1140-1440px para desktop grande
  ([Layout grid, USWDS](https://designsystem.digital.gov/utilities/layout-grid/);
  [What's the best container width for websites?](https://qualityhive.com/blog/optimum-website-container-sizes))
  — 1024px (el ancho del perfil) queda por debajo de ese rango.
- **Alternativas descartadas:** `max-w-5xl` (1024px), copiado del perfil público — descartado tras la
  evaluación heurística: el perfil es una columna de texto (ancho angosto por legibilidad), esta vista es
  un grid de fotos en 3 columnas (el ancho define qué tan grande se ve cada foto, el objetivo de C-002);
  en un monitor de 1920px dejaba ~47% de la pantalla en blanco sin agrandar ninguna foto. `max-w-7xl`
  (1280px) — descartado por ahora: en `minmax(280px, 380px)` de UX-003, un contenedor más ancho que 6xl
  solo agrega margen, no agranda más las cards (el tope de 380px ya lo limita), así que no aporta sobre
  6xl con los valores actuales.
- **Decisión y consecuencia:** el filtro sticky y el área de resultados comparten el mismo contenedor
  `max-w-6xl` (1152px) centrado. Se combina con subir el tope de card de UX-003 a 380px, para que el
  ancho extra se traduzca en fotos más grandes, no en más margen.
- **Impacto en producto:** ninguno.

<a id="ux-003"></a>

### UX-003 — El grid de desktop usa columnas `auto-fit` con `justify-content: center`, no `grid-cols-3` fijo

- **Estado:** aceptada. **Fecha:** 2026-09-02.
- **Sustento:** hallazgo de la evaluación heurística en agente separado — con `grid-cols-3` fijo, una
  búsqueda con 1 o 2 resultados deja columnas vacías a la derecha y la card queda pegada en la esquina
  superior izquierda; el ancho máximo de página por sí solo (F-002, [CL-002](./producto.md#cl-002) de
  producto.md) no lo evita, solo lo acota a un contenedor más chico.
- **Alternativas descartadas:** mantener `grid-cols-3` fijo y centrar el contenido manualmente por conteo
  de resultados en el componente Vue — descartado porque `auto-fit` + `justify-content: center` resuelve
  lo mismo en CSS puro, sin lógica condicional que mantener; `grid-template-columns: repeat(auto-fill, ...)`
  (sin colapsar columnas vacías) — descartado porque no centra una fila parcial, dejaría el mismo problema.
- **Decisión y consecuencia:** `grid-template-columns: repeat(auto-fit, minmax(280px, 380px))` con
  `justify-content: center`. Con 3 resultados el efecto es prácticamente el mismo de un grid fijo (llena
  el ancho); con menos, la fila queda centrada. El tope de 380px (subido desde 336px junto con UX-002)
  hace que el ancho extra del contenedor agrande las cards en vez de solo el margen.
- **Impacto en producto:** ninguno — cumple lo que [CL-002](./producto.md#cl-002) de producto.md ya
  prometía ("evita que la card quede perdida en una esquina"), que con solo el ancho máximo de página no
  se cumplía.

## Preguntas

Ninguna bloquea UXF-001 tal como queda definido acá.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de experiencia |
