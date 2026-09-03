# Misión: Vista de resultados de búsqueda — Investigación

**Estado:** activo

**Última actualización:** 2026-09-02

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

## El problema aparece cuando Patricio busca electricidad en Puerto Varas

**Situación:** el dueño de producto abre `/buscar`, elige la categoría Electricidad y la comuna Puerto
Varas en un monitor de escritorio ancho.

**Acción o necesidad:** evaluar si la vista de resultados, tal como está hoy, comunica que Datealo tiene
algo sólido que ofrecer.

**Respuesta actual:** la búsqueda encuentra 1 profesional. La card aparece arriba a la izquierda —
pequeña, sin foto, solo un círculo con iniciales, nombre, comuna, precio y "en Datealo desde" — y el resto
de la pantalla queda en blanco. `/buscar` nació en la misión 06 priorizando que el matching funcionara;
nunca recibió una pasada de diseño dedicada, y el grid (`lg:grid-cols-3`) se agregó sin ningún contenedor
con ancho máximo.

**Consecuencia:** un resultado que en el fondo es exitoso — Datealo encontró exactamente al profesional
que se buscaba — se lee como si la plataforma no tuviera nada. La vista no transmite la confianza que el
resto del producto ya construyó (foto de perfil, reseñas verificadas, precio orientativo).

## Evidencia

| ID    | Tipo         | Fuente                                                                 | Hecho verificable | Límite de la evidencia |
| ----- | ------------ | ----------------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código        | `app/types/search.ts` vs. `app/types/professional.ts`                  | `SearchResultProfessional` (lo que llega a la card) trae `displayName`, `comunaNombre`, `priceFrom`, `avatarUrl`, `createdAt`. `PublicProfessionalProfile` (el perfil completo) ya trae además `photoUrls`, `ratingAverage` y `reviewCount`, cargados por el propio profesional en `ProfessionalPhotos.vue`. | Explica por qué la card no puede mostrar foto de trabajo ni rating hoy — no explica si mostrarlos mejora la percepción. |
| E-002 | código + observación | `app/pages/buscar/index.vue:41,89,102`                          | Ni el filtro sticky ni el contenedor de resultados (`flex flex-col gap-3 lg:grid lg:grid-cols-3`) tienen `max-width`. En desktop ancho, con 1-3 resultados, la mayor parte de la pantalla queda vacía. | Es lectura de código + una captura real del dueño de producto (Electricidad, Puerto Varas), no un test con usuarios. |
| E-003 | benchmark     | patrones de grid de cards ([Card Grid Layout](https://coddy.tech/learn/html/practical_frontend/card_grid_layout), [What is Card Grid Layout](https://www.hashbuilds.com/patterns/what-is-card-grid-layout), [CSS Card Grid Layout](https://www.fixtools.io/css-tool/css-card-grid-layout)) | CSS Grid con `align-items: stretch` iguala automáticamente el alto de todas las cards de una misma fila; un slot de imagen con aspect-ratio fijo evita que la presencia o ausencia de foto cambie el alto de la card. | Son guías generales de layout web, no específicas de marketplaces de servicios ni validadas con tráfico real de Datealo. |
| E-004 | benchmark     | [TaskRabbit Identity Policy](https://support.taskrabbit.com/hc/en-us/articles/46260420987675-Identity-Policy) | TaskRabbit exige a sus Taskers una foto de perfil real y reconocible; el patrón de industria para "sin foto" es un avatar con iniciales o silueta, nunca una foto de stock genérica. Datealo ya implementa ese fallback (avatar con iniciales) en `SearchResultCard.vue`. | No encontramos el detalle específico de cómo Thumbtack o TaskRabbit tratan la ausencia de foto dentro de su propio grid de resultados — la búsqueda no fue concluyente en ese punto. |
| E-005 | uso (dato de la oferta actual) | captura del dueño de producto, categoría Electricidad en Puerto Varas | Con la oferta de profesionales que Datealo tiene hoy, una búsqueda típica devuelve 1-3 resultados, no decenas. Las referencias visuales que motivaron esta misión (Airbnb: "Más de 1000 alojamientos"; grid genérico de servicios: "51 Results") asumen un volumen que Datealo no tiene en esta etapa. | Es la oferta actual, pre-lanzamiento — no una proyección de cuándo cambiará. |

<a id="e-002"></a>

### E-002 — `/buscar` hereda un layout mobile sin adaptar a desktop

El contenedor raíz de la vista es `flex min-h-screen flex-col` (línea 40), el filtro sticky es
`flex gap-2 ... p-3.5` (línea 41) y el bloque de resultados es `flex flex-col gap-3 p-4 lg:p-8` con
`flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4` (líneas 89 y 102). Ninguno fija un ancho máximo: en
mobile el `flex-col` ocupa el ancho completo (correcto, es una sola columna), pero en desktop el mismo
`flex-col` sigue ocupando el 100% del viewport y el `grid-cols-3` reparte ese ancho completo entre como
máximo 3 cards por fila — con 1 resultado, esa card queda angosta y sola en una esquina.

Esto confirma que el "se ve pelado" no es solo falta de contenido en la card: es también la ausencia de un
contenedor que le dé un ancho razonable a la vista en desktop, independiente de cuántos resultados haya.

## Conclusiones

<a id="c-001"></a>

### C-001 — La card se ve pelada por dos causas independientes, no una

- **Sustento:** [E-001](#e-001), [E-002](#e-002).
- **Razonamiento:** el contenido de la card es pobre (falta foto y rating que el profesional ya cargó,
  porque el tipo de búsqueda no los expone) y, por separado, el contenedor de la vista no tiene ancho
  máximo, así que en desktop una card angosta queda perdida en una pantalla en blanco. Resolver solo una
  de las dos deja la otra visible.
- **Implicación:** la solución de esta misión necesita tocar tanto la card (qué muestra) como el layout de
  la página (`/buscar`, sin tocar el buscador/filtro en sí — territorio de la misión 09).
- **Confianza:** alta, porque está sustentada en lectura directa de código y una captura real del dueño de
  producto, no en una hipótesis.

<a id="c-002"></a>

### C-002 — Diseñar para un grid denso no es la referencia correcta en esta etapa

- **Sustento:** [E-005](#e-005).
- **Razonamiento:** Airbnb y los grids de servicios genéricos que motivaron esta misión asumen decenas o
  cientos de resultados por búsqueda; Datealo, con la oferta actual, resuelve la mayoría de las búsquedas
  con 1-3 profesionales. Copiar un grid pensado para volumen sin ese volumen agrava el problema — más
  columnas vacías, no menos.
- **Implicación:** la card individual tiene que cargar el peso visual (verse completa y sólida por sí
  sola), en vez de depender de que haya muchas cards juntas para que la vista se sienta llena.
- **Confianza:** alta, porque es el dato de oferta actual de Datealo, no una proyección — y es
  exactamente la restricción de arranque en frío que aplica a cualquier funcionalidad del lado buscador.

<a id="c-003"></a>

### C-003 — Un slot de imagen de aspect-ratio fijo, con el avatar existente como fallback, resuelve la
tensión entre "compacto" y "grid consistente"

- **Sustento:** [E-003](#e-003), [E-004](#e-004).
- **Razonamiento:** si cada card reserva el mismo espacio de imagen (con o sin foto real adentro), el
  grid se mantiene con el alto uniforme sin necesidad de que todos los profesionales tengan fotos de
  trabajo subidas — algo que hoy no se puede garantizar. El fallback no necesita inventarse: el avatar con
  iniciales que `SearchResultCard.vue` ya usa cuando no hay `avatarUrl` es exactamente el patrón que la
  industria usa para este caso.
- **Implicación:** ninguna card queda obligada a tener foto para verse terminada, y el grid no se vuelve
  irregular cuando unas la tienen y otras no.
- **Confianza:** media, porque es un patrón de layout general de industria — no está validado con el
  volumen real de fotos que los profesionales de Datealo terminen subiendo.

## El ideal: cada resultado se ve completo, exista o no una foto de trabajo

### El resultado ideal se ve así

Patricio abre `/buscar` en un monitor ancho, elige Electricidad y Puerto Varas, y ve un resultado — no
perdido en una pantalla en blanco, sino una card sustancial dentro de un contenedor centrado y con ancho
razonable. La card muestra la primera foto de trabajo que el profesional subió (o su avatar con iniciales
si todavía no subió ninguna), su nombre, comuna, precio desde, y — cuando ya tenga reseñas — su promedio y
cantidad (toda reseña en Datealo es "verificada por contacto" por construcción, así que no hace falta un
badge aparte para eso). Nada de eso es información nueva: todo ya lo cargó el profesional en su perfil o
ya lo calculó Datealo, la vista de resultados simplemente deja de esconderlo. Si la búsqueda trae dos o tres
resultados, todos comparten el mismo alto y la misma jerarquía visual, sin que la ausencia de foto en uno
de ellos rompa la fila. En mobile, la vista sigue siendo una columna legible de arriba a abajo, sin
competir por espacio horizontal.

### Capacidades del ideal

| Capacidad                         | Acción habilitada                                                          | Respuesta esperada                                                                                  | Conclusión que la justifica |
| ---------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------- |
| Card con foto/rating                | El buscador ve la card con foto de trabajo (o avatar) y rating sin salir de `/buscar`              | Datealo muestra todo dato que el profesional ya cargó a su perfil, sin pedirle nada nuevo             | [C-001](#c-001)              |
| Contenedor con ancho máximo        | El buscador en desktop ve resultados centrados, con espacio proporcional     | El layout respeta un ancho máximo; el espacio sobrante se reparte como margen, no como vacío en la card | [C-001](#c-001), [C-002](#c-002) |
| Grid con alto uniforme, con o sin foto | El buscador compara en una misma búsqueda profesionales con y sin fotos de trabajo | Todas las cards de una fila comparten el mismo alto; sin foto, el slot cae al avatar con iniciales existente | [C-003](#c-003)              |

### El ideal no significa agregar features nuevas ni tocar el buscador

- No significa sumar badges pagados, contador de vistas o favoritos — el dueño de producto fue explícito:
  esta misión mejora cómo se ve lo que ya existe, no agrega funcionalidad nueva. No existe un campo
  "verificado" en el modelo de profesional; solo las reseñas son verificadas por contacto, por
  construcción del token que las habilita — no hay nada nuevo que inventar ahí.
- No significa rediseñar el selector de categoría/comuna ni el buscador del header — eso es alcance de la
  misión 09 (layout general), en curso por separado.
- No significa que una card sin foto se vea inferior o "a medio construir" — el fallback con avatar tiene
  que sentirse tan resuelto como la versión con foto, no como un estado de carga pendiente.

## Referencias

- [Card Grid Layout](https://coddy.tech/learn/html/practical_frontend/card_grid_layout): usado en E-003
  para el patrón de `align-items: stretch` y alto uniforme entre cards.
- [What is Card Grid Layout? Uniform Card-Based Grid System](https://www.hashbuilds.com/patterns/what-is-card-grid-layout):
  usado en E-003 para el patrón de slot de imagen con aspect-ratio fijo.
- [CSS Card Grid Layout, Responsive Equal-Height Cards](https://www.fixtools.io/css-tool/css-card-grid-layout):
  usado en E-003 para la implementación de grids con alto equalizado en CSS.
- [TaskRabbit Identity Policy](https://support.taskrabbit.com/hc/en-us/articles/46260420987675-Identity-Policy):
  usado en E-004 para el estándar de foto de perfil real y avatar como fallback.
