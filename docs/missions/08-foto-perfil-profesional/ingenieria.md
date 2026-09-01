# Misión: foto de perfil de profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-09-01

**Última actualización:** 2026-09-01

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: la foto de perfil es una columna nueva y reutiliza el bucket de fotos de trabajo

`professionals` gana `avatarPath` (nullable, un solo valor — no un array), con la misma forma que
`photoPaths` ya usa: un path dentro de Supabase Storage, nunca una URL completa. El archivo vive en el
mismo bucket `professional-photos` que las fotos de trabajo, con el mismo patrón de path
(`{userId}/{uuid}.ext`) — no en un bucket nuevo. Esto significa que las tres policies de Storage que ya
protegen las fotos de trabajo (`professional_photos_select_own/insert_own/delete_own`, todas scoped por
carpeta = `auth.uid()`) ya cubren la foto de perfil sin ningún cambio: la única diferencia entre una foto
de perfil y una de trabajo es en qué columna de `professionals` queda su path, nunca en el bucket ni en la
carpeta (ver T-001).

El reemplazo (subir una foto nueva sobre una que ya existía) es subir-con-uuid-nuevo-y-borrar-el-viejo, no
un `upsert: true` sobre un nombre fijo — mismo criterio que T-002 de misión 04 ya fijó a propósito para
las fotos de trabajo: el bucket no tiene policy de `update`, y agregarla ahora para el avatar reabriría esa
decisión para todo el bucket sin necesitarlo (ver T-002).

Dos endpoints nuevos (`POST`/`DELETE /api/professionals/me/avatar`), calcados de TC-004/TC-005 de misión 04
(subir/borrar fotos de trabajo) pero para un solo archivo en vez de una colección — la validación de tipo
MIME y tamaño se extrae a una función compartida entre ambos (`professional-photo-upload.ts`) porque es
literalmente la misma regla, atada a los límites del mismo bucket, no dos reglas que hoy solo se parecen.
Dos extensiones de lectura (`GET /api/professionals/[id]`, `GET /api/search`) exponen `avatarUrl` donde
antes solo había iniciales.

- **Contratos de producto cubiertos:** F-001, F-002, D-001.
- **Riesgo bloqueante:** ninguno.

## Vocabulario ↔ entidades

| Término de producto | Entidad/campo en código                                              |
| -------------------- | --------------------------------------------------------------------- |
| foto de perfil       | `professionals.avatarPath` (persistido, path de Storage) / `avatarUrl` (expuesto al cliente, URL pública completa) |
| foto de trabajo       | `professionals.photoPaths` / `photoUrls` — ya existente, sin cambios de esta misión |

## Arquitectura: mismo patrón de fotos de trabajo (misión 04), un solo archivo en vez de una colección

```
Profesional (browser)                          Servidor                                    Storage / DB
  ProfessionalAvatar.vue
    └─ selecciona archivo ──POST, multipart──> TC-001 avatar.post.ts ──valida (compartido)──> professional-photo-upload.ts
                                                    ├─ sube {userId}/{uuid}.ext ─────────────> professional-photos (Storage)
                                                    ├─ UPDATE avatarPath ────────────────────> professionals
                                                    └─ borra el path anterior (si había) ────> professional-photos (Storage)

  "Quitar foto"          ──DELETE──────────────> TC-002 avatar.delete.ts
                                                    ├─ borra el objeto ──────────────────────> professional-photos (Storage)
                                                    └─ UPDATE avatarPath = null ─────────────> professionals

  GET /profesionales/[id]  ──fetch───────────────> TC-003 (extiende TC-003 de misión 07) ────> professionals + reviews
  GET /buscar               ──fetch───────────────> TC-004 (extiende GET /api/search, misión 06) ─> professionals
```

| Componente                                                          | Responsabilidad                                                              | No debe decidir                                | Contratos      |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------- | -------------- |
| `server/utils/professional-photo-upload.ts` (nuevo, extraído)         | Regla pura compartida: tipos MIME permitidos, tamaño máximo, extensión por tipo — hoy solo la usa `photos.post.ts` (misión 04); a partir de esta misión también `avatar.post.ts` | Hablar con Storage ni con Drizzle                  | TC-001         |
| `server/utils/professionals.ts` (extendido)                           | Persistir `avatarPath`, construir `avatarUrl` (mismo patrón que `buildPhotoUrls`), exponerlo en `Professional` y `PublicProfessionalProfile` | Validar el archivo, hablar con Storage             | TC-001, TC-002, TC-003 |
| `server/utils/search.ts` (extendido)                                   | Exponer `avatarUrl` en `SearchResultProfessional`                                | Nada de Storage ni de RLS                          | TC-004         |
| `server/api/professionals/me/avatar.post.ts` (nuevo)                  | I/O: valida el archivo, sube el nuevo, actualiza `avatarPath`, borra el viejo      | Construir la URL pública (delega a `professionals.ts`) | TC-001     |
| `server/api/professionals/me/avatar.delete.ts` (nuevo)                | I/O: borra el objeto de Storage, limpia `avatarPath`                              | Nada                                                | TC-002         |
| `app/composables/useProfessionalAvatar.ts` (nuevo)                    | Estado de subida/borrado, llama a los dos endpoints, actualiza `professional.value` | Nada de UI                                         | UXF-001        |
| `app/components/professional/ProfessionalAvatar.vue` (nuevo)          | UI de subir/reemplazar/quitar en "Editar perfil"                                  | Validar el archivo — el servidor es la fuente de verdad | UXF-001   |
| `app/components/professional-public/ProfessionalPublicPhotos.vue` (extendido) | Mostrar el avatar en el círculo grande, cuando no hay fotos de trabajo — es el único lugar donde hoy vive el fallback de iniciales (UX-001) | Nada nuevo | TC-003, UX-001 |
| `app/pages/profesionales/[id].vue` (extendido)                        | Mostrar el círculo chico con anillo junto al nombre, solo cuando sí hay fotos de trabajo — ese bloque (`<h1>` + categoría + comuna) vive en la página, no en `ProfessionalPublicPhotos.vue`, que no conoce el nombre en su template (UX-001) | Nada nuevo | TC-003, UX-001 |
| `app/components/search/SearchResultCard.vue` (extendido)              | Mostrar el avatar en vez de iniciales cuando existe                               | Nada nuevo                                          | TC-004         |

## Contratos

### TC-001 — `POST /api/professionals/me/avatar` — subir o reemplazar la foto de perfil

- **Entrada:** sesión válida. `multipart/form-data` con un solo archivo (`image/jpeg`, `image/png` o
  `image/webp`), comprimido en el cliente con el mismo `compressPhoto()` que ya usan las fotos de trabajo
  — máximo 4MB en el servidor, mismo límite que TC-004 de misión 04 y que el propio bucket.
- **Salida:** `200 { avatarUrl: string }` — la URL pública nueva, ya recalculada.
- **Invariantes:** el archivo nuevo se sube primero, con un `uuid` fresco (`{userId}/{uuid}.ext}`, nunca
  `upsert: true`); `professionals.avatarPath` se actualiza recién después de que la subida terminó bien;
  el archivo anterior (si `avatarPath` no era null) se borra al final, no antes — ese orden evita que una
  falla a mitad de camino deje `avatarPath` apuntando a un archivo que no existe. Si el borrado del
  archivo viejo falla, no revierte la respuesta — el archivo nuevo ya es el vigente, el viejo queda
  huérfano en el bucket (ver TR-001).
- **Errores:** `401` sin sesión. `400 { error: 'invalid_file_type' }` o `{ error: 'file_too_large' }` —
  mismos códigos que TC-004 de misión 04, mismas reglas (`professional-photo-upload.ts` compartido).
  `404` si no existe perfil todavía.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-001](./producto.md#d-001).

### TC-002 — `DELETE /api/professionals/me/avatar` — quitar la foto de perfil

- **Entrada:** sesión válida. Sin body — a diferencia de TC-005 de misión 04 (que recibe el `path` porque
  hay varias fotos posibles), acá solo puede haber una, así que el servidor la busca solo.
- **Salida:** `200 { avatarUrl: null }`.
- **Invariantes:** idempotente sobre el estado de `avatarPath` — si el perfil existe y `avatarPath` ya era
  `null`, igual responde `200 { avatarUrl: null }` sin error; un doble clic accidental en "Quitar foto"
  nunca debería mostrar un error. Esto es distinto de que el perfil no exista en absoluto (ver Errores) —
  "sin avatar" es un dato válido, "sin perfil" es ausencia de fila, y el contrato no los trata igual. Si
  había un archivo, se borra del bucket antes de limpiar la columna; si el borrado falla, `502` (acá sí
  bloquea la respuesta, a diferencia de TC-001: quitar la foto es la operación principal solicitada, no un
  efecto secundario de otra).
- **Errores:** `401` sin sesión. `404` si no existe perfil todavía — mismo caso que TC-001, aunque no
  debería ser alcanzable desde la UI (que solo muestra "Quitar foto" con un perfil ya cargado). `502` si
  Storage falla al borrar.
- **Contrato de producto:** [F-001](./producto.md#f-001).

### TC-003 — `GET /api/professionals/[id]` (extiende TC-003 de misión 07) — el perfil incluye `avatarUrl`

- **Entrada:** sin cambio (path param `id`).
- **Salida:** `PublicProfessionalProfile` se extiende con `avatarUrl: string | null`. Ningún campo
  existente cambia — extensión aditiva, mismo criterio que TC-003 de misión 07 con `reviews`.
- **Invariantes:** `avatarUrl` es siempre `null` o una URL pública completa — nunca `undefined`, nunca el
  path crudo del bucket (A-005: la forma pública nunca expone el dato interno de Storage).
- **Errores:** sin cambio respecto a TC-003 de misión 07.
- **Contrato de producto:** [F-002](./producto.md#f-002).

### TC-004 — `GET /api/search` (extiende el contrato ya implementado de misión 06) — cada resultado incluye `avatarUrl`

- **Entrada:** sin cambio.
- **Salida:** `SearchResultProfessional` se extiende con `avatarUrl: string | null`, misma regla que TC-003.
- **Invariantes:** igual que TC-003 — nunca `undefined`, nunca el path crudo.
- **Errores:** sin cambio.
- **Contrato de producto:** [F-002](./producto.md#f-002).

## Modelo de datos

| Entidad o campo             | Significado                                                                 | Escritura            | Retención                |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------ | --------------------------- |
| `professionals.avatarPath`  | Path dentro del bucket `professional-photos` (`{userId}/{uuid}.ext`, mismo patrón que `photoPaths`), nullable, un solo valor — nunca un array ni una URL completa | TC-001 (setea), TC-002 (limpia a `null`) | Solo el valor actual — subir uno nuevo borra el anterior del bucket, sin historial (D-001 de `producto.md`) |

### Invariantes de datos

- `avatarPath` es un solo valor, a diferencia de `photoPaths` — la foto de perfil nunca tiene más de un
  archivo vivo a la vez, y no hay `array_append`/`array_remove` involucrado.
- El archivo vive en la misma carpeta `{userId}/` que las fotos de trabajo — se distingue de ellas
  únicamente por vivir en `avatarPath` en vez de `photoPaths`, nunca por convención de nombre de archivo.
- TC-001 nunca sube con `upsert: true` (mismo criterio que T-002 de misión 04 fijó para todo el bucket) —
  sube primero, actualiza la columna después, borra el archivo viejo al final.
- **Migración:** no aplica más allá de agregar la columna — ningún perfil existente tiene `avatarPath` hoy;
  todos empiezan en `null`, que es exactamente el estado "sin foto de perfil" que `producto.md` ya define
  como válido y sin error.

### Impacto en RLS

**Esta misión no crea ninguna policy nueva de Storage — reutiliza las tres que ya protegen las fotos de
trabajo.** `professional_photos_select_own`/`insert_own`/`delete_own` (creadas por misión 04) ya están
scoped por `(storage.foldername(name))[1] = (select auth.uid())::text`, sin distinguir qué tipo de foto es
— el path de la foto de perfil (`{userId}/{uuid}.ext`) cae dentro de ese alcance sin modificar una sola
línea de `server/db/sql/rls.sql` en la parte de Storage. Verificado leyendo el archivo: las tres policies
ya cubren este caso.

Se mantiene, a propósito, la ausencia de policy de `update` que T-002 de misión 04 ya decidió para todo el
bucket — TC-001 nunca sube con `upsert: true`, así que no hace falta.

| Tabla / bucket                                    | Cambio                | Policy afectada                                                | Acción                                                                                                            |
| ---------------------------------------------------- | ---------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `professionals`                                     | nueva columna `avatarPath` | `professionals_select_public` (comentario, no la policy en sí) | actualizar el comentario que documenta qué se expondría si se reabre el grant a PostgREST — ya lista `email` (misión 07, S-006); `avatarPath` se agrega a la misma lista: es un path interno de Storage, no un dato para mostrar directo |
| `storage.objects` (bucket `professional-photos`)     | sin cambio              | `professional_photos_select_own`/`insert_own`/`delete_own`         | ninguna — el path de la foto de perfil ya cae dentro del alcance existente de las tres policies                        |

**Dónde se verifica la pertenencia en el servidor:** TC-001 y TC-002 llaman `requireUser(event)` y luego
`findProfessionalByUserId(user.id)` antes de tocar Storage o la columna — mismo patrón que TC-004/TC-005 de
misión 04. El path que se sube o borra siempre se construye server-side a partir de `user.id`, nunca se
acepta un path del cliente (a diferencia de TC-005 de misión 04, que sí recibe un `path` porque hay varias
fotos posibles entre las que elegir).

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                                                                          | Qué invalida        | Experimento o mitigación | Criterio de salida | Estado  |
| ------ | -------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------- | ----------------------- | ------- |
| TR-001 | Un archivo huérfano puede quedar en el bucket por dos caminos: (a) el borrado del viejo en TC-001 falla después de que la subida ya tuvo éxito; (b) dos `POST /avatar` casi simultáneos del mismo usuario leen el mismo `avatarPath` viejo antes de que el otro termine (TOCTOU) — el que pierde la carrera nunca queda referenciado ni se borra. Hoy no hay ningún job que limpie objetos sin referencia en `avatarPath` ni en `photoPaths`, y al no haber convención de nombre que distinga avatar de foto de trabajo (a propósito — ver Invariantes de datos), ese futuro job tendría que cruzar contra las dos columnas para saber qué es cada huérfano | Ninguno — es basura de Storage, no un bug funcional ni de seguridad; el costo es unos KB por reemplazo fallido o carrera, no una fuga de datos | Ninguna todavía — el volumen esperado (pocos profesionales, reemplazos poco frecuentes) no justifica un job de limpieza ni un lock hoy; mitigación barata si algún día se necesita: `pg_advisory_xact_lock(hashtext(user.id))` alrededor del ciclo subir/actualizar/borrar, o capturar el `avatarPath` viejo con un `UPDATE ... RETURNING` atómico en vez de una lectura previa separada | Si el volumen de reemplazos crece y el storage usado se vuelve una preocupación real, se agrega una limpieza periódica y, si la carrera empieza a ocurrir en la práctica, el lock advisory | abierto, no bloqueante |

## Estrategia de pruebas

| Contrato o riesgo                                    | Nivel                     | Caso principal                                                                 | Límite o falla |
| ------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| TC-001                                                 | contrato (endpoint) + integración (Storage real) | sube un jpg válido de 2MB → `avatarUrl` apunta al archivo nuevo, el archivo viejo desaparece del bucket | tipo no soportado → 400; archivo de 5MB → 400; sin sesión → 401 |
| TC-002                                                 | contrato + integración     | con avatar → `avatarUrl: null`, objeto borrado del bucket                          | sin avatar previo → 200 idempotente, no 404 |
| TC-003, TC-004                                         | unidad (mapeo a la forma pública) | `avatarPath` presente → `avatarUrl` con la URL pública completa                | `avatarPath` `null` → `avatarUrl` `null`, el campo nunca falta ni es `undefined` |
| `professional-photo-upload.ts` (extracción compartida) | unidad                     | el mismo tipo MIME/tamaño válido se acepta en las dos rutas de subida (fotos de trabajo y avatar) | un tipo no soportado devuelve el mismo error en las dos rutas |

### Propiedades que deben probarse

- Reemplazar la foto de perfil nunca deja dos archivos vivos en el bucket para el mismo profesional, salvo
  el caso ya documentado en TR-001 (falla puntual del borrado del viejo).
- Un profesional sin foto de perfil nunca aparece con `avatarUrl` distinto de `null` en ninguna de las tres
  superficies que lo exponen (`GET /me` vía `Professional`, `GET /[id]`, `GET /search`).

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                              | Sustento           | Criterio de aceptación principal                                                                                                   | Depende de | Issue |
| ----- | --------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----- |
| S-001 | Columna `avatarPath` en `professionals`, sin exponerse en ninguna forma pública todavía | D-001               | La migración aplica; la columna es nullable; `Professional`, `PublicProfessionalProfile` y `SearchResultProfessional` siguen sin incluirla (A-005) | —          | [#125](https://github.com/PatricioTabilo/datealo/issues/125) |
| S-002 | El profesional sube, reemplaza o quita su foto de perfil                    | F-001, TC-001, TC-002 | Sube un jpg válido → 200, `avatarUrl` nuevo, el archivo anterior desaparece del bucket; tipo no soportado → 400; sin sesión → 401; `DELETE` sin avatar previo → 200 idempotente | S-001      | [#126](https://github.com/PatricioTabilo/datealo/issues/126) |
| S-003 | UI para subir, reemplazar y quitar la foto de perfil en "Editar perfil"     | UXF-001             | Círculo punteado sin foto; sube y muestra la foto real; "Quitar foto" vuelve al punteado sin confirmación; error de red muestra el mensaje y vuelve al punteado | S-002      | [#127](https://github.com/PatricioTabilo/datealo/issues/127) |
| S-004 | `GET /api/professionals/[id]` expone `avatarUrl`                            | F-002, TC-003       | Perfil con avatar devuelve su URL; perfil sin avatar devuelve `avatarUrl: null`, nunca `undefined`                                       | S-001      | [#128](https://github.com/PatricioTabilo/datealo/issues/128) |
| S-005 | Mostrar la foto de perfil en el perfil público                              | F-002, UX-001       | Sin fotos de trabajo: la foto de perfil reemplaza el círculo grande en `ProfessionalPublicPhotos.vue`; con fotos de trabajo: aparece el círculo chico con anillo junto al nombre en `[id].vue`; sin foto de perfil, ningún cambio en ninguno de los dos | S-004      | [#129](https://github.com/PatricioTabilo/datealo/issues/129) |
| S-006 | `GET /api/search` expone `avatarUrl` por resultado                          | F-002, TC-004       | Cada resultado con avatar devuelve su URL; sin avatar, `avatarUrl: null`                                                                 | S-001      | [#130](https://github.com/PatricioTabilo/datealo/issues/130) |
| S-007 | Mostrar la foto de perfil en resultados de búsqueda                         | F-002               | La card de un profesional con avatar muestra su foto real en vez de las iniciales, mismo lugar y tamaño; sin avatar, sigue mostrando iniciales | S-006      | [#131](https://github.com/PatricioTabilo/datealo/issues/131) |

Walking skeleton: S-001 y S-002 primero (el riesgo real está en que la reutilización del bucket funcione de
punta a punta sin policies nuevas, no en ningún cálculo) — S-002 prueba esa integración antes de construir
ninguna UI encima. S-003 cierra F-001 completo. S-004/S-005 y S-006/S-007 son dos pares independientes entre
sí (perfil público y resultados de búsqueda no comparten código de UI), pueden construirse en cualquier
orden relativo una vez que S-001 está mergeado.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — La foto de perfil reutiliza el bucket `professional-photos` existente, no un bucket nuevo

- **Estado:** propuesta. **Fecha:** 2026-09-01.
- **Contratos:** TC-001, TC-002, D-001.
- **Alternativas descartadas:** un bucket dedicado `professional-avatars` con sus propias tres policies —
  mismo patrón de path y de policy exacto, solo que duplicado; la diferencia entre una foto de perfil y una
  de trabajo ya vive en qué columna de `professionals` guarda su path, no necesita vivir también en qué
  bucket la contiene. Duplicar las tres policies para una diferencia que el schema ya resuelve es
  exactamente la abstracción equivocada que el skill `discovery-engineering` pide evitar cuando dos cosas
  son la misma regla, no dos que solo se parecen.
- **Decisión y consecuencia:** mismo bucket, mismo patrón de path `{userId}/{uuid}.ext`; cero policies de
  Storage nuevas (ver Impacto en RLS).
- **Reapertura:** si el bucket alguna vez necesita límites distintos por tipo de foto (por ejemplo, un
  tamaño máximo distinto para la foto de perfil), ahí sí se justifica separarlo — hoy ambos tipos de foto
  comparten el mismo límite (4MB, `image/jpeg`/`png`/`webp`) sin ninguna razón para que diverjan.

<a id="t-002"></a>

### T-002 — El reemplazo de la foto de perfil es subir-nuevo-y-borrar-viejo, no `upsert`

- **Estado:** propuesta. **Fecha:** 2026-09-01.
- **Contratos:** TC-001.
- **Alternativas descartadas:** `upload(path, data, { upsert: true })` sobre un nombre de archivo fijo
  (`avatar.jpg`) — más simple en el código del endpoint. Técnicamente se podría acotar la policy de
  `update` por patrón de nombre (`name like '%/avatar.%'`) para no tocar las fotos de trabajo, pero eso
  introduce una pieza que el diseño hoy evita a propósito (una convención de nombre fijo, ver Invariantes
  de datos) y no resuelve limpio si la extensión cambia entre subidas (jpg → webp) sin recodificar siempre
  al mismo formato, algo que tampoco se hace hoy. T-002 de misión 04 además ya decidió, a propósito, no
  tener ninguna policy de `update` en este bucket ("si alguien la agrega para arreglar un bug de subida,
  va a perseguir un 403 en vez de arreglar nada") — agregar una, aunque fuera acotada, reabre esa pregunta
  por una necesidad que el patrón subir-nuevo-y-borrar-viejo ya resuelve sin ella.
- **Decisión y consecuencia:** cada subida usa un `uuid` nuevo, igual que las fotos de trabajo; el archivo
  viejo se borra después de que `avatarPath` ya apunta al nuevo, nunca antes (ver TC-001, Invariantes).
  Consecuencia aceptada: un archivo huérfano queda en el bucket si el borrado del viejo falla (TR-001) —
  costo de storage, no de correctitud ni de seguridad.
- **Reapertura:** ninguna prevista.

## Preguntas

Ninguna abierta.

| ID     | La duda                                                                        | Estado              | Respuesta, o quién la resuelve |
| ------ | ----------------------------------------------------------------------------------- | -------------------- | -------------------------------------- |
| TQ-001 | ¿Reutilizar el bucket `professional-photos` deja algún hueco de RLS que un bucket separado no tendría? | resuelta 2026-09-01 | No — verificado contra `server/db/sql/rls.sql`: las tres policies ya scopean por carpeta = `auth.uid()`, sin distinguir tipo de foto (ver T-001 e Impacto en RLS) |
