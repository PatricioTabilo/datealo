# Misión 15: múltiples comunas por profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-07

**Última actualización:** 2026-09-07

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: `professionals.comuna_codigo` pasa a ser una tabla de relación, y el resto del sistema se adapta a leer un conjunto en vez de un valor

`comuna_codigo` deja de ser una columna de `professionals` y pasa a una tabla `professional_comunas`
(profesional↔comuna, muchos a muchos). Todo lo que hoy lee o escribe esa columna —registro, edición de
perfil, perfil público, correo de bienvenida, búsqueda— se adapta a leer/escribir un conjunto. La columna
vieja se elimina en un slice aparte, al final, cuando ya nada la lee — no conviven las dos fuentes de
verdad más tiempo del necesario para migrar con seguridad.

- **Contratos de producto cubiertos:** F-001.
- **Riesgo bloqueante:** ninguno. El patrón (tabla de relación + agrupación en memoria) es estándar y la
  escala actual (decenas de profesionales, pre-lanzamiento) no exige optimización adicional — ver "Riesgos
  y experimentos de factibilidad". Sí hay una ventana de migración entre slices que el diseño resuelve
  explícitamente en [T-005](#t-005), no una que se haya pasado por alto.

## Arquitectura: la relación vive en su propia tabla; `professionals.ts` sigue siendo el único dueño de las reglas de negocio del profesional

`server/utils/professionals.ts` ya es, por A-006, el dominio dueño de todo lo que es "reglas y queries de
un profesional" — declarar comunas es una operación de ese dominio, no una tabla que necesite su propio
archivo de utils. `search.ts` sigue resolviendo búsqueda, ahora contra la relación en vez de la columna. El
selector múltiple es un componente nuevo, específico de comunas — no una generalización de `CatalogSelect`
para "cualquier catálogo múltiple": hoy solo tiene un consumidor real (comunas); si la misión 14 (categorías
múltiples) termina necesitando el mismo patrón de interacción, ahí se evalúa extraer un `CatalogMultiSelect`
compartido, con el mismo criterio que ya usó [T-003 de la misión 03](../../03-taxonomia-categorias-y-comunas/ingenieria.md#t-003)
para `CatalogSelect` — no antes, porque esa misión ni siquiera tiene `experiencia.md` todavía y su
interacción podría no ser un bottom sheet.

| Componente | Responsabilidad | No debe decidir | Contratos |
| ---------- | ---------------- | ---------------- | --------- |
| `server/db/schema/professional-comunas.ts` (nuevo) | Define la relación profesional↔comuna y sus índices | Validación de negocio (vive en `professionals.ts`) | F-001 |
| `server/utils/professionals.ts` | Crear/reemplazar/leer el conjunto de comunas de un profesional, junto con el resto de sus reglas | Cómo se resuelve una búsqueda | F-001 |
| `server/utils/search.ts` | Resolver coincidencias exacta/vecina y cuál comuna declarada las produjo (función pura `pickMatchedComuna`, sin Drizzle) | Cómo se declara o edita una comuna | F-001, UX-005 |
| `server/utils/comunas.ts` | `findComunasFrecuentes` cuenta comunas por profesionales activos que las declararon — se adapta a la relación, mismo criterio que hoy | Reglas de negocio de `professionals` | F-001 |
| `server/api/professionals/index.post.ts`, `me/index.patch.ts`, `me/index.get.ts`, `[id].get.ts` | Traducir HTTP ↔ funciones de `professionals.ts`; validar forma del body | Reglas de negocio (viven en `utils/`) | F-001 |
| `app/composables/useProfessionalRegistration.ts`, `useProfessionalProfile.ts` | Estado reactivo del formulario/perfil, incluida la selección de comunas | Cómo se ve el selector | F-001, UXF-001 |
| `app/components/ComunasMultiSelect.vue` (nuevo) | El sheet: catálogo, filtro, checkboxes, contador, confirmar/descartar | De qué formulario viene, qué hace con el valor confirmado | UXF-001, V-001 |

## Vocabulario e invariantes alineados con producto

| Término de producto (`producto.md`/`experiencia.md`) | Entidad/campo en código |
| -------------------------------------------------------- | -------------------------- |
| comuna declarada                                          | fila en `professional_comunas` |
| declarar/editar comunas                                    | `POST /api/professionals` (creación) o `PATCH /api/professionals/me` (reemplazo del conjunto) |
| comuna que produjo la coincidencia (card de resultados)    | ver [T-002](#t-002) — `pickMatchedComuna`, función pura en `search.ts` |

Invariante de `CLAUDE.md` que este diseño respeta sin tocar: el contacto sigue yendo directo al
profesional — nada de esta misión introduce una bandeja intermedia ni un paso nuevo antes de contactar.

## Contratos

<a id="tc-001"></a>

### TC-001 — `POST /api/professionals` crea el profesional y sus comunas declaradas en una sola operación atómica

- **Entrada:** body `{ displayName: string, categoriaSlug: string, comunaCodigos: string[], contact: string }`.
  `comunaCodigos` reemplaza a `comunaCodigo` en el body — al menos un elemento, cada código debe existir y
  estar activo, sin duplicados (el servidor deduplica con `Set` antes de validar, no confía en que el
  cliente ya lo hizo).
- **Salida:** `{ professional: Professional }`, 201 si se crea, 200 si el profesional ya existía (mismo
  comportamiento idempotente de hoy vía `onConflictDoNothing` en `userId`). `Professional.comunas:
  { codigo: string, nombre: string }[]` reemplaza a `comunaCodigo`.
- **Invariantes:** la fila de `professionals` y las N filas de `professional_comunas` se crean en una sola
  transacción (`useDb().transaction(...)`) — si algún código de comuna no es válido, no se crea ni el
  profesional ni ninguna comuna. Nunca queda un profesional sin comunas.
- **Errores:** `comunaCodigos` ausente o vacío → 400 `{ error: 'missing_field', field: 'comunaCodigos' }`
  (mismo shape que ya usan los otros campos requeridos). Algún código no existe o está inactivo → 400
  `{ error: 'invalid_comuna' }` (mismo error que ya existía, sin señalar cuál código — igual que hoy).
- **Contrato de producto:** [F-001](./producto.md#f-001), [CL-004](./producto.md#f-001).

<a id="tc-002"></a>

### TC-002 — `PATCH /api/professionals/me` reemplaza el conjunto completo de comunas declaradas del profesional autenticado

- **Entrada:** `comunaCodigos?: string[]` se agrega a los campos parciales que ya acepta el patch. Cuando
  está presente, **reemplaza el conjunto completo, no aplica un delta** — el cliente siempre envía el
  estado final tal como lo confirmó "Listo" en el sheet (UXF-001), nunca "agregar esta comuna" o "quitar
  esa otra".
- **Salida:** `{ professional: Professional }` con `comunas` ya actualizado.
- **Invariantes:**
  - El `professionalId` que se actualiza nunca viene del body — se resuelve siempre desde
    `requireUser(event).id` → la fila de `professionals` cuyo `userId` coincide, exactamente como ya hace
    `updateProfessional` hoy. Ningún id de comuna ni de profesional llega del cliente sin pasar por esa
    resolución (A-002).
  - Reemplazo atómico dentro de una transacción: `delete from professional_comunas where professional_id =
    ?` seguido del `insert` del nuevo conjunto — nunca un estado intermedio en cero visible a otra request
    concurrente (ej. una búsqueda que corre a mitad del `DELETE`).
  - `comunaCodigos` deduplicado antes de insertar ([CL-001](./producto.md#f-001)).
- **Errores:** `comunaCodigos` presente y vacío → 400 `{ error: 'missing_field', field: 'comunaCodigos' }`
  — la fila existente no se toca ([CL-004](./producto.md#f-001)). Algún código inválido/inactivo → 400
  `{ error: 'invalid_comuna' }`. Profesional no encontrado → 404 `{ error: 'not_found' }` (caso ya
  existente).
- **Contrato de producto:** [F-001](./producto.md#f-001), [CL-001](./producto.md#f-001),
  [CL-004](./producto.md#f-001).

<a id="tc-003"></a>

### TC-003 — La forma pública y propia de un profesional expone `comunas: { codigo, nombre }[]`, nunca `comunaCodigo`/`comunaNombre` singular

- **Entrada:** ninguna — afecta la forma de salida de `GET /api/professionals/me`, `GET
  /api/professionals/[id]` y las respuestas de TC-001/TC-002.
- **Salida:** `Professional.comunas` y `PublicProfessionalProfile.comunas`: array de `{ codigo: string,
  nombre: string }`, **siempre en orden alfabético por nombre** — mismo orden que ya usa
  `findActiveComunas` (`orderBy(asc(comunas.nombre))`). Ningún consumidor (app) reordena: el orden ya viene
  resuelto desde el servidor, siguiendo [UX-004](./experiencia.md#ux-004).
- **Invariantes:** `comunas` nunca es un array vacío para un profesional activo válido — D-003 (migración)
  y CL-004 (validación de escritura) lo garantizan juntos, ninguno de los dos solo.
- **Errores:** ninguno nuevo — hereda los 404 que estos endpoints ya devuelven.
- **Impacto en consumidores existentes:** `buildProfessionalWelcomeEmail` (correo de bienvenida) y el
  `<title>` SEO de `app/pages/profesionales/[id].vue` arman su texto con
  `Intl.ListFormat('es-CL', { type: 'conjunction' }).format(comunas.map(c => c.nombre))`, la misma regla
  de formato que fijó UX-004 para el resto de la app — ninguno de los dos inventa su propio criterio de
  unión de la lista.
- **Contrato de producto:** [F-001](./producto.md#f-001).

<a id="tc-004"></a>

### TC-004 — `GET /api/search` resuelve, por cada profesional del resultado, cuál de sus comunas declaradas produjo la coincidencia

- **Entrada:** sin cambio — `?categoria=<slug>&comuna=<codigo>`.
- **Salida:** sin cambio de forma — `SearchResultProfessional.comunaNombre` sigue siendo un único string
  ([UX-005](./experiencia.md#ux-005)), nunca un array.
- **Invariantes:** cuando un profesional califica por más de una comuna del conjunto buscado a la vez (ej.
  coincidencia `vecina` que hace match con dos comunas distintas que el profesional declaró), se elige la
  que sea alfabéticamente primera de las que matchearon — resuelto por una función pura, `pickMatchedComuna`,
  ver [T-002](#t-002). Determinístico: la misma búsqueda siempre devuelve la misma `comunaNombre` para ese
  profesional, nunca varía entre requests.
- **Errores:** sin cambio respecto de hoy.
- **Contrato de producto:** [F-001](./producto.md#f-001), [CL-002](./producto.md#f-001),
  [CL-003](./producto.md#f-001), [UX-005](./experiencia.md#ux-005).
- **Impacto en otro consumidor de `professionals.comunaCodigo`:** `findComunasFrecuentes`
  (`server/utils/comunas.ts`), que arma la lista de comunas sugeridas en el buscador del hero, cuenta hoy
  profesionales activos por comuna vía `innerJoin(professionals, eq(professionals.comunaCodigo,
  comunas.codigo))`. Pasa a unirse contra `professional_comunas` en su lugar — mismo `groupBy`/`orderBy` de
  hoy, sin cambio de contrato externo (`{ codigo, nombre }[]`, límite 3). Un profesional con varias comunas
  cuenta una vez por cada una que declaró, correctamente: si Rudiberto declaró Llanquihue, Frutillar y
  Puerto Varas, contribuye al conteo de las tres, porque de verdad atiende en las tres — no es un
  double-count indebido, es la misma semántica de hoy generalizada de 1 a N comunas por profesional.

## Modelo de datos

| Entidad o campo | Significado | Escritura | Retención o historial |
| ---------------- | ------------ | ---------- | ----------------------- |
| `professional_comunas` (nueva) | Una fila = "este profesional declaró que atiende en esta comuna" | `POST /api/professionals` (creación), `PATCH /api/professionals/me` (reemplazo) — nunca `UPDATE` en el lugar | Sin historial: al reemplazar el conjunto, las filas quitadas se borran de verdad, no se marcan inactivas — no hay ningún caso de producto que necesite recordar qué comuna declaró antes un profesional |
| `professionals.comuna_codigo` (columna actual) | Se elimina — ver "Migración y compatibilidad" | — | — |

```ts
// server/db/schema/professional-comunas.ts
export const professionalComunas = pgTable(
  'professional_comunas',
  {
    professionalId: uuid('professional_id')
      .notNull()
      .references(() => professionals.id, { onDelete: 'cascade' }),
    comunaCodigo: text('comuna_codigo')
      .notNull()
      .references(() => comunas.codigo),
  },
  table => [
    primaryKey({ columns: [table.professionalId, table.comunaCodigo] }),
    // La PK ya cubre "todas las comunas de un profesional" (professionalId es su columna líder).
    // La búsqueda necesita el sentido contrario: "qué profesionales declararon esta comuna" — sin este
    // índice, /api/search hace seq scan de toda la tabla en cada request.
    index('professional_comunas_comuna_codigo_idx').on(table.comunaCodigo),
  ],
)
```

La PK compuesta hace dos cosas a la vez: es la unicidad que resuelve CL-001 a nivel de base de datos (un
`INSERT` duplicado del mismo par falla, aunque el servidor ya deduplica antes de llegar ahí — defensa en
profundidad, no el único mecanismo), y es el índice que sirve "traer todas las comunas de un profesional"
sin necesitar uno aparte.

`onDelete: 'cascade'` en `professionalId`: hoy nada borra una fila de `professionals` (sin policy de
`delete`, ver `rls.sql`), así que esta cláusula no se ejerce todavía — se deja puesta porque es la
semántica correcta de la relación (si algún día existe un borrado de cuenta, no debería dejar comunas
huérfanas) y no cuesta nada declararla ahora.

### Invariantes de datos

- Un profesional activo válido tiene siempre al menos una fila en `professional_comunas` — lo garantizan
  juntos D-003 (migración) y la validación de escritura de TC-001/TC-002 (CL-004). Ninguna operación deja a
  un profesional existente en cero.
- El reemplazo del conjunto (TC-002) es atómico: nunca hay una ventana donde el conjunto esté vacío para
  otra request que lea en paralelo.
- `professional_comunas` no tiene historial ni soft-delete: una comuna que el profesional quita
  desaparece de la tabla. Esto es intencional (ver tabla de arriba) — no hay ninguna funcionalidad de
  producto (auditoría, "comunas que alguna vez atendiste") que dependa de conservarla.

### Impacto en RLS

Corrido el checklist del skill `seguridad-datos` contra este diseño:

| Tabla | Cambio | Policy afectada | Acción |
| ------ | ------- | ----------------- | -------- |
| `professional_comunas` | Tabla nueva | `professional_comunas_select_public` | Crear — `for select using (true)`, mismo criterio asimétrico que `professionals` (lectura pública, es parte del perfil) |
| `professional_comunas` | Tabla nueva | `professional_comunas_insert_own` | Crear — `for insert to authenticated with check (exists (select 1 from professionals p where p.id = professional_comunas.professional_id and p.user_id = (select auth.uid())))` |
| `professional_comunas` | Tabla nueva | `professional_comunas_delete_own` | Crear — mismo `EXISTS` que insert, con `using` en vez de `with check` |
| `professionals` | Ninguno — `comuna_codigo` se elimina, pero las policies existentes (`select_public`, `insert_own`, `update_own`) no la nombran explícitamente | — | Nada |

Notas del checklist, explícitas porque el skill pide no dejarlas implícitas:

- **`alter table professional_comunas enable row level security`** va en el diseño, no se asume.
- **Sin policy de `update`**: ninguna operación actualiza una fila de `professional_comunas` en el lugar —
  el reemplazo siempre es `delete` + `insert` (TC-002). Una policy de `update` sin uso real es superficie
  sin beneficio.
- **`revoke all on public.professional_comunas from anon, authenticated`** — igual que `professionals`
  (A-007): esta tabla se lee y escribe solo vía Drizzle desde `server/api/`, nunca por PostgREST. Sin este
  revoke, las tres policies de arriba serían la única puerta, no un respaldo.
- **Sin `force row level security`** — forzarlo aplicaría RLS también a la conexión de Drizzle (rol dueño),
  donde `auth.uid()` es `NULL`, y rompería el `INSERT`/`DELETE` del propio servidor. Mismo razonamiento que
  ya deja `professionals` sin forzar.
- **Dónde se verifica pertenencia en el servidor (A-002):** en `updateProfessionalComunas` (nuevo, en
  `server/utils/professionals.ts`) — recibe siempre el `userId` de `requireUser(event)`, resuelve el
  `professionalId` propio con una query a `professionals` antes de tocar `professional_comunas`, nunca un
  `professionalId` del body. Las policies de arriba son la red de esa vía, no el mecanismo — coherente con
  cómo ya está documentado el resto de `professionals` en `rls.sql`.
- **Índice de soporte para el `EXISTS` de las policies:** ya cubierto — `professionals.id` es PK y
  `professionals.user_id` tiene `unique()`, ambos ya indexados por esas restricciones; no hace falta un
  índice nuevo para las policies de arriba (además son respaldo, nunca las evalúa la conexión real).
- **Cliente de Supabase en el browser:** esta misión no cambia qué tablas son alcanzables desde ahí —
  `professional_comunas` queda tan cerrada a `anon`/`authenticated` como `professionals` ya lo está.

## Riesgos y experimentos de factibilidad

Sin riesgos de factibilidad que bloqueen el diseño. El patrón (tabla de relación muchos-a-muchos, join +
agrupación en memoria) es estándar en Postgres, ya usado en el propio schema de Datealo (`comuna_vecinas`,
aunque ahí simétrico); no hay incertidumbre de rendimiento real a la escala actual (decenas de profesionales
pre-lanzamiento, catálogo de 346 comunas como máximo teórico de filas por profesional). Si el volumen crece
lo suficiente para que el join de búsqueda deje de usar el índice de `professional_comunas_comuna_codigo_idx`
de forma eficiente, se revisa con un `EXPLAIN` real en ese momento — no hay nada que experimentar hoy contra
datos que no existen.

## Estrategia de pruebas

| Contrato o riesgo | Nivel | Caso principal | Límite o falla |
| ------------------- | ------ | ---------------- | ---------------- |
| TC-001, F-001, CL-004 | integración (`server/api/professionals/index.post.test.ts`, Vitest) | crear con 3 comunas válidas → 201, `comunas` con las 3, en orden alfabético | `comunaCodigos: []` → 400 `missing_field`; un código inactivo → 400 `invalid_comuna`, no se crea el profesional |
| TC-002, CL-001 | integración | reemplazar de 3 a 1 comuna → `comunas` refleja solo la 1; enviar un código duplicado en el array → se guarda una sola vez | `comunaCodigos: []` sobre un profesional existente → 400, el conjunto anterior sigue intacto (releer después del 400 y confirmar) |
| TC-004, CL-003, UX-005 (unidad, `server/utils/search.test.ts`) | unidad | profesional con comunas [Llanquihue, Frutillar], búsqueda exacta en Frutillar → `comunaNombre: 'Frutillar'` | profesional que matchea por dos comunas vecinas a la vez → `comunaNombre` es la alfabéticamente primera de las dos, estable entre corridas |
| CL-002 | unidad (`search.test.ts`) | profesional cuyas únicas comunas se desactivan → no aparece en ningún resultado de esa comuna, `existsActiveProfessionalForCategoria` tampoco lo cuenta | — |
| D-003 (migración) | integración, una sola vez al desplegar | correr el backfill contra una copia con profesionales existentes → cada uno termina con exactamente 1 fila en `professional_comunas`, igual a su `comuna_codigo` anterior | ningún profesional queda con 0 filas después del backfill |

### Propiedades que deben probarse

- El reemplazo de TC-002 no deja nunca un estado parcial visible: una búsqueda que corre a mitad de un
  `PATCH` en curso ve el conjunto viejo completo o el nuevo completo, nunca ninguno.
- `comunaCodigos` con duplicados produce el mismo resultado final que sin ellos, en ambos endpoints
  (TC-001 y TC-002) — la deduplicación es idempotente.

## Plan de construcción

| ID | Slice (una frase, sin "y") | Sustento | Criterio de aceptación principal | Depende de |
| ---- | ---------------------------- | ---------- | ----------------------------------- | ------------ |
| S-001 | Crear la tabla `professional_comunas` con su RLS y migrar los datos existentes | D-003, "Modelo de datos", "Impacto en RLS" | Migración corre sin error contra datos reales; cada profesional existente termina con exactamente 1 fila igual a su `comuna_codigo` anterior; `professional_comunas` cerrada a `anon`/`authenticated` (verificado con un `curl` directo a PostgREST, no solo desde la app) | — |
| S-002 | `POST /api/professionals` crea el profesional con varias comunas | TC-001, T-005 | `POST` con `comunaCodigos: ['10101','10102']` válidos → 201, `comunas` con las 2; con un código inválido → 400 y no queda profesional creado; el backfill de S-001 se vuelve a correr al desplegar (T-005), sin error, sin duplicar filas | S-001 |
| S-003 | `PATCH /api/professionals/me` reemplaza el conjunto de comunas | TC-002, CL-001, CL-004 | `PATCH` con un conjunto nuevo → refleja exactamente ese conjunto; `comunaCodigos: []` → 400, conjunto anterior intacto | S-001 |
| S-004 | `GET /api/professionals/me` y `GET /api/professionals/[id]` devuelven `comunas[]` | TC-003 | Ambos responden `comunas: [{codigo,nombre}]` en orden alfabético; correo de bienvenida y `<title>` SEO usan `Intl.ListFormat` sobre esa lista | S-001, S-002 |
| S-005 | `/api/search` resuelve la comuna que produjo cada coincidencia contra `professional_comunas`, y `findComunasFrecuentes` cuenta contra la misma relación | TC-004, T-002, CL-002, CL-003 | Búsqueda exacta y vecina devuelven `comunaNombre` correcto en casos de una y de varias comunas coincidentes (probado con `pickMatchedComuna` a nivel unidad, sin DB); profesional sin comunas activas no aparece; comunas frecuentes del hero siguen sugiriendo las comunas con más profesionales activos, ahora contando por `professional_comunas` | S-001 |
| S-006 | Eliminar `professionals.comuna_codigo` y su índice | Limpieza — ninguna fuente de verdad duplicada | `npx nuxi typecheck` y `npm run build` pasan sin ninguna referencia a `professionals.comunaCodigo`; migración de columna corre sin error | S-002, S-003, S-004, S-005 |
| S-007 | Construir `ComunasMultiSelect.vue` (el sheet) | UXF-001, V-001, UX-001, UX-002, UX-003 | Los 6 modos del mockup `selector-comunas.html` funcionan: marcar/desmarcar sin cerrar, buscar sin perder marcas, "Listo" deshabilitado en cero, error con reintentar | — |
| S-008 | Registro de profesional usa el selector múltiple | V-002, TC-001 | Formulario de registro completo con 3 comunas → `POST` con `comunaCodigos` correcto; campo vacío bloquea "Publicar mi perfil" igual que hoy | S-002, S-007 |
| S-009 | Fila "Comunas" del perfil editable usa el selector múltiple | V-003, UX-004, UX-006 | Tocar la fila abre el sheet con lo ya marcado; confirmar dispara `PATCH` y actualiza la fila; con muchas comunas, la fila trunca con elipsis | S-003, S-007 |
| S-010 | Perfil público muestra el listado completo de comunas | V-004, UX-004 | Perfil con 6 comunas muestra la lista completa sin truncar, en el subtítulo y en el `<title>` | S-004 |

`S-010` no depende de `S-007`/`S-008`/`S-009`: solo necesita el contrato de datos de `S-004`, así que puede
construirse y mergearse en paralelo al trabajo del selector — el orden de la tabla es por número, no una
secuencia estricta salvo donde "Depende de" lo dice.

## Secciones bajo demanda

### Migración y compatibilidad

**Backfill, corrido dos veces (S-001 y de nuevo en S-002 — ver [T-005](#t-005)):**

```sql
insert into professional_comunas (professional_id, comuna_codigo)
select id, comuna_codigo from professionals
on conflict do nothing;
```

`on conflict do nothing` la vuelve re-ejecutable sin duplicar filas — mismo criterio de idempotencia que ya
sigue `rls.sql` con sus `drop policy if exists`. La primera corrida (S-001) migra a todos los profesionales
que ya existían antes de esta misión. Entre que S-001 se despliega y S-002 se despliega, el código de
registro sigue siendo el viejo (escribe solo `professionals.comunaCodigo`) — cualquier profesional
registrado en esa ventana queda momentáneamente sin filas en `professional_comunas`. La segunda corrida,
al desplegar S-002, cierra ese hueco. Después de S-002, `TC-001` garantiza que todo registro nuevo crea sus
filas en la misma transacción, así que no hace falta una tercera corrida.

**Orden de despliegue, no solo de código:** `S-001` (crea la tabla y migra) tiene que estar desplegado y
con el backfill corrido **antes** de que `S-002`/`S-003`/`S-004`/`S-005` lean o escriban
`professional_comunas` — si no, esos slices leerían una tabla vacía para profesionales que ya existían.
`S-006` (borrar la columna vieja) es lo último, y solo después de confirmar que ningún código en `main`
sigue leyendo `professionals.comunaCodigo` — el propio `npx nuxi typecheck` lo confirma, porque Drizzle
tipa el schema y una referencia a una columna que ya no existe en el schema no compila.

**Sin ventana de downtime necesaria:** mientras `S-001` a `S-005` conviven (columna vieja todavía presente,
tabla nueva ya poblada y ya siendo la fuente de verdad para lectura/escritura), la columna vieja queda sin
usar por el código apenas S-002 se despliega (con la ventana entre S-001 y S-002 ya cerrada por la segunda
corrida del backfill) — no hace falta sincronizarla ni mantenerla actualizada durante el resto de la
transición.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El `PATCH` de comunas reemplaza el conjunto completo, nunca aplica un delta agregar/quitar

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Contratos:** [TC-002](#tc-002), [UXF-001](./experiencia.md#uxf-001-declarar-o-editar-las-comunas-donde-atiendo).
- **Alternativas descartadas:** un endpoint de delta (`POST .../comunas` para agregar una, `DELETE
  .../comunas/:codigo` para quitar una) — se descarta porque el sheet de `experiencia.md` no produce un
  delta: el usuario marca y desmarca libremente dentro de una misma apertura y confirma con "Listo" un
  estado final completo. Modelar el backend como delta obligaría al frontend a reconstruir qué cambió
  respecto de lo que había, trabajo que el propio flujo de UX ya resolvió mostrando el estado final.
- **Decisión y consecuencias:** `PATCH /api/professionals/me` con `comunaCodigos` presente borra todas las
  filas de `professional_comunas` del profesional e inserta el conjunto recibido, en una transacción.
  Habilita un contrato simple (un solo campo, una sola operación) que refleja exactamente la interacción
  real. Costo aceptado: un `PATCH` con un conjunto casi idéntico al anterior igual borra e inserta todo —
  aceptable porque el volumen por profesional es chico (D-002 no impone tope, pero ni Rudiberto ni Camila
  pasan de una decena).
- **Reapertura:** si el volumen real de comunas por profesional crece lo suficiente para que borrar e
  insertar todo el conjunto en cada edición sea un costo medible.

<a id="t-002"></a>

### T-002 — La comuna que produjo la coincidencia en `/api/search` se elige con una función pura, `pickMatchedComuna`, no dentro de la query SQL

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Contratos:** [TC-004](#tc-004), [UX-005](./experiencia.md#ux-005).
- **Alternativas descartadas:** un `EXISTS` simple (como el resto de los filtros de esta misión) — resuelve
  si el profesional califica, pero no dice **cuál** de sus comunas fue la que matcheó, y UX-005 exige mostrar
  esa comuna específica en la card. Resolver el desempate dentro de la query con `.selectDistinctOn([professionals.id])`
  ordenado por `comunas.nombre` — funciona, pero deja una regla de negocio (cuál comuna "gana" cuando hay
  varias candidatas) enterrada en SQL, sin poder probarla sin una base de datos real — exactamente el
  antipatrón que `discovery-engineering` nombra ("la lógica pura vive fuera de la infraestructura") y que
  el propio `search.ts` ya evita en `rankByCompleteness`, la función pura y testeable que ordena por
  completitud de perfil. Mantener las dos reglas de desempate en lugares distintos (una en SQL, otra en JS)
  sin necesidad real es la inconsistencia que esta decisión corrige.
- **Decisión y consecuencias:** `findActiveProfessionals` trae **todas** las filas que matchean (un join
  simple entre `professionals`, `professional_comunas` y `comunas`, sin `DISTINCT`) — un profesional que
  matchea por dos comunas a la vez aparece en dos filas. El resultado se agrupa por `professionals.id` en
  memoria, y una función pura nueva decide cuál mostrar:

  ```ts
  // server/utils/search.ts — sin Drizzle, sin event: se prueba con un array literal
  export function pickMatchedComuna(
    candidatas: { codigo: string, nombre: string }[],
  ): { codigo: string, nombre: string } {
    return [...candidatas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))[0]!
  }
  ```

  Reusa el mismo criterio de orden alfabético que ya fija D-001/UX-004 para toda la misión, sin inventar una
  jerarquía nueva, y queda al lado de `rankByCompleteness` con el mismo patrón: dato crudo de la query,
  regla de negocio en una función que no importa Drizzle. Costo aceptado: la query trae más filas que un
  `DISTINCT ON` (como mucho, una por cada comuna que un profesional tenga en común con la búsqueda — un
  número chico, acotado por D-002 solo por el catálogo completo de 346 comunas en el peor caso teórico), y
  hay un paso de agrupación en JS antes de pasarle el resultado a `orderResults`/`rankByCompleteness`.
- **Reapertura:** ninguna prevista.

<a id="t-003"></a>

### T-003 — El servidor deduplica y valida `comunaCodigos` antes de escribir, sin confiar en que el sheet ya lo hizo

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Contratos:** [TC-001](#tc-001), [TC-002](#tc-002), [CL-001](./producto.md#f-001).
- **Alternativas descartadas:** confiar en que la interacción del sheet (checkboxes, imposible marcar dos
  veces la misma fila) ya garantiza un array sin duplicados — se descarta por A-002: el servidor nunca
  confía en invariantes que solo la UI garantiza, porque nada impide una request armada a mano (o un bug de
  cliente) que sí traiga duplicados.
- **Decisión y consecuencias:** ambos endpoints pasan `comunaCodigos` por `new Set(...)` antes de validar
  cada código y antes de insertar. Sin este paso, un array con duplicados rompería la PK compuesta de
  `professional_comunas` con un error de constraint poco claro para quien lo depure.
- **Reapertura:** ninguna prevista.

<a id="t-004"></a>

### T-004 — `professionals.comuna_codigo` se elimina en un slice separado, al final, no en el mismo cambio que crea la tabla nueva

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Contratos:** "Modelo de datos", "Migración y compatibilidad".
- **Alternativas descartadas:** eliminar la columna vieja en el mismo slice que crea `professional_comunas`
  y migra los datos (S-001) — se descarta porque en ese momento todavía existen cuatro slices de código
  (S-002 a S-005) que no se escribieron todavía y podrían necesitar leer el valor viejo como referencia
  durante su propio desarrollo o rollback. Mantener las dos fuentes de verdad para siempre, sin plan de
  eliminarla — se descarta porque duplica el dato sin ningún consumidor real del duplicado, con el riesgo de
  que diverjan si algo llegara a escribir una sin la otra.
- **Decisión y consecuencias:** la columna vieja convive entre S-001 y S-006. `S-006` la elimina recién
  cuando `npx nuxi typecheck` confirma que ninguna referencia sobrevive. Costo aceptado: dos fuentes de
  datos técnicamente presentes durante la ventana de construcción de la misión — **con una excepción real
  entre S-001 y S-002, que T-005 resuelve explícitamente**: hasta que S-002 se despliega, el código de
  registro sigue siendo el viejo y sigue escribiendo la columna vieja para cualquier profesional nuevo.
- **Reapertura:** ninguna prevista.

<a id="t-005"></a>

### T-005 — El backfill de `professional_comunas` se corre dos veces, no una: al desplegar S-001 y de nuevo al desplegar S-002

- **Estado:** aceptada. **Fecha:** 2026-09-07.
- **Contratos:** "Migración y compatibilidad", [TC-001](#tc-001), invariante "un profesional activo válido
  tiene siempre al menos una fila en `professional_comunas`" (Modelo de datos).
- **Alternativas descartadas:** fusionar S-001 (schema + backfill) y S-002 (`POST` con `comunaCodigos`) en
  un solo slice — cierra la ventana por construcción, pero mezcla un cambio de infraestructura (tabla, RLS,
  migración de datos) con un cambio de contrato de API en el mismo PR, más grande y más difícil de revisar
  que cualquier otro slice del plan, sin necesidad real. Confiar en que S-001 y S-002 se despliegan lo
  bastante rápido como para que la ventana no importe — se descarta porque el propio flujo de `CLAUDE.md`
  exige un checkpoint de revisión humana entre cada PR, y esa revisión puede tardar horas o días; cualquier
  registro que ocurra en el medio queda con cero comunas, violando la invariante que este mismo documento
  declara.
- **Decisión y consecuencias:** el backfill de S-001 (`insert into professional_comunas select id,
  comuna_codigo from professionals on conflict do nothing`) es idempotente por diseño — se vuelve a correr,
  sin cambios, como parte del despliegue de S-002, después de mergear. La segunda corrida es una operación
  barata (un `INSERT ... ON CONFLICT DO NOTHING` sobre una tabla chica) que cierra cualquier profesional
  registrado por el código viejo durante la ventana entre ambos despliegues, sin migrar nada dos veces de
  forma incorrecta. Después de S-002, ningún código vuelve a crear un profesional sin sus filas de
  `professional_comunas` en la misma transacción (TC-001), así que no hace falta una tercera corrida.
- **Reapertura:** ninguna prevista.

## Preguntas

No queda ninguna pregunta abierta que bloquee el plan de construcción.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| ---- | --------- | -------- | --------------------------------- |
| —    | —         | —        | —                                    |
