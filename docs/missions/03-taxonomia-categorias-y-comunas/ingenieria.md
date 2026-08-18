# Misión 03: taxonomía de categorías y comunas — Ingeniería

**Estado:** en revisión

**Última actualización:** 2026-08-18

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: dos tablas de catálogo con `activa`, dos endpoints de solo lectura, un componente
compartido compuesto por dos wrappers

Dos tablas nuevas (`categorias`, `comunas`), cada una con el campo `activa` que D-001/D-002 piden. Dos
endpoints `GET` de solo lectura, sin autenticación (son catálogo público, no datos de usuario). Dos
composables que los consumen con cache, y un componente Vue (`CatalogSelect`) que implementa el contrato de
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
ownership) — son datos de referencia que otros dominios consumen. Por eso `server/utils/taxonomia.ts` es
solo queries, sin lógica que valga la pena aislar como función pura: el principio de "lógica fuera de la
infraestructura" del skill no aplica acá, sería abstracción sin regla que separar.

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
| `server/db/schema/taxonomia.ts`        | Forma de las tablas                                     | Qué filas existen (eso es el seed)          | D-001, D-002   |
| `server/utils/taxonomia.ts`             | Queries: solo filas `activa = true`, columnas públicas | Presentación, formato del texto              | D-001, D-002   |
| `server/api/categorias.get.ts` / `comunas.get.ts` | I/O: llama la query, devuelve JSON              | Filtrar por texto (eso lo hace el cliente)    | TC-001, TC-002 |
| `app/composables/useCategoriasCatalog.ts` / `useComunasCatalog.ts` | Fetch con cache, expone `pending`/`error` | Cuándo mostrar la lista (eso es el componente) | TC-003         |
| `app/components/CatalogSelect.vue`     | Los 6 modos de UXF-001, sobre `UInputMenu` — recibe `items`/`pending`/`error`/`placeholder` por props, nunca sabe si es categoría o comuna | De dónde vienen los datos | D-004, UX-001, TC-004 |
| `app/components/CategoriaSelect.vue` / `ComunaSelect.vue` | Conectar su composable con `CatalogSelect` — ninguna lógica de interacción propia | Cómo se ve o se comporta el selector (eso ya lo resolvió `CatalogSelect`) | TC-004 |

No hay diagrama: son cinco capas en línea recta (schema → query → endpoint → composable → componentes),
sin ramificaciones ni servicios externos de por medio. `CategoriaSelect`/`ComunaSelect` son la única
bifurcación, y es deliberada: comparten `CatalogSelect` por composición, no por copiarse entre sí.

## Contratos

### TC-001 — `GET /api/categorias`

- **Entrada:** ninguna — sin params ni query.
- **Salida:** `200 { categorias: { slug: string, nombre: string }[] }` — solo las `activa = true`, ordenadas
  alfabéticamente por `nombre`.
- **Invariantes:** nunca incluye una fila con `activa = false`. Nunca incluye columnas internas (si el
  schema suma alguna después, es privada por default — A-005).
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

### TC-003 — `useCategoriasCatalog()` / `useComunasCatalog()`

- **Entrada:** ninguna.
- **Salida:** `{ items: Ref<{slug, nombre}[]>, pending: Ref<boolean>, error: Ref<boolean> }` (comunas:
  mismo shape con `codigo` en vez de `slug`).
- **Invariantes:** el fetch ocurre una sola vez por sesión de navegación — `useAsyncData` con una key fija
  comparte el resultado entre todos los componentes que lo usen, así que abrir `CategoriaSelect` en dos
  formularios distintos de la misma página no dispara dos requests.
- **Errores:** `error` pasa a `true` si el fetch falla; el composable no reintenta solo, expone `refresh()`
  para que el componente lo dispare desde el botón "Reintentar" (ver `experiencia.md`, modo error).
- **Contrato de producto:** soporte de [D-004](./producto.md#d-004).

### TC-004 — `<CatalogSelect>`, compuesto por `<CategoriaSelect>` / `<ComunaSelect>`

- **Entrada (props) de `CatalogSelect`:** `modelValue: string | null`, `items: {value: string, label: string}[]`,
  `pending: boolean`, `error: boolean`, `placeholder: string`.
- **Entrada (props) de `CategoriaSelect` / `ComunaSelect`:** solo `modelValue: string | null` — el resto
  (`items`, `pending`, `error`, `placeholder`) lo arma cada wrapper llamando a su composable y pasándoselo a
  `CatalogSelect` internamente; quien usa `<CategoriaSelect>` no ve ni necesita saber que existe
  `CatalogSelect` debajo.
- **Salida (emit):** `update:modelValue(value: string | null)`, igual en las tres.
- **Invariantes:** `CatalogSelect` **nunca** emite un valor que no esté en `items`, o `null` — es la
  garantía de D-004, implementada una sola vez, porque `UInputMenu` no permite "crear" una opción por
  default (a diferencia de un combobox libre). Ninguna opción se muestra mientras el campo de búsqueda esté
  vacío (UX-001, modo "enfocado sin texto") — `CatalogSelect` controla el `open` de `UInputMenu` a mano en
  vez de dejarlo abrir solo al enfocar. `CategoriaSelect`/`ComunaSelect` no reimplementan nada de esto —
  si D-004 cambia, se edita `CatalogSelect` una vez y el cambio llega gratis a los dos wrappers, porque lo
  componen — no porque lo copien.
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
el mecanismo — el filtro real vive en `server/utils/taxonomia.ts` (TC-001/TC-002). Restringir la policy a
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
| `CategoriaSelect`/`ComunaSelect` componen bien | unitario | Cada wrapper le pasa a `CatalogSelect` los `items` de su propio composable | Un cambio en `CatalogSelect` (ej. un modo nuevo) no exige tocar los wrappers |
| TR-001 (conteo del seed) | manual, una vez | `select count(*) from comunas` = 346 después del seed | — |

### Propiedades que deben probarse

- El componente nunca deja el formulario en un estado donde `modelValue` sea un string que no exista en el
  catálogo cargado — ni siquiera transitoriamente mientras se escribe.
- Desactivar una comuna (`activa = false`) no rompe un valor ya guardado en otra tabla que la referencie
  (esto lo prueba la misión que agregue esa referencia — 04 o 06 — no esta).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                  | Sustento             | Criterio de aceptación principal                                                     | Depende de |
| ----- | ------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ---------- |
| S-001 | Tablas `categorias` y `comunas` con RLS y seed completo        | D-001, D-002, TR-001 | `select count(*) from comunas` = 346; `select count(*) from categorias` = 8; Gran Santiago (32) + Puerto Varas activas en `comunas`, las 8 categorías activas | — |
| S-002 | Endpoints `GET /api/categorias` y `GET /api/comunas`            | TC-001, TC-002        | Cada endpoint devuelve solo filas `activa = true`, ordenadas por nombre               | S-001 |
| S-003 | Composables `useCategoriasCatalog()` y `useComunasCatalog()`    | TC-003                | Montar dos componentes que usan el mismo composable en la misma página dispara un solo request | S-002 |
| S-004 | Componente `CatalogSelect.vue` con los 6 modos de `experiencia.md` | TC-004, D-004, UXF-001, UX-001 | Test unitario (Vitest + Vue Test Utils) verifica los 6 modos y que nunca emite un valor fuera de `items` | S-003 |
| S-005 | `CategoriaSelect.vue` y `ComunaSelect.vue`, componiendo `CatalogSelect` | TC-004 | Cada uno monta `CatalogSelect` pasándole su composable — cero lógica de interacción propia, verificable con un diff que no toca `CatalogSelect` | S-004 |

Cinco slices, en línea recta por dependencia — no hay forma de paralelizar sin que uno bloquee al
siguiente (los wrappers necesitan `CatalogSelect`, que necesita el composable, que necesita el endpoint,
que necesita la tabla). S-004 y S-005 quedan separados a propósito, aunque parezcan "el mismo componente en
dos partes": S-004 es donde vive toda la regla de D-004/UX-001 y se puede revisar y probar sola, sin
todavía saber si hay uno o dos consumidores — separarlo fuerza a que `CatalogSelect` no termine con nada
específico de categoría o comuna colado adentro.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — Las claves primarias son naturales (`slug`, `codigo`), no `uuid`

- **Estado:** propuesta. **Fecha:** 2026-08-18.
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

- **Estado:** propuesta. **Fecha:** 2026-08-18.
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

### T-003 — `CategoriaSelect`/`ComunaSelect` componen `CatalogSelect`, no duplican su lógica

- **Estado:** propuesta. **Fecha:** 2026-08-18.
- **Contratos:** D-004, [UX-001](./experiencia.md#ux-001-el-componente-no-muestra-nada-hasta-que-el-usuario-empieza-a-escribir).
- **Alternativas descartadas:** cada componente implementa sus propios 6 modos por separado — es lo que se
  proponía en la primera versión de este documento. Funciona, pero duplica la única regla que D-004 definió
  como una sola cosa para las dos entidades; un cambio a esa regla (un modo nuevo, un ajuste al debounce)
  se tendría que aplicar dos veces y sincronizar a mano. Un mixin o un composable que devuelva solo el
  estado (sin el markup) — deja la mitad de la lógica compartida (el estado) y la otra mitad duplicada (el
  template con sus seis variantes de UI), que es donde vive la mayoría del riesgo de que las dos
  implementaciones diverjan.
- **Decisión y consecuencias:** `CatalogSelect.vue` es la única implementación de UXF-001. `CategoriaSelect`
  y `ComunaSelect` son componentes de una sola responsabilidad — conectar su composable con
  `CatalogSelect` — sin markup ni lógica de interacción propia. Beneficio: un cambio a D-004/UX-001 se hace
  una vez. Costo aceptado: agregar un tercer archivo por lo que a simple vista son "dos componentes
  parecidos" — se acepta porque la alternativa es la duplicación exacta que esta misión existe para evitar
  en los datos, ahora también en el componente.
- **Reapertura:** si `CategoriaSelect` o `ComunaSelect` necesitan alguna vez una regla que no aplique a la
  otra — ahí `CatalogSelect` deja de ser una talla única y esta decisión se revisa.

## Preguntas

Ninguna abierta.
