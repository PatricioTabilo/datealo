# Misión: múltiples categorías por profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio Tabilo el 2026-09-07

**Última actualización:** 2026-09-07

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: la categoría deja de ser una columna de `professionals` y pasa a ser una tabla de relación `professional_categorias`, con su propio precio y descripción

Hoy `professionals` tiene `categoria_slug`, `price_from` y `description` como columnas únicas. D-002 y
D-003 de `producto.md` ya decidieron que precio y descripción varían por categoría — eso descarta cualquier
diseño que mantenga esas tres columnas en `professionals` y solo agregue una tabla de vínculo N:N sin
campos propios. La tabla nueva, `professional_categorias`, lleva `professional_id`, `categoria_slug`,
`price_from` y `description` propios; las tres columnas equivalentes de `professionals` se retiran una vez
migrados los datos existentes (CL-005 de `producto.md`).

El riesgo principal no es el modelo de datos en sí —es una tabla de relación estándar— sino no dejar el
sistema inconsistente a mitad de camino mientras se migra: `professionals` ya tiene filas reales (aunque
sean de prueba, no hay usuarios de producción todavía) con esas tres columnas pobladas, y media docena de
lugares en `app/` y `server/` las leen hoy (`search.ts`, `professionals.ts`, `[id].vue`, `perfil.vue`,
`registro.vue`, `ProfessionalPublicContactBar.vue`). Por eso el Plan de construcción corta esto como
expand/contract (ver [T-001](#t-001)) en vez de un solo slice que cambie todo a la vez.

- **Contratos de producto cubiertos:** F-001, F-002, F-003.
- **Riesgo bloqueante:** ninguno.

## Arquitectura: la relación profesional-categoría es su propia tabla; el resto de las capas ya estaba separado correctamente

`server/utils/search.ts` ya separa la lógica pura (`rankByCompleteness`, `completenessScore`) de la
infraestructura (`findActiveProfessionals` con Drizzle) — el Principio central del skill
`discovery-engineering` ya se cumple ahí, y esta misión no lo toca: `rankByCompleteness` sigue recibiendo
la misma forma (`ProfessionalCompletenessInput`), solo cambia de dónde `findActiveProfessionals` saca
`priceFrom`/`description` (ahora de `professional_categorias`, vía join). No hace falta ninguna
reestructuración de capas para esta misión, solo un componente nuevo del mismo tipo que ya existen
(`server/utils/professional-categorias.ts`, junto a `professionals.ts`, `search.ts`, `reviews.ts`).

| Componente                                         | Responsabilidad                                                                 | No debe decidir                                  | Contratos                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------ |
| `server/db/schema/professional-categorias.ts`        | Define la tabla, su PK compuesta y sus índices                                      | Reglas de negocio                                  | Modelo de datos                |
| `server/utils/professional-categorias.ts`            | CRUD de la relación + invariantes (no duplicar, nunca sin categoría)                | Autenticación, forma de la respuesta HTTP          | TC-004, TC-005, TC-006, CL-002 |
| `server/api/professionals/me/categorias/*.ts`        | Autenticación (`requireUser`), validación de entrada, códigos HTTP                  | Cómo se guarda o se ordena una categoría           | TC-004, TC-005, TC-006         |
| `server/utils/professionals.ts` (existente, se achica) | Identidad del profesional (nombre, comuna, contacto, fotos) — pierde categoría/precio/descripción propios | Qué categorías tiene declaradas                    | TC-001, TC-002                 |
| `server/utils/search.ts` (existente, cambia su query) | Ranking y filtro de resultados — lee precio/descripción de la categoría que hizo match | Qué categorías existen o cómo se declaran          | TC-003                         |
| `app/pages/profesional/perfil.vue`                   | Renderiza un bloque por categoría declarada; dispara agregar/editar/quitar          | Si se puede quitar la última (lo decide el 409 del endpoint) | UXF-001               |
| `app/pages/profesionales/[id].vue`                   | Elige la categoría de contexto (query param o la primera declarada) y arma "También hace" | Qué precio/descripción tiene cada categoría (viene ya resuelto del endpoint) | UXF-002 |

## Contratos

### TC-001 — `GET /api/professionals/[id]` y `GET /api/professionals/me` devuelven todas las categorías declaradas, no una

- **Entrada:** `id` (path, uuid) para el primero; sesión del usuario para el segundo.
- **Salida:** `{ professional: { id, displayName, comunaNombre, contact, categorias: PublicCategoria[], photoUrls, avatarUrl, createdAt, ... } }`, donde
  `PublicCategoria = { slug: string, nombre: string, priceFrom: number | null, description: string | null }`.
  `GET /api/professionals/me` devuelve la misma forma más los campos privados que ya expone (`email`,
  `active`).
- **Transición (S-002 a S-008, ver [T-004](#t-004)):** mientras `perfil.vue` y `[id].vue` no migraron a
  consumir `categorias`, la respuesta expone **además** los campos legacy `categoriaNombre`/`priceFrom`/`description`
  a nivel raíz de `professional` (calculados desde `categorias[0]`, la primera declarada), para no romper
  esos dos consumidores. `categorias` reemplaza a esos campos sueltos recién cuando ambos migran (S-009).
- **Invariantes:** `categorias.length >= 1` siempre — un profesional activo nunca queda sin categoría
  (CL-002). El orden es por `createdAt` ascendente de `professional_categorias` — la primera categoría
  declarada queda primera en el array, que es lo que UX-003 usa como default sin contexto de búsqueda.
- **Errores:** 404 `not_found` si el id no existe o el profesional está inactivo (sin cambio respecto a
  hoy).
- **Contrato de producto:** [F-003](./producto.md#f-003).

### TC-002 — `POST /api/professionals` crea el profesional y su primera categoría de forma atómica

- **Entrada:** `{ displayName, categoriaSlug, comunaCodigo, contact }` — sin cambio de forma respecto al
  registro actual (misión 04); precio y descripción no se piden acá (UX-001: solo se declaran editando el
  perfil).
- **Salida:** `{ professional: Professional }` — sin cambio de forma visible mientras dure la ventana de
  transición de [T-004](#t-004): `Professional` gana `categorias: PublicCategoria[]` con una sola fila,
  y conserva `categoriaSlug`/`priceFrom`/`description` calculados desde esa fila hasta S-009.
- **Invariantes:** la fila de `professionals` y su primera fila de `professional_categorias` (con
  `priceFrom: null`, `description: null`) nacen en la misma transacción — o existe el profesional con su
  categoría, o no existe ninguna de las dos filas. Nunca un profesional sin categoría.
- **Errores:** sin cambio respecto a hoy (400 `missing_field`/`invalid_categoria`/`invalid_comuna`/`invalid_contact`).
- **Contrato de producto:** [F-001](./producto.md#f-001) (la categoría inicial es una declaración de
  categoría como cualquier otra, solo que ocurre en el registro).

**Transición (S-003 a S-007, ver [T-004](#t-004)):** `PATCH /api/professionals/me` (el endpoint que ya
existe hoy) sigue aceptando `priceFrom`/`description` sueltos durante esta ventana — internamente
actualiza la fila de `professional_categorias` de la única categoría que el profesional tiene hasta que
S-006 exista, que sigue siendo inambiguo porque todavía nadie puede declarar una segunda. Deja de
aceptarlos en S-007, cuando `perfil.vue` migra a `/me/categorias/*`.

### TC-003 — `GET /api/search` devuelve el precio y la completitud de la categoría buscada, nunca de otra

- **Entrada:** sin cambio de forma (`categoria`, `comuna` por query string).
- **Salida:** sin cambio de forma (`SearchResultProfessional[]`); `priceFrom` y la señal de completitud
  (`hasDescription`, `hasPrice` para `rankByCompleteness`) se leen de la fila de `professional_categorias`
  que matchea `categoria_slug = :categoria`, nunca de otra categoría del mismo profesional.
- **Invariantes:** un profesional con 2+ categorías nunca aparece dos veces en los resultados de una sola
  búsqueda (ya lo garantiza el filtro por una sola `categoria_slug`); el precio mostrado es siempre el de
  la categoría por la que se buscó (ejemplo verificable de F-002 en `producto.md`).
- **Errores:** sin cambio respecto a hoy.
- **Contrato de producto:** [F-002](./producto.md#f-002).

### TC-004 — `POST /api/professionals/me/categorias` agrega una categoría al perfil propio

- **Entrada:** `{ categoriaSlug: string, priceFrom?: number | null, description?: string | null }` —
  precio y descripción opcionales (D-002, D-003 de `producto.md`; F-001 regla 1).
- **Salida:** `{ categorias: PublicCategoria[] }` — la lista completa ya actualizada, mismo shape que
  TC-001, para que el cliente reemplace su estado local sin recalcular nada.
- **Invariantes:** un profesional nunca tiene dos filas con la misma `categoria_slug` (PK compuesta en
  `professional_categorias`, ver Modelo de datos).
- **Errores:** 401 sin sesión; 400 `invalid_categoria` si el slug no existe o no está activa; 400
  `invalid_price` si `priceFrom` no es un entero positivo; 400 `already_declared` si el profesional ya
  tiene esa categoría (conflicto de PK capturado explícitamente, nunca un 500).
- **Contrato de producto:** [F-001](./producto.md#f-001).

### TC-005 — `PATCH /api/professionals/me/categorias/[slug]` edita precio o descripción de una categoría propia

- **Entrada:** `{ priceFrom?: number | null, description?: string | null }`.
- **Salida:** `{ categorias: PublicCategoria[] }`, mismo shape que TC-004.
- **Invariantes:** no cambia qué categorías tiene el profesional, solo sus dos campos editables.
- **Errores:** 401 sin sesión; 404 `not_found` si el profesional no tiene declarada esa categoría; 400
  `invalid_price` igual que TC-004.
- **Contrato de producto:** [F-001](./producto.md#f-001).

### TC-006 — `DELETE /api/professionals/me/categorias/[slug]` quita una categoría propia, nunca la última

- **Entrada:** `slug` (path).
- **Salida:** `{ categorias: PublicCategoria[] }` tras la baja.
- **Invariantes:** un profesional activo nunca queda con `categorias.length === 0` (F-001 regla 3, CL-002
  de `producto.md`) — **incluso bajo dos `DELETE` concurrentes del mismo profesional** (ver
  [T-002](#t-002)): el conteo y el borrado ocurren dentro de una única transacción que toma
  `select ... for update` sobre la fila de `professionals`, así una segunda request concurrente queda
  bloqueada hasta que la primera termine (commit o rollback) y vuelve a contar sobre el estado ya
  actualizado — nunca las dos leen el mismo conteo de 2 y las dos pasan el chequeo.
- **Errores:** 401 sin sesión; 404 `not_found` si no tiene esa categoría declarada; 409 `last_category` si
  es la única que le queda — no se ejecuta la baja.
- **Contrato de producto:** [F-001](./producto.md#f-001), [CL-002](./producto.md#casos-límite-que-cruzan-funcionalidades).

## Modelo de datos

| Entidad o campo                          | Significado                                                    | Escritura                                                              | Retención o historial                    |
| ------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `professional_categorias` (tabla nueva)     | Una categoría que un profesional declaró, con su precio y descripción propios (término de producto: "categoría declarada") | `POST`/`PATCH`/`DELETE /api/professionals/me/categorias/*`, y el registro (TC-002) crea la primera | Se borra la fila al quitar la categoría — sin historial, igual que hoy no hay historial de precio/descripción |
| `professional_categorias.created_at`        | Cuándo se declaró — determina cuál es "la primera categoría" (UX-003) | Automático, `defaultNow()`, nunca se actualiza                               | Permanente mientras la fila exista           |
| `professionals.categoria_slug`, `.price_from`, `.description` (columnas existentes) | Retirados — su significado pasa íntegro a `professional_categorias` | — (columnas eliminadas en S-009, ver Plan de construcción) | Los datos existentes se migran, no se pierden (ver Migración) |

### Invariantes de datos

- Un profesional nunca tiene dos filas de `professional_categorias` con la misma `categoria_slug` — PK
  compuesta `(professional_id, categoria_slug)`, no una constraint aplicada a mano en el endpoint.
- Un profesional activo nunca tiene cero filas en `professional_categorias` — invariante de aplicación
  (TC-006), verificado dentro de una transacción con lock de fila: ver [T-002](#t-002) por qué no es un
  trigger, y cómo se cierra la condición de carrera de dos bajas concurrentes.
- `professional_categorias.professional_id` referencia `professionals.id` con `on delete cascade` — hoy
  nada borra un `professionals`, pero si alguna vez se agrega esa operación, sus categorías no quedan
  huérfanas.
- `professional_categorias.categoria_slug` referencia `categorias.slug` con `onUpdate: 'cascade'` — misma
  FK que `professionals.categoria_slug` tiene hoy; se traslada, no se descarta.
- **Índice `professional_categorias_categoria_slug_idx` sobre `categoria_slug`** — Postgres no indexa una
  FK automáticamente, y esta es la columna por la que filtra `/api/search` (TC-003), la superficie de más
  tráfico esperado. Se crea junto con la tabla en S-001, no como una acción pendiente de TR-001: TR-001
  solo verifica con `EXPLAIN` que el plan la usa, la creación del índice ya es parte del schema.
- El precio y la descripción de una categoría nunca se leen ni se muestran mezclados con los de otra — ya
  lo garantiza el modelo (cada fila es autónoma), pero es el invariante que hace cumplir F-003 regla 3.

### Impacto en RLS

`professionals` pierde tres columnas pero no cambia su ownership ni sus relaciones — las tres policies
existentes (`professionals_select_public`, `professionals_insert_own`, `professionals_update_own`) siguen
aplicando igual, sin editarlas.

`professional_categorias` es una tabla nueva con datos de usuario, así que nace con policy — mismo patrón
asimétrico que `professionals` (A-002 del skill `arquitectura`): lectura pública, escritura solo del dueño.
La diferencia es que esta tabla no tiene `user_id` propio — la pertenencia se resuelve con un `exists`
contra `professionals.user_id`, igual que cualquier tabla hija.

| Tabla                    | Cambio                                                        | Policy afectada                                                                     | Acción                                             |
| --------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `professionals`             | Se eliminan `categoria_slug`, `price_from`, `description` (S-009); `user_id` y relaciones sin cambio | `professionals_select_public`, `professionals_insert_own`, `professionals_update_own`      | Nada — ninguna policy referencia esas tres columnas    |
| `professional_categorias`   | Tabla nueva, lectura pública, escritura solo del dueño (vía join)     | `professional_categorias_select_public`, `_insert_own`, `_update_own`, `_delete_own` (nuevas) | Crear, más el `revoke` que cierra PostgREST (A-007)    |

SQL a agregar a `server/db/sql/rls.sql`, en el mismo bloque que documenta `professionals` (ver [T-003](#t-003) por qué lleva policy de `delete`, a diferencia de `professionals`):

```sql
alter table professional_categorias enable row level security;

drop policy if exists professional_categorias_select_public on professional_categorias;
create policy professional_categorias_select_public on professional_categorias
  for select to authenticated, anon using (true);

drop policy if exists professional_categorias_insert_own on professional_categorias;
create policy professional_categorias_insert_own on professional_categorias
  for insert to authenticated with check (
    exists (
      select 1 from professionals p
      where p.id = professional_categorias.professional_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists professional_categorias_update_own on professional_categorias;
create policy professional_categorias_update_own on professional_categorias
  for update to authenticated using (
    exists (
      select 1 from professionals p
      where p.id = professional_categorias.professional_id and p.user_id = (select auth.uid())
    )
  ) with check (
    exists (
      select 1 from professionals p
      where p.id = professional_categorias.professional_id and p.user_id = (select auth.uid())
    )
  );

drop policy if exists professional_categorias_delete_own on professional_categorias;
create policy professional_categorias_delete_own on professional_categorias
  for delete to authenticated using (
    exists (
      select 1 from professionals p
      where p.id = professional_categorias.professional_id and p.user_id = (select auth.uid())
    )
  );

-- Igual que professionals: cierra PostgREST por completo. Drizzle usa el rol dueño y no le afecta.
revoke all on public.professional_categorias from anon, authenticated;
```

Checklist de `seguridad-datos` corrido contra este diseño: RLS habilitado explícito, las cuatro operaciones
tienen policy o razón documentada, `revoke` presente (sin él estas policies serían la única puerta, no un
respaldo), ningún `update` sin `with check`, sin `force row level security` (rompería la conexión de rol
dueño de Drizzle, mismo motivo que `professionals`). La autorización real —A-002— vive en
`server/api/professionals/me/categorias/*.ts`: cada endpoint resuelve primero el `professionals.id` del
`user.id` autenticado (`requireUser(event)`) y opera sobre esa fila, nunca confía en el `professionalId`
que mandara el cliente.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                                                 | Qué invalida                          | Experimento o mitigación                                                                                  | Criterio de salida                                          | Estado  |
| ------ | -------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| TR-001 | ¿La query de `/api/search` con el join nuevo contra `professional_categorias` usa el índice `professional_categorias_categoria_slug_idx` (creado en S-001), o cae a un seq scan? | Rendimiento de la superficie de más tráfico del producto | Correr `EXPLAIN` sobre la query de S-004 antes de mergear ese slice | El plan usa el índice para filtrar por `categoria_slug`, no un seq scan | abierto |

## Estrategia de pruebas

| Contrato o riesgo     | Nivel                 | Caso principal                                                                 | Límite o falla                                                        |
| ------------------------ | ------------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| TC-004                   | contrato (`server/api`)  | Feña agrega Gasfitería con precio $18.000 → 201, `categorias` incluye ambas          | Agregar una categoría que ya tiene → 400 `already_declared`, no duplica     |
| TC-006, CL-002           | contrato                 | Quitar Electricidad con 2 categorías declaradas → 200, queda solo Gasfitería         | Quitar la única categoría que le queda → 409 `last_category`, no se borra   |
| TC-006, T-002 (concurrencia) | contrato, concurrente | Dos `DELETE` simultáneos sobre las 2 categorías de un mismo profesional → uno termina en 200, el otro en 409 (nunca los dos en 200) | — |
| TC-003, F-002            | integración              | Buscar "Gasfitería" en Ñuñoa muestra el precio de Gasfitería, no el de Electricidad  | Profesional con la categoría pero sin esa comuna → no aparece (sin cambio)  |
| TC-002                   | contrato                 | Registro nuevo crea `professionals` + 1 fila de `professional_categorias`            | Falla el insert de la categoría → no queda un `professionals` sin categoría (transacción) |
| CL-005 (migración)       | integración, una vez     | Un profesional preexistente con `categoria_slug`/`price_from`/`description` conserva exactamente esos valores en su fila migrada | —                                                                            |
| RLS de `professional_categorias` | bypass real (ver `seguridad-datos`) | Insertar una fila directo con el cliente de sesión (`$supabase.from('professional_categorias')`) queda bloqueado por el `revoke` | Un `select`/`insert` directo por PostgREST no devuelve ni escribe nada |

### Propiedades que deben probarse

- Agregar una categoría es idempotente en el sentido correcto: agregar dos veces la misma nunca produce
  dos filas — la segunda falla explícitamente (400), no se ignora en silencio ni sobrescribe la primera.
- Ninguna secuencia de agregar/quitar categorías deja a un profesional activo con `categorias.length === 0`,
  probado tanto con 1 como con 2+ categorías de partida, **y también bajo dos bajas concurrentes** sobre
  el mismo profesional (el lock de fila de TC-006/T-002 es lo que hace esto verificable, no solo deseable).
- El precio/descripción que devuelve `/api/search` para una categoría nunca cambia si se edita la
  descripción de otra categoría del mismo profesional (aislamiento entre filas).

## Migración y compatibilidad

Datos existentes: cada fila actual de `professionals` tiene `categoria_slug`, `price_from` y `description`
poblados (o `null` en los dos últimos, que ya son opcionales hoy). CL-005 de `producto.md` exige que esos
valores se conserven como la primera categoría declarada, sin pedirle a nadie que los vuelva a ingresar.

**Expand/contract en dos fases, no un solo paso** (ver [T-001](#t-001)):

1. **Expand (S-001):** se crea `professional_categorias` y se migran los datos con un `insert ... select`
   en la misma migración generada por `drizzle-kit generate` (a mano, agregado al archivo `.sql` que
   Drizzle genera — el backfill de datos no es algo que Drizzle infiera del diff de schema):

   ```sql
   insert into professional_categorias (professional_id, categoria_slug, price_from, description, created_at)
   select id, categoria_slug, price_from, description, created_at
   from professionals;
   ```

   Usar `professionals.created_at` como `created_at` de la fila migrada —no `now()`— es lo que preserva el
   orden real de "categoría declarada primero" (TC-001) para profesionales que ya existían antes de esta
   misión: su única categoría de hoy sigue siendo la primera después de migrar. Las columnas legacy de
   `professionals` siguen existiendo en este paso — nada las borra todavía.

2. **Contract (S-009):** una vez que `perfil.vue` (S-007) y `[id].vue` (S-008) migraron a `categorias` y
   a `/me/categorias/*`, y ya no queda ningún consumidor de los campos legacy (ver [T-004](#t-004) sobre
   la compatibilidad temporal que hace posible este orden), se elimina `categoria_slug`, `price_from`,
   `description` y su índice (`professionals_categoria_slug_idx`) de `professionals` en una migración
   aparte, y `PATCH /me`/`GET .../[id]`/`GET .../me` dejan de exponer o aceptar esos campos.

Sin rollback físico distinto del que ya da `drizzle-kit` (revertir la migración reconstruye las columnas,
pero no repuebla sus valores desde `professional_categorias` automáticamente) — aceptable porque no hay
tráfico de producción real todavía que dependa de una reversión sin pérdida de datos.

## Plan de construcción

Corte vertical, no por capa (ver [T-001](#t-001)/[T-004](#t-004)): cada slice deja la app funcionando de
punta a punta si se mergea solo. Ningún slice cambia la forma externa de un endpoint sin que, en el mismo
slice o ya de antemano, exista compatibilidad para quien todavía lo consume con la forma vieja.

| ID    | Slice (una frase, sin "y")                                                                  | Sustento                | Criterio de aceptación principal                                                                                 | Depende de |
| ----- | -------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- |
| S-001 | Crear `professional_categorias` (con su índice) con su RLS y migrar los datos existentes desde `professionals` | D-002, D-003, CL-005, T-001 | La tabla existe con RLS habilitado, sus 4 policies y `professional_categorias_categoria_slug_idx`; cada profesional activo tiene exactamente 1 fila migrada con sus valores actuales de categoría/precio/descripción; ningún endpoint cambia de comportamiento todavía | —          |
| S-002 | `GET /api/professionals/[id]` y `GET /api/professionals/me` agregan `categorias`, sin quitar los campos legacy | TC-001, T-004            | Perfil público y editor de perfil siguen mostrando exactamente lo mismo que hoy (leen los campos legacy, ahora calculados desde `professional_categorias`); `categorias` ya está disponible en la respuesta aunque nada lo consuma todavía | S-001      |
| S-003 | Registro y `PATCH /me` dejan de escribir directo en `professionals.categoria_slug`/`price_from`/`description`, y pasan a escribir la fila de `professional_categorias` por debajo | TC-002, T-004             | Un registro nuevo crea `professionals` + su primera `professional_categorias` en una transacción; `PATCH /me` con `priceFrom`/`description` sigue funcionando igual que hoy para quien todavía tiene una sola categoría | S-002      |
| S-004 | `/api/search` lee precio y completitud de la categoría buscada desde `professional_categorias`      | TC-003, F-002              | Buscar una categoría de un profesional con 2+ categorías muestra el precio de esa categoría, nunca el de otra            | S-001      |
| S-005 | `POST /api/professionals/me/categorias` — agregar una categoría al perfil propio                    | TC-004, F-001              | Ejemplo verificable de F-001: Feña agrega Gasfitería con precio $18.000; endpoint nuevo, no lo consume ninguna UI todavía | S-002, S-003 |
| S-006 | `PATCH`/`DELETE /api/professionals/me/categorias/[slug]` — editar y quitar una categoría propia, con lock de fila | TC-005, TC-006, CL-002, T-002 | CL-002 bajo concurrencia: dos `DELETE` simultáneos sobre la última categoría — solo uno la borra, el otro recibe 409; editar una categoría no toca las demás | S-005      |
| S-007 | `perfil.vue` pasa de un formulario de una categoría (vía `PATCH /me`) a bloques por categoría (vía `/me/categorias/*`) | UXF-001                  | El flujo completo mockeado en `experiencia.md` (lista, agregando, confirmando quitar) funciona en la app; `perfil.vue` deja de mandar `priceFrom`/`description` a `PATCH /me` | S-006      |
| S-008 | `[id].vue` migra de los campos legacy a `categorias`: categoría de contexto completa, el resto bajo "También hace" | UXF-002, UX-004, UX-005  | Flujo UXF-002 completo: categoría de contexto con detalle, secundarias sin precio si falta (UX-005), filas no interactivas | S-002      |
| S-009 | Contract: eliminar los campos legacy de las respuestas, `PATCH /me` deja de aceptar `priceFrom`/`description`, y se borran `categoria_slug`/`price_from`/`description` y su índice de `professionals` | T-001 (fase contract), T-004 | `npx nuxi typecheck` y `npm run build` pasan sin ninguna referencia a las columnas ni campos viejos; nada en `app/`/`server/` los usa | S-007, S-008 |

S-004 depende solo de S-001 (no de S-002/S-003) porque la query de búsqueda no expone ninguno de los campos
legacy — puede leer de `professional_categorias` sin esperar a que los otros consumidores migren. S-005 y
S-006 son endpoints nuevos y aditivos: no rompen nada aunque ninguna UI los use aún, así que no necesitan
esperar a S-007/S-008 para mergearse.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — La migración de categoría/precio/descripción se corta en expand/contract, nunca en un solo slice

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Contratos:** TC-001, TC-002, TC-003, CL-005.
- **Alternativas descartadas:** un solo slice gigante que crea la tabla, migra los datos, actualiza los
  tres endpoints, borra las columnas viejas y actualiza las dos vistas a la vez — descartada porque
  produce un PR imposible de revisar (CLAUDE.md: "un PR chico y revisable") y porque si algo falla a mitad
  de camino no hay forma de mergear una parte y dejar el resto para después sin romper la app. Una primera
  versión de este documento cortó expand/contract **por capa** (todos los endpoints de lectura primero,
  luego escritura, luego borrar columnas) — descartada tras la auditoría en contexto separado del gate:
  ese corte cambiaba la forma de `GET`/`PATCH` antes de que `perfil.vue`/`[id].vue` supieran leerla,
  dejando la app rota entre slices — exactamente lo que esta decisión dice que hay que evitar. Se
  reemplaza por el corte vertical con compatibilidad temporal de [T-004](#t-004).
- **Decisión y consecuencias:** expand (S-001: tabla + backfill, sin tocar consumidores) → cada slice
  siguiente es vertical y mergeable solo, con compatibilidad temporal en las respuestas mientras dure la
  migración (T-004) → contract (S-009: borrar columnas y campos legacy, ya sin consumidores). Costo
  aceptado: durante la ventana de transición existen dos formas de la misma información (campos legacy +
  `categorias`) — deliberado, no un descuido; S-009 es obligatorio y entra al plan desde el principio, no
  "después si hay tiempo".
- **Reapertura:** ninguna prevista — el patrón es estándar para este tipo de cambio (ver
  `references/slicing.md` de `discovery-engineering`).

<a id="t-002"></a>

### T-002 — "Nunca sin categoría" se verifica en el endpoint con un lock de fila, no con un trigger de Postgres

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Contratos:** TC-006, CL-002.
- **Alternativas descartadas:** (a) un trigger `before delete` en `professional_categorias` que cuente las
  filas del mismo `professional_id` y aborte si quedaría en cero — técnicamente más robusto contra
  cualquier vía de escritura, pero la única vía de escritura real es `server/api/` (Drizzle, rol dueño;
  PostgREST está cerrado por el `revoke`), así que el trigger protegería contra un camino que no existe;
  es la misma sobre-construcción que el skill `discovery-engineering` pide evitar para lógica que no
  cambia de forma. (b) Contar y borrar como dos pasos sueltos sin transacción ni lock — descartada tras la
  auditoría del gate: dos `DELETE` concurrentes del mismo profesional (ej. doble tap en una conexión
  lenta, el perfil de usuario que describe `CLAUDE.md`) pueden ambos leer el mismo conteo de 2 antes de
  que el otro confirme su borrado, y los dos pasan el chequeo — el invariante "nunca cero categorías" se
  rompe en el único camino de escritura real, no en uno hipotético. Esto es justo la asimetría que la
  auditoría señaló contra TC-002 (que sí es transaccional) y TC-004 (que sí se apoya en una constraint real
  de la base).
- **Decisión y consecuencias:** el conteo y el borrado ocurren dentro de una transacción de Drizzle que
  toma `select ... for update` sobre la fila de `professionals` del dueño antes de contar — el lock hace
  que una segunda request concurrente espere hasta que la primera termine, y vuelva a contar sobre el
  estado ya actualizado. La lógica vive en una función de `server/utils/professional-categorias.ts`
  (coherente con la tabla de "Arquitectura"), invocada por el endpoint — no inline en el handler de Nitro,
  así se puede probar con una conexión de test sin pasar por HTTP. Consecuencia aceptada: si algún día se
  abre una vía de escritura fuera de `server/api/` (job externo, admin panel directo a la base), esta
  protección no aplica ahí — mismo trade-off que ya acepta A-002 para el resto de las reglas de negocio de
  Datealo.
- **Reapertura:** si se agrega una vía de escritura a `professional_categorias` fuera de `server/api/`.

<a id="t-003"></a>

### T-003 — `professional_categorias` sí lleva policy de `delete`, a diferencia de `professionals`

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Contratos:** TC-006, Impacto en RLS.
- **Alternativas descartadas:** omitir la policy de `delete` como hace `professionals` (que confía en el
  default-deny de Postgres porque nada la borra) — descartada porque acá sí existe una operación real de
  borrado (TC-006, quitar una categoría), a diferencia de `professionals`, que ninguna operación de
  ninguna misión borra hoy.
- **Decisión y consecuencias:** `professional_categorias_delete_own` sigue el mismo patrón `exists (...)`
  que `_update_own`. Es respaldo, no el mecanismo real — igual que el resto de las policies de esta tabla
  — porque el `revoke` cierra PostgREST por completo y la verificación real ocurre en TC-006.
- **Reapertura:** ninguna prevista.

<a id="t-004"></a>

### T-004 — Los endpoints existentes exponen y aceptan la forma legacy en paralelo a `categorias`, hasta que ambos consumidores migran

- **Estado:** aceptada. **Fecha:** 2026-09-06.
- **Contratos:** TC-001, TC-002, S-002, S-003, S-009.
- **Alternativas descartadas:** cortar el Plan de construcción por capa (todos los `GET` primero, después
  los `POST`/`PATCH`/`DELETE`, después la UI) — es la versión que auditó el gate y no sobrevivió: `TC-001`
  cambiaba la forma de `GET .../[id]` y `.../me` en S-002 reemplazando los campos sueltos, pero
  `perfil.vue` y `[id].vue` (que los leen como campos planos) no se actualizaban hasta S-008/S-009, varios
  slices después — cualquiera de esos slices intermedios mergeado solo deja el perfil público y el editor
  de perfil rotos en producción. Es la misma inconsistencia que [T-001](#t-001) dice que el expand/contract
  existe para evitar.
- **Decisión y consecuencias:** durante la ventana S-002 a S-008, `GET /api/professionals/[id]` y
  `GET /api/professionals/me` devuelven **tanto** los campos legacy (`categoriaNombre`/`priceFrom`/`description`,
  calculados desde `categorias[0]`) **como** el array `categorias` nuevo; `PATCH /api/professionals/me`
  sigue aceptando `priceFrom`/`description` sueltos (que hasta S-006 son inambiguos: todo profesional
  tiene una sola categoría) y los escribe en la fila de `professional_categorias` correspondiente. Ningún
  slice de esta ventana rompe a `perfil.vue` ni a `[id].vue`, que sigue leyendo/escribiendo exactamente
  como hoy sin saber que el storage cambió por debajo. Consecuencia aceptada: el código de los tres
  endpoints existentes lleva temporalmente ambas formas (más ramas, más superficie) hasta que S-009 las
  retira — costo aceptado a cambio de que cada slice intermedio sea mergeable solo.
- **Reapertura:** ninguna prevista — S-009 cierra la ventana en el mismo Plan de construcción, no queda
  como trabajo futuro sin fecha.

## Preguntas

Ninguna pregunta bloquea el gate.

| ID     | La duda | Estado | Respuesta, o quién la resuelve |
| ------ | ------- | ------ | ------------------------------- |
| —      | —       | —      | —                                |
