# Misión 03: taxonomía de categorías y comunas — Ingeniería

**Estado:** vigente

**Última actualización:** 2026-08-18. **Aprobado por Patricio el:** 2026-08-18.

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: dos tablas de catálogo con `activa`, dos endpoints de solo lectura, un componente
compartido compuesto por dos wrappers

Dos tablas nuevas (`categorias`, `comunas`), cada una con el campo `activa` que D-001/D-002 piden. Dos
endpoints `GET` de solo lectura, sin autenticación (son catálogo público, no datos de usuario). Un
composable genérico (`useCatalogFetch`) que los consume con cache, y un componente Vue (`CatalogSelect`) que
implementa el contrato de
D-004 sobre `UInputMenu` de Nuxt UI (A-004) — ya trae resuelto el autocompletado, lo que se construye acá
es el contenido y las reglas: catálogo cerrado, nada visible hasta escribir. `CategoriaSelect` y
`ComunaSelect` son dos wrappers delgados que lo componen, no dos copias de la misma lógica (ver T-003).

Es la primera vez que el repo tiene tablas de negocio, así que también es donde `server/db/schema/`,
`server/db/sql/rls.sql` y el patrón de "endpoint de lectura pública" (receta del skill `arquitectura`)
salen a andar por primera vez.

- **Contratos de producto cubiertos:** D-001, D-002, D-004.
- **Riesgo bloqueante:** ninguno — ver [TR-001](#tr-001) para el único riesgo no bloqueante (exactitud del
  seed de 346 comunas).

## Arquitectura: catálogo de solo lectura, sin dominio de negocio propio

Categorías y comunas no son un dominio con reglas de negocio (no hay cálculo, no hay ranking, no hay
ownership) — son datos de referencia que otros dominios consumen. Por eso `server/utils/categorias.ts` y
`server/utils/comunas.ts` son solo queries, sin lógica que valga la pena aislar como función pura: el
principio de "lógica fuera de la infraestructura" del skill no aplica acá, sería abstracción sin regla que
separar. Van en un archivo por entidad, no combinados en uno solo — `server/db/schema/` y `server/utils/`
siguen esa convención sin excepción (CLAUDE.md, A-006), aunque ambas tablas nazcan de la misma misión.

Los componentes sí tienen una regla real — "no mostrar nada hasta escribir, nunca emitir un valor fuera
del catálogo" (D-004, UX-001) — y esa regla es **idéntica** para categoría y comuna, porque D-004 la
definió como una sola regla para ambos, no dos parecidas. Repetirla en dos archivos sería el mismo error
que evitar herencia solo de nombre: dos copias que hay que mantener sincronizadas a mano cada vez que
cambie un modo. Por eso hay un tercer componente, `CatalogSelect.vue`, que implementa los 6 modos una sola
vez — `CategoriaSelect` y `ComunaSelect` lo **componen**: cada uno es una capa delgada que le pasa su
composable (`useCategoriasCatalog`/`useComunasCatalog`) y su placeholder, sin repetir la lógica de
enfocado/filtrado/selección.

| Componente                          | Responsabilidad                                    | No debe decidir                          | Contratos      |
| -------------------------------------- | ------------------------------------------------------ | -------------------------------------------- | -------------- |
| `server/db/schema/categorias.ts` / `comunas.ts` | Forma de las tablas — un archivo por entidad (A-006) | Qué filas existen (eso es el seed) | D-001, D-002   |
| `server/utils/categorias.ts` / `comunas.ts` | Queries: solo filas `activa = true`, columnas públicas — un archivo por entidad | Presentación, formato del texto | D-001, D-002   |
| `server/api/categorias.get.ts` / `comunas.get.ts` | I/O: llama la query, devuelve JSON — dos archivos porque Nitro enruta por archivo, no porque haya lógica distinta | Filtrar por texto (eso lo hace el cliente) | TC-001, TC-002 |
| `app/composables/useCatalogFetch.ts`   | Fetch con cache y manejo de error, genérico — no sabe si trae categorías o comunas | De dónde viene el endpoint (eso lo fija cada wrapper) | TC-003 |
| `app/composables/useCategoriasCatalog.ts` / `useComunasCatalog.ts` | Fijar `key`, `endpoint` y el `normalize` de su entidad para `useCatalogFetch` — un solo `return`, sin lógica propia | Cómo se cachea o qué pasa si falla (eso ya lo resolvió `useCatalogFetch`) | TC-003 |
| `app/components/CatalogSelect.vue`     | Los 6 modos de UXF-001, sobre `UInputMenu` — recibe `items`/`pending`/`error`/`placeholder` por props, nunca sabe si es categoría o comuna | De dónde vienen los datos | D-004, UX-001, TC-004 |
| `app/components/CategoriaSelect.vue` / `ComunaSelect.vue` | Conectar su composable con `CatalogSelect` — ninguna lógica de interacción propia | Cómo se ve o se comporta el selector (eso ya lo resolvió `CatalogSelect`) | TC-004 |

Fetch (`useCatalogFetch`) y componente (`CatalogSelect`) siguen la misma forma a propósito: una
implementación genérica que no sabe si es categoría o comuna, y un wrapper de una sola responsabilidad por
entidad, sin lógica de interacción ni de fetch propia. Es el mismo principio (T-003) aplicado dos veces, no
dos decisiones distintas.

**La capa de queries (`server/utils/categorias.ts` / `comunas.ts`) queda afuera del patrón genérico +
wrapper, a propósito.** Las dos funciones difieren en los nombres de columna que le pasan a Drizzle
(`categorias.slug` vs `comunas.codigo`) — TypeScript necesita esos nombres literales para tipar el
resultado. Forzar una función genérica ahí cambia columnas explícitas y tipadas por un parámetro genérico
sin ese tipo, que es exactamente la protección que Drizzle existe para dar. Que vivan en dos archivos
(A-006, un archivo por entidad) no es el mismo problema que D-004 vino a resolver: eso era código repetido
que se podía desincronizar sin que nadie lo note; acá cada archivo tiene una diferencia real (el tipo de su
columna) que justifica que sean dos.

No hay diagrama: son cinco capas en línea recta (schema → query → endpoint → composable → componentes),
sin ramificaciones ni servicios externos de por medio. `CategoriaSelect`/`ComunaSelect` son la única
bifurcación, y es deliberada: comparten `CatalogSelect` por composición, no por copiarse entre sí.

## Contratos

### TC-001 — `GET /api/categorias`

- **Entrada:** ninguna — sin params ni query.
- **Salida:** `200 { categorias: { slug: string, nombre: string }[] }` — solo las `activa = true`, ordenadas
  alfabéticamente por `nombre`.
- **Invariantes:** nunca incluye una fila con `activa = false`. Nunca incluye columnas internas (si el
  schema suma alguna después, es privada por default — A-005). La respuesta se cachea en el servidor
  hasta una hora (T-004) — un cambio de `activa` puede tardar hasta ese tiempo en reflejarse.
- **Errores:** ninguno esperado con input inválido (no hay input). Una falla de conexión a la base
  propaga como `500` — no hay una condición de negocio que distinga un error "manejable" de una caída de
  infraestructura acá.
- **Contrato de producto:** [D-001](./producto.md#d-001), [D-004](./producto.md#d-004).

### TC-002 — `GET /api/comunas`

- **Entrada:** ninguna.
- **Salida:** `200 { comunas: { codigo: string, nombre: string }[] }` — solo `activa = true`, ordenadas
  alfabéticamente por `nombre`. `codigo` es el código oficial de comuna de la SUBDERE (ver
  [E-006](./investigacion.md#e-006)), no un id interno.
- **Invariantes:** igual que TC-001, aplicado a `comunas`.
- **Errores:** igual que TC-001.
- **Contrato de producto:** [D-002](./producto.md#d-002), [D-004](./producto.md#d-004).

### TC-003 — `useCatalogFetch()`, compuesto por `useCategoriasCatalog()` / `useComunasCatalog()`

Mismo problema que TC-004, un nivel más abajo: pedir un catálogo con cache y manejo de error es una sola
lógica, no dos. `useCatalogFetch(key, endpoint, normalize)` la implementa una vez; `useCategoriasCatalog()`
y `useComunasCatalog()` son un wrapper de una sola responsabilidad cada uno, solo fijando su `key`, su
`endpoint` y cómo traducir la respuesta del endpoint a la forma genérica — igual que
`CategoriaSelect`/`ComunaSelect` respecto de `CatalogSelect`.

- **Entrada de `useCatalogFetch(key, endpoint, normalize)`:** `key: string` (para `useAsyncData`),
  `endpoint: string` (la ruta a pedir), `normalize: (data: T) => {value, label}[]` (traduce la respuesta
  cruda del endpoint). El tercer parámetro es necesario porque `useCatalogFetch` no conoce la forma de esa
  respuesta — no puede adivinar si el campo identificador se llama `slug` o `codigo` con solo `key` y
  `endpoint`; eso quedó mal especificado en una versión anterior de este documento.
- **Entrada de `useCategoriasCatalog()` / `useComunasCatalog()`:** ninguna — cada uno llama internamente a
  `useCatalogFetch('categorias', '/api/categorias', normalize)` con el `normalize` que mapea
  `{slug, nombre}` a `{value, label}` (o `{codigo, nombre}` en el caso de comunas).
- **Salida (las tres):** `{ items: ComputedRef<{value: string, label: string}[]>, pending: Ref<boolean>, error: Ref<boolean>, refresh: () => void }`.
- **Invariantes:** el fetch ocurre una sola vez por sesión de navegación, incluso si dos componentes montan
  el mismo wrapper al mismo tiempo (ej. `CategoriaSelect` en dos formularios de la misma página). Esto
  necesita **dos** opciones de `useAsyncData`, no solo una `key` compartida — verificado con un componente
  que monta el mismo wrapper dos veces y cuenta las requests reales al endpoint:
  - `getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]` — reusa datos
    ya resueltos (ej. al volver a una página).
  - `dedupe: 'defer'` — sin esto, dos llamadas con la misma `key` que ocurren casi al mismo tiempo (sin
    `await` entre medio, que es como se usan los composables en la práctica) hacen que la segunda cancele
    la primera y dispare su propia request: dos hits al servidor en vez de uno, aunque el resultado final
    se vea igual reactivamente. El default de `useAsyncData` (`dedupe: 'cancel'`) no alcanza para este
    caso.
- **Errores:** `error` pasa a `true` si el fetch falla; no reintenta solo, expone `refresh()` para que
  `CatalogSelect` lo dispare desde el botón "Reintentar" (ver `experiencia.md`, modo error).
- **Contrato de producto:** soporte de [D-004](./producto.md#d-004).

### TC-004 — `<CatalogSelect>`, compuesto por `<CategoriaSelect>` / `<ComunaSelect>`

- **Entrada (props) de `CatalogSelect`:** `modelValue: string | null`, `items: {value: string, label: string}[]`,
  `pending: boolean`, `error: boolean`, `placeholder: string`, `showAllOnFocus?: boolean` (default `false`
  — ver UX-002).
- **Entrada (props) de `CategoriaSelect` / `ComunaSelect`:** solo `modelValue: string | null` — el resto
  (`items`, `pending`, `error`, `placeholder`, `showAllOnFocus`) lo arma cada wrapper llamando a su
  composable y pasándoselo a `CatalogSelect` internamente; quien usa `<CategoriaSelect>` no ve ni necesita
  saber que existe `CatalogSelect` debajo. `CategoriaSelect` pasa `showAllOnFocus: true`; `ComunaSelect` no
  lo pasa (queda en `false`).
- **Salida (emit):** `update:modelValue(value: string | null)`, igual en las tres.
- **Invariantes:** `CatalogSelect` **nunca** emite un valor que no esté en `items`, o `null` — es la
  garantía de D-004, implementada una sola vez, porque `UInputMenu` no permite "crear" una opción por
  default (a diferencia de un combobox libre). Con `showAllOnFocus: false` (default, `ComunaSelect`),
  ninguna opción se muestra mientras el campo de búsqueda esté vacío (UX-001); con `showAllOnFocus: true`
  (`CategoriaSelect`), el catálogo completo se muestra apenas se enfoca, sin esperar texto (UX-002).
  `CatalogSelect` sigue sin saber qué entidad es — decide según el prop, nunca según cuántos `items`
  recibió. `CategoriaSelect`/`ComunaSelect` no reimplementan nada de esto — si D-004/UX-001/UX-002 cambian,
  se edita `CatalogSelect` una vez y el cambio llega gratis a los dos wrappers, porque lo componen — no
  porque lo copien.
- **Errores:** si `useCategoriasCatalog()`/`useComunasCatalog()` reportan `error`, el componente entra en
  modo error (ver `experiencia.md`) y el campo queda deshabilitado hasta reintentar.
- **Contrato de producto:** [D-004](./producto.md#d-004), [UXF-001](./experiencia.md#uxf-001-elegir-categoría-o-comuna-desde-el-catálogo).

## Modelo de datos

| Entidad o campo    | Significado                                              | Escritura                          | Retención o historial |
| ---------------------- | ------------------------------------------------------------- | --------------------------------------- | ---------------------- |
| `categorias.slug`      | Identificador estable del oficio, usado en código y futuras URLs | Seed inicial (8 filas), fijo — no se genera desde el nombre en runtime | Permanente, nunca se reusa |
| `categorias.nombre`    | Nombre visible, el que decidió D-001 ("Gasfitería")            | Seed inicial; editable a mano en la base si cambia el copy | — |
| `categorias.activa`    | Si aparece en el selector de registro/búsqueda                  | Seed inicial (las 8 en `true`); cambios manuales en la base (D-001, sin panel de admin) | — |
| `comunas.codigo`       | Código oficial SUBDERE de la comuna                              | Seed inicial (346 filas), fijo          | Permanente |
| `comunas.nombre`       | Nombre oficial de la comuna ("Ñuñoa")                            | Seed inicial                            | — |
| `comunas.activa`       | Si aparece en el selector — Gran Santiago y Puerto Varas parten en `true`, el resto en `false` (D-002) | Seed inicial; cambios manuales en la base | — |

### Invariantes de datos

- `categorias.slug` y `comunas.codigo` son claves primarias — la unicidad la garantiza Postgres, no una
  verificación de aplicación.
- Ninguna fila se borra nunca (ni categoría ni comuna): "sacar" una es poner `activa = false`, nunca un
  `DELETE` — un profesional o una búsqueda histórica pueden seguir referenciando una categoría o comuna
  desactivada.
- No hay `updated_at`/`created_at` con valor de negocio — estas tablas no tienen historial que importe,
  son catálogo de referencia.

**Migración:** no aplica — son tablas nuevas. `server/db/schema/index.ts` está vacío hoy (auditado antes de
diseñar esto), así que no hay dato previo en el repo ni consumidor existente que adaptar.

### Impacto en RLS

Primera tabla del repo con RLS real — no hay política previa que migrar.

| Tabla        | Cambio | Policy afectada             | Acción |
| --------------- | ------ | -------------------------------- | ------ |
| `categorias`     | nueva  | `categorias_select_public`       | crear — lectura pública sin restricción (`using (true)`); no existe policy de escritura porque nada escribe vía la conexión de la app (A-002: el seed y los cambios de `activa` van directo a la base, no por `server/api/`) |
| `comunas`        | nueva  | `comunas_select_public`          | crear — mismo criterio que `categorias` |

**Por qué la policy es `using (true)` y no `using (activa = true)`:** por A-002, la policy es respaldo, no
el mecanismo — el filtro real vive en `server/utils/categorias.ts`/`comunas.ts` (TC-001/TC-002). Restringir la policy a
solo filas activas la duplicaría sin necesidad, y estos datos no son sensibles (nombres de comuna y
categoría son públicos por diseño) — no hay nada que proteger si alguien consultara `comunas` completa por
fuera del filtro de la app.

## Riesgos y experimentos de factibilidad

<a id="tr-001"></a>

| ID     | Riesgo o pregunta                                              | Qué invalida         | Experimento o mitigación                          | Criterio de salida                | Estado  |
| ------ | ------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------ | -------------------------------------- | ------- |
| TR-001 | El seed de 346 comunas tiene un nombre o código mal transcrito | Una comuna real queda invisible o con nombre incorrecto | Fuente única: el PDF de SUBDERE citado en [E-006](./investigacion.md#e-006), no reescribir a mano — generar el `INSERT` desde ese dato | El conteo final es exactamente 346 filas, verificado contra la fuente | abierto |

## Estrategia de pruebas

Sin infraestructura de test de integración contra Postgres todavía en el repo — la misión 02 tampoco la
agregó, y verificó S-001 a mano contra la base de desarrollo. Este es el mismo criterio: no se agrega el
andamiaje de integración solo para dos queries de un `select` con un `where`.

`@vue/test-utils` no está instalado — la única prueba de componente que existe hoy es el `email.test.ts`
de la misión 02, que no monta nada de Vue. S-004 lo agrega (`npm i -D @vue/test-utils`) como parte del
slice, no como precondición externa: es la primera vez que un componente de Datealo necesita esta clase de
prueba.

| Contrato o riesgo   | Nivel        | Caso principal                                              | Límite o falla |
| ------------------------ | ------------ | ------------------------------------------------------------ | ---------------- |
| TC-001, TC-002           | manual       | `GET /api/categorias` devuelve exactamente 8 filas; `GET /api/comunas` devuelve solo las comunas con `activa = true` | Marcar una comuna en `false` a mano y confirmar que desaparece de la respuesta |
| TC-004 (D-004)           | unitario (Vitest + Vue Test Utils), contra `CatalogSelect` directo | Seleccionar una opción de la lista emite `update:modelValue` con su `value` | Escribir texto que no matchea nada y no seleccionar nada — el componente nunca emite ese texto |
| UX-001 (nada hasta escribir) | unitario, contra `CatalogSelect` directo | Con el campo enfocado y vacío, la lista de opciones no se renderiza | Al escribir la primera letra, aparece |
| UX-002 (categorías muestran todo al enfocar) | unitario, contra `CatalogSelect` directo | Con `showAllOnFocus: true`, enfocar sin escribir muestra el catálogo completo | Con `showAllOnFocus: false` (default), enfocar sin escribir no muestra nada |
| `CategoriaSelect`/`ComunaSelect` componen bien | unitario | Cada wrapper le pasa a `CatalogSelect` los `items` de su propio composable | Un cambio en `CatalogSelect` (ej. un modo nuevo) no exige tocar los wrappers |
| TR-001 (conteo del seed) | manual, una vez | `select count(*) from comunas` = 346 después del seed | — |
| T-004 (caché) | manual, una vez contra el preview del PR | `curl` repetido a `/api/categorias` muestra `x-vercel-cache: HIT` la segunda vez — comportamiento documentado por Vercel, esto es confirmación, no una incertidumbre | — |

### Propiedades que deben probarse

- El componente nunca deja el formulario en un estado donde `modelValue` sea un string que no exista en el
  catálogo cargado — ni siquiera transitoriamente mientras se escribe.
- Desactivar una comuna (`activa = false`) no rompe un valor ya guardado en otra tabla que la referencie
  (esto lo prueba la misión que agregue esa referencia — 04 o 06 — no esta).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                  | Sustento             | Criterio de aceptación principal                                                     | Depende de |
| ----- | ------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ---------- |
| S-001 | Tablas `categorias` y `comunas` con RLS y seed completo        | D-001, D-002, TR-001 | `select count(*) from comunas` = 346; `select count(*) from categorias` = 8; Gran Santiago (32) + Puerto Varas activas en `comunas`, las 8 categorías activas | [#45](https://github.com/PatricioTabilo/datealo/issues/45) |
| S-002 | Endpoints `GET /api/categorias` y `GET /api/comunas`            | TC-001, TC-002        | Cada endpoint devuelve solo filas `activa = true`, ordenadas por nombre               | [#46](https://github.com/PatricioTabilo/datealo/issues/46) |
| S-003 | `useCatalogFetch()` y sus wrappers `useCategoriasCatalog()`/`useComunasCatalog()` | TC-003 | Montar dos componentes que usan el mismo wrapper en la misma página dispara un solo request (verificado, requirió `dedupe: 'defer'` además de `getCachedData`); ningún wrapper tiene lógica de fetch propia | [#47](https://github.com/PatricioTabilo/datealo/issues/47) |
| S-004 | Componente `CatalogSelect.vue` con los 6 modos de `experiencia.md` | TC-004, D-004, UXF-001, UX-001 | Test unitario (Vitest + Vue Test Utils) verifica los 6 modos y que nunca emite un valor fuera de `items` | [#48](https://github.com/PatricioTabilo/datealo/issues/48) |
| S-005 | `CategoriaSelect.vue` y `ComunaSelect.vue`, componiendo `CatalogSelect` | TC-004 | Cada uno monta `CatalogSelect` pasándole su composable — cero lógica de interacción propia, verificable con un diff que no toca `CatalogSelect` | [#49](https://github.com/PatricioTabilo/datealo/issues/49) |

Cinco slices, en línea recta por dependencia — no hay forma de paralelizar sin que uno bloquee al
siguiente (los wrappers necesitan `CatalogSelect`, que necesita el composable, que necesita el endpoint,
que necesita la tabla). S-004 y S-005 quedan separados a propósito, aunque parezcan "el mismo componente en
dos partes": S-004 es donde vive toda la regla de D-004/UX-001 y se puede revisar y probar sola, sin
todavía saber si hay uno o dos consumidores — separarlo fuerza a que `CatalogSelect` no termine con nada
específico de categoría o comuna colado adentro.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — Las claves primarias son naturales (`slug`, `codigo`), no `uuid`

- **Estado:** aceptada. **Fecha:** 2026-08-18. **Aprobada por Patricio el:** 2026-08-18.
- **Contratos:** D-001, D-002.
- **Alternativas descartadas:** `uuid` autogenerado como en `professionals` (patrón del resto del repo) —
  para una tabla de catálogo fijo y pequeño, un id sin significado obliga a un join o un mapeo extra en
  cada lugar que ya conoce el nombre o el código oficial; el `slug`/`codigo` ya es estable y único por
  definición (D-001 fija los nombres, SUBDERE fija los códigos), así que inventar un id encima no agrega
  nada.
- **Decisión y consecuencias:** `categorias.slug` (`text`) y `comunas.codigo` (`text`) son primary key.
  Beneficio: el componente y cualquier URL futura (`/categoria/gasfiteria`) usan el mismo valor sin
  traducción. Costo aceptado: si algún día una categoría necesita cambiar de `slug` (renombrar el oficio),
  es un cambio de clave primaria, no un `UPDATE` de una columna — pero eso ya requeriría re-decidir D-001,
  no es un caso frecuente.
- **Reapertura:** si aparece un caso real de necesitar renombrar un `slug`/`codigo` ya en uso por datos de
  otra tabla.

<a id="t-002"></a>

### T-002 — Los tres componentes viven en `app/components/` sin subcarpeta de dominio

- **Estado:** aceptada. **Fecha:** 2026-08-18. **Aprobada por Patricio el:** 2026-08-18.
- **Contratos:** D-004.
- **Alternativas descartadas:** `app/components/shared/` o `app/components/taxonomia/` — Nuxt prefija el
  nombre del componente con el de la carpeta (A-006), así que `shared/ComunaSelect.vue` se auto-importaría
  como `<SharedComunaSelect>`, un prefijo que no aporta nada y que nadie va a escribir por costumbre.
- **Decisión y consecuencias:** `CatalogSelect.vue`, `CategoriaSelect.vue` y `ComunaSelect.vue` quedan
  flat, como `db.ts`/`auth.ts`/`email.ts` en `server/utils/` (infraestructura transversal sin dominio
  propio, A-006) — mismo criterio aplicado al lado de `app/`.
- **Reapertura:** si aparecen más componentes verdaderamente transversales (sin dominio) y la carpeta
  `app/components/` empieza a mezclarlos con los de dominio de forma confusa.

<a id="t-003"></a>

### T-003 — Categoría y comuna nunca tienen lógica duplicada entre archivos: una implementación genérica
por capa, un wrapper de una sola responsabilidad por entidad

- **Estado:** aceptada. **Fecha:** 2026-08-18. **Aprobada por Patricio el:** 2026-08-18.
- **Contratos:** D-004, [UX-001](./experiencia.md#ux-001-el-componente-no-muestra-nada-hasta-que-el-usuario-empieza-a-escribir).
- **Alternativas descartadas:** cada capa implementa su versión para categoría y su versión para comuna por
  separado — es lo que proponía la primera versión de este documento, tanto para el componente
  (`CategoriaSelect`/`ComunaSelect` con los 6 modos cada uno) como para el fetch
  (`useCategoriasCatalog`/`useComunasCatalog` con su propio `useAsyncData` cada uno). Funciona, pero duplica
  la única regla que D-004 definió como una sola cosa para las dos entidades; un cambio a esa regla (un modo
  nuevo, un ajuste al debounce) se tendría que aplicar dos veces y sincronizar a mano. Un mixin o un
  composable que devuelva solo el estado (sin el markup del componente) — deja la mitad de la lógica
  compartida y la otra mitad duplicada, que es donde vive la mayoría del riesgo de que las dos
  implementaciones diverjan.
- **Decisión y consecuencias:** `useCatalogFetch` y `CatalogSelect.vue` son las únicas implementaciones de
  "traer un catálogo con cache" y de UXF-001, respectivamente. `useCategoriasCatalog`,
  `useComunasCatalog`, `CategoriaSelect` y `ComunaSelect` son wrappers de una sola responsabilidad — fijar
  el dato específico de su entidad y nada más. Beneficio: un cambio a D-004/UX-001, o al manejo de error del
  fetch, se hace una vez y llega a las dos entidades. Costo aceptado: dos archivos genéricos más de los que
  parecían necesarios a simple vista — se acepta porque la alternativa es la misma duplicación que esta
  misión existe para evitar en los datos, repetida en cada capa de código que los toca. La capa de queries
  (`server/utils/categorias.ts`/`comunas.ts`, un archivo por entidad) queda fuera de este patrón — ver la
  nota en la sección de Arquitectura.
- **Reapertura:** si `CategoriaSelect`/`ComunaSelect` o sus composables necesitan alguna vez una regla que
  no aplique a la otra entidad — ahí la implementación compartida deja de ser una talla única y esta
  decisión se revisa.

<a id="t-004"></a>

### T-004 — `GET /api/categorias` y `GET /api/comunas` se cachean vía header HTTP, no vía caché de
aplicación

- **Estado:** aceptada. **Fecha:** 2026-08-18. **Aprobada por Patricio el:** 2026-08-18.
- **Contratos:** TC-001, TC-002.
- **Tensión:** el dedupe del lado del cliente (TC-003, `dedupe: 'defer'`) evita que una misma página pida
  el catálogo dos veces, pero no evita que cada página nueva, de cada usuario, vuelva a pegarle a la base
  — para un dato que casi no cambia (D-001/D-002: `activa` se toca a mano, rara vez), eso es costo sin
  beneficio.
- **Alternativas descartadas:** `defineCachedEventHandler` de Nitro (primera versión de esta decisión) —
  memoiza la ejecución del handler, pero sobre funciones serverless (A-003, preset `vercel`) el storage por
  default no garantiza compartirse entre instancias; es una caché que no se puede observar ni controlar
  desde afuera. Redis/Vercel KV como store explícito — resuelve el problema de observabilidad, pero es
  infraestructura nueva para un caso que no la necesita: nadie escribe estas tablas desde la app
  (D-001/D-002, sin panel de admin), así que no hay ningún evento de escritura del que colgar una
  invalidación inmediata — un TTL por tiempo es la única opción real exista o no Redis de por medio.
- **Decisión y consecuencia:** `setResponseHeader(event, 'cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400')`
  en ambos handlers — el patrón exacto que documenta Vercel para cachear respuestas de Vercel Functions en
  su CDN ([Caching Serverless Function Responses](https://vercel.com/docs/functions/serverless-functions/edge-caching)):
  cualquier respuesta con `s-maxage` cachea, y su checklist de "qué hace cacheable una respuesta" (método
  `GET`, sin `Authorization`, sin `set-cookie`, sin `private`/`no-cache`, bajo 10MB) la cumplen los dos
  endpoints sin ajustes. No es una apuesta ni una caché de aplicación propia — es el mecanismo estándar que
  Vercel expone para exactamente este caso. `x-vercel-cache: HIT` en la respuesta confirma que sirvió desde
  el CDN (ver Estrategia de pruebas). Consecuencia aceptada: un cambio de `activa` en la base puede tardar
  hasta una hora en reflejarse en lo que sirve el CDN — ya documentado como invariante en TC-001/TC-002.
- **Reapertura:** si algún flujo necesita ver un cambio de `activa` reflejado al instante (hoy ninguno lo
  necesita — los cambios son manuales y poco frecuentes).

## Preguntas

Ninguna abierta.
