import { asc, eq } from 'drizzle-orm'
import { categorias, comunas } from '../db/schema/taxonomia'

export async function findActiveCategorias() {
  return useDb()
    .select({ slug: categorias.slug, nombre: categorias.nombre })
    .from(categorias)
    .where(eq(categorias.activa, true))
    .orderBy(asc(categorias.nombre))
}

export async function findActiveComunas() {
  return useDb()
    .select({ codigo: comunas.codigo, nombre: comunas.nombre })
    .from(comunas)
    .where(eq(comunas.activa, true))
    .orderBy(asc(comunas.nombre))
}
