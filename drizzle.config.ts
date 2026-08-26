import { defineConfig } from 'drizzle-kit'

// Supavisor en modo sesión (puerto 5432, DATABASE_URL_SESSION) — drizzle-kit necesita prepared
// statements para migrar, y el modo transacción que usa la app no los soporta. Detalle completo
// de por qué este modo y no la conexión directa real de Supabase en .env.example y recetas.md.
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
