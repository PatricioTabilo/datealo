import { asc, eq } from 'drizzle-orm'
import { categorias } from '../db/schema/categorias'
import { professionalCategorias } from '../db/schema/professional-categorias'

export type PublicCategoria = {
  slug: string
  nombre: string
  priceFrom: number | null
  description: string | null
}

// Orden por createdAt ascendente: la primera categoría declarada queda primera, que es lo que usa el
// resto del sistema como categoría de contexto por default sin un query param de búsqueda.
export async function findProfessionalCategorias(professionalId: string): Promise<PublicCategoria[]> {
  return useDb()
    .select({
      slug: professionalCategorias.categoriaSlug,
      nombre: categorias.nombre,
      priceFrom: professionalCategorias.priceFrom,
      description: professionalCategorias.description,
    })
    .from(professionalCategorias)
    .innerJoin(categorias, eq(professionalCategorias.categoriaSlug, categorias.slug))
    .where(eq(professionalCategorias.professionalId, professionalId))
    .orderBy(asc(professionalCategorias.createdAt))
}
