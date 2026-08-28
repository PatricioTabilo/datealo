import { eq } from 'drizzle-orm'
import { professionals } from '../db/schema/professionals'

export async function findProfessionalByUserId(userId: string) {
  const [row] = await useDb()
    .select({ id: professionals.id })
    .from(professionals)
    .where(eq(professionals.userId, userId))
  return row ?? null
}
