# Misión 04: registro y perfil de profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-08-24

**Última actualización:** 2026-08-24

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: una tabla nueva (`professionals`), auth vía enlace mágico con callback propio, y fotos
subidas por el servidor, no directo a Storage

Esta es la primera misión que agrega un dominio de negocio real al repo — hasta hoy solo existían catálogos
de referencia (`categorias`, `comunas`, misión 03) y la plomería de auth/correo (misión 02), sin tablas ni
endpoints de usuario. Todo lo que sigue se audita contra eso: nada existe todavía.

La arquitectura tiene tres piezas nuevas: la tabla `professionals` con sus dos ejes de RLS (lectura
pública, escritura del dueño — A-002); un endpoint propio (`GET /auth/confirm`, fuera de `/api/`) que
completa el enlace mágico de D-001 y redirige a la pantalla de crear el perfil o a la de editarlo, según si
ya existe una fila — el endpoint solo enruta, crear y editar son acciones de TC-001 y TC-003, que ocurren
después; y un
camino de subida de fotos que comprime en el cliente y sube a Supabase Storage a través del servidor, sin
abrir una segunda excepción a A-001 (ver T-002).

- **Contratos de producto cubiertos:** F-001, F-002, F-003, D-001, D-002, D-004, D-005.
- **Riesgo bloqueante:** ninguno — ver TR-001 a TR-003 para los riesgos no bloqueantes (configuración del
  template de correo, tamaño de fotos desde el celular, comportamiento de `verifyOtp` con un enlace
  reusado).

## Vocabulario: producto ↔ código

| Término de producto                        | Entidad/campo en código                                  |
| ------------------------------------------- | ---------------------------------------------------------- |
| profesional                                 | `professionals` (tabla nueva)                              |
| perfil activo / publicado                   | `professionals.active = true`                              |
| categoría                                   | `professionals.categoriaSlug` → FK a `categorias.slug` (misión 03) |
| comuna                                      | `professionals.comunaCodigo` → FK a `comunas.codigo` (misión 03) |
| contacto (WhatsApp o teléfono)              | `professionals.contact`                                    |
| precio "desde $X"                           | `professionals.priceFrom` (entero, nullable — D-004: nunca procesado, solo mostrado) |
| descripción                                 | `professionals.description` (nullable)                     |
| fotos de trabajos                           | `professionals.photoPaths` (`text[]`, paths dentro del bucket — la URL pública se calcula al responder, nunca se guarda) |
| verificado                                  | fuera de alcance de esta misión — no hay columna todavía (D-002: nace activo sin revisión) |

`professionals` va en inglés (no `profesionales`) porque así lo anticipa la receta "Agregar una tabla" del
skill `arquitectura`, escrita para esta misión antes de que existiera — seguirla evita dos convenciones para
la misma tabla. `categorias`/`comunas` quedan en español porque ya existían así (misión 03); no se
renombran acá.

## Arquitectura: capas en línea recta, con un segundo punto de entrada fuera de `/api/`

```
Browser (signInWithOtp, cliente) ──> Supabase Auth ──(SMTP custom, misión 02)──> correo del profesional
                                                                                          │
                                                                                    toca el enlace
                                                                                          ▼
GET /auth/confirm (server/routes) ──verifyOtp──> sesión en cookie ──redirige──> V-002 o V-003

V-002/V-003 (Vue) ──> server/api/professionals/* ──> server/utils/professionals.ts ──Drizzle──> professionals
                  └─> server/api/professionals/me/photos ──> Supabase Storage (sesión del usuario)
```

`GET /auth/confirm` es la única ruta de esta misión que vive en `server/routes/` y no en `server/api/`: no
es una llamada programática del cliente Vue, es el destino del enlace que el correo de Supabase Auth arma —
nada en el código construye esa URL, así que no lleva el prefijo `/api` que el resto del contrato usa.

| Componente                                       | Responsabilidad                                                    | No debe decidir                        | Contratos            |
| ------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------ | --------------------- |
| `server/db/schema/professionals.ts`               | Forma de la tabla                                                     | Qué filas existen                          | F-001, F-002          |
| `server/utils/professionals.ts`                   | Queries y las únicas reglas de negocio reales (idempotencia de CL-003, forma pública) | Presentación, HTTP                        | TC-001 a TC-005        |
| `server/routes/auth/confirm.get.ts`                | Verificar el `token_hash`, fijar la sesión, decidir a dónde redirige  | Crear ni editar el perfil                  | TC-006, D-001         |
| `server/api/professionals/*`                      | I/O: valida entrada, llama a `server/utils/professionals.ts`, arma la respuesta pública | Reglas de negocio (eso ya lo hizo utils)  | TC-001 a TC-005        |
| `server/api/professionals/me/photos.{post,delete}.ts` | Sube/borra en Supabase Storage con la sesión del usuario, actualiza `photoPaths` y calcula `photoUrls` para la respuesta | Comprimir la imagen (eso lo hizo el cliente) | TC-004, TC-005       |
| `app/pages/profesional/{ingresar,registro,perfil}.vue` | Las tres vistas de `experiencia.md` (V-001 a V-003)              | Verificación de sesión (la hace el middleware) | UXF-001 a UXF-003  |
| `app/middleware/profesional.ts`                   | Redirige según sesión + existencia de perfil, antes de montar la página | Nada del contenido de la página            | T-005                 |
| `app/components/landing/LandingForProfessionals.vue` (existente) | El CTA navega a V-001 en vez de capturar waitlist          | Cualquier otra cosa del componente          | D-005                 |

## Contratos

### TC-001 — `POST /api/professionals` — crear el perfil (F-001)

- **Entrada:** sesión válida (cookie). Body: `{ displayName: string, categoriaSlug: string, comunaCodigo: string, contact: string }`. El email nunca viaja en el body — sale de la sesión (CL-003: nunca puede ser la cuenta de otra persona).
- **Salida:** `201 { professional: Professional }` si se crea; `200 { professional: Professional }` si el usuario ya tenía un perfil (CL-003 — nunca duplica, nunca es un error). `Professional = { id, displayName, categoriaSlug, comunaCodigo, contact, description: string | null, priceFrom: number | null, photoUrls: string[], active: boolean }` — `photoUrls` son URLs públicas completas, calculadas a partir de `photoPaths` (la columna real) al armar la respuesta; nunca se guarda una URL completa en la base (ver Modelo de datos).
- **Invariantes:** el insert usa `on conflict (user_id) do nothing returning *`; si no devuelve fila (ya existía), un `select` por `user_id` trae la existente — atómico ante un doble submit casi simultáneo (CL-003), no un "buscar primero, insertar después" con ventana de carrera. `active` nace en `true` (D-002), sin paso intermedio. Al crear, dispara el correo de [F-003](./producto.md#f-003) llamando a `sendEmail()` (misión 02) a través
del mecanismo de tarea diferida que Nitro expone para el preset `vercel` (`event.waitUntil()` o el
equivalente de `@vercel/functions` — el nombre exacto se confirma contra la documentación de Nitro al
implementar S-003, no se asume de memoria), envuelto en un `try/catch` que descarta el error. No es un
`await` bloqueante (el redirect a V-003 no espera el correo, per `experiencia.md`: "se dispara en paralelo,
no bloquea la navegación") ni una promesa suelta sin ningún mecanismo (una función serverless de Vercel
puede cortar la ejecución apenas responde, A-003, antes de que esa promesa suelta termine). Una falla de
Resend nunca cambia el código de esta respuesta, solo se registra.
- **Errores:** `401` sin sesión. `400 { error: 'invalid_categoria' }` o `{ error: 'invalid_comuna' }` si el slug/código no existe en el catálogo activo. `400 { error: 'invalid_contact' }` si no matchea `/^\+56\d{9}$/` después de sacar espacios. `400 { error: 'missing_field', field }` si falta alguno de los cuatro. Las tres primeras reglas viven en `validateProfessionalFields()` (`server/utils/professionals.ts`), la misma función que reusa TC-003 — el requisito de "los cuatro presentes" es lo único que TC-001 agrega encima, porque es la única regla que no aplica a una edición.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-002](./producto.md#d-002).

### TC-002 — `GET /api/professionals/me` — leer el propio perfil (para V-003)

- **Entrada:** sesión válida.
- **Salida:** `200 { professional: Professional }` (misma forma que TC-001). `404 { error: 'not_found' }` si el usuario está autenticado pero nunca completó F-001 — no debería ocurrir en el flujo normal (TC-006 no deja llegar a V-003 sin perfil), pero el endpoint no confía en eso.
- **Invariantes:** el `select` es siempre por `user_id = sesión.id` — no hay parámetro `id` en la URL, así que no hay un id ajeno que comparar (a diferencia del patrón genérico de la receta del skill `arquitectura`, acá "propio" es la única pregunta que el endpoint puede hacer).
- **Errores:** `401` sin sesión.
- **Contrato de producto:** [F-002](./producto.md#f-002).

### TC-003 — `PATCH /api/professionals/me` — editar campos de texto (F-002)

- **Entrada:** sesión válida. Body: subconjunto parcial de `{ displayName, categoriaSlug, comunaCodigo, contact, description, priceFrom }` — el cliente manda uno o varios campos, nunca fotos (esas van por TC-004/TC-005).
- **Salida:** `200 { professional: Professional }` con el estado ya actualizado.
- **Invariantes:** cada campo presente se valida con la misma función que usa TC-001 (`validateProfessionalFields()` en `server/utils/professionals.ts` — categoría/comuna contra el catálogo, contacto contra el regex), no una copia de la regla escrita de nuevo acá. `priceFrom` ausente o `null` son lo mismo: "sin precio" (D-004, siempre opcional). `updatedAt` se fija en el handler al valor de `now()`, no hay trigger de base de datos para esto.
- **Errores:** `401` sin sesión. `404` si no existe perfil todavía. `400` con el mismo shape de error que TC-001 por el primer campo inválido que encuentra.
- **Contrato de producto:** [F-002](./producto.md#f-002), [D-004](./producto.md#d-004).

### TC-004 — `POST /api/professionals/me/photos` — subir una foto

- **Entrada:** sesión válida. `multipart/form-data` con un solo archivo (`image/jpeg`, `image/png` o `image/webp`), ya comprimido en el cliente (ver T-002) — máximo 4MB en el servidor, por debajo del límite de body de las funciones de Vercel (y también limitado en el propio bucket — ver Impacto en RLS — como defensa que no depende de que este endpoint sea el único camino).
- **Salida:** `201 { path: string, photoUrls: string[] }` — `path` es el nuevo path dentro del bucket (`{userId}/{uuid}.{ext}`, lo que el cliente manda de vuelta si más tarde borra esta foto — ver TC-005), `photoUrls` es la lista completa de URLs públicas ya recalculada.
- **Invariantes:** el archivo se sube a `professional-photos/{userId}/{uuid}.{ext}` — nunca a la carpeta de otro usuario, verificado en código antes de llamar a Storage, y respaldado de verdad por la policy `professional_photos_insert_own` (para esta ruta la policy es la barrera, no un respaldo — ver Impacto en RLS). `professionals.photoPaths` se actualiza con `array_append` en la misma operación de base de datos que registra el path, junto con `updatedAt` — no hay lectura-modificación-escritura de dos pasos. La fila nunca guarda una URL completa, solo el path (ver Modelo de datos).
- **Errores:** `401` sin sesión. `400 { error: 'invalid_file_type' }` o `{ error: 'file_too_large' }`. `400 { error: 'too_many_photos' }` si `photoPaths` ya tiene 12 elementos — un tope técnico de abuso, no un límite de producto (`producto.md`/`experiencia.md` no fijan ninguno; 12 es varias veces el "3 fotos" que los mockups muestran como caso típico, así que nunca debería sentirse como una restricción real). `404` si no existe perfil todavía (no se puede subir una foto de un perfil que no existe).
- **Contrato de producto:** [F-002](./producto.md#f-002), [CL-001](./producto.md#cl-001).

### TC-005 — `DELETE /api/professionals/me/photos` — borrar una foto

- **Entrada:** sesión válida. Body: `{ path: string }` — el mismo valor que devolvió TC-004, no una URL.
- **Salida:** `200 { photoUrls: string[] }` con la lista sin esa foto.
- **Invariantes:** se verifica en código que `path` empieza exactamente con `{userId}/` — una comparación de string exacta contra un valor con forma conocida, no el parseo de una URL arbitraria que manda el cliente. Respaldado de verdad por `professional_photos_delete_own` (misma nota que TC-004: acá la policy es la barrera). El `array_remove` sobre `photoPaths` y el `updatedAt` se actualizan en la misma operación.
- **Errores:** `401` sin sesión. `403 { error: 'forbidden' }` si `path` no empieza con la carpeta del usuario. `404` si `path` no está en `photoPaths` actual.
- **Contrato de producto:** [F-002](./producto.md#f-002).

### TC-006 — `GET /auth/confirm` — completar el enlace mágico (D-001)

- **Entrada:** query `{ token_hash: string, type: 'email' }` — los nombres exactos que arma el template de correo de Supabase Auth (ver TR-001).
- **Salida:** no es JSON, es un `302`. Si `verifyOtp` tiene éxito: a `/profesional/perfil` si `findProfessionalByUserId` encuentra una fila, a `/profesional/registro` si no. Si falla (expirado o ya usado): a `/profesional/ingresar?error=enlace_invalido`.
- **Invariantes:** la sesión queda en cookies antes de redirigir — el mismo `createServerClient` que usa `requireUser()`, con su `setAll` escribiendo en la respuesta del redirect. El `token_hash` nunca aparece en la URL de destino.
- **Errores:** ninguno propagado al cliente como JSON — todo error de `verifyOtp` termina en la redirección de "enlace inválido" descrita arriba, que es el modo que `experiencia.md` ya define para esto.
- **Contrato de producto:** [D-001](./producto.md#d-001).

**Enviar el enlace no tiene contrato propio.** Es `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/confirm` } })` desde el cliente, con el cliente de sesión (`createBrowserClient`, A-001) — la excepción de Auth de A-001 permite este único caso de "el browser habla directo con Supabase", y no hay ninguna regla de negocio de por medio que justifique pasarlo por `/api/`.

## Modelo de datos

| Entidad o campo             | Significado                                              | Escritura                              | Retención o historial |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| `professionals.id`           | Identificador propio del perfil, distinto del id de auth (para no exponer el id de `auth.users` en una URL pública futura, misión 05) | TC-001, una sola vez                     | Permanente             |
| `professionals.userId`       | Dueño — un usuario tiene como máximo un perfil (`unique`)  | TC-001, nunca cambia después              | Permanente             |
| `professionals.displayName`  | Nombre que ve el buscador                                  | TC-001, TC-003                             | Solo el valor actual — sin historial (D-xxx de `producto.md`: "No incluye un historial visible de valores anteriores") |
| `professionals.categoriaSlug`| Oficio, FK a `categorias.slug`                              | TC-001, TC-003                             | Solo el valor actual    |
| `professionals.comunaCodigo` | Comuna, FK a `comunas.codigo`                                | TC-001, TC-003                             | Solo el valor actual    |
| `professionals.contact`      | WhatsApp o teléfono, normalizado sin espacios                | TC-001, TC-003                             | Solo el valor actual    |
| `professionals.description`  | Texto libre corto, nullable                                  | TC-003                                     | Solo el valor actual    |
| `professionals.priceFrom`    | Entero en pesos chilenos, nullable — nunca procesado (D-004) | TC-003                                     | Solo el valor actual    |
| `professionals.photoPaths`   | Paths dentro del bucket `professional-photos` (`{userId}/{uuid}.ext`), `text[]`, default `{}` — nunca una URL completa (la URL pública se calcula al responder, TC-001/002/003) | TC-004 (agrega), TC-005 (quita)            | Solo las vigentes — borrar de Storage al borrar del array |
| `professionals.active`       | Si aparece en el buscador                                    | `true` fijo al crear (D-002); sin endpoint para cambiarlo en esta misión | — |
| `professionals.createdAt` / `updatedAt` | Auditoría interna, no expuesta al cliente — `updatedAt` refleja el último cambio real a la fila, cualquiera sea | TC-001 / TC-001, TC-003, TC-004, TC-005 | Permanente              |

### Invariantes de datos

- `professionals.userId` es único — es lo que hace atómica la idempotencia de CL-003 (ver TC-001).
- `professionals.categoriaSlug`/`comunaCodigo` son FK reales a `categorias`/`comunas` — un valor inválido
  falla en la base, no solo en la validación de la app. Referencian una fila aunque esté `activa = false`
  (mismo criterio que misión 03 ya documentó: una categoría o comuna desactivada sigue siendo válida para
  quien ya la tenía). Postgres no indexa una FK automáticamente (solo primary key/unique lo hacen), así que
  S-001 crea `professionals_categoria_slug_idx`/`professionals_comuna_codigo_idx` explícitos — son las dos
  columnas por las que la búsqueda de las misiones 05/06 va a filtrar y hacer join; sin índice, esa query
  hace table scan desde el día uno.
- Ninguna operación de esta misión borra un `professionals` row — solo `active` podría, en una misión
  futura, y hoy ni siquiera hay un camino para ponerlo en `false`.
- El único dato con forma de archivo (`photoPaths`) vive fuera de Postgres (Supabase Storage); la fila solo
  guarda el path, nunca una URL completa — Storage es la única fuente de verdad del contenido del archivo,
  y guardar el path en vez de la URL evita tener que parsear una URL arbitraria para verificar dueño en
  TC-005.
- `photoPaths` tiene un tope de 12 elementos, exigido por TC-004 — guardarraíl técnico contra abuso (un
  loop de subidas sin límite de cantidad), no una restricción de producto; ni `producto.md` ni
  `experiencia.md` fijan un máximo.

**Migración:** no aplica — `professionals` es una tabla nueva, sin dato previo en el repo ni consumidor
existente que adaptar (mismo caso que misión 03).

### Impacto en RLS

**Esta misión toca dos regímenes de RLS distintos, no uno — confundirlos es el riesgo más caro de todo el
documento.** `professionals` se lee/escribe siempre vía Drizzle (`server/utils/professionals.ts`), con la
conexión de la app: por A-002, esa conexión entra como rol dueño y **salta RLS por completo**. Ahí la
policy es respaldo puro. Las fotos, en cambio, se suben/borran con el **cliente de sesión del propio
usuario** (el mismo publishable key + JWT que arma `requireUser()`), que habla con el servicio
`storage-api` de Supabase — una conexión distinta, que sí evalúa cada policy contra `auth.uid()` del JWT.
Ahí la policy **es** la barrera, no un respaldo de nada.

| Superficie                      | Conexión                        | ¿RLS se evalúa? | Qué protege de verdad                  |
| ---------------------------------- | ------------------------------------ | -------------------- | ------------------------------------------- |
| `professionals` vía `server/api/`   | Drizzle, rol dueño                    | No                    | el código del endpoint (A-002)              |
| `storage.objects` vía `server/api/professionals/me/photos.*` | cliente de sesión del usuario, rol `authenticated` | Sí | la policy — el código es defensa en profundidad, no la barrera |

**Y hay una tercera superficie que ninguna versión anterior de este documento nombraba: PostgREST.** Todo
proyecto de Supabase expone `/rest/v1/<tabla>` con la publishable key — la misma key que ya vive en
`runtimeConfig.public` porque D-001/TC-006 necesitan un cliente de Supabase real en el browser
(`createBrowserClient`, A-001). Ese cliente no solo llama `auth.signInWithOtp()`: **también expone
`.from('professionals')` y `.storage`**, callable desde la consola del navegador por cualquiera, sin pasar
por `server/api/` en absoluto. Sin bloquear esa vía a propósito, `professionals_select_public` y
`professionals_insert_own`/`update_own` no son respaldo de nada — son la única puerta, y quedan abiertas
directo a PostgREST.

| Tabla / bucket                | Cambio | Policy o grant                | Acción                                                                 |
| ---------------------- | ------ | ------------------------------ | ------------------------------------------------------------------------- |
| `professionals`        | nueva  | `alter table professionals enable row level security` | crear — sin esto ninguna policy de abajo se evalúa nunca, sin aviso |
| `professionals`        | nueva  | `revoke all on public.professionals from anon, authenticated` | crear — cierra PostgREST por completo para esta tabla. Nada en el diseño necesita leerla ni escribirla por ahí (A-001: el browser solo habla `/api/*`, salvo Auth); Drizzle usa el rol dueño y no le afecta. **`force row level security` no se usa, a propósito** — forzaría RLS también sobre el rol dueño de Drizzle, donde `auth.uid()` es `NULL`, y rompería todo insert/update de `server/api/` |
| `professionals`        | nueva  | `professionals_select_public`  | crear — `for select to authenticated, anon using (true)`. Con el `revoke` de arriba queda inerte hoy (nadie de esos roles puede llegar a evaluarla vía PostgREST); se deja igual, documentada, para el día que un grant futuro la vuelva a poner en juego — no depender de que nadie olvide por qué existe |
| `professionals`        | nueva  | `professionals_insert_own`     | crear — `for insert to authenticated with check ((select auth.uid()) = user_id)` |
| `professionals`        | nueva  | `professionals_update_own`     | crear — `for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)` |
| `professionals`        | nueva  | sin policy de `delete`         | ninguna — ninguna operación de esta misión borra una fila (ver Invariantes de datos); sin policy, Postgres deniega por default, que es el comportamiento que se quiere |
| `storage.buckets`      | nuevo bucket `professional-photos` | — | crear con `public = true` (sin esto `getPublicUrl()` no sirve nada), `file_size_limit = 4194304`, `allowed_mime_types = array['image/jpeg','image/png','image/webp']` — son la única capa que sobrevive si alguien sube directo desde la consola del navegador saltándose TC-004 (ver fila de PostgREST arriba: el mismo cliente que puede llamar `.from()` puede llamar `.storage.upload()`) |
| `storage.objects` (bucket `professional-photos`) | nuevo | `professional_photos_select_own` | crear — `for select to authenticated using (bucket_id = 'professional-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)`. **No** `to anon`, y **no** sin filtro de carpeta: en un bucket público la lectura de un archivo ya sirve sin evaluar esta policy (`/storage/v1/object/public/...` no pasa por RLS), así que una policy amplia acá no habilita nada que el bucket público no habilite ya — solo abre `list()`/`download()` vía la API, y sin filtro de carpeta eso deja a cualquier autenticado enumerar el padrón completo de carpetas (= de `userId` con perfil) del bucket. Con el filtro, sigue alcanzando para lo único que la necesita: `remove()` hace un `select` antes de borrar, y siempre lo hace el dueño sobre su propia carpeta (TC-005) |
| `storage.objects` (bucket `professional-photos`) | nuevo | `professional_photos_insert_own` | crear — `for insert to authenticated with check (bucket_id = 'professional-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)` |
| `storage.objects` (bucket `professional-photos`) | nuevo | `professional_photos_delete_own` | crear — `for delete to authenticated using (bucket_id = 'professional-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)` |
| `storage.objects` (bucket `professional-photos`) | nuevo | sin policy de `update`         | ninguna — el código nunca sube con `upsert: true` (cada foto usa un `uuid` nuevo); si alguien lo agrega "para arreglar un bug" de subida, va a perseguir un `403` en vez de arreglar nada |

INSERT y DELETE van en policies separadas porque Postgres no acepta una sola policy nombrada para ambos
comandos a la vez, y las tres de Storage llevan `bucket_id = 'professional-photos'` explícito — sin esa
condición, `for select using (true)` aplicaría a **toda** la tabla `storage.objects`, no solo a este
bucket, y expondría cualquier bucket privado que se agregue en una misión futura si esa policy nueva no
fuera, por sí sola, lo bastante restrictiva. `(select auth.uid())` en vez de `auth.uid()` a secas es la
forma que recomienda `supabase-postgres-best-practices` para que Postgres lo evalúe una vez por query, no
una vez por fila.

**Esto activó la cláusula de reapertura de A-002** ("si alguna vez algo consulta la base sin pasar por
`server/api/` —... el cliente de Supabase desde el browser—, esta decisión se revisa antes de construirlo"):
esta misión es la primera que le da al browser un cliente de Supabase con sesión real, y por lo tanto la
primera con una superficie de PostgREST/Storage genuinamente alcanzable desde afuera. Se nombró acá, como
exige `CLAUDE.md`, y de ahí subió al skill `arquitectura` como [A-007](../../../.claude/skills/arquitectura/SKILL.md)
(ver Preguntas, TQ-001) — no se resolvió en silencio actualizando el skill sin dejar rastro de por qué.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                                              | Qué invalida                                     | Experimento o mitigación                                                                                   | Criterio de salida                                                             | Estado  |
| ------ | ------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------- |
| TR-001 | El template de correo de Supabase Auth manda `{{ .ConfirmationURL }}` por default, no `token_hash`/`type` — sin cambiarlo a mano en el dashboard, TC-006 nunca recibe lo que espera. Además, `{{ .SiteURL }}` es la URL fija del proyecto en el dashboard, no la que manda `emailRedirectTo` en cada llamada — con `{{ .SiteURL }}` en el template, todo enlace redirige siempre al mismo origen sin importar desde dónde se pidió, rompiendo probarlo contra un preview de Vercel | El flujo completo de D-001, incluida la promesa de "funciona desde otro navegador" (ver T-001), y la posibilidad de probar S-002 en un preview antes de producción | Patricio edita el template "Magic Link" en Authentication → Email Templates del dashboard de Supabase para que el link sea `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` — `{{ .RedirectTo }}` sí toma el valor de `emailRedirectTo` que manda el cliente. La lista de Redirect URLs permitidas del proyecto lleva el dominio de producción y **el patrón exacto y acotado** que use el proyecto de Vercel (ej. `https://datealo-<hash>-<team>.vercel.app` según el patrón real de sus previews) — nunca un wildcard amplio tipo `https://*.vercel.app/**`, porque sin PKCE (T-001) el `token_hash` es transferible: un `emailRedirectTo` que matchee un wildcard así deja canjear el enlace desde cualquier proyecto de Vercel de un tercero que matchee el mismo patrón, tomando la sesión de quien lo pidió | Un magic link pedido desde un preview de Vercel llega apuntando a ese preview, con `token_hash` y `type=email` en la URL; un `emailRedirectTo` fuera del patrón exacto configurado es rechazado por Supabase Auth antes de mandar el correo | abierto |
| TR-002 | Una foto sin comprimir de una cámara de celular actual (12-48MP) puede superar los ~4.5MB de body que aceptan las funciones de Vercel, incluso después de una compresión cliente que falle o no corra | La subida de fotos completa en algunos dispositivos | Comprimir en el cliente antes de subir (max 1600px de lado mayor, calidad JPEG 0.8 — ver T-002) y rechazar en el servidor con `400 file_too_large` en vez de dejar que Vercel devuelva un error genérico de plataforma | Subir una foto de 12MP real desde un celular no falla; una imagen manipulada para superar el límite después de comprimir devuelve el error legible, no un 500 | abierto |
| TR-003 | El comportamiento exacto de `verifyOtp` con un `token_hash` ya usado (doble click en el link, o abrir el mismo correo dos veces) no está verificado contra un proyecto real de Supabase todavía | El modo "enlace inválido" de UXF-001 podría no dispararse como se espera | Probar a mano contra el proyecto de desarrollo como parte de S-002, antes de darlo por cerrado | El segundo intento sobre el mismo `token_hash` redirige a `enlace_invalido`, nunca deja una sesión a medio crear | abierto |

## Estrategia de pruebas

Sin infraestructura de test de integración contra Postgres — mismo criterio que misión 02 y misión 03 ya
establecieron: se verifica a mano contra la base de desarrollo, no se agrega el andamiaje solo para esta
misión.

| Contrato o riesgo         | Nivel  | Caso principal                                                                 | Límite o falla |
| ---------------------------- | ------ | ------------------------------------------------------------------------------ | ---------------- |
| TC-001 (F-001, CL-003)        | manual | Completar los 4 campos crea el perfil con `active = true`                       | Enviar el formulario dos veces (dos pestañas) no crea un segundo perfil — misma fila devuelta |
| TC-001 (validación)           | unitario, contra `server/utils/professionals.ts` | Un `categoriaSlug` que no existe en `categorias` es rechazado | Un `contact` con espacios ("+56 9 1234 5678") se normaliza y pasa |
| TC-002/TC-003                 | manual | Editar un solo campo (ej. precio) no toca los demás                              | Editar `categoriaSlug` con un valor de comuna (cruzado) se rechaza |
| TC-004/TC-005                 | manual | Subir una foto real desde un celular la agrega a `photoPaths` y se ve en el mockup de V-003 | Borrar un path que no empieza con la carpeta propia devuelve `403` |
| TC-006 (D-001)                | manual | Pedir el enlace, tocarlo, llegar autenticado a V-002 (primera vez) o V-003 (ya tenía perfil) | Un enlace de +60 min redirige a `enlace_invalido`, no deja sesión a medias (TR-003) |
| Impacto en RLS — PostgREST directo, `professionals` | manual, **desde la consola del navegador con el cliente de sesión real**, no `curl` sin autenticar | Con `$supabase.from('professionals').select('*')` autenticado o anónimo: `permission denied` (por el `revoke`), nunca filas | `$supabase.from('professionals').update({ contact: 'x' }).eq('user_id', propioId)` también falla — el `revoke` no distingue lectura de escritura |
| Impacto en RLS — Storage directo, bucket `professional-photos` | manual, **desde la consola del navegador con la sesión de un usuario A**, no a través de `server/api/` | `$supabase.storage.from('professional-photos').upload('B/x.jpg', file)` (carpeta de otro usuario B) falla por policy | `$supabase.storage.from('professional-photos').remove(['B/foto.jpg'])` también falla; leer un archivo público (`getPublicUrl`) sí funciona, para cualquiera, sin sesión |

### Propiedades que deben probarse

- Crear el mismo perfil dos veces casi al mismo tiempo (dos pestañas, doble tap) nunca produce dos filas —
  la unicidad de `userId` lo garantiza a nivel de base, no solo a nivel de aplicación.
- Ninguna respuesta de `server/api/professionals/*` incluye `userId` ni ninguna columna que no esté en la
  forma pública documentada en TC-001 (A-005) — verificable con un diff del objeto devuelto contra las
  columnas seleccionadas explícitamente en `server/utils/professionals.ts`.
- Una foto borrada deja de estar tanto en `photoPaths` como en el bucket de Storage — nunca solo en uno de
  los dos.
- Nada que el cliente mande (body, query, o una llamada directa desde la consola del navegador al cliente
  de Supabase) puede leer o escribir la fila de `professionals` de otro usuario, ni un objeto de Storage
  fuera de su propia carpeta — verificado sin pasar por `server/api/`, no solo a través de él (ver Impacto
  en RLS).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                              | Sustento                    | Criterio de aceptación principal                                                                                     | Depende de | Issue |
| ----- | -------------------------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| S-001 | Tabla `professionals` (con sus índices de `categoriaSlug`/`comunaCodigo`): schema, `enable row level security`, sus tres policies, y el `revoke` de A-007 | D-001, D-002, D-004, A-007 | Vía Drizzle (rol dueño): `select count(*)`, `insert`, `update` funcionan. Vía PostgREST con la publishable key, **sin sesión** (`anon`): `select`, `insert`, `update` devuelven `permission denied` — el `revoke` bloquea antes de que la policy se evalúe; sin el `revoke`, este criterio falla. Inventario, ejecutable sin sesión: `select relrowsecurity from pg_class where relname = 'professionals'` es `true`; `select policyname from pg_policies where tablename = 'professionals'` devuelve exactamente `professionals_select_public`, `professionals_insert_own`, `professionals_update_own` — ninguna de `delete`. La mitad "autenticado" de este bloqueo (no solo `anon`) no es verificable todavía porque no existe ninguna sesión real hasta S-002 — se prueba ahí, no acá | —          | [#73](https://github.com/PatricioTabilo/datealo/issues/73) |
| S-002 | Flujo completo de iniciar sesión con enlace mágico (V-001 + `GET /auth/confirm`), con páginas de destino mínimas | D-001, T-001, TC-006, TR-001, TR-003 | Pedir el enlace, tocarlo desde otro navegador del mismo celular, y llegar autenticado a una página placeholder que solo confirma sesión + si ya existe perfil (`/profesional/registro` o `/profesional/perfil`, sin su UI real todavía — la arma S-003/S-004); un enlace vencido, o el mismo enlace tocado una segunda vez (TR-003), llevan al modo "enlace inválido", nunca a una sesión a medio crear; sin sesión, ambas páginas placeholder redirigen a `/profesional/ingresar` (401 lógico, no la página en blanco). La lista de Redirect URLs del proyecto de Supabase no contiene ningún wildcard amplio (`https://*.vercel.app/**` o similar) — solo el dominio de producción y el patrón exacto de previews de Vercel; un `emailRedirectTo` fuera de ese patrón es rechazado por Supabase Auth antes de mandar el correo (TR-001). Con la sesión ya creada acá: `$supabase.from('professionals').select/insert/update` también devuelven `permission denied` para un usuario autenticado — cierra la mitad de S-001 que no se podía probar sin sesión | S-001 (necesita poder consultar si ya existe perfil) | [#74](https://github.com/PatricioTabilo/datealo/issues/74) |
| S-003 | Crear el perfil, quedar publicado y disparar el correo de confirmación (`POST /api/professionals` + V-002 real) | F-001, F-003, D-002, TC-001, CL-003, A-005 | Completar los 4 campos y publicar deja `active = true` de inmediato y llega el correo de F-003 en menos de un minuto (contenido único, no dos casos — ver `experiencia.md`); reenviar el mismo formulario (CL-003) no duplica ni reenvía el correo; sin sesión, `POST /api/professionals` devuelve `401`, no crea nada; la respuesta nunca incluye `userId`, `createdAt` ni `updatedAt` — solo las columnas de la forma pública `Professional` (A-005) | S-002      | [#75](https://github.com/PatricioTabilo/datealo/issues/75) |
| S-004 | Ver y editar los campos de texto del perfil (`GET`/`PATCH /me` + V-003 real, sin fotos) | F-002, D-004, TC-002, TC-003, CL-002, A-005 | Cambiar el precio no toca nombre/categoría/comuna; dejar precio y descripción vacíos sigue publicado (CL-002); reemplaza la página placeholder de S-002; sin sesión, `GET`/`PATCH /me` devuelven `401`; la respuesta nunca incluye `userId`, `createdAt` ni `updatedAt` (A-005, mismo chequeo que S-003) | S-003      | [#76](https://github.com/PatricioTabilo/datealo/issues/76) |
| S-005 | Storage: bucket `professional-photos` (`public`, `file_size_limit`, `allowed_mime_types`) con sus tres policies, y `photos.post/delete` + sección de fotos en V-003 | F-002, T-002, T-003, TC-004, TC-005, CL-001 | Subir 3 fotos desde el celular las muestra en la pantalla; borrar una la saca de la lista y del bucket; subir la foto número 13 devuelve `too_many_photos` sin llegar a Storage. **A nivel de endpoint** (vía `server/api/`): un archivo de más de 4MB o de un tipo no permitido falla con `file_too_large`/`invalid_file_type`, no un 500 de Vercel. **A nivel de bucket, vía el cliente de sesión de un usuario A, sin pasar por `server/api/`**: subir un archivo de 5MB a la carpeta propia falla por `file_size_limit` del bucket; subir un `application/pdf` a la carpeta propia falla por `allowed_mime_types` del bucket (estas dos son la prueba real de que el límite está en el bucket, no solo en el endpoint — ver Impacto en RLS); subir a la carpeta de otro usuario B falla por policy; borrar un archivo de B falla por policy; `list()` sobre la carpeta de B falla por policy (`professional_photos_select_own`); leer un archivo público propio (`getPublicUrl`) funciona sin sesión | S-004      | [#77](https://github.com/PatricioTabilo/datealo/issues/77) |
| S-006 | El CTA "Quiero unirme" de la landing navega a iniciar sesión                | D-005                         | Tocar el botón lleva a `/profesional/ingresar`; ya no se guarda ningún email en la lista de espera de profesionales   | S-002      | [#78](https://github.com/PatricioTabilo/datealo/issues/78) |

Seis slices, mayormente en línea recta — el riesgo más grande (que el enlace mágico funcione de punta a
punta, incluido entre dispositivos) va primero, después crear (que ya incluye el correo de F-003, mismo
handler, mismo momento — no es un slice aparte), después editar texto, después fotos (la pieza con más
superficie nueva: Storage, compresión, límites de tamaño). S-006 (landing) es independiente de S-003 a
S-005 — podría ir en paralelo con esos si hace falta, solo depende de que exista S-002.

S-002 entrega páginas mínimas (placeholder) en los destinos del redirect, no la UI real de `experiencia.md`
— eso lo completa S-003/S-004. Es el mismo patrón de walking skeleton que documenta `slicing.md`: el primer
slice atraviesa todas las capas con el caso más delgado (¿el redirect llega a donde debe, con sesión
puesta?) y los siguientes lo engrosan sin volver a tocar ese contrato.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El callback del enlace mágico usa `verifyOtp` con `token_hash`, no el flujo PKCE (`exchangeCodeForSession`)

- **Estado:** aceptada. **Fecha:** 2026-08-24.
- **Contratos:** TC-006, D-001.
- **Alternativas descartadas:** flujo PKCE (`code` en la URL, `exchangeCodeForSession` en el servidor) — es
  el default que documenta Supabase para SSR y el más recomendado en general, pero exige que el
  "code verifier" generado al pedir el enlace siga disponible en el mismo navegador que lo completa. Eso
  rompe exactamente el caso que `experiencia.md` (UXF-001, Variantes y recuperación) ya promete: "el enlace
  se abre en otro navegador/dispositivo del que lo pidió → igual funciona". Con PKCE, ese caso falla.
- **Decisión y consecuencia:** el template de correo usa `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`
  (ver TR-001 — `{{ .RedirectTo }}`, no `{{ .SiteURL }}`, para que respete el `emailRedirectTo` que manda
  cada llamada), `GET /auth/confirm` llama `supabase.auth.verifyOtp({ token_hash, type: 'email' })` sobre el cliente de
  sesión (`createServerClient`, mismo que `requireUser()`). Consecuencia aceptada: se pierde la defensa
  extra contra interceptación de link que PKCE agrega — aceptable para un perfil público sin datos
  sensibles de por medio (ni contraseña, ni pago), el mismo criterio que ya usó D-001 al descartar
  contraseña por fricción antes que por seguridad extrema.
- **Reapertura:** si Datealo agrega algo sensible detrás del mismo mecanismo de auth (pagos, datos
  personales de verificación) que sí justifique la defensa extra de PKCE a costa de perder el soporte
  multi-dispositivo.

<a id="t-002"></a>

### T-002 — Las fotos se comprimen en el cliente y suben a Storage a través del servidor, no con una URL firmada directa

- **Estado:** aceptada. **Fecha:** 2026-08-24.
- **Contratos:** TC-004, A-001.
- **Tensión:** A-001 dice que el browser solo habla con `/api/*` del propio dominio, con Auth como única
  excepción ya nombrada. Subir un archivo de varios MB a través de una función serverless de Vercel
  consume el body de esa función (límite ~4.5MB) y su tiempo de ejecución, mientras que subir directo a
  Storage con una URL firmada evita ambas cosas — es el patrón que la propia documentación de Supabase
  recomienda para archivos grandes.
- **Alternativas descartadas:** URL firmada de Storage, subida directa desde el browser — técnicamente
  correcto y más liviano para el servidor, pero hace *oficial* como flujo normal de la app algo que, sin
  esta decisión, sigue siendo *posible igual* desde la consola (ver el punto de abajo) — para el volumen de
  esta misión (fotos de perfil, no video, comprimidas a menos de 1MB en la práctica) subir por el servidor
  es más simple sin ceder nada real en seguridad.
- **Decisión y consecuencia:** el cliente comprime la imagen en el browser (canvas, max 1600px de lado
  mayor, calidad JPEG 0.8 — sin librería nueva, `HTMLCanvasElement.toBlob()` alcanza) antes de mandarla a
  `POST /api/professionals/me/photos`. El handler la sube a Storage usando el mismo cliente de sesión que
  `requireUser()` ya arma (no la secret key). **Esto no es una segunda excepción a A-001 en el sentido en que
  se pensó al principio, y tampoco la evita del todo**: el `createBrowserClient` que D-001/TC-006 ya
  necesitan para el enlace mágico expone `.storage` igual, así que un usuario con la consola abierta puede
  llamar a Storage directo sin pasar por este endpoint, suba la app por acá o no. Lo que de verdad cierra
  esa puerta es la policy `professional_photos_insert_own`/`delete_own` (Impacto en RLS), no la elección de
  subir por el servidor — esa elección solo evita que **el código propio de la app** use ese camino, no que
  exista. Costo aceptado: el body de la foto pasa por la función de Nitro, sujeto al límite de Vercel —
  mitigado por la compresión cliente y el tope de 4MB del servidor y del bucket (TR-002).
- **Reapertura:** si una misión futura necesita subir archivos mucho más grandes (video de un trabajo
  terminado, por ejemplo) donde el límite de body sí se vuelva un problema real, ahí conviene evaluar URLs
  firmadas — el argumento de seguridad ya no aplica (la policy protege igual en ambos casos), así que la
  decisión pasaría a ser puramente de rendimiento.

<a id="t-003"></a>

### T-003 — Las fotos son un array de paths en la propia fila (`photoPaths text[]`), no una tabla aparte

- **Estado:** aceptada. **Fecha:** 2026-08-24.
- **Contratos:** TC-004, TC-005.
- **Alternativas descartadas:** tabla `professional_photos` con su propia fila por foto (id, path, orden) —
  es el diseño "correcto" si algún día hace falta reordenar fotos a mano o guardarles un caption, pero
  ninguna de las dos cosas está en `producto.md` ni en `experiencia.md` — el orden que se ve hoy es "el
  orden en que se subieron", que un array ya da gratis. Guardar la URL pública completa en vez del path —
  se descartó porque hace que verificar dueño en TC-005 sea parsear una URL que manda el cliente en vez de
  comparar un string con forma conocida (`{userId}/...`); el path además sobrevive si algún día cambia el
  dominio del proyecto de Supabase.
- **Decisión y consecuencia:** `professionals.photoPaths text[]`, `default '{}'` — cada elemento tiene la
  forma `{userId}/{uuid}.ext`. Agregar es `array_append`; borrar es `array_remove`, ambos en una sola
  sentencia SQL, sin transacción explícita porque Postgres ya la hace atómica por fila. La URL pública que
  ve el cliente (`Professional.photoUrls`) se calcula al armar la respuesta, nunca se guarda. Costo
  aceptado: si algún día se necesita reordenar o agregarle metadata a una foto, esto se vuelve una migración
  real (expand/contract) a una tabla — no un cambio de un campo.
- **Reapertura:** el día que producto pida reordenar fotos a mano o mostrar más de una en jerarquía
  distinta (una "foto de portada", por ejemplo).

<a id="t-004"></a>

### T-004 — `professionals.id` es un `uuid` propio, distinto de `userId`

- **Estado:** aceptada. **Fecha:** 2026-08-24.
- **Contratos:** TC-001, F-001.
- **Alternativas descartadas:** usar `userId` (el id de `auth.users`) directamente como primary key de
  `professionals`, sin un `id` separado — ahorra una columna, y de todos modos hoy la relación es 1:1.
- **Decisión y consecuencia:** `professionals.id uuid primary key default gen_random_uuid()`, `userId uuid
  not null unique` aparte, sin foreign key formal a `auth.users` en Drizzle (mismo criterio que la receta
  del skill `arquitectura` ya documenta: Supabase gestiona esa tabla, no Drizzle). Beneficio real y
  acotado: la URL pública del perfil que arme la misión 05 usa `professionals.id`, no el id de la cuenta de
  Supabase — eso sí se cumple. **Lo que este `id` no logra** es esconder el id de `auth.users` en general:
  el path de Storage (`{userId}/...`, T-003) usa el id de auth, y ese path forma parte de la URL pública de
  cada foto — así que el id de auth de un profesional con fotos igual queda visible en el HTML de su
  perfil. Se acepta así porque un UUID de auth expuesto no es una credencial ni habilita nada por sí solo;
  cambiar el path de fotos a usar `professionals.id` en su lugar es posible pero exige que la policy de
  Storage valide contra una subconsulta a `professionals` en vez de comparar directo `auth.uid()`, y esa
  subconsulta necesita que el rol `authenticated` pueda leer `professionals` — lo que choca con el `revoke`
  de Impacto en RLS. No se resuelve acá; se deja nombrado para no repetir la confusión.
- **Reapertura:** si algún día el id de `auth.users` filtrado en las URLs de fotos se vuelve un problema
  real (no solo teórico), ahí se decide entre exceptuar `professionals.id` del `revoke` con una función
  `security definer`, o aceptar el costo de una segunda tabla intermedia.

<a id="t-005"></a>

### T-005 — Un middleware de página, no cada página por separado, decide a dónde redirige según sesión + existencia de perfil

- **Estado:** aceptada. **Fecha:** 2026-08-24.
- **Contratos:** UXF-001, UXF-002, UXF-003.
- **Alternativas descartadas:** cada página (`ingresar.vue`, `registro.vue`, `perfil.vue`) resuelve su
  propia redirección en el `<script setup>` — funciona, pero repite la misma llamada a
  `GET /api/auth/me` (misión 02) y a `GET /api/professionals/me` tres veces, una por archivo, con el riesgo
  real de que la regla de una diverja de las otras dos con el tiempo.
- **Decisión y consecuencia:** `app/middleware/profesional.ts`, aplicado con `definePageMeta({ middleware:
  'profesional' })` en las tres páginas. Sin sesión → `/profesional/ingresar`. Con sesión y sin perfil,
  parado en `/profesional/perfil` → `/profesional/registro`. Con sesión y con perfil, parado en
  `/profesional/registro` → `/profesional/perfil`. `/profesional/ingresar` nunca redirige desde acá — si ya
  hay sesión y llega ahí, se deja entrar (puede querer cerrar sesión y entrar con otra cuenta más adelante,
  aunque esta misión no construye ese botón). Costo aceptado: un fetch extra a `/api/professionals/me` en
  cada navegación entre estas tres páginas — sin caché de cliente todavía, aceptable al volumen de esta
  entrega.
- **Reapertura:** si el fetch repetido se vuelve un costo real medible, ahí conviene cachear el resultado en
  estado de cliente en vez de repetirlo por navegación.

## Preguntas

Ninguna bloquea construcción — TR-001 a TR-003 son verificaciones a hacer durante S-002.

| ID     | La duda                                                                    | Estado | Respuesta, o quién la resuelve |
| ------ | --------------------------------------------------------------------------- | ------ | ------------------------------- |
| TQ-001 | Esta misión activa la cláusula de reapertura de A-002 (el browser ya tiene un cliente de Supabase real, primera vez en el repo) — ¿se actualiza el skill `arquitectura` ahora, o se deja para más adelante? | resuelta 2026-08-24 | Ahora — agregado como A-007 en `.claude/skills/arquitectura/SKILL.md`, con el `revoke` sumado también a la receta "Agregar una tabla" de `recetas.md` para que la próxima misión que cree una tabla no repita el mismo hueco |
