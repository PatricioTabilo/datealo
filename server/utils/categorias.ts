import { and, asc, eq } from 'drizzle-orm'
import { categorias } from '../db/schema/categorias'

export async function findActiveCategorias() {
  return useDb()
    .select({ slug: categorias.slug, nombre: categorias.nombre })
    .from(categorias)
    .where(eq(categorias.activa, true))
    .orderBy(asc(categorias.nombre))
}

export async function existsActiveCategoria(slug: string): Promise<boolean> {
  const [row] = await useDb()
    .select({ slug: categorias.slug })
    .from(categorias)
    .where(and(eq(categorias.slug, slug), eq(categorias.activa, true)))
  return Boolean(row)
}

export async function findCategoriaNombre(slug: string): Promise<string | null> {
  const [row] = await useDb().select({ nombre: categorias.nombre }).from(categorias).where(eq(categorias.slug, slug))
  return row?.nombre ?? null
}
