# Misión: búsqueda y resultados — Producto

**Estado:** vigente — aprobado por Patricio el 2026-08-28

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Qué construimos: elegir categoría y comuna y ver a los profesionales más cerca, sin una pantalla vacía cuando la comuna exacta no tiene a nadie

**Resultado:** cualquier persona toca una categoría y una comuna de dos listas fijas y ve, en segundos, a
los profesionales activos de esa categoría y comuna — ordenados por qué tan completo está su perfil, nunca
por una reseña o un rating que no existe. Si su comuna exacta todavía no tiene a nadie de esa categoría, ve
en su lugar a los de las comunas vecinas, marcados con su nombre, en vez de una lista vacía.

**Recorte respecto del ideal:** el ideal ([investigacion.md](./investigacion.md)) incluye, más adelante, un
orden que sí incorpore reseñas cuando existan. Acá se recorta a lo que hay datos para sostener hoy: sin
reseñas ([C-002](./investigacion.md#c-002)), el orden usa completitud del perfil y antigüedad, no calidad —
es un criterio interino que se espera reemplazar apenas exista una señal real (ver [D-001](#d-001)). La
cercanía sí usa adyacencia geográfica real (comunas que comparten límite), calculada una sola vez desde un
dataset público ([C-007](./investigacion.md#c-007)) — no muestra una distancia en kilómetros esta entrega.

**Restricciones aceptadas:** solo categoría y comuna como filtros — sin precio, disponibilidad ni rating
todavía; sin mapa visual de resultados, solo lista; sin geolocalización automática — la comuna siempre se
elige a mano; comuna y categoría son obligatorias para ver resultados, no hay una vista de "todo el
catálogo" sin filtrar.

## Funcionalidades

| ID    | Funcionalidad                                                                 | Lado     | Sustento                     | Éxito |
| ----- | -------------------------------------------------------------------------------- | -------- | ------------------------------- | ----- |
| F-001 | Buscar profesionales de una categoría en una comuna y verlos ordenados sin datos inventados | buscador | C-001, C-002, C-006, D-001, D-003, D-004 | M-001 |
| F-002 | Ver profesionales de comunas vecinas cuando la comuna elegida no tiene a nadie   | buscador | C-001, C-003, C-005, D-002      | M-002 |

<a id="f-001"></a>

### F-001 — Buscar profesionales de una categoría en una comuna y verlos ordenados sin datos inventados

Cuando a don Sergio se le tapa el lavaplatos un domingo y no conoce a ningún gasfiter de confianza,
quiero elegir "Gasfitería" y mi comuna y ver quién puede ayudarme,
para decidir a quién contactar sin tener que preguntarle a nadie primero.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** al menos un perfil activo (misión 04)
en esa categoría y comuna exactas — funciona igual con 1 o con 50 profesionales, el orden es el mismo
mecanismo.

**Sustento:** [C-001](./investigacion.md#c-001), [C-002](./investigacion.md#c-002),
[C-006](./investigacion.md#c-006), [D-001](#d-001), [D-003](#d-003), [D-004](#d-004). **Éxito:**
[M-001](#m-001).

**Reglas:**

- Don Sergio elige la categoría tocando una opción de una lista fija (`CategoriaSelect`, [D-003](#d-003)) y
  la comuna tocando una opción de la lista de comunas activas (`ComunaSelect`, misión 03) — ambas son
  obligatorias antes de ver ningún resultado ([D-004](#d-004)).
- Solo aparecen profesionales con `active = true` de esa categoría y esa comuna exacta.
- Dentro de la misma comuna, se ordenan por completitud del perfil (fotos, descripción y precio cargados) y,
  en empate, por antigüedad del perfil — nunca por un puntaje de "relevancia" simulado ni al azar
  ([D-001](#d-001)).
- Si no hay ningún profesional activo en esa categoría y comuna, Datealo no muestra una lista vacía —
  entrega el resultado de [F-002](#f-002) en su lugar.
- Datealo nunca muestra un contador de reseñas, un rating ni ningún indicador de calidad que no exista
  todavía — mismo criterio que el perfil público (misión 05).

**Ejemplo verificable:** dado que hay dos gasfiteres activos en Ñuñoa —uno con 3 fotos, descripción y
precio; otro solo con nombre y contacto—, cuando alguien busca "Gasfitería" en "Ñuñoa", entonces ve a ambos,
el primero (perfil completo) antes que el segundo.

**No incluye:** filtros de precio, disponibilidad o rating (ver Fuera de alcance), geolocalización
automática de la comuna (ver [C-004](./investigacion.md#c-004)), búsqueda por texto libre de categoría
([D-003](#d-003)).

**Experiencia:** pendiente. **Ingeniería:** pendiente.

<a id="f-002"></a>

### F-002 — Ver profesionales de comunas vecinas cuando la comuna elegida no tiene a nadie

Cuando don Sergio busca "Gasfitería" en Puente Alto y todavía no hay ningún gasfiter registrado ahí,
quiero ver igual a alguien cercano en vez de una pantalla vacía,
para no tener que adivinar si ampliar la búsqueda a otra comuna sirve de algo.

**Lado del marketplace:** buscador. **Qué necesita del otro lado:** al menos un perfil activo de esa
categoría en alguna comuna vecina real (comparte límite con la elegida, ver [D-002](#d-002)) — si tampoco
hay ninguno ahí, entra [CL-001](#cl-001).

**Sustento:** [C-001](./investigacion.md#c-001), [C-003](./investigacion.md#c-003),
[C-005](./investigacion.md#c-005), [D-002](#d-002). **Éxito:** [M-002](#m-002).

**Reglas:**

- Si la comuna elegida no tiene ningún profesional activo de esa categoría, Datealo muestra los de sus
  comunas vecinas reales — las que comparten límite geográfico con ella ([D-002](#d-002)) —, cada uno
  marcado con el nombre de su propia comuna — nunca mezclados sin decir que no son de la comuna exacta que
  se buscó.
- Un resultado de la comuna exacta, si existe, siempre aparece antes que cualquier resultado de una comuna
  vecina — el fallback solo se activa cuando la comuna exacta está en cero.
- Si tampoco hay ningún profesional activo en ninguna comuna vecina, Datealo no expande más lejos — entra el
  estado vacío honesto de [CL-001](#cl-001).

**Ejemplo verificable:** dado que Puente Alto no tiene gasfiteres activos pero La Florida (comuna vecina,
comparte límite) tiene dos, cuando alguien busca "Gasfitería" en "Puente Alto", entonces ve a los dos de La
Florida, cada uno marcado "La Florida", no una pantalla vacía.

**No incluye:** mostrar una distancia en kilómetros (esta entrega no la calcula ni la muestra, ver
[D-002](#d-002)), expandir la búsqueda más allá de las comunas vecinas directas de la comuna elegida.

**Experiencia:** pendiente. **Ingeniería:** pendiente.

## Casos límite que cruzan funcionalidades

<a id="cl-001"></a>

| ID     | Condición concreta                                                                 | Comportamiento esperado                                                                                            | Funcionalidades |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| CL-001 | Ni la comuna elegida ni ninguna de sus comunas vecinas reales tienen un profesional activo de esa categoría | Datealo muestra un estado vacío honesto —sin inventar resultados de más lejos— con una invitación a probar otra categoría o comuna | F-001, F-002     |
| CL-002 | La categoría elegida no tiene ningún profesional activo en ninguna comuna activa del país | Mismo comportamiento que CL-001, a nivel de toda la categoría, no solo de una comuna                                    | F-001, F-002     |
| CL-003 | Solo hay un profesional activo en toda la comuna y categoría buscada                    | Se muestra igual, sin ningún elemento de "otras opciones" fabricado para simular una lista más larga                     | F-001            |
| CL-004 | Dos profesionales de la misma comuna y categoría empatan en completitud de perfil y en fecha de registro | El orden es estable entre recargas de la misma búsqueda (ej. por `id`) — nunca cambia solo porque se refrescó la página | F-001            |

## Fuera de alcance

| Capacidad o caso                                            | Estado     | Razón del recorte                                                                                     | Condición para reconsiderar |
| ----------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| Filtros de precio, rating o disponibilidad                        | postergada | Con la oferta esperada al lanzamiento, cada filtro combinado reduce la lista a cero con más facilidad que ayuda ([C-001](./investigacion.md#c-001)) | Una categoría-comuna promedia 15+ profesionales activos (mismo umbral que misión 03 usa para subcategorías) |
| Mapa visual de resultados                                         | postergada | El ideal no lo exige, y aunque ahora sí hay coordenadas disponibles (D-002), mostrar un mapa es trabajo de UI que esta entrega no necesita para resolver el fallback | Si se decide mostrar resultados en un mapa, no solo en lista |
| Geolocalización GPS automática de la comuna                       | postergada | Cada profesional está atado a una comuna, no a una dirección exacta — GPS exigiría el permiso del navegador y traducir coordenadas a comuna sin ganar ninguna precisión real, porque no hay ningún dato más fino contra el cual ordenar | Cuando el perfil de un profesional guarde una dirección o ubicación exacta, no solo su comuna |
| Búsqueda por texto libre de categoría                              | postergada | Reabriría el problema de sinónimos que misión 03 ya cerró para el registro, sin catálogo que lo justifique ([D-003](#d-003)) | El catálogo de categorías crece mucho, o aparece evidencia real de que la gente prefiere escribir en vez de tocar |
| Distancia real en kilómetros entre una comuna y sus vecinas       | postergada | D-002 calcula adyacencia (comparte límite o no), no una distancia — mostrar "a 8 km" exige un cálculo adicional que esta entrega no hace | Si aparece evidencia de que la sola etiqueta "comuna vecina" no alcanza para decidir |

## Señales de éxito

<a id="m-001"></a>

### M-001 — El orden por completitud ayuda a decidir, no da lo mismo que cualquier otro orden

- **Pregunta:** ¿de los que buscan y sí encuentran resultados en su comuna exacta, una parte real abre un
  perfil, o el orden no influye en nada?
- **Señal (qué observaríamos si funciona):** de cada 10 búsquedas con al menos un resultado en la comuna
  exacta, al menos 4 abren un perfil.
- **Método y umbral:** sin analítica instrumentada todavía — se resuelve cuando exista (fuera del alcance
  técnico de esta misión, mismo criterio que misión 04 y 05). Mientras tanto, revisión cualitativa de
  Patricio sobre las primeras búsquedas reales.
- **Guardrail:** ningún perfil queda oculto por tener el perfil vacío — CL-003 y las reglas de F-001
  garantizan que se ordena después, nunca se esconde.

<a id="m-002"></a>

### M-002 — El fallback a comunas vecinas rescata la búsqueda en vez de que la gente abandone

- **Pregunta:** ¿cuando la comuna exacta no tiene a nadie, ver profesionales de una comuna vecina de verdad
  convierte, o la gente igual se va al ver que no son de su comuna?
- **Señal:** de cada 10 búsquedas que caen en el fallback de F-002, al menos 3 abren un perfil de esa lista.
- **Método y umbral:** revisión cualitativa de Patricio sobre las primeras búsquedas reales — sin
  instrumentación todavía.
- **Guardrail:** el fallback nunca se presenta como si fuera un resultado real de la comuna exacta — siempre
  marcado con el nombre de su propia comuna, para que quien busca sepa que no es lo que pidió.

## Decisiones de producto

<a id="d-001"></a>

### D-001 — Dentro de una comuna, los resultados se ordenan por completitud del perfil y antigüedad — nunca por un ranking de "relevancia" simulado ni al azar

- **Estado:** aceptada, y explícitamente interina — no la versión final del criterio de orden. **Fecha:**
  2026-08-28.
- **Sustento:** [C-002](./investigacion.md#c-002).
- **Tensión:** un orden aleatorio en cada carga le da a cada profesional la misma oportunidad de aparecer
  primero sin importar cuándo se registró, pero puede poner un perfil vacío (sin fotos ni descripción) por
  delante de uno completo — contradice directamente lo que la investigación concluye que sí puede prometerse
  hoy (C-002). Ordenar solo por antigüedad (el que se registró primero, siempre arriba) es predecible, pero
  no recompensa a quien sí completó su perfil, y no hay ninguna razón real para que "más antiguo" signifique
  "mejor".
- **Alternativas descartadas:** orden aleatorio en cada carga — descartado porque puede mostrar un perfil
  vacío por delante de uno completo, y el ideal de investigación exige que el orden refleje qué tan completo
  está el perfil, no azar. Orden por antigüedad simple — descartado porque no incentiva a nadie a completar
  su perfil (misión 04, F-002) y no distingue entre dos profesionales igual de nuevos si uno subió fotos y
  el otro no.
- **Decisión y consecuencia:** dentro de la misma comuna, los resultados se ordenan por completitud del
  perfil (cuántos de fotos, descripción y precio tiene cargados, de más a menos) y, en empate, por
  antigüedad del perfil (el más antiguo primero, ver [CL-004](#cl-004) para el empate total). Ningún
  resultado se presenta como "recomendado" ni "mejor calificado" — el orden es honesto sobre lo que mide.
  Es el mejor criterio disponible con los datos que existen hoy (C-002), no uno que se espere que dure: el
  día en que exista una señal real de calidad, este criterio deja de ser suficiente casi de inmediato.
- **Reapertura:** cuando exista alguna señal real de calidad (reseñas de misión 07, o una tasa de respuesta
  medible), se reabre para decidir si reemplaza o se combina con este criterio — se espera que esto ocurra,
  no es una posibilidad remota; "completitud + antigüedad" es un punto de partida, no el diseño final del
  orden de resultados.

<a id="d-002"></a>

### D-002 — Una "comuna vecina" es la que comparte límite real con la elegida, calculado una sola vez desde un dataset público — no una zona inventada a mano

- **Estado:** aceptada. **Fecha:** 2026-08-28 (revisada 2026-08-28).
- **Sustento:** [C-003](./investigacion.md#c-003), [C-007](./investigacion.md#c-007).
- **Qué decía antes, en corto:** la primera versión de esta decisión (mismo día) proponía un mapa fijo de
  zonas por sector, mantenido a mano igual que el campo `activa`, asumiendo que agregar coordenadas exigía
  geocodificar 346 comunas desde cero. Murió apenas se investigó un poco más: ya existen datasets públicos
  con coordenadas y límites reales de las comunas chilenas ([E-011](./investigacion.md#e-011),
  [E-012](./investigacion.md#e-012)), así que ese costo no es real. Lo que sobrevive de la versión anterior
  es que sigue sin haber presupuesto para un mapa visual ni para mostrar una distancia en kilómetros esta
  entrega (ver Fuera de alcance) — cambia el *cómo* se calcula "cerca", no el alcance visible para quien
  busca.
- **Tensión:** un mapa de zonas a mano es más rápido de escribir hoy mismo, pero es un número de zona
  inventado por Datealo, no algo que un chileno reconozca ("¿por qué La Cisterna está en mi misma zona y
  San Bernardo no?"), y hay que rehacerlo a mano cada vez que se active una comuna nueva. Calcular adyacencia
  real (qué comunas comparten frontera) desde un dataset de límites geográficos es más intuitivo — "vecina"
  significa lo mismo que en la vida real — y se recalcula solo cuando se activa una comuna nueva, sin que
  nadie tenga que redibujar zonas; el costo es un trabajo de ingeniería de una sola vez para elegir la
  fuente, cruzarla contra los códigos SUBDERE de la tabla `comunas` y validar que la cobertura y la licencia
  sirvan.
- **Alternativas descartadas:** mapa fijo de zonas por sector mantenido a mano — descartada por ser la
  versión anterior de esta misma decisión (ver arriba). Agregar coordenadas y ordenar por distancia en línea
  recta (Haversine) en vez de por adyacencia — descartada porque la distancia recta puede engañar en un país
  tan alargado y con cordillera de por medio (dos comunas pueden estar cerca en línea recta y separadas por
  un cerro sin conexión directa); "comparte límite" es más fiel a cómo la gente entiende "comuna vecina".
  Mostrar todo el Gran Santiago como "vecino" sin ninguna agrupación — descartada porque mezclaría comunas
  realmente lejanas entre sí (ej. Puente Alto y Lampa) como si fueran cercanas, rompiendo la promesa de
  "cerca" del ideal.
- **Decisión y consecuencia:** Datealo calcula, una sola vez, qué comunas comparten límite real con cada
  comuna activa, cruzando los códigos SUBDERE de la tabla `comunas` contra un dataset público de límites
  geográficos (a elegir y validar en `ingenieria.md` — ver [E-012](./investigacion.md#e-012)), y guarda ese
  resultado en la base. Cuando la comuna elegida no tiene resultados, Datealo muestra los de sus comunas
  vecinas reales, marcadas con su nombre de comuna — nunca con una distancia en kilómetros, porque esta
  entrega no calcula ni muestra esa cifra (ver Fuera de alcance).
- **Reapertura:** si el dataset elegido en `ingenieria.md` resulta tener huecos de cobertura o problemas de
  licencia, se revisa esta decisión — el mapa fijo de zonas queda como respaldo de emergencia, no como plan
  B silencioso.

<a id="d-003"></a>

### D-003 — La categoría se elige tocando una opción de una lista fija, nunca escribiendo texto libre

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** [C-006](./investigacion.md#c-006).
- **Tensión:** un campo de texto libre con autocompletado se siente más natural para quien ya sabe
  exactamente qué palabra usar, pero reabre el problema de vocabulario que misión 03 ya cerró para el
  registro (D-004 de esa misión) — "electricista" y "instalaciones eléctricas" tendrían que reconocerse como
  la misma categoría, y ese diccionario de sinónimos no existe hoy. Tocar de una lista fija es más lento de
  escanear si el catálogo creciera mucho, pero con 8 categorías eso no es un problema real todavía.
- **Alternativas descartadas:** campo de texto libre con autocompletado y matching de sinónimos —
  descartado porque exige construir y mantener un diccionario de sinónimos que no existe, solo para resolver
  un catálogo de 8 categorías donde tocar una opción de una lista corta ya cumple lo mismo sin ese costo.
- **Decisión y consecuencia:** el buscador elige la categoría tocando una opción de una lista fija (mismo
  componente `CategoriaSelect` de misión 03), igual que ya hace el carrusel de categorías de la landing — no
  hay campo de texto libre para categoría en esta entrega.
- **Reapertura:** si el catálogo de categorías crece mucho, o aparece evidencia real de que la gente
  prefiere escribir en vez de tocar, se reconsidera agregar texto libre con matching.

<a id="d-004"></a>

### D-004 — Categoría y comuna son obligatorias para ver resultados; no existe una vista de "todo el catálogo" sin filtrar

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Sustento:** guardrail de `CLAUDE.md` ("encuentra al profesional que necesitas, cerca de ti").
- **Tensión:** mostrar todos los profesionales activos de una categoría en todo Chile sin exigir comuna es
  más simple de construir y nunca cae en cero resultados si existe al menos un profesional en cualquier
  lado, pero mezclaría a alguien de Puerto Varas con alguien de Ñuñoa en la misma lista sin ningún criterio
  de cercanía — contradice el mensaje core del producto y deja al buscador sin poder decidir a quién llamar
  hoy.
- **Alternativas descartadas:** comuna opcional, con fallback a "todo el catálogo activo" sin ordenar por
  cercanía cuando no se elige — descartado porque el mensaje core de Datealo es "cerca de ti", y una lista
  nacional sin cercanía deja de cumplir esa promesa, además de duplicar en la práctica lo que ya hace
  [F-002](#f-002) pero sin limitarse a comunas vecinas reales.
- **Decisión y consecuencia:** el flujo de búsqueda exige elegir categoría y comuna antes de ver cualquier
  resultado — no existe una vista de "todos los profesionales de Chile" sin filtrar por comuna.
- **Reapertura:** si aparece una razón real de explorar sin comuna (ej. alguien que se está por mudar y
  quiere comparar zonas antes de elegir dónde vivir), se reconsidera un modo de exploración separado.

## Preguntas

Ninguna pregunta bloquea este `producto.md` hoy — Q-001 quedó disuelta el mismo día en que se abrió.

| ID    | La duda                                                                        | Estado  | Respuesta, o quién la resuelve |
| ----- | ----------------------------------------------------------------------------------- | ------- | ------------------------------------ |
| Q-001 | ¿Qué comunas exactas componen cada zona del mapa fijo que usaba la primera versión de D-002? | disuelta 2026-08-28 | Dejó de tener sentido: D-002 se revisó el mismo día para calcular adyacencia geográfica real desde un dataset público en vez de un mapa de zonas a mano — no hay zonas que definir. Qué dataset usar y cómo cruzarlo contra los códigos SUBDERE de la tabla `comunas` queda como trabajo de `ingenieria.md`, no una decisión de producto pendiente. Al resolver esta pregunta salió a la luz que Puerto Varas no operaba sola en la práctica — Patricio confirmó que un profesional que vive ahí normalmente ya atiende Frutillar, Puerto Montt y Llanquihue también, así que esas tres se activaron el mismo día en el catálogo de comunas (ver revisión en `docs/missions/03-taxonomia-categorias-y-comunas/producto.md` D-002). F-002 ya tiene con qué operar en esa zona; solo Cochamó, otra vecina real, queda fuera del catálogo activo por ahora. |
