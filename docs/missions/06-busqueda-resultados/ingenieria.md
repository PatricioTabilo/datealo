# Misión: búsqueda y resultados — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-08-29

**Última actualización:** 2026-08-29

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: un endpoint de solo lectura sobre lo que ya existe, más una tabla nueva de adyacencia entre comunas

`professionals` (misión 04) ya tiene todo el dato para ordenar por completitud (`photoPaths`, `description`,
`priceFrom`) y por antigüedad (`createdAt`) — esta misión no le agrega ninguna columna. Lo único nuevo es
`comuna_vecinas`, una tabla de solo lectura que responde "qué comunas comparten límite real con esta",
calculada una sola vez desde un dataset público de límites geográficos ([D-002](./producto.md#d-002)) y
cargada como seed estático — mismo patrón que `categorias`/`comunas` de misión 03, no una llamada en
runtime a ningún servicio externo.

Un solo endpoint nuevo, `GET /api/search`, cubre F-001 y F-002 a la vez: primero busca en la comuna exacta,
y solo si no hay nada, en sus comunas vecinas activas — nunca las dos búsquedas a la vez ni mezcladas en la
misma respuesta.

- **Contratos de producto cubiertos:** F-001, F-002, D-001, D-002, D-003, D-004.
- **Riesgo bloqueante:** ninguno — ver [TR-001](#tr-001) para el único riesgo no bloqueante (qué tan
  confiable es el dataset de límites elegido).

## Vocabulario: producto ↔ código

| Término de producto           | Entidad/campo en código                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| buscar                           | `GET /api/search`                                                                      |
| comuna vecina                    | fila de `comuna_vecinas` cuya `comuna_codigo` coincide con la comuna elegida            |
| completitud del perfil            | `rankByCompleteness()` en `server/utils/search.ts` — cuenta fotos, descripción y precio cargados |
| resultado de búsqueda             | `SearchResultProfessional` (`server/utils/search.ts`)                                  |

## Arquitectura: una query orquestadora nueva, sobre datos que ya existen

```
Browser (sin sesión)
  ──GET /api/search?categoria=&comuna=──> server/api/search.get.ts
       ──> server/utils/search.ts (findSearchResults)
              ├─ exacta: professionals WHERE categoriaSlug, comunaCodigo, active=true
              ├─ vecina (solo si exacta = []): server/utils/comunas.ts (findVecinasActivas)
              │     ──> professionals WHERE categoriaSlug, comunaCodigo IN (vecinas), active=true
              └─ ninguna (solo si vecina también = []): existe algún professionals activo de esa
                 categoría en cualquier comuna activa → distingue CL-001 de CL-002
```

`server/utils/search.ts` es un dominio nuevo, no una extensión de `professionals.ts` — mismo criterio que
ya aplicó T-004 de misión 05 para `professional-contact-events.ts` (A-006: cada archivo de
`server/utils/` es de un dominio). `rankByCompleteness()` vive ahí como función pura, sin Drizzle ni
`event` (ver [T-002](#t-002)): es exactamente la pieza que [D-001 de producto.md](./producto.md#d-001) ya
anticipa reemplazar apenas exista una señal real de calidad, y una función pura se reemplaza sin tocar la
query.

| Componente                                                | Responsabilidad                                                                    | No debe decidir                                    | Contratos      |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ---------------- |
| `server/db/schema/comuna-vecinas.ts`                            | Forma de la tabla nueva                                                                    | Qué pares existen (eso es el seed)                       | TC-001           |
| `server/db/seed/comuna-vecinas.ts`                               | Datos precalculados de adyacencia — estático, generado una vez, no runtime                | Nada — solo datos                                        | TR-001           |
| `server/utils/comunas.ts` (extendido)                            | `findVecinasActivas(comunaCodigo)` — una query más, mismo archivo que ya tiene `comunas`   | Ranking, presentación                                     | TC-001           |
| `server/utils/search.ts` (nuevo)                                 | Orquesta exacta → vecina → ninguna; `rankByCompleteness()` pura                            | Acceso a `professionals` fuera de este flujo (eso es `professionals.ts`), HTTP | TC-001 |
| `server/api/search.get.ts`                                       | I/O: valida `categoria`/`comuna`, llama a `search.ts`, arma la respuesta                    | Reglas de negocio (ya resueltas en `search.ts`)          | TC-001           |
| `app/composables/useSlowLoad.ts` (nuevo, extraído)               | Timer compartido de "tardando >10s" desde un `pending` reactivo                            | De dónde viene ese `pending`                             | TC-002           |
| `app/composables/useSearchResults.ts` (nuevo)                    | Fetch reactivo de `/api/search` según categoría/comuna elegidas, expone los 5 modos de V-001 | Presentación, routing                                     | TC-002, UXF-001  |
| `app/pages/buscar/index.vue`                                     | Renderiza los modos de V-001, lee/escribe `categoria`/`comuna` como query params            | Cómo se calcula el orden o la adyacencia (ya lo hizo el servidor) | UXF-001 |
| `app/components/landing/LandingCategories.vue` (editado)          | Cada card navega a `/buscar?categoria=<slug>` en vez de anclar a `#hero-form`               | Nada nuevo — sigue siendo decorativo salvo el link        | UXF-001          |
| `app/pages/profesionales/[id].vue` (editado)                     | El botón "Buscar profesionales" del modo no-encontrado navega a `/buscar`, no a `/`         | Nada nuevo                                                | UXF-001          |

No hay dominio nuevo de "ranking" separado de `search.ts`: con una sola función pura y un solo consumidor,
un archivo aparte sería una capa sin nadie más que la use todavía (YAGNI) — si el criterio de orden crece
lo suficiente como para tener sus propias pruebas de propiedad extensas, se separa entonces, no antes.

## Contratos

### TC-001 — `GET /api/search` — buscar profesionales por categoría y comuna

- **Entrada:** query params `categoria` (`categoriaSlug`, string) y `comuna` (`comunaCodigo`, string).
  Ambos obligatorios ([D-004](./producto.md#d-004)) — no hay valor por default para ninguno. Sin sesión.
- **Salida:** `200 { results: SearchResultProfessional[], matchType: 'exacta' | 'vecina' | 'ninguna',
  categoryHasResultsInChile: boolean }`.
  `SearchResultProfessional = { id: string, displayName: string, comunaNombre: string, priceFrom: number |
  null, createdAt: string }` — `createdAt` en ISO 8601, para "En Datealo desde..." (mismo dato que misión
  05). **Nunca incluye ningún campo de foto**: el avatar de V-001 se arma en el cliente con las iniciales de
  `displayName` — ninguna foto de trabajo (`photoPaths`) se reusa como avatar (ver [T-006](#t-006)).
- **Invariantes:**
  - `results` viene ordenado por completitud desc, empate por `createdAt` asc, empate final por `id` asc
    ([D-001](./producto.md#d-001), [CL-004](./producto.md#cl-004)) — ver [T-002](#t-002) para el cálculo.
  - `matchType` nunca mezcla resultados de la comuna exacta con los de una comuna vecina en la misma
    respuesta ([F-002](./producto.md#f-002)): es `'exacta'` cuando `results` viene de `comunaCodigo` tal
    cual se pidió; `'vecina'` cuando viene de `comuna_vecinas` activas de esa comuna (la búsqueda en
    comuna exacta ya dio cero); `'ninguna'` cuando ambas búsquedas dieron cero y `results` es `[]`.
  - `categoryHasResultsInChile` solo es información que el cliente necesita cuando `matchType === 'ninguna'`
    — distingue [CL-001](./producto.md#cl-001) (`true`: existe en otra comuna activa, el estado vacío se
    enmarca "cerca de \<comuna\>") de [CL-002](./producto.md#cl-002) (`false`: la categoría no tiene ningún
    profesional activo en ninguna comuna activa del país, el estado vacío no se enmarca por zona). En
    cualquier otro `matchType` el campo es trivialmente `true`, pero el cliente no necesita leerlo ahí.
- **Errores:** `400 { error: 'categoria_required' }` si falta `categoria`; `400 { error: 'comuna_required'
  }` si falta `comuna`; `400 { error: 'invalid_categoria' }` si no es una categoría activa (reusa
  `existsActiveCategoria`); `400 { error: 'invalid_comuna' }` si no es una comuna activa (reusa
  `existsActiveComuna`).
- **Contrato de producto:** [F-001](./producto.md#f-001), [F-002](./producto.md#f-002),
  [D-001](./producto.md#d-001), [D-002](./producto.md#d-002), [D-003](./producto.md#d-003),
  [D-004](./producto.md#d-004), [CL-001](./producto.md#cl-001), [CL-002](./producto.md#cl-002),
  [CL-003](./producto.md#cl-003), [CL-004](./producto.md#cl-004).

**Ejemplo verificable:** dado que Puente Alto no tiene gasfiteres activos pero La Florida sí tiene dos,
`GET /api/search?categoria=gasfiteria&comuna=13201` (Puente Alto) devuelve `matchType: 'vecina'` con los
dos profesionales de La Florida, cada uno con `comunaNombre: 'La Florida'` — nunca `'Puente Alto'`.

### TC-002 — `useSlowLoad(pending)` — el timer de "tardando" compartido

- **Entrada:** `pending: Ref<boolean>`, `ms?: number` (default `10_000`).
- **Salida:** `slow: Ref<boolean>` — pasa a `true` si `pending` sigue en `true` después de `ms`
  milisegundos; vuelve a `false` en cuanto `pending` cambia a `false`.
- **Invariantes:** el timer se limpia en cada cambio de `pending` y al desmontar el componente que lo usa
  (`onUnmounted`) — nunca deja un `setTimeout` corriendo después de que el fetch ya resolvió o el componente
  ya no existe. Solo corre en cliente (`import.meta.client`) — no tiene sentido en SSR, donde no hay
  "esperar" real.
- **Errores:** no aplica — es un timer, no una llamada que pueda fallar.
- **Contrato de producto:** soporte de [F-001](./producto.md#f-001), [F-002](./producto.md#f-002) — el modo
  "tardando" de V-001 (`experiencia.md`).

## Modelo de datos

| Entidad o campo                    | Significado                                                                | Escritura                             | Retención o historial |
| -------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------ |
| `professionals.*`                      | Sin cambio de schema — esta misión solo lee `categoriaSlug`, `comunaCodigo`, `photoPaths`, `description`, `priceFrom`, `createdAt`, `active` | (misión 04)             | (misión 04)              |
| `comuna_vecinas.comuna_codigo`         | Una comuna (FK a `comunas.codigo`)                                                 | Seed, una sola vez ([TR-001](#tr-001))    | Permanente, no se borra  |
| `comuna_vecinas.vecina_codigo`         | Otra comuna que comparte límite real con la primera (FK a `comunas.codigo`)        | Seed, una sola vez                        | Permanente               |

### Invariantes de datos

- `comuna_vecinas` guarda **ambos sentidos** de cada par (si Puente Alto es vecina de La Florida, existe la
  fila `(Puente Alto, La Florida)` y también `(La Florida, Puente Alto)`) — así `findVecinasActivas(codigo)`
  es un `select` simple por `comuna_codigo`, sin necesitar una unión de dos columnas en cada consulta. **La
  simetría no está reforzada por ningún `CHECK` ni trigger** — depende de que el script de TR-001 siempre
  inserte los dos sentidos, y de que una corrección manual futura en la base (mismo criterio sin panel de
  administración que `categorias`/`comunas`) toque los dos sentidos, no uno. Es un riesgo aceptado
  explícitamente, no una garantía de la base — el spot check de TR-001 solo cubre Gran Santiago y la zona
  del lago Llanquihue, no las 346 comunas, así que una asimetría fuera de esa zona podría no notarse hasta
  que alguien active esa comuna y su fallback de F-002 se vea incompleto en una sola dirección.
- `comuna_vecinas` se calcula para **las 346 comunas**, no solo las activas — la adyacencia es un hecho
  geográfico, no depende de qué comuna esté activa hoy. Esto es lo que hace que activar una comuna nueva
  ([D-002 de producto.md](./producto.md#d-002)) no exija ningún trabajo de ingeniería adicional: sus vecinas
  ya están en la tabla desde el seed inicial, la consulta solo filtra por `comunas.activa = true` al
  momento de buscar.
- Ninguna fila de `comuna_vecinas` se borra ni se recalcula en runtime — es un hecho geográfico que no
  cambia; si el dataset de origen resultara tener un error puntual, se corrige a mano en la base, igual
  criterio que `categorias`/`comunas` (sin panel de administración todavía).
- `professionals` no gana ninguna columna ni índice nuevo — `professionals_categoria_slug_idx` y
  `professionals_comuna_codigo_idx` (misión 04) ya cubren el filtro de TC-001.

**Migración:** `comuna_vecinas` es una tabla nueva, sin dato previo que adaptar. `professionals` no cambia
de schema — no hay migración de datos existentes.

### Impacto en RLS

**`professionals` no cambia de policy ni de camino de acceso.** TC-001 lee vía Drizzle (rol dueño, A-002),
el mismo camino que ya usan TC-001/TC-002 de misión 05 — nunca PostgREST directo. Ninguna policy nueva ni
modificada para esta tabla.

`comuna_vecinas` es catálogo de referencia público, mismo criterio que `categorias`/`comunas` (misión 03):
lectura sin restricción, sin policy de escritura (nada la escribe vía `server/api/`, el seed va directo a
la base), y cerrada a PostgREST por el mismo `revoke` que ya protege a esas dos tablas (A-007) — sin este
`revoke`, el default de Supabase deja `comuna_vecinas` alcanzable directo con la publishable key del
cliente, aunque nadie la consuma por ahí.

| Tabla             | Cambio  | Policy o grant                                                          | Acción                                                                                                     |
| --------------------- | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `professionals`       | ninguno | (sin cambio — todas las policies de misión 04)                             | nada — TC-001 usa Drizzle (rol dueño), que ya bypassea RLS por completo, igual que TC-001 de misión 05        |
| `comuna_vecinas`      | nueva   | `comuna_vecinas_select_public` (`using (true)`)                            | crear — lectura pública sin restricción, mismo criterio que `categorias_select_public`/`comunas_select_public` |
| `comuna_vecinas`      | nueva   | `revoke all on public.comuna_vecinas from anon, authenticated`             | crear — cierra PostgREST por completo (A-007); `findVecinasActivas()` usa Drizzle, que no le afecta            |

No hay bucket de Storage nuevo ni cliente de Supabase nuevo en el browser — `/buscar` solo habla con
`/api/search` y con `/api/categorias`/`/api/comunas` (ya existentes, para los selectores).

## Riesgos y experimentos de factibilidad

<a id="tr-001"></a>

| ID     | Riesgo o pregunta                                                                      | Qué invalida                                          | Experimento o mitigación                                                                                                                                          | Criterio de salida                                                                                          | Estado  |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| TR-001 | Ninguno de los tres datasets candidatos ([E-012](./investigacion.md#e-012)) tiene cobertura completa o licencia usable para las 346 comunas | El fallback de comunas vecinas (F-002) queda sin datos confiables para calcular, o expuesto a un problema de licencia | Probar los tres en orden (`niclabs/maps` primero, por venir de un grupo de investigación con mantenimiento más visible que los otros dos) con un script offline (`scripts/compute-comuna-vecinas.ts`, no forma parte del runtime): calcular adyacencia con una librería de geometría (`@turf/boolean-intersects` o equivalente) sobre los polígonos, cruzar cada feature contra `comunas.nombre` normalizado (sin tildes, minúsculas) y marcar cualquier comuna sin match para revisión manual — mismo criterio de "fuente única, no reescribir a mano" que TR-001 de misión 03 usó para el seed de comunas | Un dataset con las 346 comunas identificadas sin ambigüedad (o los huecos documentados y aceptados a mano) y licencia compatible con uso comercial (MIT, CC-BY o dominio público) — documentado como comentario en `server/db/seed/comuna-vecinas.ts` | abierto |

Si ninguno de los tres alcanza cobertura completa, el criterio de salida no exige 100%: comunas sin match
quedan sin fila en `comuna_vecinas` (su F-002 simplemente no tiene vecinas — cae directo a
[CL-001](./producto.md#cl-001)/[CL-002](./producto.md#cl-002), un estado que el diseño ya cubre), no bloquea
el resto de la entrega.

## Estrategia de pruebas

Mismo criterio que misión 05: sin infraestructura de test de integración contra Postgres, se verifica a
mano contra la base de desarrollo — salvo `rankByCompleteness()`, que al ser una función pura sí se prueba
con Vitest sin ninguna infraestructura.

| Contrato o riesgo                                                        | Nivel     | Caso principal                                                                                                                     | Límite o falla |
| ----------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `rankByCompleteness()` (D-001)                                               | unitario (Vitest) | Un perfil con 3 fotos, descripción y precio queda antes que uno solo con nombre y contacto                                                | Dos perfiles con la misma completitud y distinta `createdAt`: gana el más antiguo; con la misma `createdAt` también, gana el `id` menor (orden estable, CL-004) |
| TC-001 — comuna exacta con resultados (F-001)                                | manual    | `categoria=electricidad&comuna=<Ñuñoa>` con 2 profesionales activos devuelve `matchType: 'exacta'`, ordenados por completitud       | Un profesional `active = false` en esa comuna/categoría nunca aparece |
| TC-001 — fallback a comuna vecina (F-002)                                    | manual    | `categoria=gasfiteria&comuna=<Puente Alto>` sin resultados exactos pero con 2 en La Florida devuelve `matchType: 'vecina'`, cada `comunaNombre` es la comuna real del profesional, nunca "Puente Alto" | Un profesional activo en una comuna que NO es vecina de la elegida nunca aparece |
| TC-001 — comuna sin oferta cercana (CL-001)                                   | manual    | Categoría existente en otra comuna activa, sin resultados en la exacta ni en sus vecinas: `matchType: 'ninguna'`, `categoryHasResultsInChile: true` | — |
| TC-001 — categoría sin oferta en ningún lado (CL-002)                         | manual    | Categoría sin ningún profesional activo en ninguna comuna activa: `matchType: 'ninguna'`, `categoryHasResultsInChile: false`        | — |
| TC-001 — validación de query params                                           | manual    | Sin `categoria` o sin `comuna` → `400` con el `error` correspondiente; con un slug/código inexistente o inactivo → `400 invalid_*`   | — |
| TC-002 (`useSlowLoad`)                                                        | unitario (Vitest) | `pending = true` sostenido más de `ms` pone `slow = true`; `pending = false` antes de `ms` nunca lo activa                          | Desmontar el componente mientras el timer corre no deja ningún `setTimeout` pendiente (verificable con `vi.useFakeTimers()` y contando timers activos) |
| Impacto en RLS — PostgREST directo, `comuna_vecinas`                          | manual, **desde la consola del navegador**, con o sin sesión | `$supabase.from('comuna_vecinas').select('*')` devuelve `permission denied`                                                        | — |
| TR-001 (cobertura del dataset elegido)                                        | manual, una vez | Cada una de las 34 comunas del Gran Santiago + las 4 de la zona del lago Llanquihue tiene al menos una fila en `comuna_vecinas` (spot check, no las 346) | Puente Alto incluye a La Florida y San Bernardo como vecinas reales, verificado contra un mapa |

### Propiedades que deben probarse

- `rankByCompleteness()` nunca cambia de orden entre dos llamadas con el mismo input — es una función pura,
  sin `Math.random()` ni dependencia de reloj salvo `createdAt`, que ya viene en el input.
- TC-001 nunca devuelve una mezcla de `matchType: 'exacta'` y resultados de otra comuna en el mismo array —
  verificable revisando que todo `comunaNombre` del array coincida con la comuna pedida cuando
  `matchType === 'exacta'`, y con ninguno de ellos cuando es `'vecina'`.
- Un profesional `active = false` nunca aparece en ningún `matchType`, ni siquiera cuando es el único que
  existiría para esa categoría/comuna (ese caso cae en `'ninguna'`, no en un array con una fila inactiva).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                                                    | Sustento                                              | Criterio de aceptación principal                                                                                                                                                                                        | Depende de | Issue |
| ----- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| S-001 | Tabla `comuna_vecinas` con RLS y seed calculado desde el dataset elegido en TR-001                   | D-002, TR-001                                          | `select count(*) from comuna_vecinas` > 0; Puente Alto tiene a La Florida y San Bernardo como vecinas (verificado a mano); vía PostgREST, `select`/`insert` devuelven `permission denied`                                | —          | [#94](https://github.com/PatricioTabilo/datealo/issues/94) |
| S-002 | Endpoint `GET /api/search` con orden por completitud y fallback a comunas vecinas                    | F-001, F-002, D-001, D-003, D-004, TC-001, CL-001 a CL-004 | Cubre los 5 casos de la tabla de Estrategia de pruebas para TC-001 (exacta, vecina, CL-001, CL-002, validación); `rankByCompleteness()` tiene sus tests unitarios en verde                                                | S-001      | [#95](https://github.com/PatricioTabilo/datealo/issues/95) |
| S-003 | Composable compartido `useSlowLoad()`, extraído de `usePublicProfessionalProfile` sin cambiar su comportamiento | TC-002                                                 | `usePublicProfessionalProfile` sigue pasando sus propios casos de uso (misión 05) usando el composable nuevo; test unitario de `useSlowLoad()` en verde                                                                  | —          | [#96](https://github.com/PatricioTabilo/datealo/issues/96) |
| S-004 | Página `/buscar` con los 8 modos del mockup, consumiendo `/api/search` y `useSlowLoad()`              | F-001, F-002, UXF-001, todos los CL de producto.md      | Abrir `/buscar?categoria=&comuna=` reproduce cada modo del mockup validado (`design-mockups/resultados-busqueda.html`) con datos reales; tocar una card navega al perfil (misión 05)                                    | S-002, S-003 | [#97](https://github.com/PatricioTabilo/datealo/issues/97) |
| S-005 | Conectar el carrusel de la landing y el botón "Buscar profesionales" del perfil a `/buscar`           | UXF-001                                                | Tocar una card de `LandingCategories` navega a `/buscar?categoria=<slug>` con esa categoría pre-elegida (modo eligiendo, solo falta comuna); el botón "Buscar profesionales" de `/profesionales/[id].vue` navega a `/buscar` en vez de `/`; el `SearchAction` de `index.vue` apunta a `/buscar?categoria={search_term_string}` en vez de `?q=` | S-004      | [#98](https://github.com/PatricioTabilo/datealo/issues/98) |

S-001 y S-003 no dependen entre sí — pueden ir en paralelo. S-002 depende solo de la tabla (S-001), no del
composable de tardando. S-004 es el walking skeleton: la vista real consumiendo los dos contratos ya
probados por separado. S-005 queda último porque toca archivos que ya existen y funcionan (aunque de forma
decorativa o apuntando a `/`) — cambiarlos antes de que `/buscar` exista dejaría un link roto en producción
si los slices se mergean por separado.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — `search.ts` es un dominio propio, no una extensión de `professionals.ts`

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** TC-001.
- **Alternativas descartadas:** agregar `findSearchResults()` a `server/utils/professionals.ts` — más corto
  de escribir porque ya importa `professionals`, pero mezcla dos razones de cambio (editar/leer un perfil
  propio vs. orquestar una búsqueda multi-comuna con su propio criterio de orden) en el mismo archivo,
  contradiciendo A-006 sin nombrarlo — mismo error que T-004 de misión 05 ya corrigió para
  `professional-contact-events.ts`.
- **Decisión y consecuencia:** `server/utils/search.ts` importa `professionals` y `comunas`, pero
  `professionals.ts` y `comunas.ts` no saben que `search.ts` existe. `findVecinasActivas()` sí vive en
  `comunas.ts` (no en `search.ts`), porque es una query más sobre `comunas`, mismo criterio que
  `existsActiveComuna()`.
- **Reapertura:** ninguna prevista.

<a id="t-002"></a>

### T-002 — El orden por completitud es una función pura, separada de la query a la base

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** TC-001, [D-001](./producto.md#d-001).
- **Alternativas descartadas:** `ORDER BY` calculado en SQL (ej. una expresión que sume columnas booleanas)
  — más rápido de escribir hoy y evita traer filas a memoria para ordenarlas, pero D-001 ya declara este
  criterio explícitamente interino ("se espera reemplazar apenas exista una señal real de calidad"); cuando
  eso pase (reseñas de misión 07, o una tasa de respuesta), el cambio sería una migración de query en vez de
  un cambio de función, y no se podría probar sin levantar Postgres. Con el volumen esperado por
  [C-001 de investigación](./investigacion.md#c-001) (pocos resultados por búsqueda), traer todas las filas
  que ya matchearon categoría+comuna a memoria para ordenarlas no es el antipatrón de "traer todo el
  catálogo a filtrar en el cliente" — el filtro ya ocurrió en SQL, solo el orden de un puñado de filas se
  mueve a JS.
- **Decisión y consecuencia:** `rankByCompleteness()` recibe y devuelve `ProfessionalCompletenessInput[]`,
  un tipo propio de `search.ts` — **no** el `ProfessionalRow` privado de `professionals.ts` (8 columnas,
  pensado para el CRUD del dueño del perfil, con `contact`/`categoriaSlug`/`comunaCodigo`/`active` que la
  regla de orden no usa). `ProfessionalCompletenessInput = { id: string, createdAt: Date, hasPhotos:
  boolean, hasDescription: boolean, hasPrice: boolean }` — `findSearchResults()` mapea la fila que trae
  Drizzle a esta forma mínima antes de llamar a `rankByCompleteness()`, y recién después arma
  `SearchResultProfessional` con los campos que sí necesita el cliente (`displayName`, `comunaNombre`,
  `priceFrom`). Sin este mapeo explícito, la función "pura" terminaría acoplada a la forma de persistencia
  de `professionals` — exactamente lo que la Dependency Rule prohíbe cruzar hacia el círculo interno, y lo
  que impediría reemplazar este criterio (D-001, cuando exista una señal real de calidad) sin tocar cómo se
  lee la tabla.
- **Reapertura:** cuando [D-001 de producto.md](./producto.md#d-001) se reabra (misión 07, reseñas), este
  es el único lugar que cambia — `ProfessionalCompletenessInput` gana un campo (`rating`, `reviewCount`) sin
  que `professionals.ts` ni el endpoint necesiten saberlo.

<a id="t-003"></a>

### T-003 — La adyacencia de comunas se precalcula una sola vez y se guarda como seed estático, no se calcula en runtime

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** [D-002 de producto.md](./producto.md#d-002).
- **Alternativas descartadas:** guardar solo coordenadas por comuna y calcular distancia Haversine en cada
  consulta — ya descartada en D-002 de producto (la distancia recta no es fiel a "comparte límite", puede
  cruzar la cordillera). Llamar a un servicio externo de geometría (ej. una API GIS) en cada `GET
  /api/search` — agrega latencia y una dependencia externa a un dato que no cambia nunca (la geografía de
  Chile no se mueve), sin ningún beneficio sobre precalcularlo una vez.
- **Decisión y consecuencia:** un script offline (`scripts/compute-comuna-vecinas.ts`, no se despliega ni
  corre en producción) calcula adyacencia real para las 346 comunas desde el dataset elegido en
  [TR-001](#tr-001), cruza cada feature contra `comunas.nombre` y genera el array estático de
  `server/db/seed/comuna-vecinas.ts` — mismo patrón que `server/db/seed/taxonomia.ts`. Activar una comuna
  nueva ([D-002 de producto.md](./producto.md#d-002)) nunca requiere volver a correr este script: sus
  vecinas ya están en la tabla desde el seed inicial, calculadas para las 346 comunas, no solo las activas.
- **Reapertura:** si el dataset elegido resulta tener huecos de cobertura serios (ver TR-001), o si Chile
  activa/crea una comuna nueva de verdad (raro, pero ha pasado históricamente) — ahí sí habría que
  recorrer el script una vez más.

<a id="t-004"></a>

### T-004 — `useSlowLoad()` se extrae como composable compartido, en vez de duplicar el timer de misión 05

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** TC-002.
- **Alternativas descartadas:** copiar el mismo `ref` + `setTimeout` + `watch` dentro de
  `useSearchResults.ts`, como ya existe en `usePublicProfessionalProfile.ts` — es literalmente la misma
  regla (10s desde que empieza a cargar, sin depender de qué se está cargando), no dos reglas parecidas; el
  criterio del skill de ingeniería para decidir esto es exactamente "si esta regla cambia, ¿cambia para las
  dos entidades a la vez, por el mismo motivo?" — sí: si el umbral de "tardando" cambiara mañana (ej. a 8s),
  tendría que cambiar en los dos lugares a la vez, y duplicado eso solo pasa si alguien se acuerda de tocar
  los dos archivos.
- **Decisión y consecuencia:** `app/composables/useSlowLoad.ts` nuevo, con la firma de TC-002.
  `usePublicProfessionalProfile.ts` (misión 05) se refactoriza para consumirlo, sin cambiar su
  comportamiento observable — mismo timer, ahora compartido. `useSearchResults.ts` lo consume igual.
- **Reapertura:** si alguna vez el umbral o el criterio de "tardando" necesitara ser distinto entre el
  perfil y la búsqueda — ahí deja de ser la misma regla y esta decisión se revisa.

<a id="t-005"></a>

### T-005 — `/buscar` usa query params para categoría y comuna, y corrige el `SearchAction` de la landing que ya apuntaba ahí

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** UXF-001, [D-003](./producto.md#d-003), [D-004](./producto.md#d-004).
- **Alternativas descartadas:** estado solo en el cliente (sin reflejar categoría/comuna en la URL) — más
  simple de escribir, pero no permite compartir ni recargar un link de búsqueda ya armado, y rompe el caso
  de uso de `LandingCategories` (llegar con la categoría pre-elegida, [UXF-001](./experiencia.md#uxf-001)
  exige exactamente eso).
- **Decisión y consecuencia:** `/buscar?categoria=<slug>&comuna=<codigo>`, ambos opcionales en la URL (el
  modo "eligiendo" de V-001 cubre el caso de que falte uno o los dos). `app/pages/index.vue` ya tiene un
  `SearchAction` de schema.org apuntando a `https://datealo.cl/buscar?q={search_term_string}` — un patrón de
  texto libre que [D-003 de producto.md](./producto.md#d-003) ya descartó para categoría; se corrige en el
  mismo slice (S-005) a `https://datealo.cl/buscar?categoria={search_term_string}`, coherente con que la
  categoría sí viene de un catálogo fijo pero el nombre del parámetro puede recibirse como texto desde un
  buscador externo sin que Datealo tenga que validarlo ahí (la validación real ocurre en TC-001, que
  devuelve `400 invalid_categoria` si no matchea el catálogo).
- **Reapertura:** ninguna prevista.

<a id="t-006"></a>

### T-006 — El endpoint de búsqueda nunca devuelve una foto para el avatar

- **Estado:** aceptada. **Fecha:** 2026-08-29.
- **Contratos:** TC-001.
- **Alternativas descartadas:** devolver la primera foto de `photoPaths` como avatar de la card — es lo que
  una lectura superficial de "Foto o iniciales" en `experiencia.md` podría sugerir, pero el propio mockup
  validado de esta misión (`design-mockups/resultados-busqueda.html`) nunca muestra una foto en el círculo
  de avatar, solo iniciales, en los 9 frames — y hay una razón de fondo: ninguna foto de trabajo garantiza
  mostrar la cara del profesional (ver la investigación de la misión 08, aún sin aprobar, que documenta
  exactamente este problema). Devolver una foto que el mockup nunca muestra sería construir un campo que la
  experiencia aprobada no usa.
- **Decisión y consecuencia:** `SearchResultProfessional` no incluye ningún campo de foto — el cliente
  arma las iniciales de `displayName` (mismo criterio que el perfil público, misión 05, cuando no hay
  fotos). Si la misión 08 se aprueba y agrega un campo de foto de perfil dedicado, este contrato se
  extiende ahí, no antes.
- **Reapertura:** cuando la misión 08 (foto de perfil de profesional) se apruebe y quede `vigente`.

## Preguntas

Ninguna bloquea construcción — el único punto abierto es TR-001, que es un riesgo con mitigación en curso,
no una pregunta de producto o de diseño.

| ID     | La duda | Estado | Respuesta, o quién la resuelve |
| ------ | ------- | ------ | ------------------------------- |
| —      | —       | —      | sin preguntas abiertas todavía |
