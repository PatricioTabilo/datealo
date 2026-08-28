import { and, asc, eq } from 'drizzle-orm'
import { comunas } from '../db/schema/comunas'

export async function findActiveComunas() {
  return useDb()
    .select({ codigo: comunas.codigo, nombre: comunas.nombre })
    .from(comunas)
    .where(eq(comunas.activa, true))
    .orderBy(asc(comunas.nombre))
}

export async function existsActiveComuna(codigo: string): Promise<boolean> {
  const [row] = await useDb()
    .select({ codigo: comunas.codigo })
    .from(comunas)
    .where(and(eq(comunas.codigo, codigo), eq(comunas.activa, true)))
  return Boolean(row)
}

export async function findComunaNombre(codigo: string): Promise<string | null> {
  const [row] = await useDb().select({ nombre: comunas.nombre }).from(comunas).where(eq(comunas.codigo, codigo))
  return row?.nombre ?? null
}
