# Misión: búsqueda y resultados — Investigación

**Estado:** activo

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando don Sergio busca un gasfiter en Puente Alto un domingo y no hay ninguno ahí

**Situación:** a don Sergio se le tapa el lavaplatos un domingo en la tarde, en Puente Alto. Abre Datealo,
elige "Gasfitería" y su comuna, y la lista sale vacía — los dos gasfiteres que ya se registraron en Datealo
están en Ñuñoa y Providencia, al otro lado de la ciudad. Es exactamente el escenario que anticipa el
catálogo de comunas de misión 03: 34 comunas activas de Gran Santiago más la zona del lago Llanquihue
(Puerto Varas, Frutillar, Puerto Montt y Llanquihue), y el registro de profesionales (misión 04) recién se
cerró hoy mismo, así que casi ninguna combinación de categoría y comuna tiene todavía más de uno o dos
profesionales.

**Acción o necesidad:** encontrar a alguien que resuelva el problema hoy, sin tener que adivinar si ampliar
la búsqueda a otra comuna sirve de algo o si Datealo simplemente no tiene nada para él.

**Respuesta actual:** hoy pregunta en el grupo de WhatsApp del edificio o busca en Facebook Marketplace —
ahí la búsqueda no está acotada a su comuna exacta, así que igual le puede responder alguien de más lejos
([E-008](#e-008)).

**Consecuencia:** si la pantalla de resultados se ve simplemente vacía, sin ninguna alternativa, don Sergio
cierra Datealo y vuelve al grupo de WhatsApp — y esto no es un caso raro: con el catálogo y el volumen
actuales, "pocos o cero resultados" es el resultado más probable de cualquier búsqueda al lanzamiento, no
la excepción ([E-003](#e-003)).

## Preguntas que la investigación debe resolver

- ¿Qué reemplaza a "ordenar por relevancia" cuando Datealo no tiene reseñas, tasa de respuesta ni ningún
  historial de un profesional? Afecta el criterio de orden que el ideal puede prometer.
- ~~¿Qué significa concretamente "comuna cercana" sin coordenadas ni un mapa de adyacencia entre comunas ya
  cargado en la base?~~ Resuelta: existen datasets públicos de coordenadas y límites reales que permiten
  calcular adyacencia real sin geocodificar a mano ([C-007](#c-007)) — la pregunta que queda abierta es cuál
  fuente usar y cómo cruzarla contra los códigos SUBDERE de Datealo, una decisión de `producto.md`.
- ¿Hace falta búsqueda por texto libre de categoría, o alcanza con elegir de una lista fija como ya hace el
  carrusel de la landing? Afecta si esta misión reabre el problema de vocabulario que misión 03 ya cerró
  para el registro.

## Evidencia

| ID    | Tipo             | Fuente                                                                                          | Hecho verificable | Límite de la evidencia |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | código             | `server/db/schema/professionals.ts`                                                              | El perfil de un profesional no tiene ninguna columna de rating, reseña, tasa de respuesta ni contador de contactos o vistas — solo `displayName`, `categoriaSlug` (uno solo), `comunaCodigo` (uno solo), `contact`, `description`, `priceFrom`, `photoPaths` y `active` | Dice qué datos existen hoy para ordenar resultados, no cómo debería verse ni ordenarse la búsqueda |
| E-002 | decisión interna   | [D-001](../03-taxonomia-categorias-y-comunas/producto.md#d-001), [D-004](../03-taxonomia-categorias-y-comunas/producto.md#d-004) de misión 03 | Categoría y comuna siempre se eligen de un catálogo fijo (`CategoriaSelect`, `ComunaSelect`), nunca texto libre; y D-001 deja explícito que "cómo un buscador la elige en pantalla... es una decisión de la misión 06, no de esta" | Fija una restricción de catálogo, no dice cómo ordenar los resultados ni qué mostrar cuando no hay ninguno |
| E-003 | código             | `server/db/seed/taxonomia.ts`, `docs/missions/04-registro-perfil-profesional/README.md`          | Hay 8 categorías activas × 38 comunas activas (34 de Gran Santiago + 4 de la zona del lago Llanquihue) = 304 combinaciones posibles de búsqueda, y el registro de profesionales (misión 04) recién se cerró el 2026-08-28, el mismo día en que se abre esta investigación | No mide cuántos profesionales reales existen hoy (no se consultó la base directamente), pero confirma que el volumen es necesariamente bajo por lo reciente del registro |
| E-004 | benchmark          | [Recommending Search Filters To Improve Conversions At Airbnb (arXiv)](https://arxiv.org/html/2602.23717v1) | Airbnb define "low inventory" como un resultado con menos de 18 listados (el tamaño de una página) y su sistema evita activamente sugerir filtros que dejen el conteo bajo ese umbral | Mide inventario de arriendos turísticos a escala global — Datealo no tiene ese volumen ni cerca, pero confirma que hasta un marketplace con millones de listados protege contra sobre-filtrar cuando el resultado ya es escaso |
| E-005 | benchmark          | [Evolution of Search Ranking at Thumbtack (Thumbtack Engineering)](https://medium.com/thumbtack-engineering/evolution-of-search-ranking-at-thumbtack-f7a69fd0da13) | El ranking de Thumbtack pondera historial del profesional, tasa de respuesta y reseñas junto con la solicitud del cliente; etiquetas como "Responds Quickly" o "In High Demand" solo aparecen en profesionales con historial acumulado | Describe un sistema de machine learning entrenado con años de datos de miles de transacciones — ninguna de esas señales (reseñas, tasa de respuesta) existe en Datealo hoy ([E-001](#e-001)) |
| E-006 | benchmark          | [How does Yelp determine its search results? (Yelp Support Center)](https://www.yelp-support.com/article/How-does-Yelp-determine-its-search-results) | El sort "Recommended" (default) combina término de búsqueda, distancia, rating y datos de uso; "Distance" es un sort alternativo que reordena solo por proximidad — un negocio a una cuadra puede ganarle a uno con mejor rating a varios kilómetros | Yelp tiene millones de reseñas para alimentar "Recommended" — Datealo no tiene ninguna, así que ese modo no es replicable hoy; pero confirma que ordenar solo por proximidad ("Distance") es un modo válido que un producto maduro ya ofrece cuando no hay otra señal |
| E-007 | benchmark          | [Understand & manage your location when you search on Google (Google Search Help)](https://support.google.com/websearch/answer/179386) | Sin permiso de ubicación precisa, Google estima un "área general" (más de 3 km²) desde IP o wifi y sigue mostrando resultados locales, aunque pueden estar "más lejos de lo que en verdad estás" | Es búsqueda web general, no un marketplace de servicios, pero confirma que degradar sin geolocalización de precisión no es una limitación inventada por falta de presupuesto — es el patrón estándar cuando no se pide GPS |
| E-008 | benchmark general de UX | [Search UX Best Practices (Pencil & Paper)](https://www.pencilandpaper.io/articles/search-ux), [Empty state UX examples and design rules that actually work (Eleken)](https://www.eleken.co/blog-posts/empty-state-ux) | La práctica estándar ante cero resultados es nunca dejar una pantalla vacía sin salida: reconocer la falta de resultados y ofrecer un siguiente paso concreto (ampliar el filtro, ver alternativas relacionadas) | Son guías generales de UX de búsqueda, no específicas de marketplaces de servicios locales ni validadas con usuarios reales de Datealo |
| E-009 | decisión interna   | Brief de esta misión (ver [README](./README.md)), conversación de roadmap del 2026-08-13         | La dirección propuesta es ordenar por relevancia y cercanía por comuna "como un portal inmobiliario", sin geolocalización de precisión; el debounce de 300ms sin resultados mientras se escribe y los estados vacíos que inviten a probar otra categoría o comuna ya son estándar del producto (`CLAUDE.md`) | Es una recomendación a confirmar en `producto.md`, no una decisión ratificada — y "como un portal inmobiliario" describe la sensación deseada, no un mecanismo verificado: no se encontró documentación técnica pública de cómo Yapo.cl o Portalinmobiliario calculan esa cercanía entre comunas |
| E-010 | código             | `server/db/schema/comunas.ts`                                                                    | La tabla de comunas solo tiene `codigo`, `nombre` y `activa` — no tiene coordenadas ni ninguna relación de comunas vecinas o adyacentes | Dice qué falta, no cómo debería resolverse (coordenadas y cálculo real, o una lista fija de adyacencia mantenida a mano) |
| E-011 | dataset externo    | [Todas las comunas de Chile con sus coordenadas geográficas (gist de rafafdz)](https://gist.github.com/rafafdz/a67d3f6ac058c45cfad8176bf583b632) | Existe un dataset público y gratuito en CSV con latitud/longitud por comuna chilena, cubriendo casi todas las comunas del país | No está atado a los códigos oficiales SUBDERE que ya usa la tabla `comunas` de Datealo — cruzarlo exige hacerlo por nombre, con riesgo de comunas homónimas o tildes distintas, no es un join automático sin revisión |
| E-012 | dataset externo    | [caracena/chile-geojson](https://github.com/caracena/chile-geojson), [fcortes/Chile-GeoJSON](https://github.com/fcortes/Chile-GeoJSON), [niclabs/maps](https://github.com/niclabs/maps) | Existen al menos tres fuentes públicas independientes con los límites geográficos reales (polígonos) de las comunas chilenas, de los que se puede calcular qué comunas comparten frontera — adyacencia real, no solo distancia en línea recta | Son proyectos de la comunidad, no una fuente oficial única — ninguno declara licencia explícita ni mantenimiento activo (ej. `caracena/chile-geojson` tiene solo 2 commits), hay que validar cobertura y licencia antes de depender de uno |

<a id="e-004"></a>

### E-004 — Hasta Airbnb evita activamente que un filtro deje pocos resultados

Airbnb mide "low inventory" en 18 listados — el tamaño de una página de resultados — y su módulo de
recomendación de filtros descarta cualquier filtro que dejaría el conteo por debajo de eso, aunque el
filtro sea relevante para la búsqueda. Lo hacen con millones de propiedades disponibles globalmente.

Esto permite afirmar que "no dejar que un filtro vacíe la lista" es un principio de diseño válido incluso a
gran escala, pero no demuestra qué debería hacer Datealo en concreto — a la escala de Datealo el problema no
es qué filtro sacar, es que la lista ya nace corta antes de aplicar ningún filtro.

<a id="e-009"></a>

### E-009 — La analogía "como un portal inmobiliario" no tiene un mecanismo verificado detrás

La búsqueda de propiedades en Yapo.cl y Portalinmobiliario permite filtrar por comuna, pero no se encontró
documentación pública de cómo esos portales calculan o muestran "comunas cercanas" cuando la elegida no
tiene resultados. La analogía del brief describe la sensación que se busca (una lista ordenada por zona, no
una búsqueda exacta que falla en seco), no un algoritmo que copiar.

Esto permite afirmar que la dirección del brief es una hipótesis de producto razonable, respaldada por el
patrón general de degradar sin geolocalización de precisión ([E-007](#e-007)), pero no demuestra que exista
un mecanismo listo para reusar — el cómo todavía hay que diseñarlo, empezando por resolver [E-010](#e-010).

## Conclusiones

<a id="c-001"></a>

### C-001 — Pocos o cero resultados va a ser el caso típico de una búsqueda al lanzamiento, no el caso raro

- **Sustento:** [E-003](#e-003), [E-004](#e-004).
- **Razonamiento:** con 304 combinaciones posibles de categoría y comuna y un registro de profesionales que
  recién se cerró hoy, la mayoría de esas combinaciones va a tener cero o uno o dos profesionales durante
  meses. Si Airbnb, con millones de propiedades, ya trata "menos de 18 resultados" como un estado a evitar
  activamente, en Datealo ese mismo estado no es una rareza a manejar con un mensaje de cortesía — es el
  resultado más probable de cualquier búsqueda real.
- **Implicación:** el buscador no puede diseñarse asumiendo que va a haber suficiente oferta para que
  filtros u orden avanzados tengan sentido. Tiene que funcionar bien con 0, 1 o 2 resultados como el caso
  principal a resolver primero, igual que misión 05 tuvo que diseñar el perfil asumiendo cero reseñas como
  el estado normal, no la excepción.
- **Confianza:** alta — combina un hecho interno verificable (E-003) con un patrón consistente de un
  benchmark a escala mucho mayor (E-004).

<a id="c-002"></a>

### C-002 — Sin reseñas, tasa de respuesta ni historial, Datealo no tiene ninguna señal propia de "relevancia" — solo cercanía y qué tan completo está el perfil

- **Sustento:** [E-001](#e-001), [E-005](#e-005), [E-006](#e-006).
- **Razonamiento:** Thumbtack y el modo "Recommended" de Yelp ponderan reseñas, tasa de respuesta y datos de
  uso — ninguno de esos datos existe en la base de Datealo hoy (E-001), porque misión 07 (reseñas) todavía
  no se construye y el contacto pasa por WhatsApp, fuera del control de Datealo. El modo "Distance" de Yelp,
  en cambio, no depende de ninguno de esos datos y coincide con lo único que Datealo sí tiene: la comuna del
  profesional.
- **Implicación:** el orden inicial del buscador no puede llamarse "relevancia" en el sentido en que
  Thumbtack o Yelp lo usan — tiene que ser honesto sobre qué está ordenando (cercanía y completitud del
  perfil: fotos, descripción, precio), no simular un ranking de calidad que no tiene datos detrás.
- **Confianza:** alta — es una restricción verificable de lo que existe hoy (E-001), reforzada por dos
  benchmarks consistentes.

<a id="c-003"></a>

### C-003 — "Cercanía por comuna" hoy es una idea sin mecanismo: la base no tiene cómo calcular qué tan cerca está una comuna de otra

- **Sustento:** [E-010](#e-010).
- **Razonamiento:** el schema actual de comunas (`codigo`, `nombre`, `activa`) no guarda coordenadas ni una
  relación de comunas vecinas. Ordenar "por cercanía" o mostrar "comunas vecinas cuando la exacta no tiene
  nadie" (la dirección del brief, [E-009](#e-009)) requiere agregar ese dato — no es algo que ya exista y
  solo falte usar.
- **Implicación:** antes de que `producto.md` pueda prometer comunas vecinas marcadas con su distancia,
  tiene que decidir de dónde sale ese dato: coordenadas con cálculo real, o una lista fija de adyacencia por
  zona (ej. agrupar Gran Santiago en sectores) mantenida a mano, con el mismo criterio manual que ya se usa
  para activar categorías y comunas (D-002 de misión 03).
- **Confianza:** alta — es una restricción verificable del schema actual, no una inferencia externa.

<a id="c-004"></a>

### C-004 — Degradar sin geolocalización de precisión ya es el patrón que usan productos con muchos más recursos que Datealo

- **Sustento:** [E-007](#e-007), [E-009](#e-009).
- **Razonamiento:** Google, con toda su infraestructura de geolocalización, igual degrada a un "área
  general" en vez de un punto exacto cuando no tiene permiso preciso, y sigue entregando resultados locales
  útiles. La dirección que ya trae el brief de esta misión (comuna elegida a mano, no GPS) va en la misma
  línea.
- **Implicación:** no vale la pena invertir en geolocalización de precisión para el lanzamiento — elegir la
  comuna a mano, reusando `ComunaSelect` de misión 03, es consistente con cómo degrada la búsqueda local un
  producto con muchos más recursos que Datealo.
- **Confianza:** media — el benchmark es de búsqueda web general, no de un marketplace de servicios, así que
  confirma el patrón general pero no lo prueba para este caso específico.

<a id="c-005"></a>

### C-005 — Un resultado vacío o casi vacío necesita una salida concreta, y en Datealo esto va a pasar seguido, no ocasionalmente

- **Sustento:** [E-008](#e-008), [C-001](#c-001).
- **Razonamiento:** la práctica de UX ya dice que un cero-resultados sin salida frustra y hace abandonar —
  eso es justo lo que `CLAUDE.md` anticipa (estados vacíos que inviten a probar otra categoría o comuna).
  Pero deja de ser un detalle cosmético cuando el caso vacío es el resultado más probable de cualquier
  búsqueda al lanzamiento (C-001), no una rareza.
- **Implicación:** el estado vacío no es algo a resolver después en `experiencia.md` con solo un mensaje —
  necesita una salida concreta definida en `producto.md` (ej. comunas vecinas, u otras categorías con oferta
  en la misma comuna), consistente con lo que este mismo estado vacío va a exigir en la mayoría de las
  búsquedas, no en un caso límite aislado.
- **Confianza:** alta.

<a id="c-006"></a>

### C-006 — Elegir la categoría de una lista fija, no escribirla, ya es la dirección que la decisión previa de misión 03 sostiene

- **Sustento:** [E-002](#e-002).
- **Razonamiento:** D-004 de misión 03 exige que categoría y comuna sean siempre una referencia al catálogo,
  nunca texto libre, y el mismo componente (`CategoriaSelect`, `ComunaSelect`) que usa el registro (misión
  04) ya existe para reutilizar en el buscador. D-001 de misión 03 deja abierto cómo se elige en pantalla,
  pero no obliga a texto libre — la restricción de "siempre catálogo" sí es vinculante.
- **Implicación:** el buscador parte de una lista de categorías para tocar (como ya hace el carrusel de la
  landing), no de una caja de texto libre con matching de sinónimos — eso solo se reconsidera si aparece
  evidencia real de que la gente prefiere escribir en vez de tocar, y en ese caso reabre el problema de
  vocabulario que misión 03 ya cerró para el registro (CL-003, retirado en esa misión por la misma razón).
- **Confianza:** alta — es una restricción de una decisión de producto ya aprobada, no una inferencia
  externa.

<a id="c-007"></a>

### C-007 — Calcular cercanía real entre comunas es más barato de lo que parecía: no hay que geocodificar a mano, hay que cruzar un dataset público una sola vez

- **Sustento:** [E-011](#e-011), [E-012](#e-012).
- **Razonamiento:** el supuesto de que agregar coordenadas exige geocodificar 346 comunas a mano no es
  cierto — ya existen varios datasets públicos y gratuitos con coordenadas o límites reales de las comunas
  chilenas. El trabajo real no es generar el dato desde cero, es cruzarlo una vez contra los códigos SUBDERE
  que ya usa la tabla `comunas` ([E-010](#e-010)) y validar que la cobertura y la licencia sirvan — un
  trabajo de ingeniería acotado y de una sola vez, no mantenimiento manual continuo.
- **Implicación:** una "zona fija mantenida a mano" deja de ser claramente la opción más barata frente a
  calcular adyacencia real (qué comunas comparten frontera) a partir de un dataset de límites — es
  probablemente más preciso, más fácil de explicar ("comuna vecina" es la que comparte límite, no un número
  de zona inventado) y no exige que alguien la actualice a mano cada vez que se active una comuna nueva.
- **Confianza:** media — confirma que el dato existe y es accesible, pero no valida todavía la calidad,
  cobertura exacta ni licencia de ningún dataset específico; eso es trabajo de ingeniería antes de
  comprometerse a una fuente.

## El ideal: cualquier persona encuentra en segundos a los profesionales más cerca de su categoría y comuna, y nunca se topa con una pantalla vacía sin salida

### El resultado ideal se ve así

Don Sergio abre Datealo desde su celular en Puente Alto un domingo porque se le tapó el lavaplatos. Toca
"Gasfitería" de una lista de categorías y elige "Puente Alto" de la lista de comunas, sin escribir ninguna
de las dos a mano. Como todavía no hay ningún gasfiter registrado en Puente Alto, no ve una pantalla vacía:
ve a los tres gasfiteres más cercanos —dos en La Florida, uno en San Bernardo— cada uno
marcado con su comuna, sus fotos, su precio "desde $X" y hace cuánto está en Datealo, sin ningún número de
reseñas inventado porque todavía no existen. Elige al primero y le escribe directo por WhatsApp desde su
perfil. Semanas después, cuando alguien busca "Jardinería" en Providencia y ya hay seis jardineros
registrados ahí, Datealo los ordena por cercanía real dentro de la comuna, sin fingir que sabe cuál es
"mejor" porque ninguno tiene reseñas todavía.

### Capacidades del ideal

| Capacidad                                                    | Acción habilitada                                                | Respuesta esperada                                                                                     | Conclusión que la justifica |
| -------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Elegir categoría de una lista fija                           | Tocar una categoría, como ya hace el carrusel de la landing          | Ve solo profesionales activos de esa categoría, sin escribir ni adivinar sinónimos                          | [C-006](#c-006)              |
| Elegir su comuna a mano, sin GPS                              | Seleccionar una comuna activa del catálogo (`ComunaSelect`)          | Ve profesionales de esa comuna, sin que Datealo le pida permiso de ubicación precisa                        | [C-004](#c-004)              |
| Ver resultados ordenados sin una relevancia inventada         | Abre la lista de resultados de su categoría y comuna                 | Los ve ordenados por cercanía y por qué tan completo está el perfil, nunca por un rating o reseña que no existe | [C-002](#c-002)              |
| Ver alternativas cuando su comuna no tiene nadie              | Busca en una comuna sin profesionales activos de esa categoría       | Ve profesionales de comunas vecinas marcados con su distancia, en vez de una pantalla vacía                 | [C-001](#c-001), [C-003](#c-003), [C-005](#c-005) |
| Nunca perder resultados por un filtro que los vacía           | Aplica cualquier filtro futuro (precio, disponibilidad)              | Datealo no deja que un filtro reduzca la lista a un puñado o a cero sin ofrecer una alternativa            | [C-001](#c-001)              |

### El ideal no significa que Datealo sepa más de lo que en verdad sabe

- No significa que ya exista un mecanismo real de cercanía entre comunas — el ideal lo asume, pero hoy no
  existe ese dato en la base ([C-003](#c-003)); construirlo es parte de lo que `producto.md` tiene que
  decidir, no algo que ya esté resuelto.
- No significa ranking por calidad o reputación — sin reseñas, "ordenado" no quiere decir "el mejor
  primero", quiere decir "el más cerca y el más completo primero" ([C-002](#c-002)).
- No significa geolocalización GPS de precisión — la comuna se elige a mano, Datealo no detecta la ubicación
  exacta de nadie automáticamente ([C-004](#c-004)).
- No significa que el buscador tenga que escribir para encontrar su categoría — elige de una lista fija,
  igual que ya elige de una lista al registrarse ([C-006](#c-006)).

## Referencias

- [Recommending Search Filters To Improve Conversions At Airbnb (arXiv)](https://arxiv.org/html/2602.23717v1):
  usado en E-004 para el umbral de "low inventory" y cómo Airbnb evita activamente generarlo.
- [Evolution of Search Ranking at Thumbtack (Thumbtack Engineering)](https://medium.com/thumbtack-engineering/evolution-of-search-ranking-at-thumbtack-f7a69fd0da13):
  usado en E-005 para qué señales alimentan un ranking de "relevancia" con historial acumulado.
- [How does Yelp determine its search results? (Yelp Support Center)](https://www.yelp-support.com/article/How-does-Yelp-determine-its-search-results):
  usado en E-006 para la diferencia entre ordenar por "Recommended" y por "Distance".
- [Understand & manage your location when you search on Google (Google Search Help)](https://support.google.com/websearch/answer/179386):
  usado en E-007 para cómo degrada la búsqueda local sin permiso de ubicación precisa.
- [Search UX Best Practices (Pencil & Paper)](https://www.pencilandpaper.io/articles/search-ux) y
  [Empty state UX examples and design rules that actually work (Eleken)](https://www.eleken.co/blog-posts/empty-state-ux):
  usados en E-008 para la práctica estándar ante cero resultados de búsqueda.
- [Todas las comunas de Chile con sus coordenadas geográficas (gist de rafafdz)](https://gist.github.com/rafafdz/a67d3f6ac058c45cfad8176bf583b632):
  usado en E-011 para confirmar que existe un dataset público de coordenadas por comuna.
- [caracena/chile-geojson](https://github.com/caracena/chile-geojson), [fcortes/Chile-GeoJSON](https://github.com/fcortes/Chile-GeoJSON):
  usados en E-012 para confirmar que existen límites geográficos reales por comuna, públicos y gratuitos.
