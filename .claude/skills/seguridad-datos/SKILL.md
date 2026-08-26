---
name: seguridad-datos
description: Audita el diseño de datos de una misión (`ingenieria.md`) o un cambio real a schema/RLS/Storage contra riesgos de seguridad conocidos de Supabase — RLS habilitada pero sin policies, PostgREST alcanzable donde no debería, buckets de Storage mal configurados, funciones `SECURITY DEFINER` que saltan RLS, claves filtradas al cliente. Usar antes de aprobar `ingenieria.md` en `discovery-engineering`, o al revisar cualquier cambio a `server/db/schema/`, `server/db/sql/rls.sql`, o buckets de Storage — especialmente si el diseño le da al browser un cliente de Supabase real (para Auth o cualquier otro uso). También cuando alguien pregunte "¿esto es seguro?", "revisa la seguridad de este diseño de datos" o "¿nos pueden hackear por acá?".
---

# Seguridad de datos en Datealo

Este skill existe porque casi se nos pasa algo real: la misión 04 (registro de profesional) estuvo a punto
de aprobarse con un diseño de RLS técnicamente bien escrito pero con una premisa falsa detrás — "las
policies son respaldo, lo real es el código" — que en dos de las tres superficies que la misión tocaba era
exactamente al revés. Una auditoría con criterio crítico lo encontró antes de construir. Este skill
condensa esa auditoría en un checklist repetible, para no depender de que alguien vuelva a improvisarla
desde cero cada vez.

No reemplaza a `security-review` (ese audita un diff de código ya escrito, en cualquier lenguaje o
framework) ni a `supabase-postgres-best-practices` (esa es la referencia genérica de Postgres). Este skill
es específico: la intersección entre el modelo de auth de Supabase y el hecho de que Datealo, por A-001, le
entrega al browser un cliente de Supabase real.

## El modelo mental que hay que tener claro antes de evaluar nada

Datealo tiene **tres formas distintas** de llegar a un dato, y RLS se comporta distinto en cada una:

| Camino                                              | Conexión                                  | ¿RLS se evalúa? | Qué protege de verdad |
| ------------------------------------------------------ | ---------------------------------------------- | -------------------- | ---------------------------- |
| `server/api/*` vía Drizzle                              | rol dueño (`postgres.<ref>`, cadena de conexión normal) | **No** — el rol dueño la salta por completo | El código del endpoint (A-002). La policy es respaldo puro. |
| PostgREST directo (`/rest/v1/<tabla>`)                  | rol `anon` o `authenticated`, según haya sesión o no | **Sí**                | La policy — y **solo** la policy, si además no se revocaron los grants (A-007) |
| Supabase Storage directo (`.storage` del cliente de sesión) | rol `authenticated`, JWT del usuario           | **Sí**                | La policy — es la barrera, el código del endpoint es defensa en profundidad, no al revés |

El error que casi pasa fue tratar las tres filas como si fueran la misma. No lo son, y la pregunta correcta
nunca es "¿hay una policy?" — es **"¿qué conexión llega hasta acá, y esa conexión evalúa RLS o la salta?"**

## Por qué esto pesa más en Datealo que en un backend tradicional

A-001 dice que el browser solo habla con `/api/*`, con **una excepción nombrada**: Auth, porque la sesión
tiene que vivir en el cliente (`createBrowserClient`). Pero ese cliente de Supabase no sabe que "solo lo
usamos para Auth" — es un objeto con `.auth`, `.from()` y `.storage` completos. Cualquiera con la consola
del navegador abierta puede llamar a los tres, con la publishable key que ya está en el bundle por diseño
(A-001 lo permite a propósito). La primera vez que una misión introduce ese cliente en el browser (D-001 de
la misión 04, y cualquier auth futura), automáticamente abre una superficie de PostgREST/Storage genuina —
se quiera o no, se haya pensado en eso o no.

## Checklist — correr esto contra cada `ingenieria.md` que toque datos, antes de marcarlo `en revisión`

**Por cada tabla nueva o modificada:**

- [ ] `alter table <tabla> enable row level security` está explícito en el diseño — no asumido. Sin esto,
  las policies existen en el catálogo y no se evalúan nunca, sin ningún aviso de Postgres.
- [ ] Cada operación (`select`, `insert`, `update`, `delete`) que la tabla necesita tiene su policy, o el
  documento dice explícitamente por qué esa operación no hace falta (ej. "sin policy de `delete` porque
  nada la borra").
- [ ] Si la tabla **no** debería ser alcanzable desde PostgREST (el caso normal en Datealo — A-001, se lee
  todo vía Drizzle): `revoke all on public.<tabla> from anon, authenticated` está en el diseño (A-007). Sin
  esto, cualquier policy de esa tabla es la única puerta, no un respaldo.
- [ ] Nadie propuso `force row level security` en una tabla que Drizzle escribe — rompería su conexión de
  rol dueño (`auth.uid()` sería `NULL` ahí).
- [ ] Ninguna policy de `update` olvida el `with check` — sin él, un dueño puede mover la fila a otro
  `user_id` y quedarse con acceso indebido a lo que sea que ese id destrabe.

**Por cada bucket de Storage nuevo o modificado:**

- [ ] El bucket está marcado `public` o privado **a propósito**, no por default — un bucket público sirve
  cualquier archivo a cualquiera que tenga la URL; uno privado evalúa policy en cada descarga.
- [ ] Las policies de `insert`/`delete` (y `update` si aplica) llevan `bucket_id = '<bucket>'` explícito —
  sin eso, una policy permisiva aplica a **toda** la tabla `storage.objects`, no solo a ese bucket.
- [ ] `file_size_limit` y `allowed_mime_types` están fijados en la creación del bucket — es la única capa
  que sobrevive si alguien sube directo desde la consola, saltándose la validación del endpoint.
- [ ] Si algo llama a Storage con `upsert: true`, existe una policy de `update` — si no, va a fallar en
  silencio contra un `403` que nadie va a asociar con "faltaba una policy".

**Sobre el cliente de Supabase en el browser (si el diseño lo usa, o si ya existe de una misión anterior):**

- [ ] El documento nombra explícitamente qué tablas y qué buckets son alcanzables desde ese cliente —
  no solo los que la app usa a propósito, sino los que **existen** y podrían llamarse desde la consola.
- [ ] Para cada uno de esos, el documento dice si la policy ahí es respaldo o es la barrera real (ver la
  tabla de arriba) — nunca la frase genérica "las policies son respaldo, no el mecanismo" aplicada sin
  distinguir la conexión.
- [ ] Si esta es la primera vez que una misión da un cliente de Supabase real al browser, se nombra como
  activación de la cláusula de reapertura de A-002 (`CLAUDE.md`: nombrar la contradicción, no resolverla en
  silencio).

**Sobre claves y funciones privilegiadas:**

- [ ] La secret/service role key no aparece en ningún código de `app/`, ni en `runtimeConfig.public`, ni en
  ningún componente o composable — solo en `server/utils/` si algo realmente la necesita (raro: la mayoría
  de las operaciones de Datealo deberían poder hacerse con el cliente de sesión del usuario, no con un
  bypass total de RLS).
- [ ] Si el diseño introduce una función `SECURITY DEFINER`, su lógica interna es al menos tan estricta
  como la policy que reemplaza — una función así, callable por `anon`/`authenticated`, salta RLS por
  completo y en silencio; es la superficie que más se olvida revisar.

**Sobre la verificación de pertenencia (A-002):**

- [ ] Cada endpoint de `server/api/` que lee o escribe datos de un usuario verifica pertenencia **en el
  código**, no solo confía en que la policy existe — la policy es la red de esa vía (Drizzle la salta).

**Sobre las pruebas:**

- [ ] Al menos una prueba de RLS ejercita un **bypass real** — llamando directo al cliente de sesión
  (`$supabase.from(...)`, `$supabase.storage...`) o a PostgREST con `curl`, no solo confirmando que la app
  propia funciona. Una prueba que solo pasa por `server/api/` nunca va a notar una policy rota, porque la
  app nunca toma ese camino.
- [ ] Ninguna prueba de "lectura pública" se confunde con "el bucket es público" — en un bucket público, la
  ruta `/storage/v1/object/public/...` sirve el archivo sin evaluar RLS en absoluto; esa prueba no
  demuestra que la policy de `select` esté bien, solo que el bucket lo es.

## Cómo correrlo

Para un `ingenieria.md` completo (no un cambio chico), corre este checklist con un subagente nuevo, sin el
contexto de quien escribió el diseño — la misma razón que ya vale para "Evaluar antes de cerrar" en
`discovery-ux`: una relectura propia sigue anclada al razonamiento con el que uno se convenció a sí mismo.
Si el diseño toca algo con impacto real (auth, datos de usuario, subida de archivos), pedirle además
verificación contra la documentación oficial de Supabase, no de memoria — el modelo de RLS/PostgREST/Storage
tiene detalles que cambian entre versiones y son fáciles de asumir mal.

Para un cambio chico y acotado (una columna, una policy puntual), el checklist de arriba alcanza para
revisarlo en la misma sesión, sin subagente — la carga de un subagente nuevo se justifica por el tamaño del
diseño, no por el hecho de que toque datos.

## Relación con `discovery-engineering`

El gate de salida de `discovery-engineering` pide que "el impacto en RLS esté resuelto explícitamente".
Este skill es cómo se verifica eso en la práctica — se corre como parte de "Evaluar antes de cerrar" antes
de marcar `ingenieria.md` como `en revisión`, no como un paso aparte que alguien tiene que acordarse de
pedir.
