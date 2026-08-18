import { asc, eq } from 'drizzle-orm'
import { comunas } from '../db/schema/comunas'

export async function findActiveComunas() {
  return useDb()
    .select({ codigo: comunas.codigo, nombre: comunas.nombre })
    .from(comunas)
    .where(eq(comunas.activa, true))
    .orderBy(asc(comunas.nombre))
}
