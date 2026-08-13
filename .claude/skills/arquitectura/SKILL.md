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
| `server/` (endpoints, schema, RLS)       | no existe — se crea en la primera misión con datos |
| Supabase, Drizzle, `postgres.js`         | no instalados                                   |
| DaisyUI v5                               | instalado y en uso en toda la landing            |
| Nuxt UI v4                               | no instalado — A-004 es una migración pendiente  |

**Consecuencia inmediata:** hasta que A-004 se ejecute, la interfaz se sigue escribiendo con DaisyUI. No
escribir componentes `U*` en un repo que no tiene `@nuxt/ui` instalado.

## A-001 — El browser nunca habla con Supabase, habla con Nitro

**Estado:** propuesta. **Fecha:** 2026-08-11.

Supabase se puede usar de dos formas opuestas. Como BaaS, el browser lleva la publishable key y consulta
PostgREST directo: ese endpoint es público por diseño y toda la seguridad recae en las policies. Como base
de datos a secas, el browser solo conoce `/api/*` del propio dominio.

Datealo usa la segunda. El cliente pega a rutas de Nitro en el mismo origen, y esas rutas hablan con
Postgres vía Drizzle. Ninguna credencial de Supabase ni cadena de conexión cruza al bundle del navegador.

**La excepción es Auth.** La sesión de Supabase Auth vive en el browser porque tiene que vivir ahí, y la
publishable key es pública por diseño. Lo que nunca baja es la secret key ni la cadena de conexión.

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

**Estado:** propuesta. **Fecha:** 2026-08-11.

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

**Estado:** propuesta. **Fecha:** 2026-08-11.

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

**Estado:** aceptada. **Fecha:** 2026-08-11.

DaisyUI es un plugin de CSS: entrega clases, no comportamiento. Los bottom sheets, el combobox con búsqueda
y los modales que pide el flujo core necesitan focus trap, navegación por teclado y roles ARIA, y con
DaisyUI eso se escribe a mano cada vez. Nuxt UI v4 está construido sobre Reka UI y lo trae resuelto.

Pesa que viene del core team de Nuxt, que en v4 el tier Pro pasó a ser gratuito, y que Datealo es
mobile-first para usuarios con poca familiaridad con apps — accesibilidad a mano es donde ese perfil se
pierde.

**La migración todavía no ocurrió.** Mientras `@nuxt/ui` no esté en `package.json`, se escribe DaisyUI.
Cuando ocurra, toca cuatro cosas y ninguna es solo la app:

- `app/assets/css/main.css` pierde `@plugin "daisyui"` y el tema `[data-theme="datealo"]`. Los tokens
  crudos quedan en `@theme` y el mapeo semántico pasa a `app.config.ts` bajo `ui.colors`.
- Los ocho componentes de `app/components/landing/` se reescriben.
- `docs/design/datealo-mockup-kit.css` deja de espejar DaisyUI, y esa parte de `docs/design/README.md`
  se reescribe.
- El skill `discovery-ux` tiene DaisyUI hardcodeado como base de todo elemento interactivo.

**Alternativas descartadas:** quedarse en DaisyUI — cero migración y más liviano, pero traslada el costo de
accesibilidad a cada misión que necesite un componente interactivo. shadcn-vue — mismo cimiento (Reka UI +
Tailwind v4), pero cada componente pasa a ser código propio que mantener y auditar.

**Reapertura:** si Nuxt UI resulta demasiado pesado para el presupuesto de carga en móvil con datos
móviles, se revisa contra una medición concreta, no contra una impresión.

## Dónde va cada cosa

`CLAUDE.md` define la estructura de carpetas y la separación de responsabilidades del lado de la app. Esto
completa el lado de servidor y datos, que ahí solo está esbozado.

| Qué                                          | Dónde                                  |
| -------------------------------------------- | -------------------------------------- |
| Endpoint HTTP                                | `server/api/<recurso>.<método>.ts`     |
| Regla de negocio o cálculo (función pura)    | `server/utils/<dominio>.ts`            |
| Cliente de base de datos (singleton)         | `server/utils/db.ts`                   |
| Schema de Drizzle                            | `server/db/schema/<entidad>.ts`        |
| Políticas RLS                                | `server/db/sql/rls.sql`                |
| Esquema de validación de entrada             | junto a su endpoint                    |
| Secretos y config de runtime                 | `runtimeConfig` en `nuxt.config.ts`    |
| Estado y acciones del cliente                | `app/composables/`                     |

Dos fronteras que no se cruzan:

- **La regla de negocio no vive en el handler.** Una función pura en `server/utils/` se prueba con una
  llamada y un `expect`. La misma regla dentro de un `defineEventHandler` solo se prueba levantando Nitro y
  la base. Esto aplica a ranking, distancia, agregación de rating y reglas de verificación — no a CRUD
  simple, donde la abstracción cuesta y no rinde.
- **El endpoint no decide presentación** y el composable no decide autorización.

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
