import { asc, eq } from 'drizzle-orm'
import { categorias } from '../db/schema/categorias'

export async function findActiveCategorias() {
  return useDb()
    .select({ slug: categorias.slug, nombre: categorias.nombre })
    .from(categorias)
    .where(eq(categorias.activa, true))
    .orderBy(asc(categorias.nombre))
}
