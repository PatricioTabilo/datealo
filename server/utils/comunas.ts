import { and, asc, eq } from 'drizzle-orm'
import { comunas } from '../db/schema/comunas'
import { comunaVecinas } from '../db/schema/comuna-vecinas'

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

// Nunca devuelve una comuna inactiva, aunque comparta límite real — activar una comuna nueva no exige
// tocar esta query, el filtro ya vive acá.
export async function findVecinasActivas(comunaCodigo: string): Promise<{ codigo: string, nombre: string }[]> {
  return useDb()
    .select({ codigo: comunas.codigo, nombre: comunas.nombre })
    .from(comunaVecinas)
    .innerJoin(comunas, eq(comunaVecinas.vecinaCodigo, comunas.codigo))
    .where(and(eq(comunaVecinas.comunaCodigo, comunaCodigo), eq(comunas.activa, true)))
    .orderBy(asc(comunas.nombre))
}
