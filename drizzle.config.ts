import { defineConfig } from 'drizzle-kit'

// Supavisor en modo sesión (puerto 5432), distinto del modo transacción que usa la app (A-003).
// drizzle-kit no soporta el modo transacción del pooler para migraciones, y la conexión directa
// real de Supabase es IPv6-only sin el add-on pagado — este modo tiene IPv4 y no cuesta nada.
const databaseUrlSession = process.env.DATABASE_URL_SESSION
if (!databaseUrlSession) {
  throw new Error('Falta DATABASE_URL_SESSION en el entorno — ver .env.example')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema',
  out: './server/db/migrations',
  dbCredentials: {
    url: databaseUrlSession,
  },
})
