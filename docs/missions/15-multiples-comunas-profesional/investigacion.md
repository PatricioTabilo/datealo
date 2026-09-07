# Misión 15: múltiples comunas por profesional — Investigación

**Estado:** activo

**Última actualización:** 2026-09-06

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## El problema aparece cuando Rudiberto no puede declarar dónde trabaja de verdad

**Situación:** Rudiberto es gasfitero y trabaja en la zona de Llanquihue, Frutillar y Puerto Varas —
comunas vecinas de la Región de los Lagos, pero administrativamente distintas. No es un área de excepción
ocasional: es su zona habitual de trabajo, las tres comunas por igual.

**Acción o necesidad:** Registrar en Datealo un perfil que refleje esa cobertura real, para aparecer en la
búsqueda de cualquiera de las tres comunas.

**Respuesta actual:** El registro de profesional exige elegir una sola comuna (`professionals.comunaCodigo`
es un único valor). Rudiberto tiene que declarar una y renunciar a las otras dos como coincidencia directa.
La única red de respaldo que existe hoy es "comunas vecinas" (misión 06), pero es un mecanismo de
*búsqueda*, no de declaración: solo entra en juego cuando la comuna buscada tiene cero profesionales, y ahí
lo muestra con la etiqueta más débil, `vecina`, no como alguien que efectivamente dijo "yo trabajo acá".

**Consecuencia:** Alguien que busca un gasfitero en Frutillar puede no encontrar a Rudiberto — o lo
encuentra solo si Frutillar no tiene ningún otro profesional, y con una señal de confianza menor de la que
merece (aparece como sugerencia de cercanía, no como alguien que declaró atender ahí).

## Preguntas que la investigación debe resolver

Las dos preguntas originales de esta sección (tope de comunas, y si el patrón es propio de zonas rurales o
también aplica en Santiago) se investigaron y movieron a evidencia y conclusiones — ver
[E-004](#e-004), [E-005](#e-005), [E-006](#e-006) y [C-004](#c-004), [C-005](#c-005), [C-006](#c-006). No
queda ninguna pregunta abierta pendiente por ahora.

## Evidencia

| ID    | Tipo                     | Fuente                                                        | Hecho verificable | Límite de la evidencia |
| ----- | ------------------------ | -------------------------------------------------------------- | ------------------ | ----------------------- |
| E-001 | Conversación con un profesional real | Conversación informal con Rudiberto, gasfitero, zona Región de los Lagos (registrada en esta misión el 2026-09-06) | Rudiberto trabaja en Frutillar, Puerto Varas, Llanquihue "y alrededores" — lo nombra como su zona habitual, no como excepción | Conversación única (N=1), sin protocolo estructurado de entrevista — no confirma cuán extendido es el patrón entre otros profesionales ni rubros |
| <a id="e-002"></a>E-002 | Benchmark                | [Comparativas Thumbtack/Angi](#referencias)                     | Thumbtack y Angi dejan que el profesional elija una lista explícita de zip codes donde quiere recibir trabajo, no un radio | Mercado de EE.UU., otra escala y otro tipo de usuario — no valida qué tope numérico conviene en Chile |
| <a id="e-003"></a>E-003 | Benchmark                | [TaskRabbit — radio de servicio](#referencias)                  | TaskRabbit usa un radio en millas desde la ubicación del Tasker, en vez de una lista discreta de zonas | No aplica directamente al modelo geográfico de Datealo (comuna como unidad administrativa, no coordenadas) — sirve para descartar el radio como alternativa, no para adoptarlo |
| E-004 | Código (decisión previa ya tomada) | `server/db/seed/taxonomia.ts:15-22` | El comentario del seed dice explícitamente: Puerto Varas, Frutillar y Puerto Montt se activaron el 2026-08-28 "porque un profesional que vive en Puerto Varas normalmente ya atiende ahí también, no solo su propia comuna" | Confirma el caso de Rudiberto desde una segunda fuente (el propio historial del código), pero sigue siendo el mismo profesional — no suma un segundo caso independiente |
| E-005 | Código (grafo de datos existente) | `server/db/seed/comuna-vecinas.ts` | Frutillar (10105) y Puerto Varas (10109) no figuran como vecinas entre sí en la tabla `comuna_vecinas` — ambas son vecinas de Llanquihue (10107), pero no lo son directamente una de la otra | Es un hecho verificable sobre el grafo actual, no sobre geografía real — no dice si el límite administrativo debería redibujarse, solo que el grafo de bordes no captura la "zona del lago" como unidad funcional |
| E-006 | Benchmark (datos públicos, Censo 2024) | [Resultados Censo 2024 — Puerto Varas](#referencias), [Frutillar Hoy — Censo 2024](#referencias) | Frutillar (22.554 hab.) + Llanquihue (18.088 hab.) + Puerto Varas (52.942 hab.) suman ~93.584 habitantes en 3 comunas; Ñuñoa sola tiene un orden de magnitud comparable o mayor de población en 1 sola comuna | Dos puntos de comparación, no un estudio sistemático de las 346 comunas — no cuantifica cuántos profesionales activos hay en cada zona, solo población total |

<a id="e-001"></a>

### E-001 — Rudiberto declara tres comunas como su zona habitual, no como excepción

Rudiberto es gasfitero y describe su zona de trabajo como Frutillar, Puerto Varas y Llanquihue "y
alrededores" — sin distinguir una comuna principal y dos secundarias. Las tres son, para él, la misma
categoría de "acá trabajo".

Esto permite afirmar que al menos un profesional real de una zona de baja densidad opera de forma habitual
en más de una comuna administrativa, pero no demuestra que sea el comportamiento típico del gremio de
gasfitería ni de otros oficios, ni cuántas comunas es razonable esperar en el caso general.

<a id="e-004"></a>

### E-004 — El propio historial del código ya registró este mismo caso antes de que existiera esta misión

El comentario en `server/db/seed/taxonomia.ts` explica por qué Puerto Varas, Frutillar y Puerto Montt están
activas junto con Llanquihue: "un profesional que vive en Puerto Varas normalmente ya atiende ahí también,
no solo su propia comuna". Es el mismo caso que E-001, documentado el 2026-08-28, antes de que esta misión
se abriera.

Esto confirma que el problema ya había obligado una solución manual (activar comunas adicionales a mano en
el seed) antes de tener una forma real de declararlo en el producto, pero no aporta un segundo caso
independiente — sigue siendo el mismo profesional.

<a id="e-005"></a>

### E-005 — El grafo de "comunas vecinas" no conecta Frutillar con Puerto Varas

Frutillar (código 10105) tiene como vecinas registradas a 10104, 10107 (Llanquihue), 10302 y 10303. Puerto
Varas (código 10109) tiene como vecinas a 10101, 10103, 10106, 10107 (Llanquihue), 10302 y 10304. Ninguna
de las dos listas incluye a la otra comuna, aunque ambas comparten borde con Llanquihue y las tres forman,
en la práctica, la misma cuenca del lago.

Esto permite afirmar que si Rudiberto no declara sus comunas y solo existiera el fallback de vecinas, una
búsqueda en Frutillar nunca ampliaría hacia Puerto Varas (ni viceversa) aunque él trabaje en ambas — el
grafo de adyacencia por borde administrativo no reconstruye la zona funcional real. No demuestra que el
grafo esté mal construido para su propósito original (backup cuando una comuna queda en cero), solo que no
sirve como sustituto de la declaración explícita.

<a id="e-006"></a>

### E-006 — Tres comunas de la cuenca del lago Llanquihue juntas tienen menos población que una sola comuna grande de Santiago

Según el Censo 2024, Frutillar tiene 22.554 habitantes, Llanquihue 18.088 y Puerto Varas 52.942 — un total
de ~93.584 personas repartidas en tres comunas. Ñuñoa, una sola comuna del Gran Santiago, ronda un orden de
magnitud de población comparable o mayor ella sola (fuentes con cifras entre ~163.000 y ~267.000 según el
corte de datos consultado).

Esto permite afirmar que la base de clientes y de profesionales potenciales de una sola comuna grande de
Santiago puede superar a la de tres comunas rurales combinadas, lo que hace más probable que un mercado
más chico por comuna necesite sumar comunas vecinas para alcanzar un volumen viable de oferta y demanda. No
demuestra cuántos profesionales activos hay realmente en cada zona hoy, solo la diferencia de población
base disponible.

## Conclusiones

<a id="c-001"></a>

### C-001 — El modelo de una sola comuna por profesional no representa la cobertura real de al menos un caso confirmado

- **Sustento:** [E-001](#e-001).
- **Razonamiento:** Rudiberto no tiene una comuna "de verdad" y dos ocasionales — las tres son su zona de
  trabajo habitual. Forzar el registro a una sola comuna exige una elección arbitraria (¿cuál de las tres
  declara?) que dejaría a las otras dos dependiendo del fallback débil de comunas vecinas, en vez de una
  declaración directa.
- **Implicación:** El producto necesita permitir declarar más de una comuna por profesional, y esas
  comunas deben contar como coincidencia exacta en la búsqueda — no solo como vecina de respaldo.
- **Confianza:** media, porque el sustento es una sola conversación sin protocolo estructurado (N=1) — es
  un caso real y concreto, pero no confirma qué tan extendido está el patrón fuera de este caso.

<a id="c-002"></a>

### C-002 — La forma correcta de declarar cobertura geográfica en Datealo es una lista de comunas, no un radio

- **Sustento:** [E-002](#e-002), [E-003](#e-003).
- **Razonamiento:** Datealo ya modela toda su geografía por comuna — schema, búsqueda, comunas vecinas —
  como unidad discreta y nombrada. Un radio en kilómetros introduciría una unidad nueva (coordenadas,
  distancia) que hoy no existe en ningún otro punto del producto, y el benchmark de TaskRabbit no resuelve
  mejor el problema que el de lista explícita de Thumbtack/Angi. Elegir comunas por nombre es además más
  legible para un profesional como Rudiberto que calibrar un número de kilómetros sin referencia clara.
- **Implicación:** La solución de datos es una relación profesional↔comuna de varias filas, no un campo de
  radio o distancia.
- **Confianza:** media — los benchmarks son de mercados de otra escala (EE.UU.) y no validan directamente
  el comportamiento de un profesional chileno, pero sí alcanzan para descartar el radio por incompatibilidad
  con el modelo de datos que Datealo ya tiene.

<a id="c-003"></a>

### C-003 — Declarar comunas no reemplaza el fallback de comunas vecinas: resuelven problemas distintos en momentos distintos

- **Sustento:** lectura directa de `server/utils/search.ts` y `server/utils/comunas.ts` (código vigente),
  sin evidencia externa nueva.
- **Razonamiento:** "comunas vecinas" es un mecanismo de búsqueda que solo se activa cuando la comuna
  buscada tiene cero profesionales — amplía la búsqueda como último recurso, y siempre marca el resultado
  como `vecina`. Comunas declaradas es información propia del profesional, verdadera sin importar cuántos
  otros profesionales haya en esa comuna: un profesional que declaró Frutillar aparece ahí como coincidencia
  exacta aunque Frutillar ya tenga otros profesionales — algo que el fallback de vecinas nunca hace, porque
  solo entra en juego con cero resultados.
- **Implicación:** el ideal conserva ambos mecanismos. Comunas declaradas eleva a un profesional de
  "aparece solo si la comuna está vacía, marcado como vecina" a "aparece siempre que alguien busque ahí,
  marcado como exacto" — sin apagar el fallback para las comunas que nadie declaró.
- **Confianza:** alta — es una lectura directa del comportamiento del código existente, no depende de datos
  externos.

<a id="c-004"></a>

### C-004 — La adyacencia geográfica de "comunas vecinas" no reconstruye la zona funcional real de un profesional

- **Sustento:** [E-005](#e-005).
- **Razonamiento:** Frutillar y Puerto Varas no son vecinas entre sí en el grafo de bordes administrativos,
  aunque ambas formen parte de la misma cuenca del lago donde Rudiberto trabaja. Un grafo pensado para
  "comunas que comparten límite" no captura "comunas donde la gente realmente se mueve para trabajar o
  contratar" — son conceptos distintos que coinciden a veces y otras no.
- **Implicación:** el fallback de comunas vecinas nunca habría resuelto el caso de Rudiberto por sí solo,
  incluso en el escenario más favorable (Frutillar en cero profesionales). Refuerza [C-003](#c-003): la
  declaración explícita no es una mejora incremental sobre el fallback, es la única forma de representar
  esta cobertura.
- **Confianza:** alta — es un hecho verificable directamente en los datos de `comuna_vecinas`, no depende
  de interpretación.

<a id="c-005"></a>

### C-005 — El patrón de cubrir varias comunas es más urgente en mercados chicos que en el Gran Santiago

- **Sustento:** [E-006](#e-006).
- **Razonamiento:** una sola comuna grande de Santiago concentra, ella sola, más población que las tres
  comunas de la cuenca del lago Llanquihue combinadas. Eso hace más probable que un profesional de Ñuñoa
  encuentre suficiente trabajo sin salir de su comuna, mientras que un profesional de una comuna rural
  pequeña necesita sumar comunas vecinas para tener una base de clientes viable — y lo mismo aplica del
  lado de quien busca: en una comuna rural chica hay menos profesionales disponibles por categoría.
- **Implicación:** esta misión no es exclusiva de zonas rurales, pero su urgencia relativa es mayor fuera
  del Gran Santiago — un dato relevante para decidir si `producto.md` prioriza el recorte inicial hacia
  esas zonas.
- **Confianza:** media — se apoya en dos puntos de comparación de población, no en un estudio sistemático
  de las 346 comunas ni en el número real de profesionales activos por zona.

<a id="c-006"></a>

### C-006 — No hay evidencia que sugiera imponer un tope numérico duro de comunas por profesional en el lanzamiento

- **Sustento:** [E-002](#e-002), [E-003](#e-003).
- **Razonamiento:** ni Thumbtack ni Angi imponen un tope bajo — Thumbtack permite hasta 1.000 zip codes por
  profesional, varios órdenes de magnitud más que las ~346 comunas que existen en todo Chile. Ningún
  benchmark revisado sugiere que un tope numérico duro sea necesario para mantener la señal de "atiendo acá
  de verdad" — esa plataforma resuelve el problema con relevancia de ranking, no con restricción de
  entrada.
- **Implicación:** el ideal no necesita un límite numérico duro de comunas. Si hiciera falta una guía para
  evitar que un profesional declare comunas sin sentido (todo el país, por ejemplo), es una decisión de
  diseño de `producto.md`/`experiencia.md` — no algo que esta investigación deba resolver de antemano.
- **Confianza:** media — el benchmark es de una plataforma de otra escala (EE.UU., miles de zip codes) que
  no enfrenta el mismo riesgo de un catálogo pequeño y cerrado de 346 comunas.

## El ideal: cualquier profesional aparece como coincidencia exacta en cada comuna donde de verdad trabaja

### El resultado ideal se ve así

Rudiberto entra a su perfil de profesional en Datealo y en la zona de trabajo ve una lista de comunas donde
puede marcar las que atiende: junto a Llanquihue, que ya tenía, marca también Frutillar y Puerto Varas.
Guarda el cambio.

Una persona en Puerto Varas busca "gasfitero" y ve a Rudiberto en los resultados como coincidencia exacta
— igual que si buscara en Llanquihue o en Frutillar. Si Rudiberto además trabajara alguna vez en Puerto
Octay (comuna vecina de Llanquihue que no declaró), seguiría sin aparecer ahí como exacto: solo aparecería
si Puerto Octay se queda sin ningún profesional propio, vía el mismo fallback de comunas vecinas que existe
hoy.

### Capacidades del ideal

| Capacidad                              | Acción habilitada                                                                 | Respuesta esperada                                                                                  | Conclusión que la justifica |
| --------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| Declarar varias comunas                 | El profesional marca en su perfil todas las comunas donde atiende, no solo una     | Aparece como coincidencia exacta en la búsqueda de cualquiera de esas comunas                          | [C-001](#c-001)              |
| Cobertura por lista, no por radio       | El profesional elige comunas por nombre de una lista, sin calibrar un radio en km  | La zona de trabajo se guarda como un conjunto concreto de comunas nombradas                            | [C-002](#c-002)              |
| Convivencia con comunas vecinas         | El fallback de comunas vecinas sigue activo para comunas sin ningún profesional declarado | Una comuna sin cobertura declarada directa sigue mostrando profesionales de comunas vecinas cuando la búsqueda exacta da cero | [C-003](#c-003)              |

### El ideal no significa cobertura automática por cercanía

- No significa que el profesional recibe comunas adicionales por cercanía geográfica de forma automática —
  cada comuna que cuenta como "exacta" fue elegida a mano por el profesional, nunca inferida por el sistema.
- No significa que desaparece el concepto de comunas vecinas — sigue siendo el mecanismo de respaldo para
  las comunas donde nadie declaró cobertura directa.
- No significa que las comunas declaradas tengan que ser geográficamente contiguas — Rudiberto declara tres
  comunas vecinas entre sí porque así trabaja, pero el mecanismo no exige contigüidad; solo la refleja
  cuando es cierta.

## Referencias

- [Thumbtack vs Angi para plomeros](https://plumberlocator.us/blog/thumbtack-vs-angi-plumbers-comparison/):
  usado en E-002 para confirmar que el profesional filtra leads por zip code explícito, no por radio.
- [Angi vs Thumbtack — comparativa de plataformas](https://www.recommended.app/compare/angi-vs-thumbtack):
  usado en E-002 para el mismo hallazgo desde una segunda fuente.
- [TaskRabbit — actualización de la app del Tasker](https://www.taskrabbit.com/blog/tasker-update-app-version-4-58-0/):
  usado en E-003 para confirmar el modelo de radio en millas como alternativa descartada.
- [Resultados Censo 2024 — Puerto Varas](https://www.eha.cl/noticia/local/resultados-censo-2024-en-puerto-varas-somos-52942-habitantes):
  usado en E-006 para la población de Puerto Varas y Llanquihue.
- [Censo 2024: Frutillar supera los 22 mil habitantes](https://frutillarhoy.cl/noticias-frutillar-censo-2024-poblacion/):
  usado en E-006 para la población de Frutillar.
