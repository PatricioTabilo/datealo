import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function useDb() {
  if (!db) {
    const { databaseUrl } = useRuntimeConfig()
    // Supabase usa Supavisor en modo transacción para la conexión de la app (necesario en serverless,
    // donde cada invocación abriría su propia conexión contra Postgres directo). Ese modo no soporta
    // prepared statements, que Drizzle usa por defecto — sin prepare: false esto compila y solo falla
    // en runtime contra el pooler; en local, contra una base directa, funciona igual y esconde el bug
    // hasta producción (A-003).
    const client = postgres(databaseUrl, { prepare: false })
    db = drizzle({ client, schema })
  }
  return db
}
