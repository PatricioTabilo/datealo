import { asc, eq } from 'drizzle-orm'
import { categorias } from '../db/schema/categorias'
import { professionalCategorias } from '../db/schema/professional-categorias'

export type PublicCategoria = {
  slug: string
  nombre: string
  priceFrom: number | null
  description: string | null
}

type DbOrTx = Parameters<Parameters<ReturnType<typeof useDb>['transaction']>[0]>[0]

// Recibe la transacción de quien llama (createProfessional), para que insertar el profesional y su
// primera categoría sea atómico — o existen las dos filas, o ninguna.
export async function createProfessionalCategoria(
  tx: DbOrTx,
  professionalId: string,
  categoriaSlug: string,
): Promise<void> {
  await tx.insert(professionalCategorias).values({ professionalId, categoriaSlug })
}

// Hasta que exista más de una categoría por profesional, esta es siempre la única fila — no hace
// falta el slug en la firma para saber cuál actualizar.
export async function updateSoleProfessionalCategoria(
  tx: DbOrTx,
  professionalId: string,
  patch: { categoriaSlug?: string, priceFrom?: number | null, description?: string | null },
): Promise<void> {
  await tx.update(professionalCategorias).set(patch).where(eq(professionalCategorias.professionalId, professionalId))
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
