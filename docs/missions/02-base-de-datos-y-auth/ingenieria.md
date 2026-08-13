# Misión 02: Base de datos, Auth y correo — Ingeniería

**Estado:** en revisión

**Última actualización:** 2026-08-13

[Índice](./README.md) · [Ingeniería](./ingenieria.md)

## Decisión técnica: Supabase (Postgres + Auth) vía Drizzle, con Resend como transporte de correo en dos roles

Ratifica A-001, A-002 y A-003 del skill `arquitectura` (hoy "propuesta") con la evaluación real que les
faltaba, y agrega dos decisiones nuevas que no estaban cubiertas ahí: qué usar para autenticación y qué
usar para correo transaccional.

La base de datos es Postgres administrado por Supabase, accedido solo desde `server/api/` vía Drizzle
(A-001) contra el pooler Supavisor en modo transacción (A-003). La identidad de ambos lados del
marketplace la resuelve Supabase Auth, con su sesión viviendo en el browser por necesidad y la
autorización real verificada en cada endpoint (A-002) — nunca solo en la policy RLS. El correo lo maneja
Resend en dos roles distintos: como transporte SMTP custom de Supabase Auth (para los correos que el
propio sistema de auth dispara: confirmación de cuenta, magic link, reset de contraseña) y como
`sendEmail()` genérico en `server/utils/` para el correo de negocio que cada misión futura va a disparar
con su propio contenido.

- **Contratos de producto cubiertos:** A-001, A-002, A-003 (skill `arquitectura`).
- **Riesgo bloqueante:** ninguno para la arquitectura en sí. El riesgo real es operativo — ver TR-001 — y
  depende de una decisión de negocio que no es de esta misión (el dominio de envío, TQ-001).

## Arquitectura: cuatro piezas, cada una con una sola responsabilidad

```
Browser ──(sesión Supabase Auth, publishable key)──> Supabase Auth
Browser ──(fetch a /api/*, mismo origen)────────────> Nitro (server/api/)
                                                          │
                                          requireUser() ──┤── useDb() ──> Postgres (Supavisor :6543)
                                                          │
                                                    sendEmail() ──> Resend API
                                                          
Supabase Auth ──(SMTP custom)──> Resend SMTP ──> bandeja del usuario
```

El browser nunca ve la cadena de conexión de Postgres ni la secret key de Supabase (A-001): solo la
publishable key, porque la sesión de Auth tiene que vivir ahí. Nitro es el único que habla con Postgres y
con la API de Resend. Supabase Auth es el único que habla con el transporte SMTP — eso lo configura el
dashboard de Supabase, no código de la app.

| Componente                      | Responsabilidad                                              | No debe decidir                        | Sustento      |
| -------------------------------- | -------------------------------------------------------------- | ----------------------------------------- | -------------- |
| `useDb()` (`server/utils/db.ts`) | Conexión singleton a Postgres vía Drizzle                    | Autorización, forma de la respuesta       | A-001, A-003  |
| `requireUser()` (`server/utils/auth.ts`) | Validar la sesión de Supabase Auth en el servidor      | Si el usuario es dueño del recurso pedido | A-002         |
| SMTP custom de Supabase Auth      | Entregar los correos que el propio sistema de auth dispara   | Contenido de negocio                      | T-002, T-003  |
| `sendEmail()` (`server/utils/email.ts`) | Enviar correo de negocio vía la API de Resend            | Copy o template — eso lo define quien lo llama | T-003    |

La pertenencia de un recurso (¿es tuyo?) nunca la decide `requireUser()` — solo confirma que hay una
sesión válida y quién es. Cada endpoint de misiones futuras hace esa segunda verificación, como ya
documenta la receta de "endpoint de escritura" en `arquitectura/references/recetas.md`.

## Contratos

### TC-001 — `useDb()` entrega un cliente Drizzle listo para consultar

- **Entrada:** ninguna — lee `databaseUrl` de `runtimeConfig` en el primer llamado.
- **Salida:** instancia de Drizzle tipada contra `server/db/schema`, reutilizada en llamados siguientes
  dentro del mismo proceso (singleton perezoso).
- **Invariantes:** la conexión se abre una sola vez por contenedor serverless caliente; se abre siempre
  con `prepare: false` — sin ese flag compila pero falla en runtime contra Supavisor en modo transacción
  (A-003), un error que no aparece en local contra una base directa.
- **Errores:** una `databaseUrl` inválida o el pooler caído propaga el error del driver `postgres.js` sin
  envolverlo — cada endpoint que lo llama decide cómo mapearlo a una respuesta HTTP.
- **Contrato de producto:** A-001, A-003.

### TC-002 — `requireUser(event)` verifica la sesión de Supabase Auth en el servidor

- **Entrada:** el `H3Event` de la request. Nunca confía en un `userId` que venga del body o la query.
- **Salida:** `{ id: string, email: string | null }` del usuario autenticado.
- **Invariantes:** valida el JWT de Supabase contra la secret key del servidor, no contra la publishable
  key del cliente — un JWT expirado o manipulado nunca resuelve a un usuario válido.
- **Errores:** sin sesión o sesión inválida → `401 { error: 'unauthorized' }`. El llamador decide si eso
  termina la request (recurso privado) o si sigue como anónimo (recurso público).
- **Contrato de producto:** A-002.

### TC-003 — `sendEmail()` entrega correo de negocio vía Resend

- **Entrada:** `{ to: string, subject: string, html: string }`. El contenido y el copy los arma quien
  llama — este contrato no sabe de profesionales, reseñas ni registro.
- **Salida:** `{ id: string }` con el ID de mensaje que devuelve Resend.
- **Invariantes:** el contrato no sabe ni le importa qué dominio respalda `emailFrom` — recibe
  `resendApiKey` y `emailFrom` desde `runtimeConfig` (variables `NUXT_RESEND_API_KEY` y `NUXT_EMAIL_FROM`,
  igual que `databaseUrl` en la receta de `arquitectura`), así que verificar el dominio en el dashboard de
  Resend no exige ningún cambio de código, solo cambiar el valor de la variable de entorno.
- **Errores:** el error del SDK de Resend (dominio no verificado, rate limit, destinatario inválido) se
  propaga con su mensaje original — no un `500` genérico que oculte cuál de las tres causas fue.
- **Contrato de producto:** T-003.

## Modelo de datos

Ninguna tabla de negocio nueva — el brief de esta misión es "cero tablas de negocio, cero pantallas, cero
flujo de usuario" y se mantiene: instalar la plomería, no modelar nada que le pertenezca a una misión de
producto.

Supabase Auth crea y administra su propio schema `auth` (empezando por `auth.users`) fuera de las
migraciones de Drizzle — `drizzle-kit` nunca genera ni toca ese schema. Las misiones 03 a 07 son las que
van a agregar sus tablas de negocio con un `user_id uuid` que referencia `auth.users.id`, no esta.

### Invariantes de datos

- `auth.users` es la única fuente de verdad de identidad (email, password hash, metadata de sesión).
  Ninguna tabla de `public` duplica email o password.
- El schema `auth` es propiedad de Supabase Auth. Un cambio ahí se hace desde el dashboard o la API de
  Supabase, nunca con una migración de `drizzle-kit`.

### Impacto en RLS

| Tabla | Cambio | Policy afectada | Acción |
| ----- | ------ | ---------------- | ------ |
| — | ninguna | — | ninguna |

Ninguna tabla nueva de negocio → ninguna policy nueva. `auth.users` ya trae RLS gestionado por Supabase,
fuera del alcance de `server/db/sql/rls.sql`. Esa fuente de verdad sigue vacía hasta la primera tabla de
negocio (misión 03).

## Riesgos y experimentos de factibilidad

| ID     | Riesgo o pregunta | Qué invalida | Experimento o mitigación | Criterio de salida | Estado |
| ------ | ----------------- | ------------ | ------------------------- | -------------------- | ------ |
| TR-001 | El proveedor de correo por defecto de Supabase Auth entrega máximo 2 correos/hora **por proyecto** (no por usuario), sin SLA, y rechaza destinatarios fuera del equipo del proyecto — inutilizable ni para probar el flujo de registro | Cualquier prueba real de confirmación de cuenta, y producción por completo | Configurar Resend como SMTP custom en el dashboard de Supabase (Authentication → Emails → SMTP Settings) como parte de S-003, usando la API key de Resend que llega por variable de entorno — el dominio que respalda esa key es indiferente para este mecanismo | Un signup de prueba contra el destinatario verificado disponible en ese momento (cuenta propia en Resend, o el dominio final una vez verificado) recibe la confirmación, sin tocar el límite (que sube a 30/hora con SMTP custom) | abierto |
| TR-002 | Supavisor en modo transacción no soporta prepared statements; si `prepare: false` se pierde en algún punto, la app compila y solo falla en runtime, y no se nota en local contra una base directa | Cualquier request que toque `useDb()` en producción | Un endpoint de salud (`/api/health/db`, temporal, se borra o se deja como healthcheck real) hace un `SELECT 1` desplegado en Vercel, no solo en local, antes de cerrar S-001 | El healthcheck responde 200 en al menos dos requests concurrentes contra el deploy de Vercel | abierto |
| TR-003 | La verificación de dominio en Resend (SPF, DKIM, DMARC) es un cambio de DNS externo a este repo, y `sendEmail()`/el SMTP de Supabase no distinguen en código qué dominio los respalda | Ninguno para el código de esta misión — sí para que un correo real le llegue a un usuario que no sea Patricio, mientras el dominio no esté verificado | Patricio configura el dominio y la verificación DNS en el dashboard de Resend por su cuenta, en paralelo a esta misión y sin bloquearla; mientras tanto S-003/S-004 se verifican contra el destinatario de prueba que Resend permita sin dominio verificado | El dominio real queda verificado en Resend antes de que cualquier misión de producto (03 a 07) dependa de un correo llegándole a un usuario real que no sea de prueba | abierto — sin fecha, fuera del código de esta misión |

## Estrategia de pruebas

| Contrato o riesgo | Nivel | Caso principal | Límite o falla |
| ------------------ | ----- | --------------- | ---------------- |
| TC-001 | integración | Una query real contra un proyecto Supabase de prueba hace round-trip | `databaseUrl` inválida propaga el error del driver, no cuelga |
| TC-002 | unidad | Sesión válida resuelve `{ id, email }` | Sin sesión, JWT expirado y JWT manipulado devuelven `401` los tres |
| TC-003 | unidad + integración manual | SDK de Resend mockeado: el payload sale con la forma correcta | Dominio no verificado y rate limit se propagan como errores distintos, no un `500` genérico; un envío real contra el dominio sandbox de Resend se corre una vez por slice, no en cada CI |
| TR-002 | integración desplegada | Healthcheck contra el deploy real de Vercel, no local | Dos requests concurrentes no agotan el pool |

### Propiedades que deben probarse

- `useDb()` no abre una conexión nueva por request dentro del mismo contenedor caliente — reutiliza el
  singleton.
- `requireUser()` nunca resuelve un usuario a partir de datos que vengan del cliente (body, query, headers
  que no sean el JWT de sesión).
- Un fallo de `sendEmail()` no revienta el endpoint que lo llama con un `500` sin contexto — el llamador
  puede distinguir "el correo falló" de "la operación de negocio falló".

## Plan de construcción

Corte por pieza de infraestructura: cada slice deja algo verificable de punta a punta (no solo "el
paquete quedó instalado"). **Los cuatro son independientes entre sí y se pueden construir y mergear en
paralelo** — ninguno toca código que otro necesite:

- S-001 (Postgres/Drizzle) y S-002 (Auth) son integraciones distintas de Supabase que no se tocan: `useDb()`
  usa el driver de Postgres, `requireUser()` usa `@supabase/supabase-js` con la secret key. Ninguno de los
  dos lee lo que el otro escribe en `runtimeConfig` — cada uno agrega sus propias claves.
- S-003 (SMTP custom en el dashboard de Supabase) no toca código de este repo en absoluto.
- S-004 (`sendEmail()`) usa la API HTTP de Resend, un camino completamente distinto del SMTP que configura
  S-003 — comparten la cuenta de Resend, no código. Su única precondición real es que exista la API key de
  Resend, que es un dato externo, no un slice.

Ninguno de los cuatro depende tampoco de qué dominio respalda las credenciales de Resend (TQ-001,
resuelta): el código consume `resendApiKey` y `emailFrom` como variables de entorno, y la verificación de
dominio en el dashboard de Resend es un paso operativo de Patricio, en paralelo a esta misión, sin bloquear
ningún merge. El único efecto de hacerlo después es que hasta entonces el correo real solo le llega a
destinatarios que Resend permita sin dominio verificado (ver TR-003).

**S-003 es el único que no produce un PR** — es configuración de dashboard, no código. Se cierra con un
comentario de confirmación en el issue, no con un merge; es la excepción al patrón "un Issue = un PR" del
resto del repo, no un error de corte.

| ID    | Slice (una frase, sin "y") | Sustento | Criterio de aceptación principal | Depende de | Issue |
| ----- | --------------------------- | -------- | ----------------------------------- | ---------- | ----- |
| S-001 | Conectar Supabase vía Drizzle | A-001, A-003, TC-001 | `useDb()` existe en `server/utils/db.ts`; `/api/health/db` desplegado en Vercel responde 200 con un `SELECT 1` contra el pooler, con `prepare: false` | — | [#31](https://github.com/PatricioTabilo/datealo/issues/31) |
| S-002 | Exponer la sesión de Supabase Auth en el servidor | A-002, TC-002 | `requireUser()` existe en `server/utils/auth.ts`; `GET /api/auth/me` responde `401` sin sesión y `200 { id, email }` con una sesión real de un usuario de prueba — queda como endpoint permanente, no de descarte, porque el frontend lo necesita para saber si hay sesión activa | — | [#32](https://github.com/PatricioTabilo/datealo/issues/32) |
| S-003 | Configurar Resend como SMTP custom de Supabase Auth | T-002, T-003, TR-001 | El dashboard de Supabase Auth queda apuntando al SMTP de Resend con su API key; un `curl -X POST` contra `POST /auth/v1/signup` de Supabase (no hay código de la app que dispare signup todavía — eso es la misión 04) hace llegar el correo de confirmación a un destinatario válido para la cuenta de Resend usada, sin tocar el límite de 2/hora por defecto | — | [#33](https://github.com/PatricioTabilo/datealo/issues/33) |
| S-004 | `sendEmail()` genérico sobre la API de Resend | TC-003 | `sendEmail()` existe en `server/utils/email.ts`; test unitario con el SDK de Resend mockeado verifica la forma del payload y el mapeo de errores; un envío real de una vez (script local, no código que se mergea) contra el sandbox de Resend confirma que llega, usando `resendApiKey`/`emailFrom` de `runtimeConfig` | requiere que exista la API key de Resend (precondición externa, no un slice) | [#34](https://github.com/PatricioTabilo/datealo/issues/34) |

## Decisiones técnicas

<a id="t-001"></a>

### T-001 — Supabase (Postgres) + Drizzle sobre Supavisor en modo transacción

- **Estado:** propuesta. **Fecha:** 2026-08-13.
- **Contratos:** A-001, A-003.
- **Alternativas descartadas:** Neon — mejor DX de branching por rama de Postgres puro, pero sin Auth
  nativo: sumaría un segundo proveedor solo para identidad, dos sistemas que mantener en vez de uno.
  Postgres self-hosted en un VPS — control total, pero para un producto pre-lanzamiento sin equipo de
  infra el costo operativo (backups, parches, HA) no se justifica contra lo que resuelve. PlanetScale —
  MySQL, no Postgres: no es "más simple", es un motor distinto con su propio costo de aprendizaje y sin
  RLS nativo, que es parte de A-002.
- **Decisión y consecuencias:** Postgres administrado por Supabase, accedido solo por Drizzle desde
  `server/api/`. El costo aceptado es la dependencia de un solo proveedor para datos e identidad — mitigado
  porque Postgres es portable (dump/restore a cualquier otro Postgres) si algún día hace falta migrar.
- **Reapertura:** si el volumen de datos o el presupuesto de latencia exige control fino sobre el
  hardware que Supabase no expone en su tier, se revisa contra Neon o self-hosted con una medición real.

### T-002 — Supabase Auth para ambos lados del marketplace

- **Estado:** propuesta. **Fecha:** 2026-08-13.
- **Contratos:** A-001, A-002.
- **Alternativas descartadas:** Clerk — mejor DX de componentes prearmados y soporte nativo de
  organizaciones/SSO, pero Datealo no tiene organizaciones ni requisitos B2B: pagaría por una superficie
  que no usa, y la fuente de verdad de usuarios quedaría fuera de Postgres, duplicando identidad entre dos
  sistemas. `@sidebase/nuxt-auth` / Better Auth self-hosted — sin costo por usuario activo y control
  total, pero sin Supabase ya resuelto como base de datos no hay ninguna razón para mantener a mano un
  segundo sistema de sesiones en un equipo de una persona.
- **Decisión y consecuencias:** Supabase Auth, con la sesión en el browser (única excepción a A-001) y la
  autorización real verificada en cada endpoint (A-002). El costo aceptado es que Supabase Auth por
  defecto no manda correo utilizable en producción — de ahí sale T-003.
- **Reapertura:** si aparece un requisito de negocio real de organizaciones o SSO (poco probable para un
  marketplace de hogar B2C), se revisa contra Clerk o WorkOS con ese requisito concreto, no en abstracto.

### T-003 — Resend como proveedor de correo, en dos roles

- **Estado:** propuesta. **Fecha:** 2026-08-13.
- **Contratos:** T-002, TC-003, TR-001.
- **Alternativas descartadas:** dejar el proveedor por defecto de Supabase — 2 correos/hora por proyecto
  entero, sin SLA, inviable incluso para pruebas (TR-001). Postmark — mejor reputación de entregabilidad y
  logging, pero al volumen de un producto pre-lanzamiento el pricing 2026 no le gana a Resend, y el
  atractivo real de Postmark (soporte, deliverability a escala) importa recién con volumen que Datealo no
  tiene todavía. AWS SES — el más barato por email a escala (~$0.10 por 1.000), pero exige manejar bounces,
  reputación de IP y sandbox a mano: costo de operación que no se justifica sin equipo de infra.
- **Decisión y consecuencias:** Resend en dos roles — SMTP custom de Supabase Auth para los correos del
  propio sistema de auth, y `sendEmail()` genérico sobre su API para correo de negocio. El costo aceptado
  es depender de un proveedor con menos años de operación que Postmark o SES; se acepta porque el volumen
  actual es cero y la integración es la más simple de las tres.
- **Reapertura:** si el volumen supera ~40-50k correos/mes o la deliverability se vuelve un problema
  medible (bounces, marcado como spam), se revisa contra Postmark o SES con datos reales de esta misma
  cuenta, no con una intuición.

## Preguntas

Ninguna pregunta abierta bloquea construcción. TQ-001 se resolvió desacoplando el código del dominio real
(el contrato TC-003 y la config de SMTP solo dependen de variables de entorno); TQ-002 no bloquea esta
misión porque no le importa a ninguno de los cuatro slices qué método de auth use cada lado del
marketplace — eso lo decide la misión 04.

| ID     | La duda | Estado | Respuesta, o quién la resuelve |
| ------ | ------- | ------ | -------------------------------- |
| TQ-001 | ¿Qué dominio verifica el envío en Resend — `datealo.cl`, un subdominio como `mail.datealo.cl`, u otro? | resuelta 2026-08-13 | No bloquea el slicing: el código consume `resendApiKey`/`emailFrom` como variables de entorno, indiferente a qué dominio las respalda. Patricio configura y verifica el dominio en el dashboard de Resend por su cuenta, en paralelo, sin fecha límite (ver TR-003). |
| TQ-002 | ¿Con qué método se autentican los profesionales — email/password, magic link, OTP por teléfono? | abierta | No bloquea esta misión: cualquiera de los tres usa el mismo SMTP custom de Supabase Auth que configura S-003. Lo resuelve la misión 04 (registro de profesional) al diseñar su propio flujo. |
