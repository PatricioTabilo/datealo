import { defineConfig } from 'drizzle-kit'

// Conexión directa (puerto 5432), distinta de la que usa la app (Supavisor, A-003).
// drizzle-kit no soporta el modo transacción del pooler para migraciones.
const databaseUrlDirect = process.env.DATABASE_URL_DIRECT
if (!databaseUrlDirect) {
  throw new Error('Falta DATABASE_URL_DIRECT en el entorno — ver .env.example')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema',
  out: './server/db/migrations',
  dbCredentials: {
    url: databaseUrlDirect,
  },
})
