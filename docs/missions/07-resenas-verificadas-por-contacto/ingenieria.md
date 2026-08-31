# Misión: reseñas verificadas por contacto — Ingeniería

**Estado:** vigente — aprobado por Patricio el 2026-08-31

**Última actualización:** 2026-08-31

[Índice](./README.md) · [Investigación](./investigacion.md) · [Producto](./producto.md) ·
[Experiencia](./experiencia.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: el token nace atado al contacto real, no a un endpoint aparte

Una primera versión de este diseño registraba el token en un endpoint nuevo, separado del que ya registra
el contacto (`POST /api/professionals/[id]/contacts`, TC-002 de misión 05). Una auditoría independiente lo
tumbó: sin ninguna relación entre las dos tablas, cualquiera podía llamar al endpoint del token directo
(público, sin sesión, descubrible en el bundle del cliente) y obtener un token "válido" sin haber tocado
nunca "Escribir por WhatsApp" ni "Llamar" — funcionalmente igual al formulario completamente abierto que
[D-001 de producto.md](./producto.md#d-001) descarta explícitamente por exponer a los profesionales al
mismo patrón de reseñas falsas que sufren los negocios chicos sin defensa
([C-004 de investigacion.md](./investigacion.md#c-004)).

La corrección: el token se registra **en la misma request** que ya registra el contacto real. Eso significa
extender `POST /api/professionals/[id]/contacts` (TC-001 de este documento, que reemplaza y extiende TC-002
de misión 05) con un body JSON opcional — el primer cambio real a un contrato de una misión cerrada que
hace este diseño, nombrado explícito acá y no en silencio. Sigue disparándose con `sendBeacon`, sigue sin
leer la respuesta (T-003 de misión 05 intacto); lo único que cambia es que ahora puede llevar un `token`
opaco que no identifica a nadie (D-002 de esa misma misión sigue vigente). Con esto, un token solo puede
existir si nació en el mismo momento que una fila real de `professional_contact_events` — fabricar uno
cuesta exactamente lo mismo que fabricar un contacto falso, que ya era el límite aceptado por D-001 desde
antes de esta misión, no una puerta nueva.

Las reseñas viven en su propia tabla (`reviews`), con un `token` que nunca se expone en ninguna respuesta
pública. El correo al profesional (F-003) necesita su email, que hoy solo vive en `auth.users` de Supabase
— se copia a una columna nueva `professionals.email` en el registro (extiende misión 04), en vez de leer el
schema interno de Supabase Auth desde Drizzle.

**Qué protege este mecanismo, dicho en voz alta, y qué no.** Una segunda auditoría marcó que el documento
implicaba más protección de la que hay: el costo real de fabricar una reseña falsa sigue siendo dos llamadas
HTTP sin sesión (`POST /contacts` con un `token` inventado, después `POST /reviews` con ese mismo token) —
sin rate limit, sin CAPTCHA, sin ninguna verificación adicional. Es, en los hechos, casi el mismo costo que
el formulario completamente abierto que D-001 rechaza — pero solo para quien está dispuesto a escribir dos
`fetch()`. Lo que el mecanismo eleva es la fricción para un buscador casual usando la interfaz (que nunca ve
un botón de reseñar sin haber contactado de verdad, UX-001 de `experiencia.md`), no la resistencia contra un
script. Esto es consistente con lo que D-001 ya acepta explícitamente ("no impide el abuso al cien por
ciento"), pero el documento no lo decía con esta claridad — queda dicho acá, y como TR-003 en Riesgos.

- **Contratos de producto cubiertos:** F-001, F-002, F-003, D-001, D-002, D-003.
- **Riesgo bloqueante:** ninguno — los riesgos reales (TR-001 a TR-003 más abajo) son conocidos y aceptados,
  no bloquean esta entrega.

## Vocabulario ↔ entidades

| Término de producto        | Entidad/campo en código                                                          |
| --------------------------- | --------------------------------------------------------------------------------- |
| reseña                      | `reviews`                                                                          |
| token de contacto (D-001)   | `professional_contact_tokens.token`                                               |
| "verificada por contacto"   | no es una columna — es que exista una fila en `professional_contact_tokens` con ese `(professionalId, token)`, nacida en el mismo request que un contacto real |
| "un cliente de Datealo"     | `reviews.name IS NULL`, resuelto en la capa de presentación, nunca guardado como texto |

## Arquitectura: el token nace atado al contacto real; el servidor nunca confía en un token que no vino acompañado de uno

```
Buscador (browser)                                    Servidor                                          DB
  crypto.randomUUID() → localStorage
  click "WhatsApp"/"Llamar"
    └─ sendBeacon(…/contacts, body: {token}) ──POST, sin esperar──> TC-001 (extiende TC-002 misión 05) ──> professional_contact_events
                                                                        └─ si el token tiene forma válida ──> professional_contact_tokens

  bottom sheet "Publicar reseña"     ──fetch, espera──────────────> TC-002 (nuevo, upsert)              ──> reviews
                                                                        └─ event.waitUntil(sendEmail()) ──> Resend (F-003)

  GET /profesionales/[id]            ──fetch───────────────────────> TC-003 (extiende TC-001 misión 05)  ──> professionals + reviews (Promise.all)
```

| Componente                                                   | Responsabilidad                                                        | No debe decidir                              | Contratos      |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------ | -------------- |
| `server/utils/professional-contact-tokens.ts` (nuevo)          | Registrar un token junto a un contacto real; verificar que un token corresponde a uno | Forma de la reseña, envío de correo                | TC-001, TC-002 |
| `server/utils/reviews.ts` (nuevo)                               | Reglas puras: validar rating/comentario, resolver nombre en blanco, upsert, promedio, construir el correo de F-003 (`buildReviewNotificationEmail`, igual que `buildProfessionalWelcomeEmail` en misión 04) | Verificar el token (capa anterior)               | TC-002, TC-003 |
| `server/utils/professionals.ts` (extendido)                    | Exponer `email` internamente para F-003, sin agregarlo a ninguna forma pública | Enviar el correo (eso es el handler), construir su contenido (eso es `reviews.ts`) | TC-002         |
| `server/api/professionals/[id]/contacts.post.ts` (extendido, misión 05) | I/O: valida forma de `id`, llama a `professional-contact-events.ts` y, si viene `token`, a `professional-contact-tokens.ts` | Generar el token (lo genera el cliente)          | TC-001         |
| `server/api/professionals/[id]/reviews.post.ts` (nuevo)        | I/O: verifica token, llama a `reviews.ts`, dispara el correo sin esperarlo   | Construir el HTML del correo                     | TC-002, F-003  |
| `server/api/professionals/[id].get.ts` (extendido)              | Orquesta `professionals` + `reviews` en una sola respuesta                  | Ninguna regla propia — solo compone               | TC-003         |
| `app/composables/useReviewToken.ts` (nuevo)                    | Generar, guardar y leer el token por profesional en `localStorage`          | Nada de red                                       | UXF-001        |
| `app/components/professional-public/ProfessionalPublicContactBar.vue` (extendido) | Lee/genera el token antes de disparar `sendBeacon`, ahora con body | Nada — sigue sin saber qué hace el servidor con eso | UXF-001        |

`server/utils/professional-contact-tokens.ts` y `server/utils/reviews.ts` quedan como dos archivos de
dominio separados (A-006): verificar un token y aplicar las reglas de una reseña son dos responsabilidades
distintas que cambian por motivos distintos. La tabla del token tampoco se fusiona dentro de
`professional_contact_events` como una columna nullable — esa tabla existe, por diseño de misión 05, para
nunca llevar nada que identifique a quien contacta (D-002 de esa misión); agregarle una columna que sirve
exactamente como credencial de verificación cambiaría lo que esa tabla promete ser, incluso en las filas
donde quedara en blanco. Son dos conceptos de dominio distintos — un registro anónimo de hechos, y un
registro de autorización — aunque nazcan en el mismo request.

**Ownership de `server/api/professionals/[id]/contacts.post.ts`:** este archivo pasa a ser infraestructura
compartida entre misión 05 (registrar el contacto) y misión 07 (registrar el token), no exclusivo de
ninguna de las dos — queda nombrado acá para que quien lo toque después no asuma que es "de misión 05" y
edite sin ver el efecto sobre el token, o viceversa.

## Contratos

### TC-001 — `POST /api/professionals/[id]/contacts` (extiende TC-002 de misión 05) — registrar el contacto y, si viene, su token

- **Entrada:** path param `id`. Body JSON opcional `{ token?: string }` (formato UUID). Sin sesión — D-002 de
  misión 05 sigue vigente: nada que identifique a la persona; un token opaco sin ningún dato personal no lo
  viola, aunque sí actualiza el invariante literal "sin body" del contrato original de esa misión, que queda
  reemplazado por este. El token viaja en el body, no en la URL — a diferencia de un query param, no queda
  en logs de acceso ni en el historial del navegador.
- **Salida:** sin cambio respecto a misión 05 — `204` sin cuerpo. Se dispara con `sendBeacon`, el cliente
  nunca la lee (T-003 de misión 05, intacto).
- **Invariantes:** todo lo que TC-002 de misión 05 ya garantizaba, sin cambios — un `id` sin forma de UUID
  se descarta antes de tocar la base; inserta una fila en `professional_contact_events`; no exige `active`,
  solo que el profesional exista. Además: si el body trae un `token` con forma de UUID válida, en la misma
  request se inserta también `(professionalId, token, createdAt)` en `professional_contact_tokens`
  (`onConflictDoNothing` — un reintento de `sendBeacon` nunca produce un error que nadie vería). Un `token`
  ausente o mal formado nunca es un error y nunca bloquea el registro del contacto real — mismo espíritu que
  el invariante ya vigente de misión 05 ("D-002 — el registro nunca bloquea el contacto real"). El insert
  del contacto y el del token son dos sentencias separadas, no una transacción conjunta: si el insert del
  token falla por una razón ajena a su forma (ej. un error transitorio de la base), el insert del contacto
  ya se completó y la respuesta sigue siendo `204` — el contacto real nunca queda condicionado a que el
  token se haya guardado con éxito.
- **Errores:** sin cambio — `404 { error: 'not_found' }` si `id` no tiene forma de UUID o el profesional no
  existe. Un `token` mal formado nunca produce error, se ignora.
- **Contrato de producto:** [F-002 de misión 05](../05-perfil-publico-profesional/producto.md#f-002)
  (sin cambio), [D-001](./producto.md#d-001) de esta misión.

### TC-002 — `POST /api/professionals/[id]/reviews` — publicar o reemplazar la reseña de este navegador

- **Entrada:** path param `id`. Body JSON `{ token: string, rating: number, comment?: string, name?: string }`.
  Usa `fetch` normal, no `sendBeacon` — a diferencia de TC-001, acá el cliente sí necesita leer la respuesta
  (spinner mientras espera, mensaje de error si falla, cierre del sheet solo si el servidor confirma —
  UXF-001 de `experiencia.md`).
- **Salida:** `200 { review: PublicReview }`. `PublicReview = { id, name: string, rating: number, comment:
  string | null, verified: true, updatedAt: string }` — `updatedAt`, no `createdAt`: un reemplazo cambia
  lo que la reseña dice, y la fecha que se expone tiene que reflejar eso, la misma columna por la que se
  ordena la lista en TC-003 (corregido en revisión de PR, el diseño original tenía `createdAt` acá, un
  desajuste real con la propia regla de "Invariantes de datos" de este documento). `name` ya resuelto ("un cliente de Datealo" si
  llegó vacío, D-002).
- **Invariantes:**
  - El `token` debe corresponder a una fila en `professional_contact_tokens` para ese `professionalId` — si
    no existe, la reseña no se publica (F-001: "Datealo nunca publica una reseña sin verificar primero...").
  - `rating`: entero 1-5, obligatorio, con `check (rating between 1 and 5)` también a nivel de base — no
    solo en el código de la aplicación, mismo espíritu que A-002 ("RLS es la red de seguridad, no el único
    mecanismo") aplicado acá a la integridad de datos, no a la autorización.
  - `comment`: opcional, máximo 500 caracteres — se rechaza si lo supera, nunca se trunca en silencio
    (experiencia.md, UXF-001), con `check (char_length(comment) <= 500)` también a nivel de base, mismo
    criterio que el `check` de `rating`: la aplicación no es la única barrera contra una fila fuera de
    forma. `name`: opcional, texto libre sin validación de formato.
  - `name` en blanco o ausente se guarda como `NULL` — el reemplazo por "un cliente de Datealo" ocurre al
    leer (`toPublicReview`), no al escribir: si el copy cambia algún día, no hace falta un backfill de filas
    ya escritas con el texto viejo.
  - Upsert atómico por `(professionalId, token)` a nivel de base (`onConflictDoUpdate`, ver T-003) — CL-003:
    una segunda reseña del mismo token reemplaza a la primera, nunca inserta una fila nueva.
  - Dispara F-003 (correo al profesional) sin esperar su resultado —
    `event.waitUntil(sendEmail(...).catch(() => {}))`, mismo patrón que `server/api/professionals/index.post.ts`
    (misión 04). El asunto/cuerpo los construye `buildReviewNotificationEmail` en `reviews.ts` (ver
    Arquitectura), no el handler. Si `professionals.email` es `null` (perfil sin email registrado, ver
    T-002), F-003 simplemente no dispara — no es un error.
- **Errores:**
  - `404 { error: 'not_found' }` si `id` no tiene forma de UUID o el profesional no existe.
  - `403 { error: 'not_verified' }` si el `token` no corresponde a un contacto real de ese profesional — la
    UI nunca debería llegar a este caso (el formulario está oculto sin token, UX-001 de experiencia.md);
    solo lo alcanza quien le pega directo al endpoint.
  - `400 { error: 'invalid_rating' }` si `rating` no es un entero 1-5.
  - `400 { error: 'comment_too_long' }` si `comment` supera 500 caracteres.
- **Contrato de producto:** [F-001](./producto.md#f-001), [D-001](./producto.md#d-001),
  [D-002](./producto.md#d-002), [D-003](./producto.md#d-003), [CL-001, CL-002, CL-003](./producto.md#casos-límite-que-cruzan-funcionalidades).

### TC-003 — `GET /api/professionals/[id]` (extiende TC-001 de misión 05) — el perfil incluye sus reseñas

- **Entrada:** sin cambio (path param `id`).
- **Salida:** `PublicProfessionalProfile` de misión 05 se extiende con `reviews: PublicReview[]` (de la más
  reciente a la más antigua por `updatedAt`), `ratingAverage: number | null` (redondeado a un decimal, `null`
  sin reseñas), `reviewCount: number`. Ningún campo existente de TC-001 de misión 05 cambia — extensión
  aditiva.
- **Invariantes:** sin reseñas, `reviews: []`, `ratingAverage: null`, `reviewCount: 0` — F-002 hereda el
  comportamiento sin reseñas de misión 05 (CL-003 de esa misión: la sección de reseñas ni siquiera aparece).
  El handler pide primero `findPublicProfessionalProfile` de `professionals.ts` y solo si existe pide la
  de `reviews.ts` — encadenadas, no con `Promise.all`: un id que no corresponde a ningún profesional (o
  uno inactivo) nunca debe pagar la segunda consulta. No hace falta un índice adicional para el `order by
  updated_at`: `experiencia.md` ya fija sin paginación ni "ver más" en esta entrega, porque con la oferta y
  el volumen esperados ningún perfil va a acumular reseñas suficientes para que un `sort` sobre unas pocas
  filas importe.
- **Errores:** sin cambio respecto a TC-001 de misión 05 (`404` si no existe o `active = false`).
- **Contrato de producto:** [F-002](./producto.md#f-002), [D-002](./producto.md#d-002).

## Modelo de datos

| Entidad o campo                              | Significado                                                        | Escritura                           | Retención               |
| --------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------- | -------------------------- |
| `professional_contact_tokens.id`              | Identificador de la fila                                              | TC-001                                 | Permanente                 |
| `professional_contact_tokens.professionalId`  | FK a `professionals.id`                                               | TC-001                                 | Permanente                 |
| `professional_contact_tokens.token`           | `uuid`, opaco, generado por el cliente, sin significado propio        | TC-001                                 | Permanente                 |
| `professional_contact_tokens.createdAt`       | Cuándo se registró                                                    | TC-001                                 | Permanente                 |
| `reviews.id`                                  | Identificador de la reseña                                            | TC-002                                 | Permanente                 |
| `reviews.professionalId`                      | FK a `professionals.id`                                               | TC-002                                 | Permanente                 |
| `reviews.token`                               | `uuid`, el mismo token que autorizó la reseña — nunca sale en una respuesta. FK compuesta `(professional_id, token)` hacia `professional_contact_tokens(professional_id, token)`, `onDelete: 'restrict'` (mismo criterio explícito que `professional_contact_events.professionalId` de misión 05: hoy nada borra un token, pero queda decidido en vez de heredar el default de Postgres) | TC-002                            | Permanente                 |
| `reviews.rating`                              | 1 a 5, obligatorio, con `check` a nivel de base                       | TC-002                                 | Se sobreescribe al reemplazar |
| `reviews.comment`                             | Texto libre, opcional, máx. 500 caracteres, con `check` a nivel de base | TC-002                                 | Se sobreescribe al reemplazar |
| `reviews.name`                                | Texto libre, opcional; `NULL` se resuelve a "un cliente de Datealo" al leer | TC-002                            | Se sobreescribe al reemplazar |
| `reviews.createdAt`                           | Cuándo se publicó por primera vez                                     | TC-002, solo en el insert original      | Permanente, no cambia al reemplazar |
| `reviews.updatedAt`                           | Cuándo se reemplazó por última vez — ordena la lista y es la fecha relativa que se muestra | TC-002                | Se actualiza en cada reemplazo |
| `professionals.email`                         | Copia del email de `auth.users` al momento del registro, para F-003    | `POST /api/professionals` (misión 04, extendido) | Permanente, sin sincronización posterior (ver TR-001) |

### Invariantes de datos

- Un token solo puede existir si nació en la misma request que un contacto real — `professional_contact_tokens`
  solo se escribe desde TC-001, nunca desde un endpoint que no escriba también `professional_contact_events`
  en la misma llamada (ver Decisión técnica).
- `unique index` en `professional_contact_tokens(professional_id, token)` — sin él, el `onConflictDoNothing`
  de TC-001 no tiene contra qué resolver el conflicto y falla en runtime; es la base de que un reintento de
  `sendBeacon` nunca duplique fila.
- Un dispositivo (token) mantiene como máximo una reseña vigente por profesional — `unique index` en
  `reviews(professional_id, token)`; TC-002 hace upsert sobre esa unicidad a nivel de base, nunca en dos
  pasos desde el código (ver T-003).
- `reviews(professional_id, token)` lleva además una FK compuesta hacia
  `professional_contact_tokens(professional_id, token)` — sin ella, una reseña podría sobrevivir en la base
  a un token que ya no existe en ningún lado (hoy nada borra un token, pero D-001 no descarta que algún día
  se agregue una expiración), y seguiría mostrándose "verificada por contacto" con la prueba ya desaparecida,
  sin que ninguna restricción lo marcara.
- `reviews.createdAt` no cambia en un reemplazo; `reviews.updatedAt` sí, y es el campo que ordena "más
  reciente primero" y que se muestra como fecha relativa — un reemplazo empuja la reseña arriba de la lista,
  coherente con que D-003 lo trata como editar, no como un evento nuevo sin relación con el anterior.
- `reviews.token` nunca se expone en ninguna respuesta pública (`PublicReview` no lo incluye) — es un
  secreto de correlación, no un dato de la reseña.
- Ninguna de las dos tablas nuevas lleva un índice de un solo campo sobre `professionalId` — el `unique
  index` compuesto `(professional_id, token)` ya cubre las consultas filtradas solo por `professionalId`
  (regla de "leftmost prefix": un índice sobre `(a, b)` sirve también para filtrar solo por `a`), mismo
  criterio que ya deja explícito `professional_contact_events` de misión 05 para su propio índice.

### Impacto en RLS

| Tabla                          | Cambio        | Policy afectada                                    | Acción                                                                                          |
| -------------------------------- | ------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `professional_contact_tokens`    | tabla nueva   | ninguna (sin `select`/`insert`/`update`/`delete`)      | `alter table professional_contact_tokens enable row level security;` + `revoke all ... from anon, authenticated;` — mismo criterio que `professional_contact_events` de misión 05: todo pasa por Drizzle (rol dueño, A-002), PostgREST cerrado por completo (A-007) |
| `reviews`                        | tabla nueva   | ninguna                                                | `alter table reviews enable row level security;` + `revoke all ... from anon, authenticated;` — misma razón; la lectura pública de reseñas pasa por TC-003 (Drizzle), nunca por PostgREST directo |
| `professionals`                  | columna nueva (`email`) | `professionals_select_public` (sin cambio de condición) | ninguna acción sobre la policy — la tabla ya está cerrada a `anon`/`authenticated` por su `revoke` de misión 04 (A-007), así que RLS no es lo que protege `email`. La protección real es de código (A-005): el `select` explícito de `Professional`/`PublicProfessionalProfile` en `professionals.ts` no debe listar `email` — hay que mantenerlo así a mano al agregar la columna, el mismo punto que ya anota TC-001 de misión 05 sobre `userId` |

`force row level security` no se usa en ninguna de las dos tablas nuevas, mismo motivo que misión 05: Drizzle
escribe con el rol dueño, donde `auth.uid()` es `NULL` — forzarlo rompería el `insert` del propio servidor.

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta                                                                                  | Qué invalida                                       | Experimento o mitigación | Criterio de salida | Estado |
| ------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ---------------------------- | ------------------------ | ------ |
| TR-001 | `professionals.email` se desincroniza si el profesional cambia su email en Supabase Auth (sin trigger ni sync) | F-003 podría enviar a una dirección vieja | Aceptado sin mitigación — hoy no existe ningún flujo de "cambiar email" en Datealo (misión 04 no lo construyó), así que la desincronización no tiene ningún camino real para ocurrir todavía | Si Datealo agrega cambio de email de cuenta, ese diseño decide si sincroniza `professionals.email` o lo reemplaza por una lectura en vivo | abierto, no bloqueante |
| TR-002 | Si el `sendBeacon` de TC-001 falla en silencio (navegador viejo, bloqueador de contenido) o si el `token` de `localStorage` se pierde (limpieza de datos del sitio, modo privado), el buscador ve WhatsApp/Llamar funcionar normal (misión 05 ya blindó eso) pero nunca puede reseñar después, sin ningún error visible | Reduce el volumen real de reseñas sin que nadie se entere por qué — a diferencia de misión 05, donde fallar solo pierde una fila de analytics, acá fallar le quita a alguien la posibilidad completa de dejar una reseña | Ninguna en esta entrega — mismo límite que T-003 de misión 05 ya aceptó para el contacto mismo (sin fallback a `fetch`), y limitación ya reconocida por D-001 de producto (el mecanismo "no impide el abuso al cien por ciento" en ninguna dirección) | Si [M-001](./producto.md#m-001) muestra una proporción de contactos-a-reseñas muy por debajo de lo esperado, descartar esta causa antes de asumir que es solo cambio de dispositivo (CL-002) | abierto, no bloqueante |
| TR-003 | El mecanismo no resiste a un atacante que escribe código: dos llamadas HTTP sin sesión (`POST /contacts` con un `token` inventado, después `POST /reviews` con ese mismo token) bastan para publicar una reseña falsa "verificada por contacto" — el mismo costo, en la práctica, que el formulario completamente abierto que D-001 rechaza, para quien esté dispuesto a escribir dos `fetch()` en vez de usar la interfaz | Vacía parcialmente la promesa de D-001 para cualquiera que no sea un buscador casual usando el navegador; además, este ataque infla `professional_contact_events` y `professional_contact_tokens`/`reviews` a la vez, en el mismo script — el guardrail de [M-001](./producto.md#m-001) ("ningún profesional termina con más reseñas que contactos") es ciego a este caso específico, porque los dos contadores suben juntos | Aceptado tal como está: D-001 ya renuncia explícitamente a impedir el abuso al cien por ciento, y lo que este mecanismo sí sube es la fricción para el buscador casual de la interfaz (nunca ve la opción de reseñar sin haber contactado, UX-001), no la resistencia contra un script — nombrado acá para que quede explícito, no implícito | Si aparece evidencia real de reseñas fabricadas en volumen (patrones de rating/comentario repetidos, ráfagas de reseñas sin el contacto correspondiente en un rango de tiempo razonable), reabrir D-001 con un mecanismo que sí cueste algo real (rate limit por IP, un desafío tipo CAPTCHA, o similar) | abierto, no bloqueante |

## Estrategia de pruebas

| Contrato                    | Nivel               | Caso principal                                                                 | Límite o falla                                                                                                    |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| TC-001                          | contrato (endpoint)    | `id` real + `token` con forma válida → `204`, filas en `professional_contact_events` y `professional_contact_tokens` | `id` inválido → `404` sin insertar nada; `token` mal formado o ausente → `204`, solo se inserta el contacto; token repetido → `204`, sin duplicar fila |
| TC-002                          | contrato + unidad      | token que existe en `professional_contact_tokens`, rating 5 → `200` con la reseña  | token inexistente o inventado sin contacto real → `403`; rating fuera de 1-5 → `400`; comentario > 500 → `400`; segunda reseña del mismo token → reemplaza, no duplica (CL-003) |
| TC-002 (F-003)                  | unidad                 | reseña publicada → `sendEmail()` llamado con el asunto y cuerpo de `buildReviewNotificationEmail` | `sendEmail()` rechaza (mock) → la respuesta `200` se envía igual; `professionals.email` nulo → `sendEmail()` nunca se llama |
| `reviews.ts` (funciones puras)  | unidad                 | `resolveReviewerName(null)` → `"un cliente de Datealo"`; `resolveReviewerName("Carmen")` → `"Carmen"` | rating no entero, `0`, `6` → todos inválidos                                                                        |
| TC-003                          | contrato               | profesional con 2 reseñas → `ratingAverage` correcto a un decimal, orden por `updatedAt` desc | profesional sin reseñas → `reviews: []`, `ratingAverage: null`, `reviewCount: 0`                                     |
| RLS (`professional_contact_tokens`, `reviews`) | integración/manual | —                                                                                   | vía PostgREST (consola del navegador, con o sin sesión): `select`/`insert` sobre las dos tablas nuevas devuelven `permission denied` |

### Propiedades que deben probarse

- Un token nunca puede quedar registrado en `professional_contact_tokens` sin una fila correspondiente en
  `professional_contact_events` de la misma request — no hay ningún camino de código que escriba uno sin el
  otro.
- El upsert de TC-002 es atómico: dos requests concurrentes con el mismo token nunca producen dos filas —
  la garantía es del `unique index` de la base, no de un `select`-then-`insert` en dos pasos del código.
- Un `rating` inválido nunca deja una reseña anterior en un estado parcial — la validación corre antes de
  tocar la base.
- `sendEmail()` fallando nunca revierte ni bloquea la publicación de la reseña (F-003).
- Un insert directo en `reviews` con un `(professionalId, token)` que no existe en `professional_contact_tokens`
  falla por la FK compuesta, a nivel de base — no solo por el chequeo `403` de la aplicación.

## Plan de construcción

El riesgo de esta misión está en la integración (¿el mecanismo de verificación aguanta punta a punta?), no
en un algoritmo — el corte es vertical: un walking skeleton que prueba el camino completo del mecanismo por
API antes de tocar ninguna UI (S-001 a S-003), después la UI que lo hace usable en la app real (S-004 a
S-005), y al final el correo (F-003), que no bloquea ni depende de nada del camino principal y puede
construirse en paralelo desde S-006.

| ID    | Slice (una frase, sin "y")                                                              | Sustento                  | Criterio de aceptación principal                                                                 | Depende de | Issue |
| ----- | ------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- | ----- |
| S-001 | Extender `POST …/contacts` con un `token` opcional (tabla `professional_contact_tokens` + RLS + revoke) | D-001, TC-001                 | `id` real + `token` válido inserta fila en las dos tablas; `token` ausente/inválido inserta solo el contacto, sin error; token repetido no duplica; PostgREST deniega `select`/`insert` | —          | [#107](https://github.com/PatricioTabilo/datealo/issues/107) |
| S-002 | Publicar o reemplazar la reseña de un profesional, verificando el token (tabla `reviews` con RLS/revoke, `check` de rating y de largo de comentario, FK compuesta hacia `professional_contact_tokens`, endpoint `POST …/reviews`, sin el correo todavía) | F-001, D-001, D-002, D-003, CL-001 a CL-003, TC-002 | Token con contacto real + rating publica la reseña; token sin contacto real → `403`; rating/comment inválidos → `400`; segunda reseña del mismo token reemplaza, nunca duplica; PostgREST deniega `select`/`insert` | S-001      | [#108](https://github.com/PatricioTabilo/datealo/issues/108) |
| S-003 | `GET /api/professionals/[id]` extendido con `reviews`/`ratingAverage`/`reviewCount`           | F-002, TC-003                 | Perfil con reseñas devuelve el arreglo ordenado y el promedio correcto; perfil sin reseñas devuelve `[]`/`null`/`0`, sin romper la forma que misión 05 ya expone | S-002      | [#109](https://github.com/PatricioTabilo/datealo/issues/109) |

*(con S-001 a S-003 mergeados, el mecanismo completo — contactar con token, publicar reseña, verla en el
perfil — ya es verificable por API/`curl`, sin ninguna UI todavía)*

| S-004 | `useReviewToken` + `ProfessionalPublicContactBar.vue` envían el token en el body del beacon existente | D-001, UXF-001                | Tocar "Escribir por WhatsApp"/"Llamar" genera un token si no existía, lo guarda en `localStorage`, y lo manda en el mismo `sendBeacon` que ya dispara el contacto | S-001      | [#110](https://github.com/PatricioTabilo/datealo/issues/110) |
| S-005 | UI de reseñas en `/profesionales/[id].vue`: sección de reseñas, card "dejar la tuya", bottom sheet (nuevo y editando, UXF-001/UXF-002), estados vacío/error, toast `bottom-right` | F-001, F-002, todos los UXF de experiencia.md | Con token, aparece la card y el sheet publica/edita una reseña real; sin token, no aparece ninguna forma de reseñar; toast en `bottom-right` (patrón universal de `discovery-ux`) | S-003, S-004 | [#111](https://github.com/PatricioTabilo/datealo/issues/111) |

*(con S-005 mergeado, el walking skeleton está completo y usable en la app real — 5 slices, no 7)*

| S-006 | Columna `professionals.email`, poblada al registrar el perfil                                | F-003, T-002                  | `POST /api/professionals` con sesión guarda `email`; `email` nunca aparece en `Professional` ni en `PublicProfessionalProfile` | —          | [#112](https://github.com/PatricioTabilo/datealo/issues/112) |
| S-007 | Correo de aviso al profesional cuando se publica una reseña — contenido (UXF-003) y disparo (`sendEmail()` sin esperar) | F-003, TR-001, UXF-003        | Reseña publicada con `professionals.email` no nulo dispara `sendEmail()` con el contenido exacto de UXF-003 (asunto sin adelantar rating, cuerpo con/sin nombre, con/sin comentario); `sendEmail()` fallando no afecta la respuesta `200` | S-002, S-006 | [#113](https://github.com/PatricioTabilo/datealo/issues/113) |

S-006 no depende de nada del camino principal — puede construirse en paralelo con S-001 a S-005.

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — El token nace en la misma request que el contacto real, extendiendo TC-002 de misión 05, no en un endpoint aparte

- **Estado:** propuesta. **Fecha:** 2026-08-30. Reemplaza una versión anterior de esta misma decisión, tumbada
  en auditoría el 2026-08-30 por no verificar nada contra un contacto real (ver Decisión técnica).
- **Contratos:** [D-001](./producto.md#d-001) de producto; TC-002 de misión 05 (extendido, ver TC-001 de
  este documento).
- **Alternativas descartadas:**
  - Un endpoint nuevo y desconectado para el token (la versión original de esta decisión) — descartada tras
    la auditoría: sin ninguna relación con `professional_contact_events`, cualquiera puede fabricar un token
    válido sin haber contactado nunca, vaciando la promesa de D-001.
  - Que el servidor emita el token en la respuesta de TC-002 de misión 05 — descartada porque ese endpoint
    se dispara con `sendBeacon`, que nunca permite leer la respuesta (T-003 de esa misión, decisión vigente).
  - Agregar el `token` como query param en vez de body — descartada porque un valor que funciona como
    credencial de escritura no debería terminar en logs de acceso, proxies o historial del navegador; un
    body cumple la misma función sin ese costo.
  - Extender `professional_contact_events` con una columna `token` nullable, en vez de una tabla nueva —
    descartada porque cambiaría lo que esa tabla promete ser (D-002 de misión 05: nunca lleva nada que
    identifique a quien contacta), incluso en las filas donde el token quedara en blanco; un registro
    anónimo de hechos y un registro de autorización son dos conceptos de dominio distintos, aunque nazcan en
    el mismo request.
- **Decisión y consecuencia:** `POST /api/professionals/[id]/contacts` (TC-002 de misión 05) se extiende con
  un body JSON opcional `{ token? }`. El cliente genera el token (`crypto.randomUUID()`) antes de disparar el
  beacon y lo guarda en `localStorage` de inmediato — no depende de ninguna respuesta del servidor. El
  servidor, en la misma request, inserta el contacto (sin cambios) y, si el token tiene forma válida, una
  fila en `professional_contact_tokens`. Un token solo puede existir atado a un contacto real.
- **Reapertura:** ninguna prevista — si en producción aparece evidencia de que el token igual se fabrica en
  volumen (ej. scripts que llaman a `/contacts` con tokens inventados en bucle), eso reabre D-001 de
  producto, no esta decisión técnica: el mecanismo de verificación en sí ya asume ese límite.

<a id="t-002"></a>

### T-002 — El email del profesional se copia a `professionals.email` en el registro, no se lee `auth.users` directo

- **Estado:** propuesta. **Fecha:** 2026-08-30.
- **Contratos:** F-003.
- **Alternativas descartadas:** query cruda de Drizzle contra el schema `auth` de Supabase — técnicamente
  alcanzable (misma base), pero es un schema que Supabase gestiona y migra por su cuenta, sin definición de
  Drizzle; acoplar `reviews.ts`/`professionals.ts` a su forma interna es la fuga que un anti-corruption
  layer existe para evitar, y ninguna otra parte del código lo hace hoy. Consultar el cliente admin de
  Supabase en cada envío — agrega una dependencia de red extra a un flujo que hoy es 100% Drizzle, por un
  dato que ya está disponible gratis en el momento del registro.
- **Decisión y consecuencia:** `professionals` gana una columna `email` (nullable), poblada por
  `POST /api/professionals` en el mismo request donde `user.email` ya está disponible (igual que
  `buildProfessionalWelcomeEmail` hoy). Perfiles creados antes de esta misión quedan con `email = null` —
  F-003 no envía el correo para esos casos, sin error (TR-001). Nunca se agrega a `Professional` ni a
  `PublicProfessionalProfile` (A-005): es un dato interno.
- **Reapertura:** si Datealo agrega un flujo de cambio de email de cuenta, revisar si `professionals.email`
  debe sincronizarse ahí mismo.

<a id="t-003"></a>

### T-003 — El reemplazo de una reseña (D-003) es un upsert a nivel de base, no un select-then-insert en el código

- **Estado:** propuesta. **Fecha:** 2026-08-30.
- **Contratos:** [D-003](./producto.md#d-003) de producto; CL-003.
- **Alternativas descartadas:** verificar en el handler si ya existe una reseña y decidir `insert` vs.
  `update` en JS — descartada porque dos requests concurrentes del mismo token (doble tap en una conexión
  lenta) podrían leer "no existe" las dos antes de que la primera termine de insertar, produciendo dos filas
  — justo lo que CL-003 prohíbe.
- **Decisión y consecuencia:** `unique index` en `reviews(professional_id, token)`; el insert usa
  `onConflictDoUpdate` para que la base garantice la unicidad, no el código de la aplicación.
- **Reapertura:** ninguna prevista.

## Preguntas

Ninguna pregunta bloquea la construcción — los puntos que podrían haber quedado abiertos (cómo verificar el
token sin tocar TC-002 de misión 05 en falso, de dónde sale el email del profesional, cómo garantizar el
upsert) se resolvieron como T-001, T-002 y T-003 arriba.

| ID | La duda | Estado | Respuesta, o quién la resuelve |
| -- | ------- | ------ | ------------------------------- |
| —  | —       | —      | sin preguntas abiertas propias de ingeniería |
