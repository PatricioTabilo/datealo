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
