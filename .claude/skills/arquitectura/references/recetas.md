# Recetas de construcción

El código concreto de cada operación que toca servidor, datos, interfaz o despliegue. Las decisiones que lo
sustentan están en el [SKILL.md](../SKILL.md); acá está el cómo.

De servidor y datos (A-001 a A-003), nada existe todavía en el repo: no hay `server/`, ni Supabase, ni
Drizzle instalados. La primera misión que necesite datos crea la base, y esas recetas son su forma. De
interfaz (A-004), la migración está en curso — ver la [misión 01](../../../../docs/missions/01-migracion-nuxt-ui/).

## Contenido

- [Instalar la base de datos](#instalar-la-base-de-datos)
- [El cliente de base de datos](#el-cliente-de-base-de-datos)
- [Secretos y runtimeConfig](#secretos-y-runtimeconfig)
- [Un endpoint de lectura](#un-endpoint-de-lectura)
- [Un endpoint de escritura, con su verificación](#un-endpoint-de-escritura-con-su-verificación)
- [Agregar una tabla](#agregar-una-tabla)
- [Desplegar a Vercel](#desplegar-a-vercel)
- [Antes de dar por terminado un endpoint](#antes-de-dar-por-terminado-un-endpoint)
- [Colores de marca y radio en Nuxt UI](#colores-de-marca-y-radio-en-nuxt-ui)

## Instalar la base de datos

```bash
npm i drizzle-orm postgres
npm i -D drizzle-kit
npm i zod          # validación de entrada en los endpoints
```

`postgres.js` es el driver que documenta Drizzle para Supabase. No usar `node-postgres` salvo que aparezca
una razón concreta, porque la doc oficial y los ejemplos asumen el primero.

## El cliente de base de datos

Un singleton perezoso en `server/utils/db.ts`. Nitro auto-importa lo que está en `server/utils/`, así que
`useDb()` queda disponible en cualquier handler sin import.

```ts
// server/utils/db.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function useDb() {
  if (!db) {
    const { databaseUrl } = useRuntimeConfig()
    // prepare: false es obligatorio contra Supavisor en modo transacción (A-003).
    // Sin esto compila y falla en runtime, pero funciona en local contra una base directa.
    const client = postgres(databaseUrl, { prepare: false })
    db = drizzle({ client, schema })
  }
  return db
}
```

El singleton importa: en serverless cada invocación reutiliza el módulo si el contenedor sigue caliente, y
abrir una conexión por request agota el pooler.

## Secretos y runtimeConfig

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Privado: solo servidor. Nunca llega al bundle del cliente.
    databaseUrl: '',
    supabaseSecretKey: '',

    public: {
      // Público por diseño: la publishable key no es un secreto.
      supabaseUrl: '',
      supabaseKey: '',
    },
  },
})
```

Nuxt mapea las variables de entorno con prefijo `NUXT_` a las claves de `runtimeConfig`, y `NUXT_PUBLIC_` a
las de `public`:

```bash
# .env — nunca se commitea
NUXT_DATABASE_URL=postgresql://postgres.<ref>:<pass>@aws-<region>.pooler.supabase.com:6543/postgres
NUXT_SUPABASE_SECRET_KEY=...
NUXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=...
```

**La regla que no se negocia:** todo lo que entra a `public` es legible desde el código fuente de la página.
Antes de agregar una clave ahí, la pregunta es "¿me da lo mismo publicar esto en el README?".

## Un endpoint de lectura

```ts
// server/api/professionals/[id].get.ts
import { z } from 'zod'

const params = z.object({ id: z.string().uuid() })

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, params.parse)

  const profile = await findPublicProfile(id)   // server/utils/professionals.ts
  if (!profile) {
    throw createError({ statusCode: 404, statusMessage: 'not_found' })
  }

  return profile
})
```

El handler hace I/O y orquestación. La consulta y cualquier regla viven en `server/utils/`, donde se prueban
sin levantar Nitro.

## Un endpoint de escritura, con su verificación

Este es el patrón que materializa A-002. La policy RLS existe, pero **no corre en esta conexión** — si la
verificación de pertenencia no está en el código, no está en ninguna parte.

```ts
// server/api/professionals/[id].patch.ts
import { z } from 'zod'

const params = z.object({ id: z.string().uuid() })
const body = z.object({
  displayName: z.string().min(2).max(80).optional(),
  phone: z.string().regex(/^\+56\d{9}$/).optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)   // valida la sesión en el servidor, nunca confía en el cliente
  const { id } = await getValidatedRouterParams(event, params.parse)
  const patch = await readValidatedBody(event, body.parse)

  const owner = await findProfileOwnerId(id)
  if (!owner) {
    throw createError({ statusCode: 404, statusMessage: 'not_found' })
  }

  // A-002: acá vive la autorización real. La policy es respaldo, no el mecanismo.
  if (owner !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'forbidden' })
  }

  return updateProfile(id, patch)
})
```

Devolver `404` en vez de `403` cuando el recurso no existe evita confirmarle a un tercero que un ID es
válido. Cuando existe pero no es suyo, `403` es correcto y más útil para depurar.

## Agregar una tabla

Tres archivos cambian juntos, y el tercero es el que se olvida.

**1. El schema** en `server/db/schema/<entidad>.ts`:

```ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const professionals = pgTable('professionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

**2. La policy** en `server/db/sql/rls.sql`, con los dos ejes separados:

```sql
alter table professionals enable row level security;

-- El perfil es el producto: lo lee cualquiera.
create policy professionals_select_public on professionals
  for select using (true);

-- Lo edita solo su dueño.
create policy professionals_update_own on professionals
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**3. La verificación en el endpoint**, como en la receta anterior. Sin esto, los dos archivos anteriores no
protegen nada por A-002.

Las migraciones se generan con `drizzle-kit` contra la **conexión directa** (puerto `5432`), no contra el
pooler. El `drizzle.config.ts` lleva esa URL, distinta de la que usa la app.

## Desplegar a Vercel

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: { preset: 'vercel' },
})
```

`vercel` y no `vercel-edge`: edge corre en V8 sin APIs de Node y el driver de Postgres no funciona ahí.

Las variables de entorno se cargan en Vercel bajo *Settings → Environment Variables*, con los mismos nombres
`NUXT_*` del `.env` local. Vercel detecta Nuxt solo, así que el preset explícito es defensa contra que
cambie el default, no un requisito.

## Antes de dar por terminado un endpoint

Además de `npx nuxi typecheck` y `npm run build` que exige `CLAUDE.md`:

- [ ] La entrada está validada — params, query y body, no solo el body.
- [ ] Si toca datos de un usuario, la pertenencia se verifica en el código (A-002).
- [ ] La tabla tiene su policy en `rls.sql`, aunque la autorización real esté en el handler.
- [ ] Hay una prueba de que un cliente anónimo no lee lo que no debe.
- [ ] Ningún secreto entró a `runtimeConfig.public`.
- [ ] Los errores devuelven código HTTP y cuerpo legibles, no un 500 genérico.
- [ ] La regla de negocio quedó en `server/utils/`, no enterrada en el handler.

## Colores de marca y radio en Nuxt UI

Verificado al ejecutar S-001 de la migración — dejarlo acá evita que la próxima vez alguien tenga que
volver a investigarlo a mitad de un slice.

**Un color custom necesita su escala completa de 11 tonos (`50` a `950`), no un valor plano.** Nuxt UI
referencia los tonos por número en sus componentes; un solo hex no alcanza. El `500` es el que se ve en el
estado normal de un botón — ahí va el hex de marca exacto, para que el resultado sea indistinguible del
que tenías antes.

```css
/* app/assets/css/main.css */
@theme static {
  --color-indigo-datealo-50: #F9F9FD;
  --color-indigo-datealo-100: #F0EFFA;
  --color-indigo-datealo-200: #CFCEF3;
  --color-indigo-datealo-300: #A2A0E8;
  --color-indigo-datealo-400: #726FDC;
  --color-indigo-datealo-500: #423ED0;  /* el hex de marca exacto */
  --color-indigo-datealo-600: #312DB8;
  --color-indigo-datealo-700: #282598;
  --color-indigo-datealo-800: #201E7B;
  --color-indigo-datealo-900: #1D1B5F;
  --color-indigo-datealo-950: #141343;
}
```

`@theme static` y no `@theme`: sin `static`, Tailwind solo genera el CSS de los tonos que detecta usados
en el código en build-time, y Nuxt UI los referencia dinámicamente por prop — se pierden tonos en
producción si no se fuerza la generación completa.

Si aparece un color de marca nuevo sin escala ya calculada, generarla en vez de estimarla a ojo: tomar el
HSL del hex, mantener el mismo hue/saturación y variar la luminosidad según una curva pareja (50 ≈ 97% de
luminosidad, 500 = la luminosidad real del hex de marca, 950 ≈ 14%), forzando que el escalón `500`
reproduzca el hex original exacto.

**El mapeo semántico va en `app/app.config.ts`, no en `main.css`.** Los tonos de arriba son crudos; acá se
dice cuál es "primario":

```ts
// app/app.config.ts
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo-datealo',
      secondary: 'turquesa-datealo',
      neutral: 'gray',  // el gris de datealo (#1F2937/#6B7280) ya es gray-800/gray-500 de Tailwind
    },
  },
})
```

Antes de crear una escala custom para un gris o un color de estado (éxito, error), comprobar si ya coincide
con un color nativo de Tailwind — ahorra los 11 tonos.

**El radio base se overridea como variable CSS, no en `app.config.ts`:**

```css
/* app/assets/css/main.css */
:root {
  --ui-radius: 0.5rem; /* default de Nuxt UI: 0.25rem */
}
```

`--ui-radius` es un multiplicador que los componentes calculan internamente (`rounded-md`, `rounded-lg`,
etc.), no un valor 1:1 con el `border-radius` final — no asumir que "quiero 1rem de radio" es
`--ui-radius: 1rem` sin verificarlo visualmente primero.
