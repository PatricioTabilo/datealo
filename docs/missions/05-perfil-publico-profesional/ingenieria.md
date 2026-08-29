# Misión: perfil público de profesional — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-08-28

**Última actualización:** 2026-08-28

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: dos endpoints públicos sobre lo que ya existe, más una tabla nueva y aislada para el evento de contacto

`professionals` (misión 04) ya tiene todo el dato que el perfil público necesita — nombre, categoría,
comuna, contacto, descripción, precio, fotos y `createdAt`. Esta misión no le agrega ninguna columna: solo
expone un subconjunto nuevo de esos datos, ya públicos por diseño (D-001 de producto.md), a través de un
endpoint sin sesión. Lo único que agrega es una tabla chica y aislada, `professional_contact_events`, para
el evento de contacto — sin ninguna columna que identifique a quien contacta (D-002 de producto.md).

Todo se lee y escribe vía `server/api/` con Drizzle, el mismo camino que ya usa misión 04 — esta misión no
reabre PostgREST para `professionals` ni para nada nuevo, aunque sea literalmente "el perfil público": la
policy `professionals_select_public` que misión 04 dejó escrita "por si algún día se revierte el revoke"
sigue inerte, a propósito, porque ese día no es hoy (ver Impacto en RLS).

- **Contratos de producto cubiertos:** F-001, F-002, D-001, D-002, M-002.
- **Riesgo bloqueante:** ninguno.

## Vocabulario: producto ↔ código

| Término de producto              | Entidad/campo en código                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| perfil público                       | `GET /api/professionals/[id]` — lee `professionals` (misión 04), sin cambio de schema |
| "En Datealo desde..."                | `professionals.createdAt`, expuesto por primera vez en una forma pública            |
| evento de contacto                   | `professional_contact_events` (tabla nueva) — el nombre lleva "events" porque es un log de hechos ya ocurridos, no una libreta de contactos |
| botón "Escribir por WhatsApp" / "Llamar" | construidos en el cliente a partir de `professional.contact` (T-002) — no hay dos contactos separados en el dato |

## Arquitectura: dos dominios nuevos y chicos, cada uno en su propio archivo de utils

```
Browser (sin sesión) ──GET──> server/api/professionals/[id].get.ts ──> server/utils/professionals.ts ──Drizzle──> professionals, categorias, comunas

                       ──POST (sendBeacon, sin esperar)──> server/api/professionals/[id]/contacts.post.ts ──> server/utils/professional-contact-events.ts ──Drizzle──> professional_contact_events

                       └─(en paralelo, sin pasar por Datealo)─> wa.me/<contact> o tel:<contact>
```

`server/utils/professionals.ts` (misión 04) se extiende con una función nueva de lectura pública. El
registro del evento de contacto va en un archivo propio, `server/utils/professional-contact-events.ts`, no
mezclado en `professionals.ts` — son dos razones de cambio distintas (leer/editar un perfil vs. registrar un
evento) y dos dominios distintos con su propio ciclo de vida, consistente con A-006 del skill `arquitectura`
("cada archivo de `server/utils/` es de un dominio... nunca sirve a dos dominios a la vez"). La única regla
que sí se comparte de verdad entre las dos formas públicas de `professionals` (`Professional` de misión 04 y
la nueva de esta misión) es armar `photoUrls` desde `photoPaths` — se extrae a un helper interno de
`professionals.ts`, porque ahí sí es la misma regla, no dos parecidas.

| Componente                                                | Responsabilidad                                                              | No debe decidir                              | Contratos      |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------- |
| `server/db/schema/professional-contact-events.ts`               | Forma de la tabla nueva                                                             | Qué filas existen                                   | TC-002           |
| `server/utils/professionals.ts` (extendido)                     | Query pública por `id`, con categoría/comuna resueltas en la misma consulta         | Presentación, HTTP, el dominio de contactos         | TC-001           |
| `server/utils/professional-contact-events.ts` (nuevo)           | Verificar que el profesional existe y registrar el evento                            | Presentación, HTTP, el dominio de perfiles          | TC-002           |
| `server/api/professionals/[id].get.ts`                          | I/O: valida forma de `id`, llama a utils, arma la respuesta pública                  | Reglas de negocio (eso ya lo hizo utils)            | TC-001           |
| `server/api/professionals/[id]/contacts.post.ts`                 | I/O: valida forma de `id`, llama a utils                                            | Identificar a quien contacta (D-002 lo prohíbe)     | TC-002           |
| `app/pages/profesionales/[id].vue`                               | Renderiza los modos de V-001 (`experiencia.md`), arma `wa.me`/`tel:` en el cliente, dispara TC-002 sin esperar | Verificación de sesión — no aplica, no hay ninguna | UXF-001, UXF-002 |

## Contratos

### TC-001 — `GET /api/professionals/[id]` — ver el perfil público de un profesional

- **Entrada:** path param `id`. Sin sesión — cualquiera puede llamarlo (D-001 de producto.md).
- **Salida:** `200 { professional: PublicProfessionalProfile }`.
  `PublicProfessionalProfile = { id, displayName, categoriaNombre: string, comunaNombre: string, contact,
  description: string | null, priceFrom: number | null, photoUrls: string[], createdAt: string }` —
  `createdAt` en ISO 8601, es lo único que esta forma expone y que `Professional` (misión 04, `GET /me`) no
  expone. `categoriaNombre`/`comunaNombre` son el nombre legible, no el slug/código — el perfil público no
  necesita el identificador técnico, solo lo que se muestra (V-001 de `experiencia.md` nunca lee
  `categoriaSlug`).
- **Invariantes:** solo devuelve una fila con `active = true` — un perfil inactivo responde exactamente
  igual (`404`) que un `id` que no existe, para no filtrar por el código de respuesta si alguien se dio de
  baja. Un `id` sin forma de UUID se descarta antes de tocar la base (mismo `404`; sin este chequeo, un
  valor mal formado contra una columna tipada `uuid` produce un error de Postgres —`22P02`— en vez de un
  resultado vacío controlado). Nunca incluye `userId` (A-005) — es un `select` explícito nuevo, no reutiliza
  `publicColumns` de misión 04 tal cual (que sí incluye `active`, que esta forma tampoco expone: no hace
  falta, si la respuesta existe ya es porque está activo); ambos `select` excluyen `userId`
  independientemente, así que una columna privada futura en `professionals` (una nota de moderación, un
  score interno) hay que recordar excluirla en los dos lugares, no en uno — queda anotado con un comentario
  cruzado en ambos archivos para no depender de la memoria. `categoriaNombre`/`comunaNombre` se resuelven en
  la misma consulta (`leftJoin` contra `categorias` y `comunas`), no con dos queries adicionales por
  separado — este es, según T-001, el endpoint con más tráfico esperado de todo el diseño (el destino de las
  cards de misión 06), así que el costo de un round-trip evitable importa acá de una forma en que no importa
  en el flujo de correo de bienvenida de misión 04 (que sí usa dos queries separadas, porque corre una vez
  por registro, no una vez por visita).
- **Errores:** `404 { error: 'not_found' }` — único caso de error de este contrato.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-001](./producto.md#d-001),
  [D-002](./producto.md#d-002).

### TC-002 — `POST /api/professionals/[id]/contacts` — registrar que ocurrió un contacto

- **Entrada:** path param `id`. Sin sesión, sin body — [D-002 de producto.md](./producto.md#d-002) es
  explícito: nada que identifique a quien contacta.
- **Salida:** `204` sin cuerpo — el cliente nunca lee esta respuesta (la dispara con `sendBeacon`, ver
  T-003).
- **Invariantes:** un `id` sin forma de UUID se descarta antes de tocar la base, mismo criterio y mismo
  motivo que TC-001 (evita el `22P02` de Postgres contra la columna `uuid`, en vez de dejarlo escapar como
  un `500`). Inserta una fila en `professional_contact_events` con `professionalId = id` y
  `createdAt = now()`. No exige que el perfil siga `active` — solo que exista (verificado con un `select`
  antes del insert, no parseando el código de violación de FK de Postgres); un perfil que se desactivó entre
  que el buscador abrió la pantalla y tocó el botón igual registra el contacto, porque el contacto ya
  ocurrió de verdad.
- **Errores:** `404 { error: 'not_found' }` si `id` no tiene forma de UUID, o no corresponde a ningún
  profesional.
- **Contrato de producto:** [F-002](./producto.md#f-002), [D-002](./producto.md#d-002),
  [M-002](./producto.md#m-002).

## Modelo de datos

| Entidad o campo                              | Significado                                                        | Escritura           | Retención o historial |
| -------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------- | ------------------------ |
| `professionals.*`                                  | Sin cambio de schema — misión 04 ya tiene todo lo que esta misión lee    | (misión 04)             | (misión 04)              |
| `professional_contact_events.id`                   | Identificador propio de la fila, sin uso fuera de la base                | TC-002                  | Permanente               |
| `professional_contact_events.professionalId`       | FK a `professionals.id` — el profesional que recibió el contacto. `onDelete: 'restrict'` explícito: hoy ningún flujo borra un `professionals` row (misión 04), así que nunca se ejerce, pero queda decidido en vez de depender del default silencioso de Postgres — si algún día se agrega un borrado de perfiles, ese diseño tiene que decidir qué hacer con su historial de contactos, no heredar un comportamiento que nadie eligió | TC-002, una vez, nunca cambia | Permanente          |
| `professional_contact_events.createdAt`            | Cuándo ocurrió el contacto                                               | TC-002                  | Permanente               |

### Invariantes de datos

- `professional_contact_events` no tiene ninguna columna que identifique al buscador — a propósito, por
  [D-002 de producto.md](./producto.md#d-002). Cómo misión 07 va a atar una reseña a un contacto real sin
  esa identidad es [Q-001 de producto.md](./producto.md#q-001), no algo que esta misión resuelva.
- `professional_contact_events` no tiene ninguna defensa contra un `POST` fabricado (sin sesión, sin límite
  de tasa) — cualquiera puede inflar el conteo de un profesional real sin que el contacto haya ocurrido. Hoy
  no importa: ningún dato de esta tabla es público ni se consume todavía (fuera de alcance de esta misión,
  ver Fuera de alcance de `producto.md`). Es exactamente la superficie que Q-001 deja pendiente para misión
  07 — cualquier uso futuro de esta tabla como "prueba de que un contacto ocurrió" tiene que resolver esto
  primero, no asumir que la fila ya es confiable.
- `professional_contact_events.professionalId` lleva índice — es la única columna por la que se va a
  consultar (un conteo por profesional, el día que exista esa necesidad).
- TC-001 nunca lee `professional_contact_events` — no hay ningún contador visible en esta misión
  ([C-001](./investigacion.md#c-001), [C-004](./investigacion.md#c-004) de investigación; "Fuera de
  alcance" de `producto.md`).

**Migración:** no aplica — `professional_contact_events` es una tabla nueva, sin dato previo que adaptar. El
cambio a `professionals` es de exposición (un endpoint nuevo la lee distinto), no de schema — no hay
migración de datos existentes.

### Impacto en RLS

**`professionals` no cambia de policy ni de camino de acceso a nivel de RLS/PostgREST.** TC-001 lee vía
Drizzle (rol dueño, A-002), el mismo camino que TC-002/TC-003 de misión 04 — no PostgREST directo. Esto es,
literalmente, el escenario que el comentario de `professionals_select_public` en `rls.sql` ya anticipaba
("si algún día se revierte el revoke... para un perfil público futuro") — pero este diseño no lo activa: el
perfil público de Datealo se sirve vía `server/api/`, como todo lo demás (A-001), no vía PostgREST. La
policy sigue existiendo, sigue inerte por el `revoke` de misión 04, y sigue sin ser la barrera de nada.

Esto es distinto de decir que **la exposición a nivel de aplicación** no cambia: sí cambia, a propósito.
Misión 04 solo dejaba leer `professionals` vía Drizzle para el dueño autenticado (`GET /me`,
`requireUser()`); TC-001 lee vía Drizzle para cualquiera, sin sesión. Ese es exactamente el efecto que
[D-001 de producto.md](./producto.md#d-001) decide a propósito ("el número de WhatsApp o teléfono del
profesional es visible... sin iniciar sesión") — se nombra acá para que quede claro que el cambio real de
superficie vive en la autorización de `server/api/` (A-002: "cada endpoint verifica pertenencia en el
código" — acá la verificación es "no hace falta ninguna", explícita, no ausente), no en RLS.

| Tabla                          | Cambio | Policy o grant                                                                | Acción                                                                                          |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `professionals`                     | ninguno | (sin cambio — `professionals_select_public`, `_insert_own`, `_update_own`, el `revoke`, todo de misión 04) | nada — TC-001 usa el mismo camino (Drizzle, rol dueño) que ya bypassea RLS por completo |
| `professional_contact_events`       | nueva  | `alter table professional_contact_events enable row level security`                  | crear — sin esto, cualquier policy futura sobre esta tabla no se evaluaría nunca, sin aviso        |
| `professional_contact_events`       | nueva  | `revoke all on public.professional_contact_events from anon, authenticated`          | crear — cierra PostgREST por completo (A-007). Nada en el diseño necesita leer ni escribir esta tabla por ahí: TC-002 usa Drizzle (rol dueño), que no le afecta |
| `professional_contact_events`       | nueva  | sin ninguna policy (`select`/`insert`/`update`/`delete`)                             | ninguna — nada de este diseño necesita que un rol `anon`/`authenticated` toque esta tabla vía PostgREST; sin policy, Postgres deniega por default para esos roles, que es el comportamiento que se quiere. **`force row level security` no se usa** — rompería el `insert` de TC-002, que corre con el rol dueño de Drizzle, donde `auth.uid()` es `NULL` |

No hay bucket de Storage nuevo, ni cliente de Supabase nuevo en el browser — el browser de esta misión solo
habla con `/api/*` (dos rutas nuevas) y con `wa.me`/`tel:` fuera de Datealo, ningún cliente de Supabase
entra en juego del lado del buscador.

## Riesgos y experimentos de factibilidad

Ninguno bloqueante — el diseño es una extensión chica de un camino ya construido y probado en misión 04.

## Estrategia de pruebas

Mismo criterio que misión 04: sin infraestructura de test de integración contra Postgres, se verifica a
mano contra la base de desarrollo.

| Contrato o riesgo                                            | Nivel  | Caso principal                                                                                     | Límite o falla |
| ------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------- | ----------------- |
| TC-001 (F-001)                                                      | manual | Abrir `/profesionales/<id>` de un perfil activo con fotos, precio y descripción muestra todo, incluida "En Datealo desde..." | Un `id` inexistente, mal formado, o de un perfil `active = false` devuelve `404` — los tres casos, indistinguibles entre sí |
| TC-001 (perfil recién publicado — CL-001, CL-002, CL-003)            | manual | Un perfil sin fotos, descripción ni precio devuelve la misma forma, con esos campos en `null`/`[]`  | El cliente los trata como "no mostrar la sección", nunca como un error |
| TC-002 (F-002, M-002)                                                | manual | Tocar "Escribir por WhatsApp" o "Llamar" agrega una fila en `professional_contact_events` con el `professionalId` correcto | Un `id` inexistente o mal formado devuelve `404` sin insertar ninguna fila |
| TC-002 (D-002, M-002 — el registro nunca bloquea el contacto real)    | manual | Desconectar la red antes de tocar el botón: `wa.me`/`tel:` se abren igual, sin ningún error visible | — |
| Impacto en RLS — PostgREST directo, `professional_contact_events`    | manual, **desde la consola del navegador**, con o sin sesión | `$supabase.from('professional_contact_events').select('*')` devuelve `permission denied` | `.insert({ professionalId: '...' })` también falla — el `revoke` bloquea antes de evaluar cualquier policy |
| Impacto en RLS — `professionals` sigue cerrado (sin cambio respecto a misión 04) | manual, sin sesión | `$supabase.from('professionals').select('*')` sigue devolviendo `permission denied` — esta misión no reabre ese camino | — |

### Propiedades que deben probarse

- Un perfil `active = false` nunca es alcanzable por su `id` vía TC-001 — mismo `404` que un `id`
  inexistente, sin que la respuesta permita distinguir los dos casos.
- Ningún endpoint de esta misión expone `professional_contact_events` de vuelta al cliente — ni un conteo,
  ni una lista, ni ningún dato derivado (verificable por ausencia: no hay ningún endpoint de lectura para
  esta tabla en todo el diseño).
- Una falla de red o de servidor en TC-002 nunca impide que `wa.me`/`tel:` se abran — el `sendBeacon` de
  T-003 no tiene forma de bloquear la navegación siguiente, así que esta propiedad la garantiza la elección
  de API, no un `try/catch` que alguien podría olvidar escribir.

## Plan de construcción

| ID    | Slice (una frase, sin "y")                                          | Sustento                       | Criterio de aceptación principal                                                                                                                                                                 | Depende de| Issue |
| ----- | ------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------| ----- |
| S-001 | Endpoint público `GET /api/professionals/[id]` con nombres de categoría/comuna resueltos y "En Datealo desde" | F-001, D-001, D-002, TC-001, CL-001, CL-002, CL-003 | Un `id` de un perfil activo devuelve sus datos completos, incluido `createdAt`, con `categoriaNombre`/`comunaNombre` resueltos en una sola consulta; un perfil sin fotos/descripción/precio devuelve esos campos vacíos, no un error; un `id` inexistente, mal formado o de un perfil `active = false` devuelve `404` idéntico en los tres casos; la respuesta nunca incluye `userId` | —          | [#87](https://github.com/PatricioTabilo/datealo/issues/87) |
| S-002 | Tabla `professional_contact_events` (con su índice, RLS habilitada y el `revoke`) y el endpoint `POST /api/professionals/[id]/contacts` | F-002, D-002, TC-002, M-002 | Tocar el endpoint con un `id` real inserta una fila con `professionalId` y `createdAt`, sin ningún otro dato; un `id` inexistente o mal formado devuelve `404` sin insertar; vía PostgREST (consola del navegador, con o sin sesión), `select`/`insert` sobre `professional_contact_events` devuelven `permission denied` | —          | [#88](https://github.com/PatricioTabilo/datealo/issues/88) |
| S-003 | Vista pública `/profesionales/[id].vue` — todos los modos de V-001 (cargando, encontrado completo, encontrado vacío, no encontrado, tardando) con los botones de contacto | F-001, F-002, UXF-001, UXF-002, CL-001 a CL-005 | Abrir la URL de un perfil real muestra el mockup validado (`design-mockups/perfil-publico.html`) con datos reales; un `id` inválido muestra el modo "no encontrado"; tocar "Escribir por WhatsApp"/"Llamar" abre la app externa correcta y dispara TC-002 sin esperar su respuesta (verificable con la red desconectada, ver Estrategia de pruebas) | S-001, S-002 | [#89](https://github.com/PatricioTabilo/datealo/issues/89) |

Tres slices, sin dependencia entre S-001 y S-002 — podrían ir en paralelo, cada uno en su propio archivo de
utils (`professionals.ts` vs. `professional-contact-events.ts`) sin tocar el mismo archivo salvo el barril
`server/db/schema/index.ts` (un `export *` más, sin conflicto real). S-003 es el walking skeleton completo:
la vista real, consumiendo los dos endpoints ya probados por separado.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — La URL pública usa `/profesionales/[id]`, un namespace nuevo y separado de `/profesional/*`

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Contratos:** TC-001, UXF-001.
- **Alternativas descartadas:** reusar `/profesional/[id]` (mismo prefijo singular que las páginas de
  autogestión del profesional — `ingresar`, `registro`, `perfil`, misión 04) — funciona técnicamente,
  porque Nitro/Nuxt priorizan rutas estáticas sobre dinámicas en el mismo prefijo, pero mezcla dos
  audiencias completamente distintas (el profesional gestionando su propia cuenta vs. cualquiera viendo el
  perfil de un tercero) bajo el mismo namespace — confunde a la próxima misión que toque esa carpeta. Un
  slug legible en vez de `id` (ej. `/profesionales/marcelo-rojas-electricidad-nunoa`) — más amigable para
  compartir o para SEO, pero ni `producto.md` ni `experiencia.md` piden nada de eso para esta entrega, y ya
  hay una decisión tomada en [T-004 de misión 04](../04-registro-perfil-profesional/ingenieria.md#t-004) de
  usar `professionals.id` en la URL pública — agregar un slug es una migración real (unicidad, colisiones,
  qué pasa si el profesional cambia de nombre) sin ningún requisito que la sustente hoy.
- **Decisión y consecuencia:** la vista pública vive en `/profesionales/[id]`, plural, sin relación de ruta
  con `/profesional/*`. Anticipa el prefijo que misión 06 (búsqueda y resultados) probablemente va a
  necesitar para listar profesionales.
- **Reapertura:** si producto pide URLs legibles (SEO, compartir en redes) — ahí se evalúa agregar un slug
  sin romper `id` como identificador estable.

<a id="t-002"></a>

### T-002 — Los links de contacto se arman en el cliente, no en el servidor

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Contratos:** TC-001, UXF-002, [D-001](./producto.md#d-001)/[D-002](./producto.md#d-002) de producto.
- **Alternativas descartadas:** devolver `whatsappUrl`/`telUrl` ya construidos en TC-001 — no hay ninguna
  regla de negocio en armar estas URLs, es formateo puro; hacerlo en el servidor le agrega una
  responsabilidad a un contrato de lectura sin necesidad, cuando el cliente ya tiene todo lo que hace falta.
- **Decisión y consecuencia:** el cliente arma `https://wa.me/<dígitos sin +>?text=<mensaje codificado>`
  (`wa.me` exige el número sin el símbolo `+`, según su propia documentación) y `tel:<contact>` (con el
  `+`, el mismo formato E.164 en que ya se guarda `professionals.contact`, misión 04). El mensaje
  pre-armado usa `displayName` y `categoriaNombre`, ya presentes en la respuesta de TC-001 — sin ningún
  dato adicional del servidor.
- **Reapertura:** ninguna prevista.

<a id="t-003"></a>

### T-003 — El registro del contacto usa `navigator.sendBeacon`, no `fetch`, y nunca se espera antes de navegar

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Contratos:** TC-002, [D-002](./producto.md#d-002)/[M-002](./producto.md#m-002) de producto, UXF-002.
- **Alternativas descartadas:** `fetch()` sin `await` ("fire-and-forget") antes de navegar a `wa.me`/`tel:`
  — es la opción más obvia, pero un `fetch` en vuelo puede cancelarse si el navegador descarga la pestaña
  al navegar afuera (más probable en `tel:`, que en algunos navegadores móviles sí produce una navegación
  real). Esperar la respuesta del `POST` antes de abrir WhatsApp/la llamada — garantiza el registro, pero
  contradice directo D-002/M-002 ("el registro nunca puede retrasar el contacto real"): cualquier latencia
  de red ahí sería una demora real y visible para alguien que solo quiere escribir un mensaje.
- **Decisión y consecuencia:** el cliente llama `navigator.sendBeacon('/api/professionals/<id>/contacts')`
  — la API que los navegadores exponen exactamente para este caso: enviar datos justo antes de que la
  página se descargue o pierda foco, sin bloquear ni devolver una promesa que haya que esperar. Costo
  aceptado: `sendBeacon` siempre usa `POST` y no permite leer la respuesta — coherente con que TC-002 ya
  devuelve `204` sin cuerpo. Si `sendBeacon` no está disponible (navegador muy antiguo), el botón de
  contacto igual funciona — solo no queda registro de ese contacto puntual, mismo costo aceptado que una
  falla de red.
- **Reapertura:** si M-002 (el evento de contacto queda registrado de forma confiable) muestra en producción
  una tasa de pérdida real y medible que preocupe a producto — ahí se evalúa un mecanismo con reintento,
  que `sendBeacon` no ofrece.

<a id="t-004"></a>

### T-004 — El registro del evento de contacto vive en su propio archivo de dominio, no en `professionals.ts`

- **Estado:** aceptada. **Fecha:** 2026-08-28.
- **Contratos:** TC-002.
- **Alternativas descartadas:** extender `server/utils/professionals.ts` con la función de registrar el
  contacto (el borrador inicial de este documento lo planteaba así) — más corto de escribir, pero mezcla dos
  razones de cambio distintas (editar un perfil vs. registrar un evento de otro dominio) en el mismo
  archivo, contradiciendo A-006 del skill `arquitectura` sin nombrarlo — una auditoría de este documento lo
  encontró antes de construir.
- **Decisión y consecuencia:** `server/utils/professional-contact-events.ts` es un archivo nuevo, propio del
  dominio "evento de contacto" — mismo patrón que ya separa `professionals.ts` de `categorias.ts`/
  `comunas.ts`. Solo la función que arma `photoUrls` sigue compartida dentro de `professionals.ts`, porque
  ahí sí es la misma regla para las dos formas públicas del mismo agregado (`professionals`).
- **Reapertura:** ninguna prevista.

## Preguntas

Ninguna bloquea construcción.

| ID     | La duda | Estado | Respuesta, o quién la resuelve |
| ------ | ------- | ------ | ------------------------------- |
| —      | —       | —      | sin preguntas abiertas todavía |
