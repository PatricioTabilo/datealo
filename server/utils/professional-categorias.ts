import { and, asc, eq } from 'drizzle-orm'
import { categorias } from '../db/schema/categorias'
import { professionalCategorias } from '../db/schema/professional-categorias'
import { professionals } from '../db/schema/professionals'

export type PublicCategoria = {
  slug: string
  nombre: string
  priceFrom: number | null
  description: string | null
}

type Db = ReturnType<typeof useDb>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
type DbOrTx = Db | Tx

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
// resto del sistema como categoría de contexto por default sin un query param de búsqueda. Acepta un
// tx opcional para poder leer el estado ya actualizado desde dentro de la misma transacción
// (removeProfessionalCategoria), en vez de una conexión aparte que todavía no vería el cambio.
export async function findProfessionalCategorias(professionalId: string, db: DbOrTx = useDb()): Promise<PublicCategoria[]> {
  return db
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

export async function updateProfessionalCategoria(
  professionalId: string,
  categoriaSlug: string,
  patch: { priceFrom?: number | null, description?: string | null },
): Promise<PublicCategoria[] | null> {
  const [updated] = await useDb()
    .update(professionalCategorias)
    .set(patch)
    .where(and(
      eq(professionalCategorias.professionalId, professionalId),
      eq(professionalCategorias.categoriaSlug, categoriaSlug),
    ))
    .returning({ professionalId: professionalCategorias.professionalId })

  if (!updated) return null

  return findProfessionalCategorias(professionalId)
}

export type RemoveProfessionalCategoriaResult = 'not_found' | 'last_category' | { categorias: PublicCategoria[] }

// El lock de fila sobre professionals es lo que hace seguro el conteo: sin él, dos DELETE
// concurrentes sobre las dos únicas categorías de un profesional podrían ambos contar 2 antes de que
// el otro confirme su borrado, y los dos pasarían el chequeo de "no es la última". Con `for update`,
// la segunda request espera a que la primera termine (commit o rollback) y cuenta sobre el estado ya
// actualizado.
export async function removeProfessionalCategoria(
  professionalId: string,
  categoriaSlug: string,
): Promise<RemoveProfessionalCategoriaResult> {
  return useDb().transaction(async (tx) => {
    await tx.select({ id: professionals.id }).from(professionals).where(eq(professionals.id, professionalId)).for('update')

    const declared = await tx
      .select({ categoriaSlug: professionalCategorias.categoriaSlug })
      .from(professionalCategorias)
      .where(eq(professionalCategorias.professionalId, professionalId))

    if (!declared.some(row => row.categoriaSlug === categoriaSlug)) return 'not_found'
    if (declared.length <= 1) return 'last_category'

    await tx
      .delete(professionalCategorias)
      .where(and(
        eq(professionalCategorias.professionalId, professionalId),
        eq(professionalCategorias.categoriaSlug, categoriaSlug),
      ))

    return { categorias: await findProfessionalCategorias(professionalId, tx) }
  })
}

// null en vez de lanzar: onConflictDoNothing captura el choque contra la PK compuesta
// (professionalId, categoriaSlug) sin una vuelta redonda de select-antes-de-insert, y el endpoint
// traduce null a 400 already_declared en vez de dejar que un 500 de Postgres llegue al cliente.
export async function addProfessionalCategoria(
  professionalId: string,
  categoriaSlug: string,
  priceFrom: number | null,
  description: string | null,
): Promise<PublicCategoria[] | null> {
  const [inserted] = await useDb()
    .insert(professionalCategorias)
    .values({ professionalId, categoriaSlug, priceFrom, description })
    .onConflictDoNothing({ target: [professionalCategorias.professionalId, professionalCategorias.categoriaSlug] })
    .returning({ professionalId: professionalCategorias.professionalId })

  if (!inserted) return null

  return findProfessionalCategorias(professionalId)
}
