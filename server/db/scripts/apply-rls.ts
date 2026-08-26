// Aplica server/db/sql/rls.sql contra la base real. `rls.sql` es re-ejecutable (cada policy lleva su
// `drop policy if exists`), así que este script es seguro de correr después de cada `db:migrate` que
// toque una tabla o un bucket con datos de usuario — ninguna migración incluye RLS, A-007 no se aplica solo.
import postgres from 'postgres'

process.loadEnvFile('.env')

const databaseUrlSession = process.env.DATABASE_URL_SESSION
if (!databaseUrlSession) {
  throw new Error('Falta DATABASE_URL_SESSION en el entorno — ver .env.example')
}

const sql = postgres(databaseUrlSession, { max: 1 })

try {
  await sql.file(new URL('../sql/rls.sql', import.meta.url))
  console.log('rls.sql aplicado')
}
finally {
  await sql.end()
}
