---
name: arquitectura
description: Decisiones de arquitectura vigentes de Datealo y dónde va cada cosa al construir. Usar antes de crear un endpoint o una ruta de servidor, tocar la base de datos, agregar o migrar una tabla, escribir o revisar políticas RLS, conectar Supabase o Drizzle, manejar secretos y variables de entorno, desplegar a Vercel, o elegir un componente de interfaz. También al preguntar "¿dónde pongo esto?", "¿cómo creo este endpoint?", "¿esto necesita RLS?", "¿qué librería de UI usamos?" o "¿por qué está armado así?".
---

# Arquitectura de Datealo

Las decisiones que valen para todo el producto y que ninguna misión decide por su cuenta: quién habla con
la base de datos, dónde vive la autorización, cómo se conecta a Postgres y con qué se construye la interfaz.

Un `ingenieria.md` las da por supuestas y las cita como sustento. No las re-decide.

Este skill es operativo: dice qué hacer y dónde ponerlo. Cada decisión trae su porqué comprimido para que
no se re-litigue, y su condición de reapertura para que tampoco quede congelada.

## Estado: casi nada de esto está construido

Datealo es pre-lanzamiento y lo único que existe es la landing. Antes de escribir código contra este
documento, verificar qué hay:

| Pieza                                    | Estado                                          |
| ---------------------------------------- | ----------------------------------------------- |
| `server/` (endpoints, schema, RLS)       | plomería lista (misión 02) — `db.ts`, `auth.ts`, `email.ts`; sin tablas de negocio aún |
| Supabase, Drizzle, `postgres.js`         | instalados y en uso (A-001, A-002, A-003, misión 02) |
| Nuxt UI v4                               | instalado y en uso en toda la landing (A-004, misión 01) |

## A-001 — El browser nunca habla con Supabase, habla con Nitro

**Estado:** aceptada (misión 02, 2026-08-17). **Fecha:** 2026-08-11.

Supabase se puede usar de dos formas opuestas. Como BaaS, el browser lleva la publishable key y consulta
PostgREST directo: ese endpoint es público por diseño y toda la seguridad recae en las policies. Como base
de datos a secas, el browser solo conoce `/api/*` del propio dominio.

Datealo usa la segunda. El cliente pega a rutas de Nitro en el mismo origen, y esas rutas hablan con
Postgres vía Drizzle. Ninguna credencial de Supabase ni cadena de conexión cruza al bundle del navegador.

**La excepción es Auth.** La sesión de Supabase Auth vive en el browser porque tiene que vivir ahí, y la
publishable key es pública por diseño. Lo que nunca baja es la secret key ni la cadena de conexión.

**La sesión viaja en cookies, no en `localStorage`.** Datealo es SSR, no SPA (misión 02, TC-002): el
servidor necesita leer la sesión en cada request para que `requireUser()` funcione. El cliente de Supabase
del browser se arma con `createBrowserClient()` de `@supabase/ssr`, nunca con el `createClient()` plano de
`@supabase/supabase-js` — ese guarda la sesión en `localStorage`, invisible para el servidor, y el síntoma
es silencioso: el login "funciona" del lado del browser y cualquier endpoint protegido devuelve `401`
siempre, porque `requireUser()` nunca ve la cookie que nunca se escribió. Receta concreta en
[`recetas.md`](./references/recetas.md#requireuser-con-supabasessr).

**Al construir:**

- Todo acceso a datos pasa por `server/api/`. Un componente que importa un cliente de Supabase y consulta
  directo viola esta decisión, aunque funcione.
- Los secretos van en `runtimeConfig` a secas. Lo que se pone en `runtimeConfig.public` queda embebido en
  el JavaScript del cliente y se lee desde el código fuente de la página.
- En `runtimeConfig.public` solo van la URL del proyecto y la publishable key.

**Alternativas descartadas:** Supabase como BaaS con RLS como única defensa — expone la superficie completa
de la base. Un backend separado (Express, Fastify) — agrega un despliegue y un origen más sin resolver nada
que Nitro no resuelva.

## A-002 — RLS es la red de seguridad, no el mecanismo de autorización

**Estado:** aceptada (misión 02, 2026-08-17). **Fecha:** 2026-08-11.

RLS se evalúa contra el rol de Postgres y los claims del JWT, y PostgREST los setea en cada request. **Una
conexión de Drizzle con la cadena de conexión normal entra como rol dueño y se salta RLS por completo.**
Escribir las policies y consultar con Drizzle sin más las deja como decoración: no corren nunca.

La autorización de Datealo vive en las rutas de `server/api/`, que ya son la única puerta por A-001. Las
policies de `server/db/sql/rls.sql` se escriben igual, como respaldo para la superficie de Supabase y para
el día que algo consulte por fuera del servidor.

**Al construir, esto es lo que más se olvida:**

- Cada endpoint que lee o escribe datos de un usuario verifica pertenencia **en el código**, explícitamente.
  No alcanza con que exista la policy.
- Cada tabla con datos de usuario igual nace con su policy en `server/db/sql/rls.sql`.
- Cada tabla con datos de usuario lleva además una prueba de que un cliente anónimo no lee lo que no debe.

El caso típico de Datealo tiene dos lados asimétricos: el perfil de un profesional es de **lectura pública**
(es el producto) y de **escritura solo del dueño**. Una reseña la escribe el cliente y la lee todo el mundo.
Confundir esos dos ejes es cómo se filtra un teléfono que el profesional no quería público.

**Alternativa descartada:** forzar RLS real envolviendo cada query en una transacción con
`set_config('request.jwt.claims', ...)` y `SET LOCAL ROLE authenticated`. Funciona y hay implementaciones de
referencia, pero obliga a un wrapper en cada acceso a datos y el contexto no persiste fuera de la
transacción. El costo no se justifica cuando el servidor ya es la única puerta.

**Reapertura:** si alguna vez algo consulta la base sin pasar por `server/api/` —un job externo, una
integración, el cliente de Supabase desde el browser—, esta decisión se revisa antes de construirlo.

## A-003 — La conexión va por Supavisor en modo transacción

**Estado:** aceptada (misión 02, 2026-08-17). **Fecha:** 2026-08-11.

Vercel corre funciones serverless y cada invocación abre su conexión. Contra Postgres directo se agota el
límite apenas hay tráfico paralelo.

| Uso                       | Destino                                        |
| ------------------------- | ---------------------------------------------- |
| Conexión de la app        | Supavisor transacción, `...pooler.supabase.com:6543` |
| Migraciones de drizzle-kit| Conexión directa, puerto `5432`                |
| Driver                    | `postgres.js` — el que documenta Drizzle para Supabase |
| Preset de Nitro           | `vercel` (no `vercel-edge`: no tiene APIs de Node) |

El modo transacción no soporta prepared statements y Drizzle los usa por defecto, así que la conexión se
abre con `prepare: false`. Sin ese flag la app compila y falla en runtime contra el pooler — un error que
no aparece en desarrollo local contra una base directa.

Supavisor es además el único con IPv4 en todos los planes. La conexión directa es IPv6-only sin el add-on
pagado.

## A-004 — Nuxt UI v4 es la base de interfaz

**Estado:** implementada (misión 01, 2026-08-13). **Fecha de aceptación:** 2026-08-11.

DaisyUI era un plugin de CSS: entregaba clases, no comportamiento. Los bottom sheets, el combobox con
búsqueda y los modales que pide el flujo core necesitan focus trap, navegación por teclado y roles ARIA, y
con DaisyUI eso se escribía a mano cada vez. Nuxt UI v4 está construido sobre Reka UI y lo trae resuelto.

Pesó que viene del core team de Nuxt, que en v4 el tier Pro pasó a ser gratuito, y que Datealo es
mobile-first para usuarios con poca familiaridad con apps — accesibilidad a mano es donde ese perfil se
pierde.

**La migración ya ocurrió**, en los doce slices de la
[misión 01](../../../docs/missions/01-migracion-nuxt-ui/): `app/assets/css/main.css` perdió
`@plugin "daisyui"` y `[data-theme="datealo"]` — los tokens crudos quedan en `@theme` y el mapeo semántico
vive en `app.config.ts` bajo `ui.colors`. Los ocho componentes de `app/components/landing/` están
reescritos. `docs/design/datealo-mockup-kit.css` y `docs/design/README.md` espejan Nuxt UI, no DaisyUI. El
skill `discovery-ux` cita Nuxt UI como base. Receta concreta del theming (colores de marca y radio) en
[`recetas.md`](./references/recetas.md#colores-de-marca-y-radio-en-nuxt-ui).

**Alternativas descartadas:** quedarse en DaisyUI — cero migración y más liviano, pero traslada el costo de
accesibilidad a cada misión que necesite un componente interactivo. shadcn-vue — mismo cimiento (Reka UI +
Tailwind v4), pero cada componente pasa a ser código propio que mantener y auditar.

**Reapertura:** si Nuxt UI resulta demasiado pesado para el presupuesto de carga en móvil con datos
móviles, se revisa contra una medición concreta, no contra una impresión. Ya hay una primera medición: el
bundle de la landing creció 70% gzip con la migración completa, revisado y aceptado el 2026-08-12 (detalle
en `ingenieria.md` de la misión 01, TR-001) — la próxima medición se compara contra esa, no contra el
DaisyUI original.

## A-005 — Un endpoint nunca devuelve una fila cruda de Drizzle

**Estado:** propuesta. **Fecha:** 2026-08-13.

`select().from(professionals)` devuelve todas las columnas que la tabla tenga, incluida cualquiera que se
agregue después sin pensar en quién la lee. Nada en TypeScript distingue "columna que el schema tiene" de
"columna que el cliente debería ver" — compila igual, pasa review igual, y el filtrado solo se nota cuando
ya salió por la red. `professionals` va a tener campos que no son parte del contrato público desde el día
uno de la misión 04: notas de moderación, el estado interno de una verificación en curso, quizás un score
de ranking — ninguno de esos es lo que un buscador debería poder leer en el JSON de un perfil.

**Al construir:**

- Todo endpoint que devuelve una entidad define su forma pública como un `select` explícito de columnas
  (`select({ id: professionals.id, displayName: professionals.displayName, ... })`) o un mapeo posterior a
  un tipo propio — nunca el resultado de Drizzle pasado directo al `return` del handler.
- Una columna nueva en una tabla es privada por default. Se agrega a la forma pública como un cambio
  explícito, no como un efecto colateral de tocar el schema.
- Esto es una regla de forma de respuesta, distinta de A-002 (qué filas) y A-001 (qué credenciales) — las
  tres cierran huecos distintos y ninguna reemplaza a las otras dos.

**Alternativa descartada:** confiar en que RLS filtra columnas — RLS decide qué filas son visibles, nunca
qué columnas de una fila, y de todos modos no corre en esta conexión (A-002). Confiar en la disciplina de
"no selecciono esas columnas a mano" sin un tipo que lo fuerce — funciona hasta el primer `select(*)`
copiado bajo presión de tiempo.

## A-006 — `server/` se organiza por dominio, no solo por tipo de archivo

**Estado:** propuesta. **Fecha:** 2026-08-13.

`CLAUDE.md` ya fija la carpeta por tipo (`api/`, `utils/`, `db/schema/`) para el lado de la app, con la
YAGNI explícita de no mover nada a `src/` ni inventar estructura antes de que haya fricción real. Eso sigue
vigente para `app/`. Del lado de `server/`, la fricción ya es previsible: misiones 03 a 07 van a agregar
`professionals`, `reviews`, `search` como dominios reales, y sin un segundo eje `server/utils/` termina
mezclando singletons de infraestructura (`db.ts`, `auth.ts`, `email.ts`, sin dueño de dominio) con lógica
de negocio (`professionals.ts`, `search-ranking.ts`) en la misma carpeta plana — la misión que toca
`professionals` no puede ver "su" código sin leer los archivos de las otras cuatro.

```
server/api/professionals/[id].get.ts
server/api/professionals/[id].patch.ts
server/api/search/index.get.ts
server/utils/db.ts              # infraestructura transversal, no es de ningún dominio
server/utils/auth.ts            # infraestructura transversal
server/utils/email.ts           # infraestructura transversal
server/utils/professionals.ts   # dominio: queries y reglas de professionals
server/utils/search-ranking.ts  # dominio: reglas puras del ranking de search
```

**Al construir:**

- Cada archivo de `server/utils/` es de un dominio (`professionals.ts`, `reviews.ts`) o es infraestructura
  transversal (`db.ts`, `auth.ts`, `email.ts`) — nunca las dos cosas, y nunca sirve a dos dominios a la vez.
- `server/api/` agrupa por dominio en subcarpetas (`professionals/`, `search/`) apenas exista más de un
  endpoint por dominio — no hace falta esperar a que "duela".
- `server/db/schema/` ya sigue este eje por convención de `CLAUDE.md` (un archivo por entidad); se
  mantiene sin cambios.
- `app/components/` ya agrupa por dominio en subcarpetas — `components/landing/*.vue` es el precedente.
  Nuxt prefija el nombre del componente con la carpeta (`landing/LandingNavbar.vue` → `<LandingNavbar>`),
  así que agregar `components/professionals/` o `components/search/` cuando el dominio aparezca sigue el
  mismo patrón que ya existe, sin costo nuevo.
- `app/composables/` y `app/utils/` **no siguen el mismo patrón** — por default Nuxt solo auto-importa el
  nivel superior de esas carpetas, no subcarpetas arbitrarias. Ahí el agrupamiento por dominio va en el
  nombre del archivo (`useProfessionalProfile.ts`, `professionals.ts` en `utils/`), no en una subcarpeta:
  meter un composable en `composables/professionals/useProfile.ts` lo saca del auto-import sin ningún
  error de compilación — se entera recién en runtime, con un `useProfile is not defined`. Esto ya era la
  convención de `CLAUDE.md` (`useAlgo` por archivo); acá queda explícito el porqué.
- `app/types/` no tiene esta restricción — los tipos se importan con `import type`, no por auto-import —
  pero se mantiene igual de flat que `composables/` mientras no haya más de una entidad por dominio, por la
  misma YAGNI de `CLAUDE.md`.

**Alternativa descartada:** subcarpetas por dominio en cada carpeta desde el día uno
(`server/utils/professionals/`, `server/db/schema/professionals/`) — con una sola entidad por dominio, un
archivo ya resuelve el problema real (mezclar infraestructura y negocio); la carpeta agrega ceremonia sin
un segundo archivo que la justifique. Reabrir esto cuando un dominio necesite más de un archivo de
`utils/` (ej. `professionals.ts` más `professionals-verification.ts`).

**Reapertura:** si `server/utils/` vuelve a mezclar infraestructura y dominio a pesar de esta regla —
señal de que la regla no bastó y hace falta la subcarpeta.

## Dónde va cada cosa

`CLAUDE.md` define la estructura de carpetas y la separación de responsabilidades del lado de la app. Esto
completa el lado de servidor y datos, que ahí solo está esbozado.

| Qué                                          | Dónde                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| Endpoint HTTP                                | `server/api/<dominio>/<recurso>.<método>.ts`        |
| Regla de negocio o cálculo (función pura)    | `server/utils/<dominio>.ts`                         |
| Infraestructura transversal (sin dominio)    | `server/utils/db.ts`, `auth.ts`, `email.ts`         |
| Forma pública de una entidad (DTO)           | `select` explícito en el endpoint o `server/utils/<dominio>.ts` — nunca la fila cruda de Drizzle |
| Schema de Drizzle                            | `server/db/schema/<entidad>.ts`                     |
| Políticas RLS                                | `server/db/sql/rls.sql`                             |
| Esquema de validación de entrada             | junto a su endpoint                                 |
| Secretos y config de runtime                 | `runtimeConfig` en `nuxt.config.ts`                 |
| Estado y acciones del cliente                | `app/composables/`                                  |

Tres fronteras que no se cruzan:

- **La regla de negocio no vive en el handler.** Una función pura en `server/utils/` se prueba con una
  llamada y un `expect`. La misma regla dentro de un `defineEventHandler` solo se prueba levantando Nitro y
  la base. Esto aplica a ranking, distancia, agregación de rating y reglas de verificación — no a CRUD
  simple, donde la abstracción cuesta y no rinde.
- **El endpoint no decide presentación** y el composable no decide autorización.
- **La forma pública de una entidad no es su fila de Drizzle** (A-005) — lo que `server/utils/` calcula y
  lo que el handler devuelve al cliente pueden ser tipos distintos a propósito.

## Recetas concretas

El código de cada operación —crear un endpoint con validación y verificación de pertenencia, montar el
cliente de base de datos, agregar una tabla con su policy, tematizar Nuxt UI con un color de marca,
configurar el despliegue— vive en [`references/recetas.md`](./references/recetas.md). Leerlo antes de
escribir la primera de cada tipo, no a mitad de una.

## Qué hacer cuando algo choca con esto

Estas decisiones son el terreno, no una sugerencia. Si una misión necesita contradecirlas, el orden es:

1. Nombrar la contradicción en el `ingenieria.md` de la misión, no resolverla en silencio en un PR.
2. Si además cambia lo que el producto promete, entra primero como decisión en `producto.md`.
3. Recién entonces se actualiza este skill, con la alternativa descartada anotada.

Una limitación técnica puede influir en el recorte de alcance, pero no se presenta como necesidad de
producto.
